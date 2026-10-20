"use client";

import { ArrowRight, Flower2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/wellness-plan/progress-ring";
import type { WellnessPlan } from "@/lib/wellness-plan/types";
import {
  computePlanProgress,
  getCurrentWeek,
} from "@/lib/wellness-plan/generate-plan";
import { getPlanBySlug } from "@/lib/wellness-plan/catalog";

interface ActivePlanSummaryProps {
  plan: WellnessPlan;
  onContinue: () => void;
}

export function ActivePlanSummary({ plan, onContinue }: ActivePlanSummaryProps) {
  const progress = computePlanProgress(plan);
  const week = getCurrentWeek(plan);
  const catalog = plan.catalogSlug
    ? getPlanBySlug(plan.catalogSlug)
    : plan.primaryGoal === "reduce_anxiety"
      ? getPlanBySlug("reduce-anxiety")
      : undefined;
  const blurb =
    plan.assessment.customGoal ||
    catalog?.shortDescription ||
    "Continue where you left off — your progress is saved.";

  return (
    <section className="rounded-[22px] border border-[#EEDCE9] bg-white p-5 shadow-[0_8px_28px_rgba(123,57,98,0.06)] md:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:gap-6">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFF0F6]">
            <Flower2 className="h-5 w-5 text-[#BE4A8B]" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#BE4A8B]">
              Your Active Plan
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-[-0.02em] text-[#512943] md:text-[1.35rem]">
              {plan.title}
            </h2>
            <p className="mt-1 max-w-[36ch] text-sm leading-relaxed text-[#957F94]">
              {blurb}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <ProgressRing value={progress.percent} size={68} stroke={6} />
          <div>
            <p className="text-lg font-bold leading-none text-[#512943]">
              {progress.percent}%
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#957F94]">
              Progress
            </p>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-3 border-y border-[#F3E6EF] py-3 sm:grid-cols-3 sm:gap-4 xl:border-y-0 xl:border-l xl:py-0 xl:pl-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#957F94]">
              Current Streak
            </p>
            <p className="mt-1.5 text-base font-bold text-[#512943]">
              {plan.currentStreak}{" "}
              <span className="text-sm font-semibold text-[#957F94]">Days</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#957F94]">
              Completed Tasks
            </p>
            <p className="mt-1.5 text-base font-bold text-[#512943]">
              {progress.completedTasks}
              <span className="text-sm font-semibold text-[#957F94]">
                /{progress.totalTasks}
              </span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#957F94]">
              Current Week
            </p>
            <p className="mt-1.5 text-base font-bold text-[#512943]">
              Week {week?.weekNumber ?? 1}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 xl:justify-end">
          <Button
            onClick={onContinue}
            className="h-11 w-full rounded-full bg-gradient-to-r from-[#BE4A8B] to-[#A63F79] px-6 text-white shadow-[0_8px_20px_rgba(190,74,139,0.25)] hover:from-[#A63F79] hover:to-[#94366B] sm:w-auto"
          >
            Continue Plan
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
