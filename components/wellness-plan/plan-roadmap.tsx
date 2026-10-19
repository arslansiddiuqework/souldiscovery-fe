"use client";

import { useMemo, useState } from "react";
import { Check, Clock3 } from "lucide-react";
import { WellnessPlan } from "@/lib/wellness-plan/types";
import { getPlanDayNumber } from "@/lib/wellness-plan/generate-plan";
import { MissionCheckbox, taskIcon } from "./task-runner";
import { TIME_LABELS } from "@/lib/wellness-plan/types";
import { cn } from "@/lib/utils";

interface PlanRoadmapProps {
  plan: WellnessPlan;
  onTaskClick: (taskId: string) => void;
}

function dailyMinutesLabel(plan: WellnessPlan) {
  const fromAssessment = plan.assessment?.dailyTime
    ? TIME_LABELS[plan.assessment.dailyTime]
    : null;
  if (fromAssessment) return fromAssessment.toLowerCase();

  const todayTasks =
    plan.weeks
      .flatMap((w) => w.days)
      .find((d) => d.dayNumber === getPlanDayNumber(plan))?.tasks ?? [];
  const mins = todayTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
  return mins > 0 ? `${mins} minutes` : "a few minutes";
}

export function PlanRoadmap({ plan, onTaskClick }: PlanRoadmapProps) {
  const currentDay = getPlanDayNumber(plan);
  const [openWeek, setOpenWeek] = useState(
    plan.weeks.find((w) => w.days.some((d) => d.dayNumber === currentDay))
      ?.weekNumber || 1
  );

  const activeWeek = useMemo(
    () => plan.weeks.find((w) => w.weekNumber === openWeek) ?? plan.weeks[0],
    [plan.weeks, openWeek]
  );

  const weekTitle = activeWeek?.title
    ? activeWeek.title.replace(/^Week\s*\d+\s*[—–-]?\s*/i, "")
    : "";

  return (
    <section className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[26px] border border-[#EADCE5] bg-gradient-to-b from-white via-white to-[#FFF8FB] shadow-[0_12px_32px_rgba(123,57,98,0.07)]">
      <header className="shrink-0 border-b border-[#EADCE5] px-4 py-3.5 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#B74783]">
              Roadmap
            </p>
            <h2 className="mt-1 font-display text-lg font-bold tracking-tight text-[#49263D]">
              {plan.durationDays} days · {plan.weeks.length}{" "}
              {plan.weeks.length === 1 ? "week" : "weeks"}
            </h2>
            <p className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] text-[#927C8B]">
              <Clock3 className="h-3.5 w-3.5 text-[#B74783]" />
              About {dailyMinutesLabel(plan)} a day · Day {currentDay} of{" "}
              {plan.durationDays}
            </p>
          </div>
        </div>

        <div className="mt-3.5 flex flex-wrap gap-2">
          {plan.weeks.map((week) => {
            const done = week.days.filter((d) => d.completed).length;
            const selected = openWeek === week.weekNumber;
            const weekDays = week.days.length;
            const weekPercent = weekDays
              ? Math.round((done / weekDays) * 100)
              : 0;
            return (
              <button
                key={week.id}
                type="button"
                onClick={() => setOpenWeek(week.weekNumber)}
                className={cn(
                  "min-w-[118px] rounded-2xl px-3.5 py-2.5 text-left transition duration-200",
                  selected
                    ? "bg-gradient-to-br from-[#B74783] to-[#9F376F] text-white shadow-[0_10px_22px_rgba(183,71,131,0.28)]"
                    : "bg-white text-[#795A70] ring-1 ring-[#EADCE5] hover:bg-[#FFF8FB] hover:ring-[#E9A8C4]"
                )}
              >
                <span className="block text-[13px] font-semibold">
                  Week {week.weekNumber}
                </span>
                <span
                  className={cn(
                    "mt-0.5 block text-[11px] tabular-nums",
                    selected ? "text-white/80" : "text-[#927C8B]"
                  )}
                >
                  {done} of {weekDays} days · {weekPercent}%
                </span>
              </button>
            );
          })}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
        {activeWeek && (
          <>
            <div className="mb-3 rounded-2xl bg-[#FFF0F6]/80 px-3.5 py-2.5 ring-1 ring-[#F0CADA]">
              <p className="text-[13px] font-semibold text-[#49263D]">
                Week {activeWeek.weekNumber}
                {weekTitle ? ` — ${weekTitle}` : ""}
              </p>
              <p className="mt-0.5 text-[12px] text-[#927C8B]">
                {activeWeek.days.length} days · {activeWeek.focus}
              </p>
            </div>

            <ol className="relative space-y-2.5">
              <div
                aria-hidden
                className="absolute bottom-5 left-[15px] top-5 w-px bg-gradient-to-b from-[#B74783]/50 via-[#F0CADA] to-transparent"
              />
              {activeWeek.days.map((day) => {
                const isCurrent = day.dayNumber === currentDay;
                const dayDone = day.tasks.filter((t) => t.completed).length;
                return (
                  <li key={day.id} className="relative pl-10">
                    <div
                      className={cn(
                        "absolute left-1.5 top-3.5 flex h-5 w-5 items-center justify-center rounded-full border-2",
                        day.completed
                          ? "border-[#B74783] bg-[#B74783] text-white shadow-[0_0_0_3px_rgba(183,71,131,0.14)]"
                          : isCurrent
                            ? "border-[#B74783] bg-white shadow-[0_0_0_4px_rgba(183,71,131,0.16)]"
                            : "border-[#EADCE5] bg-white"
                      )}
                    >
                      {day.completed ? (
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      ) : isCurrent ? (
                        <span className="h-2 w-2 animate-pulse rounded-full bg-[#B74783]" />
                      ) : null}
                    </div>

                    <div
                      className={cn(
                        "rounded-[18px] px-3.5 py-3 transition",
                        isCurrent
                          ? "bg-white shadow-[0_10px_24px_rgba(183,71,131,0.1)] ring-1 ring-[#F0CADA]"
                          : "bg-[#FFF8FB] ring-1 ring-[#EADCE5]/80"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#B74783]">
                            Day {day.dayNumber}
                          </p>
                          {isCurrent && (
                            <span className="rounded-full bg-[#FFF0F6] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[#B74783] ring-1 ring-[#F0CADA]">
                              Today
                            </span>
                          )}
                          <p className="truncate text-[13px] font-semibold text-[#49263D]">
                            {day.theme}
                          </p>
                        </div>
                        <span className="shrink-0 text-[11px] font-medium tabular-nums text-[#927C8B]">
                          {dayDone}/{day.tasks.length}
                        </span>
                      </div>

                      <ul className="mt-2 space-y-0.5">
                        {day.tasks.map((task) => {
                          const Icon = taskIcon(task.type);
                          const canOpen = isCurrent && !task.completed;
                          return (
                            <li key={task.id}>
                              <button
                                type="button"
                                disabled={!canOpen}
                                onClick={() => onTaskClick(task.id)}
                                className={cn(
                                  "flex w-full items-center gap-2 rounded-xl px-1.5 py-1.5 text-left",
                                  canOpen && "hover:bg-[#FFF0F6]/70"
                                )}
                              >
                                <MissionCheckbox
                                  completed={task.completed}
                                  className="h-5 w-5"
                                />
                                <Icon className="h-3 w-3 shrink-0 text-[#B74783]" />
                                <span
                                  className={cn(
                                    "flex-1 truncate text-[12.5px] text-[#49263D]",
                                    task.completed && "line-through opacity-50"
                                  )}
                                >
                                  {task.title}
                                </span>
                                <span className="text-[11px] text-[#927C8B]">
                                  {task.estimatedMinutes}m
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>
    </section>
  );
}
