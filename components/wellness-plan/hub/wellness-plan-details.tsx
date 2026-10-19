"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  CalendarDays,
  Check,
  Clock,
  FileText,
  Flower2,
  Loader2,
  Sparkles,
  Target,
  Wind,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CatalogPlan } from "@/lib/wellness-plan/catalog";
import type {
  DailyTime,
  PreferredActivity,
  WellnessAssessment,
  WellnessPlan,
} from "@/lib/wellness-plan/types";
import { computePlanProgress } from "@/lib/wellness-plan/generate-plan";

interface WellnessPlanDetailsProps {
  catalog: CatalogPlan;
  enrollment: WellnessPlan | null;
  starting: boolean;
  open: boolean;
  onBack: () => void;
  onStart: (assessment: WellnessAssessment, forceNew?: boolean) => void;
  onContinue: () => void;
}

const PRACTICE_STYLES = [
  { wrap: "bg-[#EBE9FE] text-[#5B4B8A]", Icon: Wind },
  { wrap: "bg-[#FCE7F3] text-[#B74783]", Icon: Flower2 },
  { wrap: "bg-[#ECFDF5] text-[#287D58]", Icon: Brain },
  { wrap: "bg-[#EEF2FF] text-[#5B6BC7]", Icon: FileText },
] as const;

