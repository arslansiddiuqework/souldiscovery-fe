"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Flower2, Gamepad2, Heart, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalmToolsPanel } from "./calm-tools-panel";
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
  const searchParams = useSearchParams();
  const [deskView, setDeskView] = useState<DeskView>(() =>
    searchParams?.get("view") === "calm" ? "calm" : "plans"
  );
  const progress =
    activePlan?.status === "active" ? computePlanProgress(activePlan) : null;

  useEffect(() => {
    const view = searchParams?.get("view");
    if (view === "calm") setDeskView("calm");
    else if (view === "plans") setDeskView("plans");
  }, [searchParams]);

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
          <div
            data-tour="wellness-plan"
            data-tour-priority="high"
            className="relative shrink-0 overflow-hidden border-b border-[#EADCE5]/70 bg-[linear-gradient(105deg,#FFF7FB_0%,#FFFFFF_42%,#F7F1FF_100%)] px-4 py-4 sm:px-6 sm:py-5"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(ellipse_at_right,rgba(217,184,245,0.35),transparent_70%)]"
            />

            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3.5">
                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-[#B74783]/15"
                  />
                  <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#B74783] text-white shadow-[0_8px_18px_rgba(183,71,131,0.32)]">
                    <Flower2 className="h-[18px] w-[18px]" aria-hidden />
                  </span>
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#B74783]">
                    Wellness desk
                  </p>
                  <h1 className="truncate font-display text-[1.15rem] font-bold tracking-[-0.03em] text-[#49263D] sm:text-[1.35rem]">
                    Care for today,{" "}
                    <span className="text-gradient-brand">plans for tomorrow</span>
                  </h1>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
                <div
                  role="tablist"
                  aria-label="Desk views"
                  className="grid w-full grid-cols-2 gap-1 rounded-full bg-white/80 p-1 shadow-[0_8px_24px_rgba(123,57,98,0.06)] ring-1 ring-[#EADCE5] sm:w-[360px]"
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
                        data-tour={tab.id === "calm" ? "calm-tools" : undefined}
                        data-tour-priority={tab.id === "calm" ? "high" : undefined}
                        onClick={() => setDeskView(tab.id)}
                        className={cn(
                          "relative flex items-center gap-2.5 rounded-full px-2.5 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]",
                          active ? "text-white" : "text-[#795A70] hover:bg-[#FFF0F6]"
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId={reduceMotion ? undefined : "desk-view-pill"}
                            className="absolute inset-0 rounded-full bg-[linear-gradient(105deg,#C45A92,#B74783)] shadow-[0_8px_18px_rgba(183,71,131,0.28)]"
                            transition={
                              reduceMotion
                                ? { duration: 0 }
                                : { type: "spring", stiffness: 420, damping: 34 }
                            }
                          />
                        )}
                        <span
                          className={cn(
                            "relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                            active ? "bg-white/20 text-white" : "bg-[#FFF0F6] text-[#B74783]"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span className="relative z-[1] min-w-0">
                          <span className="block truncate text-[13px] font-bold leading-none tracking-[-0.01em]">
                            {tab.label}
                          </span>
                          <span
                            className={cn(
                              "mt-1 block truncate text-[10px] font-medium leading-none",
                              active ? "text-white/80" : "text-[#927C8B]"
                            )}
                          >
                            {tab.hint}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <p className="hidden items-center gap-2 border-l border-[#EADCE5] pl-4 text-[13px] font-medium italic leading-snug text-[#795A70] xl:flex">
                  <Heart
                    className="h-3.5 w-3.5 shrink-0 text-[#B74783]"
                    aria-hidden
                  />
                  <span className="max-w-[11rem]">
                    “Small steps create big changes.”
                  </span>
                </p>
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
                  Choose a path.
                </p>
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
                  activePlan={activePlan}
                  onOpenPlan={onOpenPlan}
                  onContinueActive={onContinueActive}
                />
              ) : (
                <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#FFFBFD]">
                  <div aria-hidden className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-0 bg-[radial-gradient(80%_50%_at_0%_0%,rgba(255,240,246,0.9)_0%,transparent_60%),radial-gradient(60%_40%_at_100%_100%,rgba(243,232,248,0.55)_0%,transparent_55%),linear-gradient(180deg,#FFFBFD_0%,#FBF7FB_100%)]" />
                  </div>

                  <div
                    className="relative flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-3.5 sm:px-5 sm:pt-4"
                    data-tour="calm-tools"
                    data-tour-priority="normal"
                  >
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

                  <div className="relative min-h-0 flex-1 overflow-hidden p-3 pt-1 sm:p-4 sm:pt-2">
                    <CalmToolsPanel />
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
