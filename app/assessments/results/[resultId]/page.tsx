"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { NeedSupportNow } from "@/components/assessments/crisis-support";
import {
  fetchAssessmentResult,
  readGuestResult,
  type SubmitResult,
} from "@/lib/api/assessments";
import { useSession } from "@/lib/contexts/session-context";

export default function AssessmentResultsPage() {
  const params = useParams();
  const resultId = String(params.resultId || "");
  const { isAuthenticated } = useSession();
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        if (resultId === "guest") {
          const guest = readGuestResult();
          if (!guest) throw new Error("No guest result found for this session.");
          if (!active) return;
          setResult(guest);
        } else if (isAuthenticated) {
          const data = await fetchAssessmentResult(resultId);
          if (!active) return;
          setResult(data);
        } else {
          const guest = readGuestResult(resultId);
          if (guest) {
            if (!active) return;
            setResult(guest);
          } else {
            throw new Error("Sign in to view saved assessment results.");
          }
        }
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load results");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [resultId, isAuthenticated]);

  const scoring = result?.scoring;
  const recommendations = (result?.recommendations || []).filter(
    (r) => !dismissed.includes(r.planSlug)
  );

  return (
    <div className="min-h-screen bg-[#FBF9FF] text-[#302B3D]">
      <div className="page-shell pb-20 pt-28">
        <div className="container-app max-w-3xl">
          <div className="mb-6 flex justify-end">
            <NeedSupportNow crisis={result?.crisis} />
          </div>

          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#B74783]" />
            </div>
          ) : error || !result || !scoring ? (
            <div className="rounded-2xl border border-[#EADCE5] bg-white p-8 text-center">
              <p>{error || "Result not found"}</p>
              <Link href="/assessments" className="mt-4 inline-block font-semibold text-[#B74783]">
                Return to Assessment Center
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <section className="rounded-3xl border border-[#E9E2F2] bg-white p-6 shadow-[0_12px_40px_rgba(123,57,98,0.06)] sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7863C6]">
                  Your results
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight">{result.title}</h1>
                <p className="mt-2 text-sm text-[#716B7D]">
                  Completed{" "}
                  {new Date(result.completedAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                  {" · "}Instrument version {result.instrumentVersion}
                </p>
                {scoring.interpretationLabel && (
                  <p className="mt-4 text-lg font-semibold text-[#49263D]">
                    {scoring.interpretationLabel}
                  </p>
                )}
                <p className="mt-3 text-base leading-relaxed text-[#716B7D]">
                  {scoring.interpretationSummary}
                </p>
                <p className="mt-4 rounded-2xl bg-[#F0EAFE]/70 px-4 py-3 text-sm text-[#716B7D]">
                  {scoring.disclaimer}
                </p>
              </section>

              {scoring.scoringMethod === "starting_point_routing" ? (
                <section className="rounded-3xl border border-[#E9E2F2] bg-white p-6 sm:p-8">
                  <h2 className="text-xl font-bold">Suggested assessments</h2>
                  <p className="mt-2 text-sm text-[#716B7D]">
                    These suggestions help you choose where to begin. They are not a diagnosis.
                  </p>
                  <ul className="mt-4 space-y-2">
                    {(scoring.suggestedAssessmentSlugs || []).map((slug) => (
                      <li key={slug}>
                        <Link
                          href={`/assessments/${slug}`}
                          className="block rounded-2xl border border-[#EADCE5] px-4 py-3 text-sm font-semibold text-[#49263D] hover:bg-[#FFF0F6]"
                        >
                          {slug.replace(/-/g, " ")}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {(scoring.educationalTips || []).length > 0 && (
                    <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[#716B7D]">
                      {scoring.educationalTips!.map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                  )}
                  <Link
                    href="/assessments"
                    className="mt-6 inline-flex rounded-full border border-[#EADCE5] px-5 py-2.5 text-sm font-bold text-[#49263D] hover:bg-[#FFF0F6]"
                  >
                    Browse all assessments
                  </Link>
                </section>
              ) : (
                <>
                  <section className="rounded-3xl border border-[#E9E2F2] bg-white p-6 sm:p-8">
                    <h2 className="text-xl font-bold">Patterns you reflected on</h2>
                    <p className="mt-2 text-sm text-[#716B7D]">
                      What this may mean: these notes describe themes from your answers. They cannot
                      establish a clinical diagnosis.
                    </p>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl bg-[#F0EAFE]/60 p-4">
                        <h3 className="text-sm font-bold text-[#49263D]">
                          What seems to be going well
                        </h3>
                        {scoring.goingWell.length > 0 ? (
                          <ul className="mt-2 space-y-1 text-sm text-[#716B7D]">
                            {scoring.goingWell.map((item) => (
                              <li key={item} className="flex gap-2">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#287D58]" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-sm text-[#927C8B]">
                            Nothing strongly stood out as a strength this time — that is okay.
                          </p>
                        )}
                      </div>
                      <div className="rounded-2xl bg-[#FFF0F7]/80 p-4">
                        <h3 className="text-sm font-bold text-[#49263D]">
                          Areas you may want to give attention to
                        </h3>
                        {scoring.needsAttention.length > 0 ? (
                          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-[#716B7D]">
                            {scoring.needsAttention.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-sm text-[#927C8B]">
                            No areas were flagged for extra attention based on this reflection.
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 rounded-2xl border border-dashed border-[#E9B7D5] bg-white p-4">
                      <p className="text-sm font-bold text-[#49263D]">
                        One small step you could try today
                      </p>
                      <p className="mt-1 text-sm text-[#716B7D]">{scoring.smallStep}</p>
                    </div>
                  </section>

                  <section className="rounded-3xl border border-[#E9E2F2] bg-white p-6 sm:p-8">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[#B74783]" />
                      <h2 className="text-xl font-bold">Explore activities that fit your needs</h2>
                    </div>
                    <p className="mt-2 text-sm text-[#716B7D]">
                      Free AI Wellness Plan activities related to what you reflected on. You choose
                      what to try — nothing is added without your confirmation.
                    </p>
                    {recommendations.length === 0 ? (
                      <p className="mt-4 text-sm text-[#927C8B]">
                        Browse the Wellness Plan catalog to pick activities yourself.
                      </p>
                    ) : (
                      <ul className="mt-4 space-y-3">
                        {recommendations.map((rec) => (
                          <li
                            key={rec.planSlug}
                            className="flex flex-col gap-3 rounded-2xl border border-[#EADCE5] p-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="font-semibold capitalize text-[#49263D]">
                                {rec.planSlug.replace(/-/g, " ")}
                              </p>
                              <p className="mt-1 text-sm text-[#716B7D]">{rec.reason}</p>
                            </div>
                            <div className="flex gap-2">
                              <Link
                                href={rec.href}
                                className="rounded-full bg-[#B74783] px-4 py-2 text-sm font-bold text-white"
                              >
                                Explore
                              </Link>
                              <button
                                type="button"
                                onClick={() =>
                                  setDismissed((d) => [...d, rec.planSlug])
                                }
                                className="rounded-full px-3 py-2 text-sm font-semibold text-[#927C8B] hover:bg-[#FBF9FF]"
                              >
                                Dismiss
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </>
              )}

              <section className="rounded-3xl border border-[#E9E2F2] bg-gradient-to-br from-[#F0EAFE] to-[#FFF0F7] p-6 sm:p-8">
                <h2 className="text-xl font-bold">Your next step</h2>
                <p className="mt-2 text-sm text-[#716B7D]">
                  One primary action based on this assessment. Professional support remains optional.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={result.primaryNextStep?.href || "/wellness-plan"}
                    className="inline-flex rounded-full bg-[#B74783] px-5 py-3 text-sm font-bold text-white"
                  >
                    {result.primaryNextStep?.label || "Explore my Wellness Plan"}
                  </Link>
                  <Link
                    href="/wellness-plan"
                    className="inline-flex rounded-full border border-[#EADCE5] bg-white px-5 py-3 text-sm font-bold text-[#49263D]"
                  >
                    Explore my Wellness Plan
                  </Link>
                  {isAuthenticated && (
                    <Link
                      href="/dashboard/assessment-history"
                      className="inline-flex rounded-full border border-[#EADCE5] bg-white px-5 py-3 text-sm font-bold text-[#49263D]"
                    >
                      View assessment history
                    </Link>
                  )}
                  <Link
                    href="/assessments"
                    className="inline-flex rounded-full px-5 py-3 text-sm font-semibold text-[#7863C6]"
                  >
                    Return to Assessment Center
                  </Link>
                </div>
                <p className="mt-4 text-xs text-[#927C8B]">
                  Consider speaking with a qualified healthcare professional if distress continues.
                  Online psychologist consultation is available if you choose it — it is never
                  required to use Assessment Center.
                </p>
                {result.guestNote && (
                  <p className="mt-3 text-sm font-medium text-[#795A70]">{result.guestNote}</p>
                )}
                {result.license?.notes && (
                  <p className="mt-3 text-xs text-[#927C8B]">{result.license.notes}</p>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
