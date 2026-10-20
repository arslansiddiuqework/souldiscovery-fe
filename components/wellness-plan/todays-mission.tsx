"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Heart } from "lucide-react";
import { PlanDay } from "@/lib/wellness-plan/types";
import { MissionCheckbox, taskIcon } from "./task-runner";
import { cn } from "@/lib/utils";

interface TodaysMissionProps {
  day: PlanDay | null;
  onTaskClick: (taskId: string) => void;
  hideAmbience?: boolean;
}

export function TodaysMission({
  day,
  onTaskClick,
  hideAmbience = false,
}: TodaysMissionProps) {
  if (!day) {
    return (
      <div className="flex h-full min-h-0 flex-col justify-center rounded-[26px] border border-[#EADCE5] bg-gradient-to-br from-white via-[#FFF8FB] to-[#FFF0F6] p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#B74783]">
          Today
        </p>
        <p className="mt-2 text-sm text-[#927C8B]">
          Your plan window has ended. Start a new plan when you&apos;re ready.
        </p>
      </div>
    );
  }

  const done = day.tasks.filter((t) => t.completed).length;
  const total = day.tasks.length;
  const next = day.tasks.find((t) => !t.completed);
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  const minutesLeft = day.tasks
    .filter((t) => !t.completed)
    .reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const allDone = total > 0 && done === total;

  return (
    <section className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[26px] border border-[#EADCE5] bg-white shadow-[0_12px_32px_rgba(123,57,98,0.08)]">
      <header className="relative z-[1] shrink-0 overflow-hidden px-4 pb-3.5 pt-4 sm:px-5 sm:pt-5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#FFF0F6] via-white to-[#F8F0FF]/70"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(183,71,131,0.2),transparent_70%)]"
        />

        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold tracking-wide text-[#B74783]">
              Today · Day {day.dayNumber}
            </p>
            <p className="text-[12px] font-semibold tabular-nums text-[#927C8B]">
              <span className="text-[#49263D]">{done}</span>/{total}
              {minutesLeft > 0 ? (
                <span className="font-medium"> · {minutesLeft}m left</span>
              ) : (
                <span className="font-medium text-[#B74783]"> · done</span>
              )}
            </p>
          </div>

          <h2 className="mt-2 font-display text-[1.55rem] font-bold leading-[1.15] tracking-[-0.03em] text-[#49263D] sm:text-[1.7rem]">
            {day.theme}
          </h2>

          <div className="mt-3.5">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/90 ring-1 ring-[#F0CADA]/80">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#C45A92] to-[#B74783]"
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        </div>
      </header>

      <ul className="relative z-[1] shrink-0 space-y-2 p-3 sm:p-3.5">
        {day.tasks.map((task, index) => {
          const Icon = taskIcon(task.type);
          const isNext = next?.id === task.id;
          return (
            <motion.li
              key={task.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.28 }}
            >
              <button
                type="button"
                disabled={task.completed}
                onClick={() => onTaskClick(task.id)}
                className={cn(
                  "group relative flex w-full items-center gap-3 overflow-hidden rounded-[18px] px-3.5 py-3 text-left transition duration-200",
                  task.completed
                    ? "bg-[#FFF8FB] ring-1 ring-[#EADCE5]/80"
                    : isNext
                      ? "bg-gradient-to-r from-[#FFF0F6] to-white shadow-[0_10px_24px_rgba(183,71,131,0.14)] ring-1 ring-[#F0CADA] hover:-translate-y-0.5"
                      : "bg-[#FBF9FF] ring-1 ring-[#EADCE5] hover:bg-[#FFF8FB] hover:ring-[#DFC7D6]"
                )}
              >
                {isNext && !task.completed && (
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#E65BA5] to-[#B74783]"
                  />
                )}
                <MissionCheckbox
                  completed={task.completed}
                  className={
                    task.completed
                      ? "border-[#B74783] bg-[#B74783] text-white"
                      : "border-[#EADCE5]"
                  }
                />
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                    isNext && !task.completed
                      ? "bg-white text-[#B74783] shadow-sm ring-1 ring-[#F0CADA]"
                      : "bg-[#FFE5F0] text-[#B74783]"
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.85} />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-[14px] font-semibold tracking-tight text-[#49263D]",
                      task.completed && "line-through decoration-[#E9A8C4]"
                    )}
                  >
                    {task.title}
                  </p>
                  <p className="truncate text-[12px] text-[#927C8B]">
                    {task.estimatedMinutes} min · {task.description}
                  </p>
                </div>
                {!task.completed && (
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold transition",
                      isNext
                        ? "bg-gradient-to-r from-[#C45A92] to-[#B74783] text-white shadow-[0_8px_18px_rgba(183,71,131,0.3)]"
                        : "bg-white text-[#B74783] ring-1 ring-[#EADCE5] group-hover:bg-[#FFF0F6]"
                    )}
                  >
                    {isNext ? "Start" : "Open"}
                    <ArrowRight className="h-3 w-3" />
                  </span>
                )}
              </button>
            </motion.li>
          );
        })}
      </ul>

      {!hideAmbience && (
        <RelaxAmbience allDone={allDone} theme={day.theme} dayNumber={day.dayNumber} />
      )}
    </section>
  );
}

