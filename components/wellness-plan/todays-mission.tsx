"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PlanDay } from "@/lib/wellness-plan/types";
import { MissionCheckbox, taskIcon } from "./task-runner";
import { cn } from "@/lib/utils";

interface TodaysMissionProps {
  day: PlanDay | null;
  onTaskClick: (taskId: string) => void;
}

export function TodaysMission({ day, onTaskClick }: TodaysMissionProps) {
  if (!day) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Today&apos;s Wellness Mission</CardTitle>
          <CardDescription>
            Your plan window has ended — start a new plan when you&apos;re ready.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const done = day.tasks.filter((t) => t.completed).length;
  const total = day.tasks.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-primary/[0.1] to-transparent" />
        <CardHeader className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[rgba(231,218,237,0.45)]">
                Day {day.dayNumber} · {day.theme}
              </p>
              <CardTitle className="text-lg md:text-xl">
                Today&apos;s Wellness Mission
              </CardTitle>
              <CardDescription>
                Complete these practices to keep your streak alive.
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-bold text-[#f3eefa]">
                {percent}%
              </p>
              <p className="text-xs text-[rgba(231,218,237,0.45)]">
                {done} / {total} done
              </p>
            </div>
          </div>
          <Progress value={percent} className="mt-4 h-1.5" />
        </CardHeader>
        <CardContent className="relative space-y-2">
          {day.tasks.map((task) => {
            const Icon = taskIcon(task.type);
            return (
              <button
                key={task.id}
                type="button"
                disabled={task.completed}
                onClick={() => onTaskClick(task.id)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition-all duration-300",
                  task.completed
                    ? "border-[rgba(216,191,227,0.12)] bg-white/[0.02] opacity-70"
                    : "border-[rgba(216,191,227,0.18)] bg-white/[0.035] hover:border-[#b384c9]/35 hover:bg-[rgba(179,132,201,0.08)]"
                )}
              >
                <MissionCheckbox completed={task.completed} />
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[rgba(179,132,201,0.12)]">
                  <Icon className="h-4 w-4 text-[#b384c9]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "font-display text-sm font-semibold text-[#f3eefa]",
                      task.completed && "line-through opacity-70"
                    )}
                  >
                    {task.title}
                  </p>
                  <p className="truncate text-xs text-[rgba(231,218,237,0.45)]">
                    {task.estimatedMinutes} min · {task.description}
                  </p>
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