export function WellnessPlanDetails({
  catalog,
  enrollment,
  starting,
  open,
  onBack,
  onStart,
  onContinue,
}: WellnessPlanDetailsProps) {
  const reduceMotion = useReducedMotion();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dailyTime, setDailyTime] = useState<DailyTime>(
    catalog.defaultDailyTime
  );
  const [confirmRestart, setConfirmRestart] = useState(false);

  const progress = enrollment ? computePlanProgress(enrollment) : null;
  const isActive = enrollment?.status === "active";
  const isPaused = enrollment?.status === "paused";
  const isCompleted = enrollment?.status === "completed";

  useEffect(() => {
    if (!open) return;
    setShowOnboarding(false);
    setConfirmRestart(false);
    setDailyTime(catalog.defaultDailyTime);
  }, [open, catalog.slug, catalog.defaultDailyTime]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onBack]);

  const buildAssessment = (): WellnessAssessment => ({
    primaryGoal: catalog.primaryGoal,
    stressLevel: 5,
    sleepQuality: "average",
    dailyTime,
    activities: catalog.defaultActivities as PreferredActivity[],
    preferredTime: "flexible",
    completedAt: new Date().toISOString(),
  });

  const practices = catalog.activityOutline.slice(0, 4);
  const topGoals = catalog.goals.slice(0, 2);

  const primaryAction = () => {
    if (isActive || isPaused) {
      onContinue();
      return;
    }
    if (isCompleted) {
      setConfirmRestart(true);
      return;
    }
    if (showOnboarding) {
      onStart(buildAssessment());
      return;
    }
    setShowOnboarding(true);
  };

  const primaryLabel = (() => {
    if (starting) return "Creating…";
    if (isActive) return "Continue plan";
    if (isPaused) return "Resume plan";
    if (isCompleted) return "Start again";
    if (showOnboarding) return "Start plan";
    return "Start plan";
  })();

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-[#2E1C4B]/35 backdrop-blur-md"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            onClick={onBack}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-detail-title"
            initial={
              reduceMotion ? false : { opacity: 0, y: 32, scale: 0.96 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion ? undefined : { opacity: 0, y: 20, scale: 0.97 }
            }
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="relative z-[1] flex max-h-[min(92dvh,720px)] w-full max-w-[420px] flex-col overflow-hidden rounded-t-[36px] bg-[#FBF9FF] shadow-[0_28px_80px_rgba(46,28,75,0.28)] sm:rounded-[36px]"
          >
            {/* Decorative glow trails */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-6 top-0 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(214,97,173,0.28),transparent_68%)] blur-2xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -left-10 bottom-16 h-40 w-40 rotate-[-18deg] rounded-full bg-[radial-gradient(ellipse,rgba(123,82,217,0.22),transparent_70%)] blur-xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-24 left-0 h-24 w-48 rotate-[-12deg] bg-[linear-gradient(105deg,transparent,rgba(183,71,131,0.18),rgba(123,82,217,0.12),transparent)] blur-md"
            />

            {/* Lotus hero — soft-masked to blend into modal */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-3 -top-1 h-[190px] w-[190px] sm:h-[210px] sm:w-[210px]"
              style={{
                WebkitMaskImage:
                  "radial-gradient(ellipse 62% 58% at 55% 48%, #000 28%, transparent 72%)",
                maskImage:
                  "radial-gradient(ellipse 62% 58% at 55% 48%, #000 28%, transparent 72%)",
              }}
            >
              <Image
                src="/images/plan-preview-lotus.jpg"
                alt=""
                fill
                className="scale-110 object-cover object-center opacity-95"
                sizes="210px"
                priority
              />
            </div>

            {/* Header */}
            <div className="relative flex items-center justify-between px-5 pb-1 pt-4 sm:px-6 sm:pt-5">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#2E1C4B]">
                <Sparkles className="h-3.5 w-3.5 text-[#7B52D9]" />
                Plan Preview
              </p>
              <button
                type="button"
                onClick={onBack}
                className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#5A4A6A] shadow-sm ring-1 ring-[#E8E0F5] transition hover:bg-white hover:text-[#2E1C4B]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative min-h-0 flex-1 overflow-y-auto px-5 pb-2 pt-3 sm:px-6">
              <div className="flex flex-wrap items-center gap-2 pr-[120px] sm:pr-[140px]">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#F9A8D4] to-[#E879C0] text-white shadow-[0_6px_14px_rgba(232,121,192,0.35)]">
                  <Flower2 className="h-4 w-4" />
                </span>
                <span className="rounded-full bg-[#EDE7FF] px-3 py-1 text-[12px] font-semibold text-[#5B4B8A]">
                  {catalog.category}
                </span>
              </div>

              <h2
                id="plan-detail-title"
                className="mt-3 max-w-[240px] font-display text-[26px] font-bold leading-[1.15] tracking-tight text-[#2E1C4B] sm:max-w-[260px] sm:text-[28px]"
              >
                {catalog.title}
              </h2>
              <p className="mt-2 max-w-[300px] text-[14px] leading-relaxed text-[#70658B]">
                {catalog.shortDescription}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EDE7FF] px-3.5 py-2 text-[12px] font-semibold text-[#5B4B8A]">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {catalog.suggestedDurationDays} days
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EDE7FF] px-3.5 py-2 text-[12px] font-semibold text-[#5B4B8A]">
                  <Clock className="h-3.5 w-3.5" />
                  {catalog.estimatedMinutesPerDay}
                </span>
              </div>

              {topGoals.length > 0 && (
                <div className="mt-5 rounded-[22px] bg-[#F3F0FF] p-4">
                  <div className="mb-2.5 flex items-center gap-2">
                    <Target className="h-4 w-4 text-[#7B52D9]" />
                    <p className="text-[14px] font-bold text-[#2E1C4B]">Focus</p>
                  </div>
                  <ul className="space-y-2.5">
                    {topGoals.map((g) => (
                      <li
                        key={g}
                        className="flex items-start gap-2.5 text-[13px] leading-snug text-[#4A3F68]"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7B52D9] text-white">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {practices.length > 0 && (
                <div className="mt-5">
                  <p className="text-[14px] font-bold text-[#2E1C4B]">
                    You&apos;ll Practice
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {practices.map((a, i) => {
                      const style = PRACTICE_STYLES[i % PRACTICE_STYLES.length];
                      const Icon = style.Icon;
                      return (
                        <span
                          key={a.title}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-semibold",
                            style.wrap
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {a.title}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {(isActive || isPaused) && progress && (
                <p className="mt-4 text-[12px] font-semibold text-[#7B52D9]">
                  {progress.percent}% complete · {progress.completedTasks}/
                  {progress.totalTasks} tasks
                </p>
              )}

              {showOnboarding && !isActive && !isPaused && !isCompleted && (
                <div className="mt-4 rounded-[18px] bg-white p-3.5 ring-1 ring-[#E8E0F5]">
                  <p className="text-[13px] font-semibold text-[#2E1C4B]">
                    Daily time?
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
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
                          "rounded-full px-3 py-1.5 text-[11px] font-bold transition",
                          dailyTime === value
                            ? "bg-[#7B52D9] text-white"
                            : "bg-[#F3F0FF] text-[#5B4B8A]"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {confirmRestart && (
                <div className="mt-4 rounded-[18px] bg-[#FCE7F3] p-3.5 text-[12px] text-[#2E1C4B]">
                  Start fresh? Past progress stays saved.
                  <div className="mt-2.5 flex gap-2">
                    <button
                      type="button"
                      disabled={starting}
                      onClick={() => onStart(buildAssessment(), true)}
                      className="rounded-full bg-[#7B52D9] px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-50"
                    >
                      {starting ? "Starting…" : "Yes, start fresh"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmRestart(false)}
                      className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-[#5B4B8A] ring-1 ring-[#E8E0F5]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer CTAs */}
            <div className="relative flex shrink-0 items-center gap-2.5 px-5 pb-5 pt-3 sm:px-6 sm:pb-6">
              <button
                type="button"
                disabled={starting}
                onClick={primaryAction}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7B52D9] to-[#D661AD] px-5 text-[15px] font-bold text-white shadow-[0_12px_28px_rgba(123,82,217,0.35)] transition hover:brightness-[1.03] active:scale-[0.98] disabled:opacity-55"
              >
                {starting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {primaryLabel}
                {!starting && <ArrowRight className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={onBack}
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#E4DDF2] bg-white px-5 text-[14px] font-bold text-[#2E1C4B] transition hover:bg-[#FBF9FF]"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