function RelaxAmbience({
  allDone,
  theme,
  dayNumber,
}: {
  allDone: boolean;
  theme: string;
  dayNumber: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mt-auto min-h-[180px] flex-1 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-[#FFF8FB] via-[#FFF0F6]/80 to-[#F4E8FF]/55"
      />

      {/* Soft ambient glows */}
      <motion.div
        aria-hidden
        className="absolute -left-10 top-4 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(230,91,165,0.2),transparent_70%)]"
        animate={
          reduceMotion ? undefined : { scale: [1, 1.15, 1], opacity: [0.5, 0.85, 0.5] }
        }
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -right-8 bottom-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(150,88,183,0.18),transparent_70%)]"
        animate={
          reduceMotion ? undefined : { scale: [1.1, 0.95, 1.1], opacity: [0.45, 0.8, 0.45] }
        }
        transition={{ duration: 7.2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Bottom waves — shorter so center content owns the space */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[36%]">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 400 120"
          preserveAspectRatio="none"
        >
          <motion.path
            fill="rgba(183,71,131,0.1)"
            d="M0,50 C80,30 140,70 210,48 C280,26 340,60 400,42 L400,120 L0,120 Z"
            animate={
              reduceMotion
                ? undefined
                : {
                    d: [
                      "M0,50 C80,30 140,70 210,48 C280,26 340,60 400,42 L400,120 L0,120 Z",
                      "M0,44 C90,64 150,28 220,52 C290,76 350,36 400,50 L400,120 L0,120 Z",
                      "M0,50 C80,30 140,70 210,48 C280,26 340,60 400,42 L400,120 L0,120 Z",
                    ],
                  }
            }
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            fill="rgba(196,90,146,0.14)"
            d="M0,72 C85,58 150,88 230,70 C310,52 360,82 400,68 L400,120 L0,120 Z"
            animate={
              reduceMotion
                ? undefined
                : {
                    d: [
                      "M0,72 C85,58 150,88 230,70 C310,52 360,82 400,68 L400,120 L0,120 Z",
                      "M0,68 C90,86 160,56 240,76 C320,96 365,62 400,74 L400,120 L0,120 Z",
                      "M0,72 C85,58 150,88 230,70 C310,52 360,82 400,68 L400,120 L0,120 Z",
                    ],
                  }
            }
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </div>

      {/* Center focal scene */}
      <div className="relative z-[1] flex h-full min-h-[180px] flex-col items-center justify-center px-4 py-5 text-center">
        <div className="relative mb-4 flex h-[118px] w-[118px] items-center justify-center sm:h-[132px] sm:w-[132px]">
          {/* Outer breathing rings */}
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute inset-0 rounded-full border border-[#B74783]/20"
              style={{ inset: i * 10 }}
              animate={
                reduceMotion
                  ? undefined
                  : { scale: [1, 1.08 + i * 0.03, 1], opacity: [0.35, 0.7, 0.35] }
              }
              transition={{
                duration: 4.2 + i * 0.4,
                delay: i * 0.35,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          <motion.div
            className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-to-br from-[#FFF0F6] to-[#F4E8FF] shadow-[0_12px_28px_rgba(183,71,131,0.18)] ring-1 ring-[#F0CADA] sm:h-[80px] sm:w-[80px]"
            animate={
              reduceMotion
                ? undefined
                : { scale: [1, 1.06, 1] }
            }
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {allDone ? (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#C45A92] to-[#B74783] text-white shadow-md">
                <Check className="h-5 w-5" strokeWidth={2.5} />
              </span>
            ) : (
              <Heart className="h-7 w-7 fill-[#B74783]/25 text-[#B74783]" />
            )}
          </motion.div>
        </div>

        {!allDone && (
          <motion.p
            aria-hidden
            className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#B74783]"
            animate={
              reduceMotion
                ? undefined
                : { opacity: [0.45, 1, 0.45] }
            }
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            Breathe
          </motion.p>
        )}

        <motion.p
          key={allDone ? "done" : "active"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-[230px] font-display text-[15px] font-bold leading-snug tracking-tight text-[#49263D] sm:text-base"
        >
          {allDone
            ? "Beautifully done. Rest in this quiet moment."
            : `A calm space for ${theme.toLowerCase()}.`}
        </motion.p>
        <p className="mt-1.5 max-w-[220px] text-[12px] leading-relaxed text-[#927C8B]">
          {allDone
            ? `Day ${dayNumber} complete — come back tomorrow for the next unlock.`
            : "Inhale slowly, then continue your next practice when ready."}
        </p>

        {allDone && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-[#B74783] shadow-sm ring-1 ring-[#F0CADA]">
            <Check className="h-3 w-3" />
            Today&apos;s mission complete
          </div>
        )}
      </div>
    </div>
  );
}
