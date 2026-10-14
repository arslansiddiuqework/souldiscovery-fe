"use client";

import { useState } from "react";
import { ArrowLeft, Clock, CalendarDays, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CatalogPlan } from "@/lib/wellness-plan/catalog";
import { ACCENT_CLASSES } from "@/lib/wellness-plan/catalog";
import { getCatalogIcon } from "@/lib/wellness-plan/catalog/icons";
import type {
  DailyTime,
  PreferredActivity,
  WellnessAssessment,
  WellnessPlan,
} from "@/lib/wellness-plan/types";
import {
  computePlanProgress,
} from "@/lib/wellness-plan/generate-plan";

interface WellnessPlanDetailsProps {
  catalog: CatalogPlan;
  enrollment: WellnessPlan | null;
  starting: boolean;
  onBack: () => void;
  onStart: (assessment: WellnessAssessment, forceNew?: boolean) => void;
  onContinue: () => void;
}

export function WellnessPlanDetails({
  catalog,
  enrollment,
  starting,
  onBack,
  onStart,
  onContinue,
}: WellnessPlanDetailsProps) {
  const Icon = getCatalogIcon(catalog.icon);
  const accent = ACCENT_CLASSES[catalog.accent];
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dailyTime, setDailyTime] = useState<DailyTime>(
    catalog.defaultDailyTime
  );
  const [confirmRestart, setConfirmRestart] = useState(false);

  const progress = enrollment ? computePlanProgress(enrollment) : null;
  const isActive = enrollment?.status === "active";
  const isPaused = enrollment?.status === "paused";
  const isCompleted = enrollment?.status === "completed";

  const buildAssessment = (): WellnessAssessment => ({
    primaryGoal: catalog.primaryGoal,
    stressLevel: 5,
    sleepQuality: "average",
    dailyTime,
    activities: catalog.defaultActivities as PreferredActivity[],
    preferredTime: "flexible",
    completedAt: new Date().toISOString(),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button
        variant="ghost"
        onClick={onBack}
        className="rounded-full text-[#795A70]"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to plans
      </Button>

      <div className="rounded-[22px] border border-[#EEDCE9] bg-white p-6 shadow-[0_4px_20px_rgba(190,74,139,0.05)] md:p-8">
        <div className="flex flex-wrap items-start gap-4">
          <span
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full",
              accent.bg,
              accent.icon
            )}
          >
            <Icon className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <span className="inline-flex rounded-full border border-[#EEDCE9] bg-[#FCF8FC] px-2.5 py-0.5 text-[11px] font-semibold text-[#BE4A8B]">
              {catalog.category}
            </span>
            <h1 className="mt-2 text-2xl font-bold tracking-[-0.02em] text-[#512943] md:text-3xl">
              {catalog.title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#957F94] md:text-base">
              {catalog.introduction}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[16px] border border-[#EEDCE9] bg-[#FCF8FC] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#957F94]">
              Who this may help
            </p>
            <p className="mt-2 text-sm text-[#512943]">{catalog.whoItsFor}</p>
          </div>
          <div className="rounded-[16px] border border-[#EEDCE9] bg-[#FCF8FC] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#957F94]">
              Duration
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-sm font-medium text-[#512943]">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-[#BE4A8B]" />
                {catalog.suggestedDurationDays} days
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#BE4A8B]" />
                {catalog.estimatedMinutesPerDay}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#512943]">
            Goals
          </h2>
          <ul className="mt-2 space-y-1.5">
            {catalog.goals.map((g) => (
              <li key={g} className="text-sm text-[#795A70]">
                · {g}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#512943]">
            What you&apos;ll practice
          </h2>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {catalog.activityOutline.slice(0, 8).map((a) => (
              <li
                key={a.title}
                className="rounded-[12px] border border-[#EEDCE9] bg-[#FCF8FC] px-3 py-2 text-sm text-[#512943]"
              >
                {a.title}
              </li>
            ))}
          </ul>
        </div>

        {catalog.safetyNotes && (
          <p className="mt-6 rounded-[14px] border border-[#EEDCE9] bg-[#FFF0F6] p-4 text-xs leading-relaxed text-[#512943]">
            <strong className="font-semibold">Note: </strong>
            {catalog.safetyNotes}
          </p>
        )}

        {(isActive || isPaused) && progress && (
          <p className="mt-4 text-sm font-medium text-[#3D9B84]">
            You&apos;re {progress.percent}% through this plan (
            {progress.completedTasks}/{progress.totalTasks} tasks).
          </p>
        )}

        {isPaused && (
          <p className="mt-2 text-sm text-[#957F94]">
            This enrollment is paused. Resume to continue where you left off.
          </p>
        )}

        {isCompleted && (
          <p className="mt-4 text-sm font-medium text-[#BE4A8B]">
            You completed this plan. You can review it or start again with a
            fresh enrollment.
          </p>
        )}

        {showOnboarding && !isActive && !isPaused && !isCompleted && (
          <div className="mt-6 rounded-[16px] border border-[#EEDCE9] bg-[#FCF8FC] p-4">
            <p className="text-sm font-semibold text-[#512943]">
              How much time can you comfortably spend each day?
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(
                [
                  ["5_minutes", "5 min"],
                  ["10_minutes", "10 min"],
                  ["15_minutes", "15 min"],
                  ["30_minutes", "30 min"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDailyTime(value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold",
                    dailyTime === value
                      ? "border-[#BE4A8B] bg-[#BE4A8B] text-white"
                      : "border-[#EEDCE9] bg-white text-[#795A70]"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-[#957F94]">
              Optional — you can change pace later. Starting creates your
              personalised schedule from this plan&apos;s outline.
            </p>
          </div>
        )}

        {confirmRestart && (
          <div className="mt-4 rounded-[14px] border border-[#EEDCE9] bg-white p-4 text-sm text-[#512943]">
            Start again with a new enrollment? Your previous progress stays in
            history and will not be overwritten.
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                className="rounded-full bg-[#BE4A8B] text-white hover:bg-[#A63F79]"
                disabled={starting}
                onClick={() => onStart(buildAssessment(), true)}
              >
                {starting ? "Starting…" : "Yes, start fresh"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() => setConfirmRestart(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {isActive ? (
            <Button
              onClick={onContinue}
              className="rounded-full bg-[#BE4A8B] px-6 text-white hover:bg-[#A63F79]"
            >
              Continue Plan
            </Button>
          ) : isPaused ? (
            <>
              <Button
                onClick={onContinue}
                className="rounded-full bg-[#BE4A8B] px-6 text-white hover:bg-[#A63F79]"
              >
                Resume Plan
              </Button>
              <Button
                onClick={() => setConfirmRestart(true)}
                variant="outline"
                className="rounded-full"
              >
                Start Again
              </Button>
            </>
          ) : isCompleted ? (
            <>
              <Button
                onClick={onContinue}
                variant="outline"
                className="rounded-full"
              >
                Review Plan
              </Button>
              <Button
                onClick={() => setConfirmRestart(true)}
                className="rounded-full bg-[#BE4A8B] text-white hover:bg-[#A63F79]"
              >
                Start Again
              </Button>
            </>
          ) : showOnboarding ? (
            <Button
              disabled={starting}
              onClick={() => onStart(buildAssessment())}
              className="rounded-full bg-[#BE4A8B] px-6 text-white hover:bg-[#A63F79]"
            >
              {starting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating plan…
                </>
              ) : (
                "Start Plan"
              )}
            </Button>
          ) : (
            <Button
              onClick={() => setShowOnboarding(true)}
              className="rounded-full bg-[#BE4A8B] px-6 text-white hover:bg-[#A63F79]"
            >
              Start Plan
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
