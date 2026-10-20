"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

type Bubble = { id: number; x: number; y: number; r: number; vy: number };
type Ripple = { id: number; x: number; y: number; born: number };

export function FidgetPlayground() {
  const reduceMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bubbles = useRef<Bubble[]>([]);
  const ripples = useRef<Ripple[]>([]);
  const frame = useRef<number | null>(null);
  const nextId = useRef(1);
  const pointer = useRef<{ x: number; y: number; down: boolean } | null>(null);

  const seed = (width: number, height: number) => {
    bubbles.current = Array.from({ length: 14 }, () => ({
      id: nextId.current++,
      x: 30 + Math.random() * (width - 60),
      y: 30 + Math.random() * (height - 60),
      r: 16 + Math.random() * 18,
      vy: reduceMotion ? 0 : 0.15 + Math.random() * 0.35,
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
      if (bubbles.current.length === 0) seed(rect.width, rect.height);
    };

    const draw = () => {
      if (!alive) return;
      const rect = canvas.getBoundingClientRect();
      context.clearRect(0, 0, rect.width, rect.height);
      const now = performance.now();

      ripples.current = ripples.current.filter((ripple) => now - ripple.born < 700);
      for (const ripple of ripples.current) {
        const t = (now - ripple.born) / 700;
        context.beginPath();
        context.arc(ripple.x, ripple.y, 8 + t * 70, 0, Math.PI * 2);
        context.strokeStyle = `rgba(183, 71, 131, ${0.35 * (1 - t)})`;
        context.lineWidth = 2;
        context.stroke();
      }

      for (const bubble of bubbles.current) {
        if (!reduceMotion) {
          bubble.y -= bubble.vy;
          if (bubble.y + bubble.r < 0) bubble.y = rect.height + bubble.r;
        }
        const gradient = context.createRadialGradient(
          bubble.x - bubble.r * 0.3,
          bubble.y - bubble.r * 0.3,
          2,
          bubble.x,
          bubble.y,
          bubble.r
        );
        gradient.addColorStop(0, "rgba(255, 248, 251, 0.95)");
        gradient.addColorStop(1, "rgba(196, 90, 146, 0.55)");
        context.beginPath();
        context.arc(bubble.x, bubble.y, bubble.r, 0, Math.PI * 2);
        context.fillStyle = gradient;
        context.fill();
        context.strokeStyle = "rgba(183, 71, 131, 0.35)";
        context.stroke();
      }

      frame.current = requestAnimationFrame(draw);
    };

    resize();
    frame.current = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    return () => {
      alive = false;
      if (frame.current != null) cancelAnimationFrame(frame.current);
      window.removeEventListener("resize", resize);
    };
  }, [reduceMotion]);

  const pointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const popAt = (x: number, y: number) => {
    const hit = bubbles.current.find(
      (bubble) => Math.hypot(bubble.x - x, bubble.y - y) <= bubble.r + 4
    );
    if (!hit) return false;
    bubbles.current = bubbles.current.filter((bubble) => bubble.id !== hit.id);
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    bubbles.current.push({
      id: nextId.current++,
      x: 24 + Math.random() * ((rect?.width || 300) - 48),
      y: (rect?.height || 240) + 20,
      r: 16 + Math.random() * 18,
      vy: reduceMotion ? 0 : 0.15 + Math.random() * 0.35,
    });
    return true;
  };

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = pointFromEvent(event);
    pointer.current = { ...point, down: true };
    event.currentTarget.setPointerCapture(event.pointerId);
    if (!popAt(point.x, point.y)) {
      ripples.current.push({ id: nextId.current++, ...point, born: performance.now() });
    }
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pointer.current?.down) return;
    const point = pointFromEvent(event);
    if (Math.hypot(point.x - pointer.current.x, point.y - pointer.current.y) > 18) {
      ripples.current.push({ id: nextId.current++, ...point, born: performance.now() });
      pointer.current = { ...point, down: true };
    }
  };

  const reset = () => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    ripples.current = [];
    seed(rect?.width || 320, rect?.height || 240);
  };

  return (
    <div className="flex h-full min-h-[280px] flex-col gap-3">
      <canvas
        ref={canvasRef}
        tabIndex={0}
        aria-label="Bubble playground. Click or tap a bubble to pop it. Drag to make ripples."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => {
          if (pointer.current) pointer.current.down = false;
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          const bubble = bubbles.current[0];
          if (bubble) popAt(bubble.x, bubble.y);
        }}
        className="min-h-0 w-full flex-1 touch-none rounded-[22px] bg-gradient-to-b from-[#FFF8FB] to-[#F3E7F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
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
