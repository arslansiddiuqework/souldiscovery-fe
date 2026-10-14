"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Loader2, ShieldCheck } from "lucide-react";
import { AssessmentIcon, typeBadgeLabel } from "@/components/assessments/assessment-icons";
import { NeedSupportNow } from "@/components/assessments/crisis-support";
import {
  fetchAssessmentOverview,
  type AssessmentOverview,
  type CrisisPayload,
} from "@/lib/api/assessments";

export default function AssessmentOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const slug = String(params.slug || "");
  const [assessment, setAssessment] = useState<AssessmentOverview | null>(null);
  const [crisis, setCrisis] = useState<CrisisPayload | null>(null);
  const [ack, setAck] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAssessmentOverview(slug);
        if (!active) return;
        setAssessment(data.assessment);
        setCrisis(data.crisis);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load assessment");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  const canBegin =
    assessment?.canStart &&
    (!assessment.requiresAcknowledgment || ack);

  return (
    <div className="min-h-screen bg-[#FBF9FF] text-[#302B3D]">
      <div className="page-shell pb-20 pt-28">
        <div className="container-app max-w-3xl">
          <div className="mb-6 flex items-center justify-between gap-3">
            <Link
              href="/assessments"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#795A70] hover:text-[#49263D]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to assessments
            </Link>
            <NeedSupportNow crisis={crisis} compact />
          </div>

          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#B74783]" />
            </div>
          ) : error || !assessment ? (
            <div className="rounded-2xl border border-[#EADCE5] bg-white p-8 text-center">
              <p>{error || "Assessment not found"}</p>
              <Link href="/assessments" className="mt-4 inline-block font-semibold text-[#B74783]">
                Return to Assessment Center
              </Link>
            </div>
          ) : (
            <article className="rounded-3xl border border-[#E9E2F2] bg-white p-6 shadow-[0_12px_40px_rgba(123,57,98,0.06)] sm:p-8">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0EAFE] text-[#7863C6]">
                  <AssessmentIcon name={assessment.icon} />
                </div>
                <span className="rounded-full bg-[#FFF0F7] px-3 py-1 text-xs font-semibold text-[#B74783]">
                  Free
                </span>
                <span className="rounded-full bg-[#F0EAFE] px-3 py-1 text-xs font-semibold text-[#7863C6]">
                  {typeBadgeLabel(assessment.typeBadge)}
                </span>
                {assessment.status === "coming_soon" && (
                  <span className="rounded-full bg-[#FBF9FF] px-3 py-1 text-xs font-semibold text-[#927C8B]">
                    Coming soon
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{assessment.title}</h1>
              <p className="mt-3 text-base leading-relaxed text-[#716B7D]">
                {assessment.longDescription}
              </p>

              <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#FBF9FF] p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[#927C8B]">
                    Intended for
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-[#49263D]">{assessment.audience}</dd>
                </div>
                <div className="rounded-2xl bg-[#FBF9FF] p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[#927C8B]">
                    Time
                  </dt>
                  <dd className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-[#49263D]">
                    <Clock className="h-4 w-4" /> About {assessment.estimatedMinutes} minutes
                    {assessment.questionCount > 0 ? ` · ${assessment.questionCount} questions` : ""}
                  </dd>
                </div>
                {assessment.referencePeriod && (
                  <div className="rounded-2xl bg-[#FBF9FF] p-4 sm:col-span-2">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-[#927C8B]">
                      Reference period
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-[#49263D]">
                      {assessment.referencePeriod}
                    </dd>
                  </div>
                )}
              </dl>

              <section className="mt-6">
                <h2 className="text-lg font-bold">What this explores</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#716B7D]">
                  {assessment.whatItExplores.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="mt-6">
                <h2 className="text-lg font-bold">What happens after</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#716B7D]">
                  {assessment.whatHappensAfter.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="mt-6 rounded-2xl border border-[#E9E2F2] bg-[#FFF0F7]/50 p-4">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#B74783]" />
                  <div>
                    <h2 className="text-sm font-bold text-[#49263D]">
                      Screening is not a diagnosis
                    </h2>
                    <p className="mt-1 text-sm text-[#716B7D]">
                      This experience cannot diagnose or treat a mental health condition. Results
                      are for personal reflection and may help you decide whether professional
                      support could be useful.
                    </p>
                    {assessment.privacyNote && (
                      <p className="mt-2 text-sm text-[#716B7D]">{assessment.privacyNote}</p>
                    )}
                    <p className="mt-2 text-xs text-[#927C8B]">
                      Source: {assessment.license.source}
                      {assessment.license.notes ? ` — ${assessment.license.notes}` : ""}
                    </p>
                  </div>
                </div>
              </section>

              {assessment.requiresAcknowledgment && assessment.canStart && (
                <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-[#EADCE5] bg-[#FBF9FF] p-4">
                  <input
                    type="checkbox"
                    checked={ack}
                    onChange={(e) => setAck(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-[#EADCE5] text-[#B74783] focus:ring-[#D98CB4]"
                  />
                  <span className="text-sm text-[#49263D]">
                    I understand this assessment is not a diagnosis and is not a substitute for
                    professional care.
                  </span>
                </label>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                {assessment.canStart ? (
                  <button
                    type="button"
                    disabled={!canBegin}
                    onClick={() =>
                      router.push(
                        `/assessments/${assessment.slug}/take${
                          assessment.requiresAcknowledgment ? "?ack=1" : ""
                        }`
                      )
                    }
                    className="inline-flex items-center justify-center rounded-full bg-[#B74783] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(183,71,131,0.28)] transition hover:bg-[#9F376F] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Begin assessment
                  </button>
                ) : (
                  <span className="inline-flex items-center justify-center rounded-full border border-[#EADCE5] bg-[#FBF9FF] px-6 py-3 text-sm font-semibold text-[#927C8B]">
                    Coming soon — pending clinical or licensing review
                  </span>
                )}
                <Link
                  href="/assessments"
                  className="inline-flex items-center justify-center rounded-full border border-[#EADCE5] bg-white px-6 py-3 text-sm font-bold text-[#49263D] hover:bg-[#FFF0F6]"
                >
                  Back to assessments
                </Link>
              </div>

              <p className="mt-4 text-xs text-[#927C8B]">
                No payment is required. Psychologist consultation is optional and never required to
                complete an assessment.
              </p>
            </article>
          )}
        </div>
      </div>
    </div>
  );
}
