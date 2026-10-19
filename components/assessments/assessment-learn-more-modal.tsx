"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  Loader2,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import {
  fetchAssessmentOverview,
  type AssessmentOverview,
} from "@/lib/api/assessments";
import { AssessmentIcon, typeBadgeLabel } from "./assessment-icons";
import { cn } from "@/lib/utils";

export function AssessmentLearnMoreModal({
  slug,
  open,
  onClose,
}: {
  slug: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [assessment, setAssessment] = useState<AssessmentOverview | null>(null);
  const [ack, setAck] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !slug) return;
    let alive = true;
    setLoading(true);
    setError(null);
    setAck(false);
    setAssessment(null);
    fetchAssessmentOverview(slug)
      .then((data) => {
        if (!alive) return;
        setAssessment(data.assessment);
      })
      .catch((e) => {
        if (!alive) return;
        setError(
          e instanceof Error ? e.message : "Couldn't load this assessment"
        );
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [open, slug]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const canBegin =
    assessment?.canStart &&
    (!assessment.requiresAcknowledgment || ack);

  const begin = () => {
    if (!assessment?.canStart) return;
    onClose();
    router.push(
      `/assessments/${assessment.slug}/take${
        assessment.requiresAcknowledgment ? "?ack=1" : ""
      }`
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-[#3D2448]/40 backdrop-blur-md"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="learn-more-title"
            initial={
              reduceMotion ? false : { opacity: 0, y: 32, scale: 0.96 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion ? undefined : { opacity: 0, y: 18, scale: 0.97 }
            }
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="relative z-[1] flex max-h-[min(90dvh,580px)] w-full max-w-[420px] flex-col overflow-hidden rounded-t-[36px] bg-gradient-to-b from-[#FFF9FC] via-white to-[#F8F4FF] shadow-[0_28px_80px_rgba(61,36,72,0.28)] sm:rounded-[36px]"
          >
            {/* Soft rose / lilac glow — distinct from plan-preview purple */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-10 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(232,121,160,0.28),transparent_68%)] blur-2xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -left-10 bottom-20 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(168,130,214,0.2),transparent_70%)] blur-xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute right-8 top-16 h-2 w-2 rounded-full bg-[#F9A8D4]/80"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute right-16 top-10 h-1.5 w-1.5 rounded-full bg-[#C4B5FD]/70"
            />

            <div className="relative flex items-center justify-between px-5 pb-1 pt-4 sm:px-6 sm:pt-5">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#C45A92]">
                <Sparkles className="h-3.5 w-3.5" />
                Quick look
              </p>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#7A6A80] shadow-[0_0_0_1px_rgba(232,210,224,0.9),0_0_18px_rgba(232,121,160,0.18)] transition hover:text-[#49263D]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative min-h-0 flex-1 overflow-y-auto px-5 pb-2 pt-3 sm:px-6">
              {loading && (
                <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 text-[#A8939E]">
                  <Loader2 className="h-7 w-7 animate-spin text-[#C45A92]" />
                  <p className="text-sm">Loading…</p>
                </div>
              )}

              {!loading && error && (
                <div className="rounded-[22px] bg-[#FFF0F2] px-4 py-8 text-center">
                  <p className="text-sm font-semibold text-[#49263D]">{error}</p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 text-xs font-bold text-[#C45A92] hover:underline"
                  >
                    Close
                  </button>
                </div>
              )}

              {!loading && assessment && (
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#E9D5FF] to-[#F5D0FE] text-[#7C3AED] shadow-[0_8px_18px_rgba(124,58,237,0.18)] ring-1 ring-white">
                      <AssessmentIcon name={assessment.icon} />
                    </span>
                    <span className="rounded-full bg-[#FFE4F0] px-3 py-1 text-[11px] font-bold text-[#C45A92]">
                      Free
                    </span>
                    <span className="rounded-full bg-[#EDE7FF] px-3 py-1 text-[11px] font-bold text-[#6D5A9C]">
                      {typeBadgeLabel(assessment.typeBadge)}
                    </span>
                    {assessment.status === "coming_soon" && (
                      <span className="rounded-full bg-[#F3F0F5] px-3 py-1 text-[11px] font-bold text-[#927C8B]">
                        Coming soon
                      </span>
                    )}
                  </div>

                  <h2
                    id="learn-more-title"
                    className="mt-4 font-display text-[26px] font-bold leading-[1.15] tracking-tight text-[#3D2448] sm:text-[28px]"
                  >
                    {assessment.title}
                  </h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#7A6A80]">
                    {assessment.shortDescription}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-white/90 px-3.5 py-2 text-[12px] font-semibold text-[#6B5A72] shadow-sm ring-1 ring-[#EADCE5]/90">
                      {assessment.audience}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-2 text-[12px] font-semibold text-[#6B5A72] shadow-sm ring-1 ring-[#EADCE5]/90">
                      <Clock className="h-3.5 w-3.5 text-[#C45A92]" />~
                      {assessment.estimatedMinutes} min
                      {assessment.questionCount > 0
                        ? ` · ${assessment.questionCount} Qs`
                        : ""}
                    </span>
                    {assessment.referencePeriod && (
                      <span className="inline-flex items-center rounded-full bg-white/90 px-3.5 py-2 text-[12px] font-semibold text-[#6B5A72] shadow-sm ring-1 ring-[#EADCE5]/90">
                        {assessment.referencePeriod}
                      </span>
                    )}
                  </div>

                  <p className="mt-5 flex items-start gap-2 text-[12px] leading-relaxed text-[#9A8A9E]">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#C45A92]" />
                    <span>
                      For personal reflection only — not a diagnosis.
                    </span>
                  </p>

                  {assessment.requiresAcknowledgment && assessment.canStart && (
                    <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-[18px] bg-white/80 px-3.5 py-3.5 shadow-sm ring-1 ring-[#EADCE5]/90 transition hover:ring-[#F0CADA]">
                      <input
                        type="checkbox"
                        checked={ack}
                        onChange={(e) => setAck(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-[#EADCE5] text-[#C45A92] focus:ring-[#F0CADA]"
                      />
                      <span className="text-[13px] font-medium text-[#3D2448]">
                        I understand this is not a diagnosis.
                      </span>
                    </label>
                  )}
                </div>
              )}
            </div>

            {!loading && assessment && (
              <div className="relative flex shrink-0 items-center gap-2.5 px-5 pb-5 pt-3 sm:px-6 sm:pb-6">
                {assessment.canStart ? (
                  <button
                    type="button"
                    disabled={!canBegin}
                    onClick={begin}
                    className={cn(
                      "inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#E879A8] via-[#C45A92] to-[#A78BFA] px-5 text-[15px] font-bold text-white shadow-[0_12px_28px_rgba(196,90,146,0.35)] transition hover:brightness-[1.03] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
                    )}
                  >
                    <Sparkles className="h-4 w-4" />
                    Begin assessment
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <span className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-[#F3F0F5] text-[14px] font-semibold text-[#927C8B]">
                    Coming soon
                  </span>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-[#EADCE5] bg-white px-5 text-[14px] font-bold text-[#3D2448] transition hover:bg-[#FFF5FA]"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
