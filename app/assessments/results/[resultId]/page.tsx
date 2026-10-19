"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Loader2, X } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { NeedSupportNow } from "@/components/assessments/crisis-support";
import { PastelLandscapeBackground } from "@/components/ui/pastel-landscape-background";
import { BRAND_NAME } from "@/lib/branding";
import {
  fetchAssessmentResult,
  readGuestResult,
  type SubmitResult,
} from "@/lib/api/assessments";
import { useSession } from "@/lib/contexts/session-context";
import { cn } from "@/lib/utils";

function ResultPulse({
  answered,
  skipped,
  score,
  maxScore,
  reduceMotion,
}: {
  answered: number;
  skipped: number;
  score: number | null;
  maxScore: number | null;
  reduceMotion: boolean | null;
}) {
  const total = Math.max(answered + skipped, 1);
  const answeredPct = Math.round((answered / total) * 100);
  const scorePct =
    score != null && maxScore != null && maxScore > 0
      ? Math.round((score / maxScore) * 100)
      : null;
  const ringPct = scorePct ?? answeredPct;
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (ringPct / 100) * circ;

  return (
    <div className="relative mx-auto flex h-[148px] w-[148px] items-center justify-center sm:h-[168px] sm:w-[168px]">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="rgba(183,71,131,0.12)"
          strokeWidth="10"
        />
        <motion.circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="#B74783"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={reduceMotion ? false : { strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {scorePct != null ? (
          <>
            <span className="font-display text-[2.4rem] font-bold leading-none tracking-tight text-[#49263D] sm:text-[2.75rem]">
              {scorePct}
            </span>
            <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#927C8B]">
              score
            </span>
          </>
        ) : (
          <>
            <span className="font-display text-[2.4rem] font-bold leading-none tracking-tight text-[#49263D] sm:text-[2.75rem]">
              {answered}
            </span>
            <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#927C8B]">
              answered
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default function AssessmentResultsPage() {
  const params = useParams();
  const resultId = String(params.resultId || "");
  const { isAuthenticated } = useSession();
  const reduceMotion = useReducedMotion();
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const isRouting = scoring?.scoringMethod === "starting_point_routing";

  const chips = useMemo(() => {
    if (!scoring) return [];
    if (isRouting) {
      return (scoring.suggestedAssessmentSlugs || []).slice(0, 3).map((slug) => ({
        key: slug,
        label: slug.replace(/-/g, " "),
        href: `/assessments/${slug}`,
        tone: "rose" as const,
      }));
    }
    const items: Array<{
      key: string;
      label: string;
      tone: "green" | "rose" | "muted";
    }> = [];
    scoring.goingWell.slice(0, 2).forEach((item, i) => {
      items.push({
        key: `well-${i}`,
        label: item.split(/[.!—]/)[0]?.trim() || item,
        tone: "green",
      });
    });
    scoring.needsAttention.slice(0, 2).forEach((item, i) => {
      items.push({
        key: `need-${i}`,
        label: item.split(/[.!—]/)[0]?.trim() || item,
        tone: "rose",
      });
    });
    if (items.length === 0) {
      items.push({
        key: "neutral",
        label:
          scoring.skippedCount > 0 && scoring.answeredCount === 0
            ? "Skipped this time"
            : "Reflection complete",
        tone: "muted",
      });
    }
    return items.slice(0, 4);
  }, [scoring, isRouting]);

  const headline =
    scoring?.interpretationLabel ||
    (scoring && scoring.answeredCount === 0 ? "Paused for now" : "You’re done");

  const primaryHref = result?.primaryNextStep?.href || "/wellness-plan";
  const primaryLabel =
    result?.primaryNextStep?.label ||
    (scoring && scoring.answeredCount === 0 ? "Retake when ready" : "Continue");

  return (
    <div className="dashboard-shell relative fixed inset-0 z-[55] overflow-hidden text-[#49263D]">
      <PastelLandscapeBackground />

      <div className="dashboard-canvas relative z-10 flex h-full min-h-0 flex-col overflow-hidden px-4 pb-4 pt-3 sm:px-6 sm:pb-5 sm:pt-4 lg:px-10">
        <header className="flex shrink-0 items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <BrandLogo variant="icon" size={34} className="shrink-0" />
            <p className="font-display text-[15px] font-bold tracking-tight">
              {BRAND_NAME}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NeedSupportNow crisis={result?.crisis} />
            <Link
              href="/assessments"
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EADCE5] bg-white/90 text-[#795A70] transition hover:bg-white"
            >
              <X className="h-4 w-4" />
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#B74783]" />
          </div>
        ) : error || !result || !scoring ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 text-center">
            <p className="text-[15px]">{error || "Result not found"}</p>
            <Link href="/assessments" className="text-sm font-bold text-[#B74783]">
              Back
            </Link>
          </div>
        ) : (
          <motion.main
            className="relative mx-auto flex min-h-0 w-full max-w-[720px] flex-1 flex-col items-center justify-center"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-[18%] h-64 w-64 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(183,71,131,0.18),transparent_70%)] blur-2xl"
            />

            <p className="relative text-[12px] font-semibold uppercase tracking-[0.16em] text-[#B74783]">
              Your result
            </p>
            <h1 className="relative mt-2 max-w-[16ch] text-center font-display text-[clamp(1.5rem,3.5vw,2.15rem)] font-bold leading-[1.1] tracking-tight text-[#49263D]">
              {headline}
            </h1>

            <div className="relative mt-6 sm:mt-8">
              <ResultPulse
                answered={scoring.answeredCount}
                skipped={scoring.skippedCount}
                score={scoring.totalScore}
                maxScore={scoring.maxScore}
                reduceMotion={reduceMotion}
              />
            </div>

            {/* Compact metric row — visual, not paragraphs */}
            <div className="relative mt-5 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-bold text-[#49263D] ring-1 ring-[#EADCE5]">
                <span className="h-2 w-2 rounded-full bg-[#287D58]" />
                {scoring.goingWell.length} strengths
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-bold text-[#49263D] ring-1 ring-[#EADCE5]">
                <span className="h-2 w-2 rounded-full bg-[#B74783]" />
                {scoring.needsAttention.length} focus
              </span>
              {scoring.skippedCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-bold text-[#795A70] ring-1 ring-[#EADCE5]">
                  {scoring.skippedCount} skipped
                </span>
              )}
            </div>

            {/* Short theme chips instead of essay blocks */}
            <div className="relative mt-5 flex max-w-full flex-wrap justify-center gap-2 px-1">
              {chips.map((chip, i) => {
                const className = cn(
                  "max-w-[220px] truncate rounded-full px-3.5 py-2 text-[12px] font-semibold capitalize",
                  "tone" in chip && chip.tone === "green" && "bg-[#E8F7EF] text-[#1F6B4A]",
                  "tone" in chip && chip.tone === "rose" && "bg-[#FFF0F6] text-[#B74783]",
                  "tone" in chip && chip.tone === "muted" && "bg-white/90 text-[#795A70] ring-1 ring-[#EADCE5]"
                );
                if ("href" in chip && chip.href) {
                  return (
                    <motion.div
                      key={chip.key}
                      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                    >
                      <Link href={chip.href} className={className}>
                        {chip.label}
                      </Link>
                    </motion.div>
                  );
                }
                return (
                  <motion.span
                    key={chip.key}
                    className={className}
                    initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                  >
                    {chip.label}
                  </motion.span>
                );
              })}
            </div>

            {!isRouting && scoring.smallStep && scoring.answeredCount > 0 && (
              <p className="relative mt-5 max-w-[34ch] text-center text-[13px] font-medium leading-snug text-[#795A70]">
                {scoring.smallStep.split(/[.!]/)[0]?.trim()}
                {scoring.smallStep.includes(".") || scoring.smallStep.includes("!")
                  ? "."
                  : ""}
              </p>
            )}

            <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={
                  scoring.answeredCount === 0
                    ? `/assessments/${result.assessmentSlug}/take`
                    : primaryHref
                }
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#B74783] px-6 text-[13px] font-bold text-white transition hover:bg-[#9F376F]"
              >
                {scoring.answeredCount === 0 ? "Retake" : primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              {isAuthenticated && (
                <Link
                  href="/dashboard/assessment-history"
                  className="text-[13px] font-semibold text-[#927C8B] hover:text-[#49263D]"
                >
                  History
                </Link>
              )}
            </div>
          </motion.main>
        )}
      </div>
    </div>
  );
}
