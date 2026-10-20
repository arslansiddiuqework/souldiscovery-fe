"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const INHALE_MS = 4000;
const EXHALE_MS = 6000;

type Phase = "inhale" | "exhale";
type Run = "idle" | "running" | "paused";

export function BreatheOrb() {
  const reduceMotion = useReducedMotion();
  const [run, setRun] = useState<Run>("idle");
  const [phase, setPhase] = useState<Phase>("inhale");
  const [scale, setScale] = useState(0.68);
  const frame = useRef<number | null>(null);
  const started = useRef(0);
  const pausedAt = useRef(0);

  const stopFrame = () => {
    if (frame.current != null) cancelAnimationFrame(frame.current);
    frame.current = null;
  };

  useEffect(() => () => stopFrame(), []);

  useEffect(() => {
    if (!reduceMotion || run !== "running") return;
    let inhale = true;
    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(() => {
        inhale = !inhale;
        setPhase(inhale ? "inhale" : "exhale");
        setScale(inhale ? 0.84 : 1);
        schedule();
      }, inhale ? INHALE_MS : EXHALE_MS);
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, [reduceMotion, run]);

  const tick = (now: number) => {
    const elapsed = now - started.current;
    const cycle = INHALE_MS + EXHALE_MS;
    const local = elapsed % cycle;
    const inhaling = local < INHALE_MS;
    const t = inhaling ? local / INHALE_MS : (local - INHALE_MS) / EXHALE_MS;
    const eased = 0.5 - Math.cos(Math.PI * t) / 2;
    setPhase(inhaling ? "inhale" : "exhale");
    setScale(inhaling ? 0.68 + eased * 0.32 : 1 - eased * 0.32);
    frame.current = requestAnimationFrame(tick);
  };

  const start = () => {
    stopFrame();
    started.current = performance.now();
    setPhase("inhale");
    setRun("running");
    if (!reduceMotion) frame.current = requestAnimationFrame(tick);
  };

  const pause = () => {
    stopFrame();
    pausedAt.current = performance.now() - started.current;
    setRun("paused");
  };

  const resume = () => {
    started.current = performance.now() - pausedAt.current;
    setRun("running");
    if (!reduceMotion) frame.current = requestAnimationFrame(tick);
  };

  const label = run === "idle" ? "Ready" : phase === "inhale" ? "In" : "Out";
  const shownScale = reduceMotion ? (phase === "inhale" ? 0.84 : 1) : scale;

  return (
    <div className="relative flex h-full min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-[20px] bg-[radial-gradient(circle_at_50%_46%,#FFF7FB_0%,#F8F3FA_58%,#F3EDF6_100%)]">
      <div className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
        <span
          aria-hidden
          className="absolute h-64 w-64 rounded-full border border-[#E7B4D4]/50 sm:h-72 sm:w-72"
          style={{ transform: `scale(${0.86 + (shownScale - 0.68) * 0.7})` }}
        />
        <span
          aria-hidden
          className="absolute h-52 w-52 rounded-full border border-[#E7B4D4]/70 sm:h-60 sm:w-60"
          style={{ transform: `scale(${0.9 + (shownScale - 0.68) * 0.55})` }}
        />
        <span
          aria-hidden
          className="absolute h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(255,240,246,0.2),rgba(231,180,212,0.18)_42%,transparent_70%)] sm:h-52 sm:w-52"
          style={{ transform: `scale(${shownScale})` }}
        />
        <span
          aria-hidden
          className="absolute h-36 w-36 rounded-full bg-[radial-gradient(circle_at_35%_30%,#FFF8FB_0%,#F3D3E6_46%,#E7B4D4_100%)] shadow-[0_18px_50px_rgba(183,71,131,0.16)] sm:h-44 sm:w-44"
          style={{
            transform: `scale(${shownScale})`,
            transition: reduceMotion ? "transform 200ms linear" : undefined,
          }}
        />
        <p className="relative font-display text-3xl font-semibold tracking-tight text-[#49263D]">
          {label}
        </p>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {run !== "running" && (
          <button
            type="button"
            onClick={run === "paused" ? resume : start}
            className="rounded-full bg-[#B74783] px-6 py-2.5 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
          >
            {run === "paused" ? "Resume" : "Start"}
          </button>
        )}
        {run === "running" && (
          <button
            type="button"
            onClick={pause}
            className="rounded-full border border-[#EADCE5] bg-white/80 px-6 py-2.5 text-sm font-semibold text-[#795A70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
          >
            Pause
          </button>
        )}
      </div>
    </div>
  );
}
