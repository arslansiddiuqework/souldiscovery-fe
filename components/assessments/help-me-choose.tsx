"use client";

import { useEffect, useId, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Clock, RotateCcw, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AssessmentIcon } from "@/components/assessments/assessment-icons";
import type { AssessmentCard } from "@/lib/api/assessments";
import {
  FEELING_CATEGORIES,
  availableFeelings,
  recommendAssessments,
  type DurationBand,
  type FeelingId,
} from "@/lib/assessments/feeling-discovery";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3;

const DURATION_OPTIONS: Array<{
  id: DurationBand;
  label: string;
  hint: string;
}> = [
  { id: "few", label: "A few minutes", hint: "About 3 minutes or less" },
  { id: "medium", label: "Around 5–10 minutes", hint: "A short check-in" },
  { id: "longer", label: "I have more time", hint: "More than 10 minutes" },
];

export function HelpMeChoose({
  open,
  onOpenChange,
  assessments,
  featured,
  onSelectAssessment,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessments: AssessmentCard[];
  featured?: AssessmentCard | null;
  onSelectAssessment: (slug: string) => void;
}) {
  const titleId = useId();
  const [step, setStep] = useState<Step>(1);
  const [feelingId, setFeelingId] = useState<FeelingId | "not_sure" | null>(
    null
  );
  const [durationBand, setDurationBand] = useState<DurationBand | null>(null);

  const feelings = availableFeelings(assessments);
  const hasDurationMeta = assessments.some(
    (a) => typeof a.estimatedMinutes === "number" && a.estimatedMinutes > 0
  );

  useEffect(() => {
    if (!open) {
      setStep(1);
      setFeelingId(null);
      setDurationBand(null);
    }
  }, [open]);

  const recommendations = recommendAssessments({
    assessments,
    featured,
    feelingId,
    durationBand: hasDurationMeta ? durationBand : null,
  });

  const reset = () => {
    setStep(1);
    setFeelingId(null);
    setDurationBand(null);
  };

  const goNext = () => {
    if (step === 1 && feelingId) {
      if (hasDurationMeta) setStep(2);
      else setStep(3);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const goBack = () => {
    if (step === 3 && hasDurationMeta) setStep(2);
    else if (step === 3) setStep(1);
    else if (step === 2) setStep(1);
  };

  const canContinue =
    (step === 1 && !!feelingId) || (step === 2 && !!durationBand);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-xl gap-0 p-0 sm:max-w-xl"
        aria-labelledby={titleId}
      >
        <div className="border-b border-[#EADCE5] bg-gradient-to-r from-[#FFF8FB] via-white to-[#F8F0FF] px-5 py-4 sm:px-6">
          <DialogHeader className="space-y-2 pr-8 text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B74783]">
              Help me choose
            </p>
            <DialogTitle id={titleId} className="text-lg sm:text-xl">
              {step === 1 && "What would you like to explore?"}
              {step === 2 && "How much time do you have?"}
              {step === 3 && "Suggested for you"}
            </DialogTitle>
            <DialogDescription className="text-sm text-[#795A70]">
              {step === 1 &&
                "Pick the option that feels closest. This is not a diagnosis."}
              {step === 2 &&
                "We’ll prefer assessments that fit your available time."}
              {step === 3 &&
                "These suggestions come from our published reflections — not a clinical evaluation."}
            </DialogDescription>
          </DialogHeader>

          <div
            className="mt-4 flex items-center gap-2"
            aria-label={`Step ${step} of ${hasDurationMeta ? 3 : 2}`}
          >
            {(hasDurationMeta ? [1, 2, 3] : [1, 3]).map((s, i) => {
              const active = s === step || (step === 3 && s === 3);
              const done =
                (s === 1 && step > 1) || (s === 2 && step === 3 && hasDurationMeta);
              return (
                <div key={s} className="flex flex-1 items-center gap-2">
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                      active || done
                        ? "bg-[#B74783] text-white"
                        : "bg-[#FFF0F6] text-[#927C8B] ring-1 ring-[#EADCE5]"
                    )}
                  >
                    {done && !active ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  {i < (hasDurationMeta ? 2 : 1) && (
                    <span
                      className={cn(
                        "h-0.5 flex-1 rounded-full",
                        done || active ? "bg-[#B74783]/40" : "bg-[#EADCE5]"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="max-h-[min(52dvh,420px)] overflow-y-auto px-5 py-4 sm:px-6">
          {step === 1 && (
            <div className="grid gap-2.5 sm:grid-cols-2" role="listbox" aria-label="Topics">
              {feelings.map((f) => {
                const selected = feelingId === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => setFeelingId(f.id)}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border p-3.5 text-left transition",
                      selected
                        ? "border-[#B74783]/40 bg-[#FFF0F6] shadow-sm ring-1 ring-[#B74783]/20"
                        : "border-[#EADCE5] bg-white hover:border-[#E7B4D4] hover:bg-[#FFF8FB]"
                    )}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFE5F0] to-[#F4E8FF] text-[#B74783]">
                      <AssessmentIcon name={f.icon} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-[#49263D]">
                        {f.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-[#927C8B]">
                        {f.description}
                      </span>
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                role="option"
                aria-selected={feelingId === "not_sure"}
                onClick={() => setFeelingId("not_sure")}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-3.5 text-left transition sm:col-span-2",
                  feelingId === "not_sure"
                    ? "border-[#B74783]/40 bg-[#FFF0F6] shadow-sm ring-1 ring-[#B74783]/20"
                    : "border-[#EADCE5] bg-white hover:border-[#E7B4D4] hover:bg-[#FFF8FB]"
                )}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0EAFE] text-[#7863C6]">
                  <Sparkles className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-[#49263D]">
                    Not sure yet
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-[#927C8B]">
                    Get a gentle starting suggestion from available reflections.
                  </span>
                </span>
              </button>
            </div>
          )}

          {step === 2 && hasDurationMeta && (
            <div className="grid gap-2.5" role="listbox" aria-label="Time available">
              {DURATION_OPTIONS.map((opt) => {
                const selected = durationBand === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => setDurationBand(opt.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border p-4 text-left transition",
                      selected
                        ? "border-[#B74783]/40 bg-[#FFF0F6] shadow-sm ring-1 ring-[#B74783]/20"
                        : "border-[#EADCE5] bg-white hover:border-[#E7B4D4] hover:bg-[#FFF8FB]"
                    )}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF0F6] text-[#B74783]">
                      <Clock className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-[#49263D]">
                        {opt.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-[#927C8B]">
                        {opt.hint}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              {recommendations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#EADCE5] bg-[#FBF9FF] p-6 text-center">
                  <p className="font-display text-sm font-semibold text-[#49263D]">
                    No matching assessments right now
                  </p>
                  <p className="mt-1 text-xs text-[#927C8B]">
                    Browse the full library to explore what is available.
                  </p>
                  <button
                    type="button"
                    className="mt-4 text-sm font-bold text-[#B74783] hover:underline"
                    onClick={() => {
                      onOpenChange(false);
                      document
                        .getElementById("assessment-library")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    Explore all assessments
                  </button>
                </div>
              ) : (
                recommendations.map(({ assessment, reason }) => (
                  <div
                    key={assessment.slug}
                    className="rounded-2xl border border-[#EADCE5] bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFE5F0] to-[#F4E8FF] text-[#B74783]">
                        <AssessmentIcon
                          name={assessment.icon}
                          className="h-5 w-5"
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#49263D]">
                          {assessment.title}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-[#795A70]">
                          {reason}
                        </p>
                        <p className="mt-2 text-[11px] font-medium text-[#927C8B]">
                          About {assessment.estimatedMinutes} min
                          {assessment.questionCount > 0
                            ? ` · ${assessment.questionCount} questions`
                            : ""}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            onOpenChange(false);
                            onSelectAssessment(assessment.slug);
                          }}
                          className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-[#B74783] px-4 text-xs font-bold text-white shadow-[0_8px_20px_rgba(183,71,131,0.25)] transition hover:bg-[#9F376F]"
                        >
                          Learn more & start
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#EADCE5] bg-[#FBF9FF]/80 px-5 py-3.5 sm:px-6">
          <div className="flex items-center gap-2">
            {step > 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#EADCE5] bg-white px-3 text-xs font-semibold text-[#795A70] transition hover:bg-[#FFF0F6] hover:text-[#B74783]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex h-9 items-center rounded-full px-3 text-xs font-semibold text-[#927C8B] transition hover:text-[#B74783]"
              >
                Close
              </button>
            )}
            {step === 3 && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-[#795A70] transition hover:text-[#B74783]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restart
              </button>
            )}
          </div>

          {step < 3 && (
            <button
              type="button"
              disabled={!canContinue}
              onClick={goNext}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-bold text-white transition",
                canContinue
                  ? "bg-[#B74783] shadow-[0_8px_20px_rgba(183,71,131,0.25)] hover:bg-[#9F376F]"
                  : "cursor-not-allowed bg-[#B74783]/35"
              )}
            >
              Continue
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Exported for tests / reuse */
export function helpMeChooseFeelingOptions(assessments: AssessmentCard[]) {
  return availableFeelings(assessments).length
    ? availableFeelings(assessments)
    : FEELING_CATEGORIES;
}
