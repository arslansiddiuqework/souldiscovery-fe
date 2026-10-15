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
    <div className="relative h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#F3F8F5] text-[#2A3D36]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(61,155,132,0.12),transparent_58%)]" />
        <div className="absolute -left-20 bottom-10 h-64 w-64 rounded-full bg-[rgba(190,74,139,0.08)] blur-3xl" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-[rgba(90,140,120,0.1)] blur-3xl" />
      </div>

      <div className="relative z-10 flex h-full min-h-0 flex-col px-3 pb-3 pt-[5.4rem] sm:px-5 sm:pb-4 sm:pt-24 lg:px-7 lg:pt-28">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto flex h-full min-h-0 w-full max-w-[1180px] flex-col overflow-hidden rounded-[28px] border border-[#D5E6DD] bg-white/80 shadow-[0_18px_50px_rgba(42,80,64,0.08)] backdrop-blur-xl"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#DCE9E2] bg-gradient-to-r from-[#F4FBF8] via-white to-[#F7FBF9] px-4 py-3.5 sm:px-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3D9B84] to-[#2F8A74] text-white shadow-[0_8px_18px_rgba(61,155,132,0.28)]">
                  <Flower2 className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#3D9B84]">
                    Wellness desk
                  </p>
                  <h1 className="text-lg font-bold tracking-tight text-[#2A3D36] sm:text-xl">
                    Care for today, plans for tomorrow
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="inline-flex rounded-full border border-[#D5E6DD] bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setDeskView("plans")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition",
                    deskView === "plans"
                      ? "bg-[#3D9B84] text-white shadow-sm"
                      : "text-[#5A7268] hover:bg-[#F7FBF9]"
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Plans
                </button>
                <button
                  type="button"
                  onClick={() => setDeskView("calm")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition",
                    deskView === "calm"
                      ? "bg-[#3D9B84] text-white shadow-sm"
                      : "text-[#5A7268] hover:bg-[#F7FBF9]"
                  )}
                >
                  <Gamepad2 className="h-3.5 w-3.5" />
                  Calm tools
                </button>
              </div>
              <p className="hidden max-w-[200px] rounded-2xl border border-[#D5E6DD] bg-white/80 px-3 py-2 text-right text-[11px] italic leading-snug text-[#6F857C] shadow-sm xl:block">
                “Small steps create big changes.”
                <Heart
                  className="ml-1 inline h-3 w-3 text-[#BE4A8B]/70"
                  aria-hidden
                />
              </p>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[270px_minmax(0,1fr)]">
            <aside className="flex shrink-0 flex-col gap-2.5 overflow-y-auto border-b border-[#DCE9E2] bg-gradient-to-b from-[#F4FBF8] to-white px-3 py-3 sm:px-4 lg:min-h-0 lg:gap-3 lg:border-b-0 lg:border-r lg:px-5 lg:py-4">
              <div className="hidden lg:block">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6F857C]">
                  Today
                </p>
                <p className="mt-1 text-sm font-semibold text-[#2A3D36]">
                  Check in, then choose a path.
                </p>
              </div>

              <div className="rounded-2xl border border-[#D5E6DD] bg-white p-2.5 shadow-[0_6px_18px_rgba(42,80,64,0.04)] lg:p-3">
                <DailyMoodCheckIn
                  compact
                  onSuggestPlans={setSuggestedSlugs}
                />
              </div>

              <div className="rounded-2xl border border-[#D5E6DD] bg-white p-2.5 shadow-[0_6px_18px_rgba(42,80,64,0.04)] lg:p-3">
                <ImmediateSupportSection compact />
              </div>

              {activePlan?.status === "active" && progress && (
                <button
                  type="button"
                  onClick={onContinueActive}
                  className="rounded-2xl border border-[#C8E8DE] bg-gradient-to-br from-[#EAF6F2] to-white p-3 text-left shadow-[0_8px_20px_rgba(61,155,132,0.12)] transition hover:border-[#3D9B84]/40 lg:mt-auto lg:p-3.5"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#3D9B84]">
                    Active plan · {progress.percent}%
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#2A3D36]">
                    {activePlan.title.replace(/ Plan$/, "")}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#D5E6DD]">
                    <div
                      className="h-full rounded-full bg-[#3D9B84]"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] font-semibold text-[#3D9B84]">
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
                <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
                  <div className="shrink-0 border-b border-[#DCE9E2] bg-gradient-to-b from-[#F7FBF9] to-white px-4 py-3.5 sm:px-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#3D9B84]">
                      Calm toolkit
                    </p>
                    <h2 className="mt-1 text-base font-bold tracking-tight text-[#2A3D36]">
                      Anxiety relief & music for your mood
                    </h2>
                    <p className="mt-0.5 text-[11px] text-[#6F857C]">
                      Quick soothing activities that sit alongside your wellness
                      plans.
                    </p>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
                    <div className="grid gap-4 lg:grid-cols-5 lg:gap-5">
                      <div className="lg:col-span-3">
                        <AnxietyGames onGamePlayed={handleGamePlayed} />
                      </div>
                      <div className="lg:col-span-2">
                        <DashboardMusic />
                      </div>
                    </div>
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
