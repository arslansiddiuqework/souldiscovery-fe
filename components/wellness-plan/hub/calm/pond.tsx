"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

type Fish = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
  color: string;
};
type Ripple = { id: number; x: number; y: number; born: number };

const COLORS = ["#C45A92", "#E7B4D4", "#7D9B8A", "#8B6BC7"];

export function Pond() {
  const reduceMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fish = useRef<Fish[]>([]);
  const ripples = useRef<Ripple[]>([]);
  const frame = useRef<number | null>(null);
  const nextId = useRef(1);
  const pointer = useRef<{ x: number; y: number } | null>(null);

  const seed = (width: number, height: number) => {
    fish.current = Array.from({ length: 6 }, (_, index) => ({
      id: nextId.current++,
      x: 40 + Math.random() * (width - 80),
      y: 40 + Math.random() * (height - 80),
      vx: 0,
      vy: 0,
      size: 16 + (index % 3) * 4,
      phase: Math.random() * Math.PI * 2,
      color: COLORS[index % COLORS.length],
    }));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let alive = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (fish.current.length === 0) seed(rect.width, rect.height);
    };

    const draw = () => {
      if (!alive) return;
      const rect = canvas.getBoundingClientRect();
      const gradient = context.createLinearGradient(0, 0, 0, rect.height);
      gradient.addColorStop(0, "#F7E9F4");
      gradient.addColorStop(1, "#D7C4E8");
      context.fillStyle = gradient;
      context.fillRect(0, 0, rect.width, rect.height);

      const now = performance.now();
      ripples.current = ripples.current.filter((ripple) => now - ripple.born < 900);
      for (const ripple of ripples.current) {
        const t = (now - ripple.born) / 900;
        context.beginPath();
        context.arc(ripple.x, ripple.y, 6 + t * 70, 0, Math.PI * 2);
        context.strokeStyle = `rgba(183, 71, 131, ${0.35 * (1 - t)})`;
        context.lineWidth = 2;
        context.stroke();
      }

      const target = pointer.current;
      for (const swimmer of fish.current) {
        if (!reduceMotion) {
          swimmer.phase += 0.012;
          swimmer.vx += Math.cos(swimmer.phase) * 0.04;
          swimmer.vy += Math.sin(swimmer.phase * 0.8) * 0.03;
        }
        if (target) {
          swimmer.vx += (target.x - swimmer.x) * 0.004;
          swimmer.vy += (target.y - swimmer.y) * 0.004;
        }
        swimmer.vx *= 0.96;
        swimmer.vy *= 0.96;
        swimmer.x += swimmer.vx;
        swimmer.y += swimmer.vy;
        if (swimmer.x < 20) swimmer.vx += 0.08;
        if (swimmer.x > rect.width - 20) swimmer.vx -= 0.08;
        if (swimmer.y < 20) swimmer.vy += 0.08;
        if (swimmer.y > rect.height - 20) swimmer.vy -= 0.08;

        const angle = Math.atan2(swimmer.vy, swimmer.vx);
        context.save();
        context.translate(swimmer.x, swimmer.y);
        context.rotate(angle);
        context.beginPath();
        context.ellipse(0, 0, swimmer.size, swimmer.size * 0.46, 0, 0, Math.PI * 2);
        context.fillStyle = swimmer.color;
        context.fill();
        context.beginPath();
        context.moveTo(-swimmer.size * 0.7, 0);
        context.lineTo(-swimmer.size * 1.15, swimmer.size * 0.28);
        context.lineTo(-swimmer.size * 1.15, -swimmer.size * 0.28);
        context.closePath();
        context.fill();
        context.restore();
      }

      frame.current = requestAnimationFrame(draw);
    };

    resize();
    frame.current = requestAnimationFrame(draw);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => {
      alive = false;
      if (frame.current != null) cancelAnimationFrame(frame.current);
      observer.disconnect();
    };
  }, [reduceMotion]);

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const reset = () => {
    const rect = canvasRef.current?.getBoundingClientRect();
    ripples.current = [];
    pointer.current = null;
    seed(rect?.width || 320, rect?.height || 240);
  };

  return (
    <div className="flex h-full min-h-[280px] flex-col gap-3">
      <canvas
        ref={canvasRef}
        tabIndex={0}
        aria-label="Pond. Move over the water and the fish follow. Tap to make a ripple."
        onPointerDown={(event) => {
          const next = point(event);
          pointer.current = next;
          ripples.current.push({ id: nextId.current++, ...next, born: performance.now() });
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (pointer.current) pointer.current = point(event);
        }}
        onPointerUp={() => {
          pointer.current = null;
        }}
        className="min-h-0 w-full flex-1 touch-none rounded-[22px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
      />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-[#EADCE5] bg-white px-4 py-2 text-sm font-semibold text-[#795A70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
