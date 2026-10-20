"use client";

import { useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Brain,
  Flower2,
  Heart,
  Leaf,
  Moon,
  Move,
  Play,
  Scale,
  Sparkles,
  Wind,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BENEFIT_LABELS,
  YOGA_CATEGORIES,
  YOGA_EXERCISES,
  formatDuration,
  type YogaBenefit,
  type YogaCategory,
  type YogaExercise,
} from "./yoga-data";
import { YogaPoseDemo, YogaPoseStyles } from "./yoga-poses";
import { YogaSession } from "./yoga-session";

const BENEFIT_ICONS: Record<YogaBenefit, typeof Wind> = {
  calm: Brain,
  rest: Moon,
  ease: Heart,
  soften: Flower2,
  mobility: Move,
  release: Sparkles,
  lengthen: Leaf,
  ground: Scale,
  balance: Scale,
  breathe: Wind,
};

type Props = {
  mode?: "section" | "panel";
  onOpenSession?: (exercise: YogaExercise) => void;
  onExitPanel?: () => void;
};

export function YogaExperience({ mode = "panel", onOpenSession, onExitPanel }: Props) {
  const reduceMotion = useReducedMotion();
  const [category, setCategory] = useState<YogaCategory | "all">("all");
  const [active, setActive] = useState<YogaExercise | null>(null);

  const exercises = useMemo(
    () =>
      category === "all"
        ? YOGA_EXERCISES
        : YOGA_EXERCISES.filter((e) => e.category === category),
    [category]
  );

  const startExercise = (exercise: YogaExercise) => {
    if (onOpenSession) {
      onOpenSession(exercise);
      return;
    }
    setActive(exercise);
  };

  if (active) {
    return (
      <div className="h-full min-h-0">
        <YogaSession
          exercise={active}
          onExit={() => setActive(null)}
          onCompleted={() => {
            /* Calm Tools have no shared completion store; UI completion only */
          }}
        />
      </div>
    );
  }

  return (
    <section
      className={cn(
        "flex h-full min-h-0 flex-col",
        mode === "section" &&
          "rounded-[22px] border border-[#EADCE5] bg-white/80 p-3 shadow-[0_10px_28px_rgba(123,57,98,0.05)] sm:p-4",
        mode === "panel" && "overflow-hidden"
      )}
      aria-labelledby="yoga-gentle-heading"
    >
      <YogaPoseStyles />

      {/* Compact header — one composition, no sparse banner */}
      <header className="shrink-0 border-b border-[#EADCE5]/80 pb-3">
        <div className="flex items-center gap-2.5">
          {onExitPanel && (
            <button
              type="button"
              onClick={onExitPanel}
              aria-label="Back to Calm Tools"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#EADCE5] bg-white text-[#795A70] shadow-[0_4px_12px_rgba(123,57,98,0.06)] transition hover:bg-[#FFF5FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          <span
            aria-hidden
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F8D5E8] via-[#E7B4D4] to-[#C45A92] shadow-[0_8px_18px_rgba(183,71,131,0.22)]"
          >
            <Flower2 className="h-4 w-4 text-white" strokeWidth={2.25} />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
              <h3
                id="yoga-gentle-heading"
                className="font-display text-[15px] font-bold leading-tight tracking-tight text-[#49263D] sm:text-lg"
              >
                Yoga & Gentle Movement
              </h3>
              <span className="text-[10px] font-bold tabular-nums text-[#B74783]">
                {exercises.length} poses
              </span>
            </div>
            <p className="mt-0.5 truncate text-[11px] font-semibold text-[#927C8B] sm:text-xs">
              Move gently. Feel more balanced.
            </p>
          </div>
        </div>

        {/* Category segmented tray */}
        <div
          className="mt-3 rounded-2xl bg-[#F8F1F6] p-1 ring-1 ring-[#EADCE5]/70"
          role="tablist"
          aria-label="Exercise categories"
        >
          <div className="flex gap-0.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {YOGA_CATEGORIES.map((tab) => {
              const selected = category === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setCategory(tab.id)}
                  className={cn(
                    "min-w-0 flex-1 basis-0 rounded-[14px] px-2 py-2 text-center text-[11px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4] sm:px-3 sm:text-xs",
                    selected
                      ? "bg-white text-[#B74783] shadow-[0_4px_14px_rgba(123,57,98,0.12)]"
                      : "text-[#795A70] hover:text-[#49263D]"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-2 text-[10px] font-medium leading-snug text-[#A08A9A]">
          Wellness practice only — not medical advice. Stop if you feel pain.
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pt-3">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
          {exercises.map((exercise) => {
            const Icon = BENEFIT_ICONS[exercise.benefit];
            return (
              <article
                key={exercise.id}
                className="group flex flex-col overflow-hidden rounded-[18px] border border-[#EADCE5]/90 bg-white shadow-[0_8px_22px_rgba(123,57,98,0.06)] transition duration-300 hover:-translate-y-0.5 hover:border-[#E7B4D4] hover:shadow-[0_14px_28px_rgba(183,71,131,0.12)]"
              >
                <div className="relative overflow-hidden">
                  <YogaPoseDemo
                    poseId={exercise.id}
                    size="card"
                    still={!!reduceMotion}
                    className="w-full rounded-none"
                  />
                  <span className="absolute bottom-1.5 right-1.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] font-bold text-[#795A70] shadow-sm ring-1 ring-[#EADCE5]/80 sm:text-[10px]">
                    {formatDuration(exercise.durationSec)}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-2 p-2 sm:p-2.5">
                  <div className="min-w-0">
                    <p className="line-clamp-2 font-display text-[12px] font-bold leading-snug text-[#49263D] sm:text-[13px]">
                      {exercise.name}
                    </p>
                    <p className="mt-1 inline-flex max-w-full items-center gap-1 truncate rounded-full bg-[#FFF0F6] px-1.5 py-0.5 text-[9px] font-semibold text-[#B74783] sm:text-[10px]">
                      <Icon className="h-2.5 w-2.5 shrink-0" aria-hidden />
                      {BENEFIT_LABELS[exercise.benefit]}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startExercise(exercise)}
                    className="mt-auto inline-flex w-full items-center justify-center gap-1 rounded-full bg-gradient-to-r from-[#C45A92] to-[#B74783] py-1.5 text-[11px] font-bold text-white shadow-[0_6px_14px_rgba(183,71,131,0.2)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4] sm:py-2 sm:text-xs"
                  >
                    <Play className="h-3 w-3 fill-current" aria-hidden />
                    Start
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function YogaSessionPanel({
  exercise,
  onExit,
}: {
  exercise: YogaExercise;
  onExit: () => void;
}) {
  return (
    <YogaSession
      exercise={exercise}
      onExit={onExit}
      onCompleted={() => {
        /* UI completion only — matches Calm Tools tracking model */
      }}
    />
  );
}
