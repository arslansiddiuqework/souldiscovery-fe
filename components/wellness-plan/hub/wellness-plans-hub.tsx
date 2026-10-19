"use client";

import { useCallback, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Flower2, Gamepad2, Heart, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { logActivity } from "@/lib/api/activity";
import { AnxietyGames } from "@/components/games/anxiety-games";
import { DashboardMusic } from "@/components/music/dashboard-music";
import { DailyMoodCheckIn } from "./daily-mood-checkin";
import { ImmediateSupportSection } from "./immediate-support-section";
import { WellnessPlanExplorer } from "./wellness-plan-explorer";
import type { WellnessPlan } from "@/lib/wellness-plan/types";
import { computePlanProgress } from "@/lib/wellness-plan/generate-plan";

interface WellnessPlansHubProps {
  activePlan: WellnessPlan | null;
  enrollments: WellnessPlan[];
  onContinueActive: () => void;
  onOpenPlan: (slug: string) => void;
}

type DeskView = "plans" | "calm";

export function WellnessPlansHub({
  activePlan,
  enrollments,
  onContinueActive,
  onOpenPlan,
}: WellnessPlansHubProps) {
  const reduceMotion = useReducedMotion();
  const [deskView, setDeskView] = useState<DeskView>("plans");
  const [suggestedSlugs, setSuggestedSlugs] = useState<string[]>([]);
  const orderedSuggestions = useMemo(() => suggestedSlugs, [suggestedSlugs]);
  const progress =
    activePlan?.status === "active" ? computePlanProgress(activePlan) : null;

  const handleGamePlayed = useCallback(
    async (gameName: string, description: string, durationMinutes = 5) => {
      try {
        await logActivity({
          type: "game",
          name: gameName,
          description,
          duration: Math.max(1, durationMinutes),
        });
      } catch (error) {
        console.error("Error logging game activity:", error);
      }
    },
    []
  );

  return (
    <div className="relative h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#FBF9FF] text-[#49263D]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(183,71,131,0.14),transparent_58%)]" />
        <div className="absolute -left-20 bottom-10 h-64 w-64 rounded-full bg-[rgba(183,71,131,0.08)] blur-3xl" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-[rgba(120,99,198,0.12)] blur-3xl" />
      </div>

      <div className="relative z-10 flex h-full min-h-0 flex-col px-3 pb-3 pt-[5.4rem] sm:px-5 sm:pb-4 sm:pt-24 lg:px-7 lg:pt-28">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto flex h-full min-h-0 w-full max-w-[1180px] flex-col overflow-hidden rounded-[28px] border border-[#EADCE5]/90 bg-white/85 shadow-[0_18px_50px_rgba(123,57,98,0.1)] backdrop-blur-xl"
        >
          <div className="relative shrink-0 overflow-hidden border-b border-[#EADCE5]/80 bg-gradient-to-r from-[#FFF0F6] via-white to-[#F4E8FF] px-4 py-4 sm:px-5">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(183,71,131,0.2),transparent_70%)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -left-6 bottom-0 h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(120,99,198,0.16),transparent_70%)]"
            />

            <div className="relative flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C45A92] to-[#B74783] text-white shadow-[0_10px_22px_rgba(183,71,131,0.32)]">
                  <Flower2 className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B74783]">
                    Wellness desk
                  </p>
                  <h1 className="truncate font-display text-lg font-bold tracking-tight text-[#49263D] sm:text-xl">
                    Care for today, plans for tomorrow
                  </h1>
                </div>
              </div>

              <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                <div
                  role="tablist"
                  aria-label="Desk views"
                  className="relative grid w-full grid-cols-2 gap-1 rounded-[20px] bg-[#F4EEF3] p-1.5 shadow-[inset_0_1px_2px_rgba(123,57,98,0.06)] ring-1 ring-[#EADCE5]/90 sm:w-[340px]"
                >
                  {(
                    [
                      {
                        id: "plans" as const,
                        label: "Plans",
                        hint: "Your paths",
                        icon: LayoutGrid,
                      },
                      {
                        id: "calm" as const,
                        label: "Calm tools",
                        hint: "Breathe & play",
                        icon: Gamepad2,
                      },
                    ] as const
                  ).map((tab) => {
                    const active = deskView === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setDeskView(tab.id)}
                        className={cn(
                          "relative z-[1] flex items-center gap-2.5 rounded-[16px] px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]",
                          active
                            ? "text-[#49263D]"
                            : "text-[#795A70] hover:text-[#49263D]"
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId={
                              reduceMotion ? undefined : "desk-view-pill"
                            }
                            className="absolute inset-0 rounded-[16px] bg-white shadow-[0_10px_24px_rgba(123,57,98,0.12)] ring-1 ring-[#F0D9E6]"
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 34,
                            }}
                          />
                        )}
                        <span
                          className={cn(
                            "relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition",
                            active
                              ? "bg-gradient-to-br from-[#C45A92] to-[#B74783] text-white shadow-[0_8px_16px_rgba(183,71,131,0.32)]"
                              : "bg-white/80 text-[#B74783] ring-1 ring-[#EADCE5]"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="relative z-[1] min-w-0">
                          <span className="block truncate text-[13px] font-bold tracking-tight">
                            {tab.label}
                          </span>
                          <span
                            className={cn(
                              "mt-0.5 block truncate text-[10px] font-medium",
                              active ? "text-[#B74783]" : "text-[#A8939E]"
                            )}
                          >
                            {tab.hint}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="hidden items-center gap-2.5 rounded-[18px] bg-gradient-to-br from-white via-[#FFF8FB] to-[#F4E8FF] px-3.5 py-2.5 shadow-[0_8px_20px_rgba(123,57,98,0.08)] ring-1 ring-[#EADCE5]/90 xl:flex">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFF0F6] text-[#B74783] ring-1 ring-[#F0D9E6]">
                    <Heart className="h-3.5 w-3.5 fill-[#B74783]/20" aria-hidden />
                  </span>
                  <p className="max-w-[168px] text-[12px] font-medium leading-snug text-[#795A70]">
                    “Small steps create big changes.”
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[270px_minmax(0,1fr)]">
            <aside className="flex shrink-0 flex-col gap-2.5 overflow-y-auto border-b border-[#EADCE5]/80 bg-gradient-to-b from-[#FFF8FB] to-white px-3 py-3 sm:px-4 lg:min-h-0 lg:gap-3 lg:border-b-0 lg:border-r lg:px-5 lg:py-4">
              <div className="hidden lg:block">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#B74783]">
                  Today
                </p>
                <p className="mt-1 text-sm font-semibold text-[#49263D]">
                  Check in, then choose a path.
                </p>
              </div>

              <div className="rounded-2xl border border-[#EADCE5]/90 bg-white p-2.5 shadow-[0_6px_18px_rgba(123,57,98,0.05)] lg:p-3">
                <DailyMoodCheckIn
                  compact
                  onSuggestPlans={setSuggestedSlugs}
                />
              </div>

              <div className="rounded-2xl border border-[#EADCE5]/90 bg-white p-2.5 shadow-[0_6px_18px_rgba(123,57,98,0.05)] lg:p-3">
                <ImmediateSupportSection compact />
              </div>

              {activePlan?.status === "active" && progress && (
                <button
                  type="button"
                  onClick={onContinueActive}
                  className="rounded-2xl border border-[#F0D9E6] bg-gradient-to-br from-[#FFF0F6] to-white p-3 text-left shadow-[0_8px_20px_rgba(183,71,131,0.12)] transition hover:border-[#B74783]/35 lg:mt-auto lg:p-3.5"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#B74783]">
                    Active plan · {progress.percent}%
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#49263D]">
                    {activePlan.title.replace(/ Plan$/, "")}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F1E9EF]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#C45A92] to-[#B74783]"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] font-semibold text-[#B74783]">
                    Continue where you left off →
                  </p>
                </button>
              )}
            </aside>

            <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
              {deskView === "plans" ? (
                <WellnessPlanExplorer
                  enrollments={enrollments}
                  highlightSlugs={orderedSuggestions}
                  activePlan={activePlan}
                  onOpenPlan={onOpenPlan}
                  onContinueActive={onContinueActive}
                />
              ) : (
                <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-gradient-to-br from-[#FFF8FB] via-[#FBF9FF] to-[#F3EEFF]">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(183,71,131,0.18),transparent_70%)]"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute bottom-0 left-8 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(29,185,84,0.1),transparent_70%)]"
                  />

                  <div className="relative flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-3.5 sm:px-5 sm:pt-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B74783]">
                        Calm toolkit
                      </p>
                      <h2 className="mt-0.5 font-display text-lg font-bold tracking-tight text-[#49263D] sm:text-xl">
                        Instant calm
                      </h2>
                    </div>
                    <span className="hidden shrink-0 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-[#795A70] ring-1 ring-[#EADCE5] sm:inline">
                      Relief + sound
                    </span>
                  </div>

                  <div className="relative grid min-h-0 flex-1 grid-rows-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-3 overflow-hidden p-3 pt-1 sm:p-4 sm:pt-2 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:grid-rows-1 lg:gap-4">
                    <AnxietyGames
                      compact
                      onGamePlayed={handleGamePlayed}
                    />
                    <DashboardMusic compact />
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
