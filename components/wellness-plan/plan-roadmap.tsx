"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { WellnessPlan } from "@/lib/wellness-plan/types";
import { getPlanDayNumber } from "@/lib/wellness-plan/generate-plan";
import { MissionCheckbox, taskIcon } from "./task-runner";
import { cn } from "@/lib/utils";

interface PlanRoadmapProps {
  plan: WellnessPlan;
  onTaskClick: (taskId: string) => void;
}

export function PlanRoadmap({ plan, onTaskClick }: PlanRoadmapProps) {
  const currentDay = getPlanDayNumber(plan);
  const [openWeek, setOpenWeek] = useState(
    plan.weeks.find((w) => w.days.some((d) => d.dayNumber === currentDay))
      ?.weekNumber || 1
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Plan Roadmap</CardTitle>
        <CardDescription>
          A {plan.durationDays}-day journey shaped around your goals.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {plan.weeks.map((week) => {
          const isOpen = openWeek === week.weekNumber;
          const weekDone = week.days.filter((d) => d.completed).length;
          return (
            <div
              key={week.id}
              className="overflow-hidden rounded-[20px] border border-[rgba(216,191,227,0.16)] bg-white/[0.02]"
            >
              <button
                type="button"
                onClick={() =>
                  setOpenWeek(isOpen ? -1 : week.weekNumber)
                }
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-white/[0.03]"
              >
                <div>
                  <p className="font-display text-base font-semibold text-[#f3eefa]">
                    {week.title}
                  </p>
                  <p className="mt-0.5 text-xs text-[rgba(231,218,237,0.5)]">
                    {week.focus} · {weekDone}/{week.days.length} days complete
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-[rgba(231,218,237,0.55)] transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28 }}
                    className="overflow-hidden"
                  >
                    <div className="relative space-y-0 border-t border-white/5 px-5 pb-5 pt-2">
                      <div className="absolute bottom-5 left-[29px] top-2 w-px bg-gradient-to-b from-[#b384c9]/40 via-[#b384c9]/15 to-transparent" />
                      {week.days.map((day) => {
                        const isCurrent = day.dayNumber === currentDay;
                        const dayProgress =
                          day.tasks.length === 0
                            ? 0
                            : day.tasks.filter((t) => t.completed).length /
                              day.tasks.length;
                        return (
                          <div key={day.id} className="relative pl-10 pt-4">
                            <div
                              className={cn(
                                "absolute left-4 top-6 flex h-5 w-5 items-center justify-center rounded-full border",
                                day.completed
                                  ? "border-[#b384c9] bg-[#b384c9] text-[#1c1033]"
                                  : isCurrent
                                    ? "border-[#b384c9] bg-[rgba(179,132,201,0.2)]"
                                    : "border-[rgba(216,191,227,0.25)] bg-[rgba(16,11,32,0.9)]"
                              )}
                            >
                              {day.completed && <Check className="h-3 w-3" />}
                            </div>
                            <div
                              className={cn(
                                "rounded-2xl border p-4 transition",
                                isCurrent
                                  ? "border-[#b384c9]/35 bg-[rgba(179,132,201,0.08)]"
                                  : "border-[rgba(216,191,227,0.12)] bg-white/[0.02]"
                              )}
                            >
                              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[rgba(231,218,237,0.4)]">
                                    Day {day.dayNumber}
                                    {isCurrent ? " · Today" : ""}
                                  </p>
                                  <p className="font-display text-sm font-semibold text-[#f3eefa]">
                                    {day.theme}
                                  </p>
                                </div>
                                <span className="text-xs text-[rgba(231,218,237,0.45)]">
                                  {Math.round(dayProgress * 100)}%
                                </span>
                              </div>
                              <div className="space-y-2">
                                {day.tasks.map((task) => {
                                  const Icon = taskIcon(task.type);
                                  return (
                                    <button
                                      key={task.id}
                                      type="button"
                                      disabled={task.completed || !isCurrent}
                                      onClick={() => onTaskClick(task.id)}
                                      className={cn(
                                        "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition",
                                        isCurrent && !task.completed
                                          ? "hover:bg-white/[0.04]"
                                          : "cursor-default"
                                      )}
                                    >
                                      <MissionCheckbox completed={task.completed} />
                                      <Icon className="h-3.5 w-3.5 shrink-0 text-[#b384c9]" />
                                      <span
                                        className={cn(
                                          "flex-1 text-sm text-[rgba(231,218,237,0.75)]",
                                          task.completed && "line-through opacity-60"
                                        )}
                                      >
                                        {task.title}
                                      </span>
                                      <span className="text-[11px] text-[rgba(231,218,237,0.4)]">
                                        {task.estimatedMinutes}m
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
