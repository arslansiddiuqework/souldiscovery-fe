"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  ArrowLeft,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BENEFIT_LABELS,
  formatClock,
  type YogaExercise,
} from "./yoga-data";
import { YogaPoseDemo, YogaPoseStyles } from "./yoga-poses";

type Run = "idle" | "running" | "paused" | "done";

type Props = {
  exercise: YogaExercise;
  onExit: () => void;
  onCompleted: (exercise: YogaExercise) => void;
};

export function YogaSession({ exercise, onExit, onCompleted }: Props) {
  const reduceMotion = useReducedMotion();
  const [run, setRun] = useState<Run>("idle");
  const [remaining, setRemaining] = useState(exercise.durationSec);
  const [muted, setMuted] = useState(true);
  const recorded = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const endAt = useRef<number | null>(null);
  const leftover = useRef(exercise.durationSec * 1000);
  const timer = useRef<number | null>(null);
  const runRef = useRef<Run>("idle");
  const mutedRef = useRef(true);
  runRef.current = run;
  mutedRef.current = muted;

  const progress =
    ((exercise.durationSec - remaining) / exercise.durationSec) * 100;

  const stopTimer = useCallback(() => {
    if (timer.current != null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const stopAudio = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    a.currentTime = 0;
  }, []);

  const ensureAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;
    const a = new Audio("/sounds/wind.mp3");
    a.loop = true;
    a.volume = 0.28;
    audioRef.current = a;
    return a;
  }, []);

  const syncAudio = useCallback(
    (nextRun: Run, nextMuted: boolean) => {
      const a = ensureAudio();
      if (nextMuted || nextRun !== "running") {
        a.pause();
        return;
      }
      void a.play().catch(() => {
        /* autoplay blocked — stay silent */
      });
    },
    [ensureAudio]
  );

  const finish = useCallback(() => {
    stopTimer();
    endAt.current = null;
    setRemaining(0);
    setRun("done");
    stopAudio();
    if (!recorded.current) {
      recorded.current = true;
      onCompleted(exercise);
    }
  }, [exercise, onCompleted, stopAudio, stopTimer]);

  const syncFromClock = useCallback(() => {
    if (endAt.current == null) return;
    const leftMs = Math.max(0, endAt.current - performance.now());
    leftover.current = leftMs;
    setRemaining(leftMs / 1000);
    if (leftMs <= 0) finish();
  }, [finish]);

  const beginClock = useCallback(
    (ms: number) => {
      stopTimer();
      leftover.current = ms;
      endAt.current = performance.now() + ms;
      setRemaining(ms / 1000);
      setRun("running");
      syncAudio("running", mutedRef.current);
      timer.current = window.setInterval(syncFromClock, 250);
    },
    [stopTimer, syncAudio, syncFromClock]
  );

  const start = () => {
    recorded.current = false;
    beginClock(exercise.durationSec * 1000);
  };

  const pause = useCallback(() => {
    stopTimer();
    if (endAt.current != null) {
      leftover.current = Math.max(0, endAt.current - performance.now());
      setRemaining(leftover.current / 1000);
    }
    endAt.current = null;
    setRun("paused");
    syncAudio("paused", mutedRef.current);
  }, [stopTimer, syncAudio]);

  const resume = () => beginClock(leftover.current);

  const restart = () => {
    recorded.current = false;
    beginClock(exercise.durationSec * 1000);
  };

  const handleExit = () => {
    stopTimer();
    stopAudio();
    onExit();
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    syncAudio(run, next);
  };

  useEffect(() => {
    const onVis = () => {
      if (document.hidden && runRef.current === "running") pause();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [pause]);

  useEffect(() => {
    return () => {
      stopTimer();
      stopAudio();
    };
  }, [stopAudio, stopTimer]);

  useEffect(() => {
    stopTimer();
    leftover.current = exercise.durationSec * 1000;
    endAt.current = null;
    setRemaining(exercise.durationSec);
    setRun("idle");
    recorded.current = false;
    stopAudio();
  }, [exercise.id, exercise.durationSec, stopAudio, stopTimer]);

  const ringSize = 72;
  const stroke = 5;
  const radius = (ringSize - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (Math.min(100, Math.max(0, progress)) / 100) * circ;

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[20px] bg-[linear-gradient(180deg,#FFFCFD_0%,#FFF5FA_45%,#F6ECF4_100%)] ring-1 ring-[#EADCE5]/80">
      <YogaPoseStyles />

      {/* Compact top bar */}
      <header className="flex shrink-0 items-center gap-2 border-b border-[#EADCE5]/70 px-2.5 py-2 sm:px-3 sm:py-2.5">
        <button
          type="button"
          onClick={handleExit}
          aria-label="Back to yoga list"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#EADCE5] bg-white text-[#795A70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-[#B74783]">
            {BENEFIT_LABELS[exercise.benefit]}
          </p>
          <h3 className="truncate font-display text-sm font-bold text-[#49263D] sm:text-base">
            {exercise.name}
          </h3>
        </div>
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "Unmute ambience" : "Mute ambience"}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#EADCE5] bg-white text-[#795A70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </header>

      {run === "done" ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-4 py-6 text-center">
          <span
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full bg-[#F8D5E8] text-[#B74783]",
              !reduceMotion && "animate-fade-in-up"
            )}
          >
            <Check className="h-7 w-7" aria-hidden />
          </span>
          <p className="font-display text-xl font-bold text-[#49263D]">Well done!</p>
          <button
            type="button"
            onClick={handleExit}
            className="rounded-full bg-[#B74783] px-6 py-2.5 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
          >
            Done
          </button>
        </div>
      ) : (
        <>
          {/* Flexible demo area — never forces overflow */}
          <div className="relative min-h-0 flex-1 px-2 pt-2 sm:px-3 sm:pt-3">
            <YogaPoseDemo
              poseId={exercise.id}
              size="hero"
              still={!!reduceMotion || run === "paused"}
              className="h-full min-h-[140px] w-full rounded-[18px] ring-1 ring-[#EADCE5]/60"
            />
          </div>

          {/* Always-visible controls footer */}
          <footer className="shrink-0 border-t border-[#EADCE5]/70 bg-white/70 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-3.5">
            <div className="mx-auto flex max-w-md flex-col items-center gap-2.5">
              <div className="flex items-center gap-4">
                <div className="relative inline-flex items-center justify-center">
                  <svg width={ringSize} height={ringSize} className="-rotate-90" aria-hidden>
                    <circle
                      cx={ringSize / 2}
                      cy={ringSize / 2}
                      r={radius}
                      fill="none"
                      stroke="rgba(183,71,131,0.14)"
                      strokeWidth={stroke}
                    />
                    <circle
                      cx={ringSize / 2}
                      cy={ringSize / 2}
                      r={radius}
                      fill="none"
                      stroke="#B74783"
                      strokeWidth={stroke}
                      strokeLinecap="round"
                      strokeDasharray={circ}
                      strokeDashoffset={offset}
                      className="transition-[stroke-dashoffset] duration-200 ease-linear"
                    />
                  </svg>
                  <span className="absolute font-display text-sm font-bold tabular-nums text-[#49263D]">
                    {formatClock(remaining)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {run !== "running" && (
                    <button
                      type="button"
                      onClick={run === "paused" ? resume : start}
                      aria-label={run === "paused" ? "Resume" : "Start"}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#C45A92] to-[#B74783] px-4 py-2 text-sm font-bold text-white shadow-[0_8px_18px_rgba(183,71,131,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" aria-hidden />
                      {run === "paused" ? "Resume" : "Start"}
                    </button>
                  )}
                  {run === "running" && (
                    <button
                      type="button"
                      onClick={pause}
                      aria-label="Pause"
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#EADCE5] bg-white px-4 py-2 text-sm font-semibold text-[#795A70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
                    >
                      <Pause className="h-3.5 w-3.5" aria-hidden />
                      Pause
                    </button>
                  )}
                  {run !== "idle" && (
                    <button
                      type="button"
                      onClick={restart}
                      aria-label="Restart"
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#EADCE5] bg-white px-3 py-2 text-sm font-semibold text-[#795A70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                      <span className="hidden xs:inline sm:inline">Restart</span>
                    </button>
                  )}
                </div>
              </div>

              {(exercise.safetyNote || exercise.alternative) && (
                <p className="max-w-sm text-center text-[10px] font-medium leading-snug text-[#927C8B]">
                  {exercise.safetyNote}
                  {exercise.safetyNote && exercise.alternative ? " · " : ""}
                  {exercise.alternative}
                </p>
              )}
              <p className="text-[10px] font-medium text-[#A08A9A]">
                Stop anytime if anything feels uncomfortable.
              </p>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
