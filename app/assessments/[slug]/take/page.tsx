"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Coffee,
  Loader2,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { NeedSupportNow } from "@/components/assessments/crisis-support";
import {
  fetchAssessmentTake,
  saveAssessmentProgress,
  startAssessmentSession,
  stashGuestResult,
  submitAssessment,
  type AssessmentQuestion,
  type CrisisPayload,
} from "@/lib/api/assessments";
import { useSession } from "@/lib/contexts/session-context";
import { cn } from "@/lib/utils";

type AnswerState = Record<
  string,
  { value: number | string | null; skipped?: boolean }
>;

function isVisible(q: AssessmentQuestion, answers: AnswerState) {
  if (!q.showIf) return true;
  const prior = answers[q.showIf.questionId];
  if (!prior || prior.skipped || prior.value === null || prior.value === undefined) {
    return false;
  }
  const values = Array.isArray(prior.value) ? prior.value : [prior.value];
  return values.some((v) => q.showIf!.values.includes(v));
}

function AssessmentTakeFlow() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useSession();
  const slug = String(params.slug || "");

  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [requiresAck, setRequiresAck] = useState(false);
  const [referencePeriod, setReferencePeriod] = useState<string | undefined>();
  const [crisis, setCrisis] = useState<CrisisPayload | null>(null);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [index, setIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [submissionToken, setSubmissionToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exitOpen, setExitOpen] = useState(false);
  const [breakMode, setBreakMode] = useState(false);
  const [saveToHistory, setSaveToHistory] = useState(true);
  const [validationMsg, setValidationMsg] = useState<string | null>(null);

  const acknowledged = searchParams.get("ack") === "1";

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAssessmentTake(slug);
        if (!active) return;
        setTitle(data.assessment.title);
        setQuestions(data.assessment.questions);
        setRequiresAck(data.assessment.requiresAcknowledgment);
        setReferencePeriod(data.assessment.referencePeriod);
        setCrisis(data.crisis);

        if (data.assessment.requiresAcknowledgment && !acknowledged) {
          router.replace(`/assessments/${slug}`);
          return;
        }

        const session = await startAssessmentSession(
          slug,
          data.assessment.requiresAcknowledgment ? true : Boolean(acknowledged)
        );
        if (!active) return;
        setSessionId(session.sessionId);
        setSubmissionToken(session.submissionToken);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Unable to start assessment");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug, acknowledged, router]);

  const visibleQuestions = useMemo(
    () => questions.filter((q) => isVisible(q, answers)),
    [questions, answers]
  );

  const current = visibleQuestions[index];
  const displayProgress =
    visibleQuestions.length > 0
      ? Math.min(
          100,
          Math.round(((index + 1) / visibleQuestions.length) * 100)
        )
      : 0;

  const selectAnswer = (value: number | string) => {
    if (!current) return;
    setValidationMsg(null);
    setAnswers((prev) => ({
      ...prev,
      [current.id]: { value, skipped: false },
    }));
  };

  const skipQuestion = () => {
    if (!current || !current.allowSkip) return;
    setValidationMsg(null);
    setAnswers((prev) => ({
      ...prev,
      [current.id]: { value: null, skipped: true },
    }));
  };

  const persistProgress = useCallback(
    async (nextAnswers: AnswerState, questionId?: string) => {
      if (!sessionId) return;
      try {
        await saveAssessmentProgress(slug, sessionId, {
          answers: Object.entries(nextAnswers).map(([questionId, a]) => ({
            questionId,
            value: a.value,
            skipped: a.skipped,
          })),
          currentQuestionId: questionId,
        });
      } catch {
        // Best-effort progress save; do not block the flow
      }
    },
    [sessionId, slug]
  );

  const goNext = async () => {
    if (!current) return;
    const answer = answers[current.id];
    const hasAnswer = answer && (answer.skipped || answer.value !== null && answer.value !== undefined);
    if (current.required && !current.allowSkip && !hasAnswer) {
      setValidationMsg("Please select an answer to continue.");
      return;
    }
    if (!hasAnswer && current.allowSkip) {
      // treat as skip if continuing without selection
      const next = {
        ...answers,
        [current.id]: { value: null, skipped: true },
      };
      setAnswers(next);
      await persistProgress(next, current.id);
    } else {
      await persistProgress(answers, current.id);
    }

    if (index >= visibleQuestions.length - 1) {
      await handleSubmit();
      return;
    }
    setIndex((i) => i + 1);
  };

  const goPrev = () => {
    setValidationMsg(null);
    setIndex((i) => Math.max(0, i - 1));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const payloadAnswers = questions.map((q) => {
        const a = answers[q.id];
        return {
          questionId: q.id,
          value: a?.value ?? null,
          skipped: Boolean(a?.skipped || a?.value == null),
        };
      });

      const result = await submitAssessment(slug, {
        answers: payloadAnswers,
        acknowledgedNotDiagnosis: requiresAck ? true : acknowledged,
        saveResults: Boolean(isAuthenticated && saveToHistory),
        sessionId: sessionId || undefined,
        submissionToken: submissionToken || undefined,
      });

      if (result.resultId) {
        router.push(`/assessments/results/${result.resultId}`);
      } else {
        stashGuestResult(result);
        router.push(`/assessments/results/guest`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit assessment");
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!current || breakMode || submitting) return;
      const num = Number(e.key);
      if (num >= 1 && num <= current.options.length) {
        const opt = current.options[num - 1];
        selectAnswer(opt.value);
      }
      if (e.key === "Enter") {
        e.preventDefault();
        void goNext();
      }
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, answers, index, breakMode, submitting]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#FBF9FF]">
        <Loader2 className="h-8 w-8 animate-spin text-[#B74783]" />
      </div>
    );
  }

  if (error && !current) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-[#FBF9FF] px-4 text-center">
        <p className="max-w-md text-[#49263D]">{error}</p>
        <Link href="/assessments" className="font-semibold text-[#B74783]">
          Back to Assessment Center
        </Link>
      </div>
    );
  }

  const questionLabel = `Question ${Math.min(index + 1, visibleQuestions.length)} of ${visibleQuestions.length}`;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#FBF9FF] text-[#302B3D]">
      <header className="shrink-0 bg-[#FBF9FF]/98 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4">
          <Link
            href="/assessments"
            aria-label="Back to Assessment Center"
            className="flex shrink-0 items-center"
          >
            <BrandLogo variant="icon" size={32} />
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-sm font-semibold text-[#49263D]">{title}</p>
            <p className="text-[11px] text-[#927C8B]">{questionLabel}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <NeedSupportNow crisis={crisis} compact />
            <button
              type="button"
              onClick={() => setExitOpen(true)}
              className="rounded-full p-2 text-[#795A70] hover:bg-[#FFF0F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(217,140,180,0.55)]"
              aria-label="Exit assessment"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="border-t border-[#E9E2F2] px-0">
          <div
            className="h-1 w-full bg-[#EDE7F5]"
            role="progressbar"
            aria-valuenow={displayProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Assessment progress"
          >
            <div
              className="h-full bg-gradient-to-r from-[#A78BFA] to-[#E9B7D5] transition-[width] duration-300 ease-out motion-reduce:transition-none"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-y-auto px-4 py-6 sm:py-8">
        {breakMode ? (
          <div className="m-auto max-w-md rounded-3xl border border-[#E9E2F2] bg-white p-8 text-center shadow-sm">
            <Coffee className="mx-auto h-8 w-8 text-[#7863C6]" />
            <h2 className="mt-4 text-xl font-bold">Take a break</h2>
            <p className="mt-2 text-sm text-[#716B7D]">
              Your answers are kept on this device for this session. Return whenever you feel ready.
            </p>
            <button
              type="button"
              onClick={() => setBreakMode(false)}
              className="mt-6 inline-flex rounded-full bg-[#B74783] px-5 py-2.5 text-sm font-bold text-white"
            >
              Continue assessment
            </button>
          </div>
        ) : (
          <>
            {referencePeriod && (
              <p className="mb-5 text-center text-sm text-[#927C8B]">{referencePeriod}</p>
            )}

            <div className="m-auto w-full rounded-3xl border border-[#E9E2F2] bg-white p-6 shadow-[0_16px_40px_rgba(123,57,98,0.07)] sm:p-8">
              <p className="sr-only" aria-live="polite">
                Progress {displayProgress} percent. Question {index + 1} of{" "}
                {visibleQuestions.length}.
                {validationMsg ? ` ${validationMsg}` : ""}
              </p>
              <h1 className="text-xl font-bold leading-snug sm:text-2xl">{current?.text}</h1>
              {current?.helpText && (
                <p className="mt-3 text-sm text-[#716B7D]">{current.helpText}</p>
              )}

              <div className="mt-8 space-y-3" role="radiogroup" aria-label="Answer options">
                {current?.options.map((opt, i) => {
                  const selected = answers[current.id]?.value === opt.value;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => selectAnswer(opt.value)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left text-[15px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(217,140,180,0.55)]",
                        selected
                          ? "border-[#B74783] bg-[#FFF0F7] text-[#49263D] shadow-[0_0_0_1px_#B74783]"
                          : "border-[#E9E2F2] bg-[#FBF9FF] text-[#49263D] hover:border-[#E9B7D5] hover:bg-[#FFF0F7]"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                          selected
                            ? "border-[#B74783] bg-[#B74783] text-white"
                            : "border-[#EADCE5] bg-white text-[#927C8B]"
                        )}
                      >
                        {i + 1}
                      </span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {validationMsg && (
                <p className="mt-4 text-sm font-medium text-[#B4233D]" role="alert">
                  {validationMsg}
                </p>
              )}
              {error && (
                <p className="mt-4 text-sm font-medium text-[#B4233D]" role="alert">
                  {error}
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={index === 0 || submitting}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-[#795A70] hover:bg-[#FFF0F6] disabled:opacity-40"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>
                <div className="flex flex-wrap gap-2">
                  {current?.allowSkip && (
                    <button
                      type="button"
                      onClick={skipQuestion}
                      className="rounded-full px-4 py-2.5 text-sm font-semibold text-[#927C8B] hover:bg-[#FBF9FF]"
                    >
                      Skip
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void goNext()}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-full bg-[#B74783] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#9F376F] disabled:opacity-60"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : index >= visibleQuestions.length - 1 ? (
                      "Finish"
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center gap-3 text-center">
              <button
                type="button"
                onClick={() => setBreakMode(true)}
                className="text-sm font-semibold text-[#7863C6] hover:underline"
              >
                Take a break
              </button>
              <p className="text-xs text-[#927C8B]">
                Your responses are personal. We do not put answers in URLs or analytics events.
              </p>
              {isAuthenticated && (
                <label className="flex items-center gap-2 text-xs text-[#716B7D]">
                  <input
                    type="checkbox"
                    checked={saveToHistory}
                    onChange={(e) => setSaveToHistory(e.target.checked)}
                    className="rounded border-[#EADCE5] text-[#B74783]"
                  />
                  Save this result to my assessment history
                </label>
              )}
            </div>
          </>
        )}
      </div>

      {exitOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#302B3D]/35 p-4">
          <div
            role="alertdialog"
            aria-labelledby="exit-title"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
          >
            <h2 id="exit-title" className="text-lg font-bold">
              Leave this assessment?
            </h2>
            <p className="mt-2 text-sm text-[#716B7D]">
              Unfinished answers may be discarded if you leave now.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setExitOpen(false)}
                className="rounded-full px-4 py-2 text-sm font-semibold text-[#49263D] hover:bg-[#FFF0F6]"
              >
                Keep going
              </button>
              <button
                type="button"
                onClick={() => router.push(`/assessments/${slug}`)}
                className="rounded-full bg-[#B74783] px-4 py-2 text-sm font-bold text-white"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AssessmentTakePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FBF9FF]">
          <Loader2 className="h-8 w-8 animate-spin text-[#B74783]" />
        </div>
      }
    >
      <AssessmentTakeFlow />
    </Suspense>
  );
}
