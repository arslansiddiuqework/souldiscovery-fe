"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type Kind = "small" | "big" | "moon" | "sun" | "cloud";
type Body = { id: number; kind: Kind; x: number; y: number };

const TOOLS: Array<{ id: Kind; label: string }> = [
  { id: "small", label: "Small star" },
  { id: "big", label: "Big star" },
  { id: "moon", label: "Moon" },
  { id: "sun", label: "Sun" },
  { id: "cloud", label: "Cloud" },
];

const reach = (kind: Kind) =>
  kind === "small" ? 14 : kind === "big" ? 22 : kind === "cloud" ? 40 : 34;

function drawStar(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  glow: number
) {
  const halo = context.createRadialGradient(x, y, 0, x, y, radius * 4);
  halo.addColorStop(0, `rgba(255, 248, 251, ${glow})`);
  halo.addColorStop(1, "rgba(255, 248, 251, 0)");
  context.fillStyle = halo;
  context.beginPath();
  context.arc(x, y, radius * 4, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#FFF8FB";
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
  if (radius > 3) {
    context.strokeStyle = `rgba(255, 248, 251, ${glow})`;
    context.lineWidth = 1.4;
    context.beginPath();
    context.moveTo(x - radius * 2.4, y);
    context.lineTo(x + radius * 2.4, y);
    context.moveTo(x, y - radius * 2.4);
    context.lineTo(x, y + radius * 2.4);
    context.stroke();
  }
}

function drawMoon(context: CanvasRenderingContext2D, x: number, y: number) {
  const radius = 26;
  const glow = context.createRadialGradient(x, y, radius * 0.4, x, y, radius * 2.2);
  glow.addColorStop(0, "rgba(255, 244, 230, 0.55)");
  glow.addColorStop(1, "rgba(255, 244, 230, 0)");
  context.fillStyle = glow;
  context.beginPath();
  context.arc(x, y, radius * 2.2, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#FFF6EA";
  context.beginPath();
  context.arc(x, y, radius, 0.5, Math.PI * 1.55);
  context.arc(x + radius * 0.42, y - 2, radius * 0.78, Math.PI * 1.55, 0.5, true);
  context.closePath();
  context.fill();
}

function drawSun(context: CanvasRenderingContext2D, x: number, y: number, still: boolean, now: number) {
  const radius = 22;
  const spin = still ? 0 : now / 8000;
  context.save();
  context.translate(x, y);
  context.rotate(spin);
  context.strokeStyle = "rgba(255, 214, 170, 0.85)";
  context.lineWidth = 2;
  context.lineCap = "round";
  for (let ray = 0; ray < 8; ray += 1) {
    const angle = (ray / 8) * Math.PI * 2;
    context.beginPath();
    context.moveTo(Math.cos(angle) * (radius + 6), Math.sin(angle) * (radius + 6));
    context.lineTo(Math.cos(angle) * (radius + 14), Math.sin(angle) * (radius + 14));
    context.stroke();
  }
  context.restore();
  const disc = context.createRadialGradient(x, y, 2, x, y, radius);
  disc.addColorStop(0, "#FFF6E8");
  disc.addColorStop(1, "#F0B27A");
  context.fillStyle = disc;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
}

function drawCloud(context: CanvasRenderingContext2D, x: number, y: number) {
  context.fillStyle = "rgba(255, 248, 251, 0.72)";
  for (const puff of [
    { dx: -16, dy: 4, rx: 18, ry: 12 },
    { dx: 0, dy: 0, rx: 24, ry: 14 },
    { dx: 18, dy: 5, rx: 16, ry: 11 },
  ]) {
    context.beginPath();
    context.ellipse(x + puff.dx, y + puff.dy, puff.rx, puff.ry, 0, 0, Math.PI * 2);
    context.fill();
  }
}

export function StarSky() {
  const reduceMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bodies = useRef<Body[]>([]);
  const dust = useRef<Body[]>([]);
  const history = useRef<Body[][]>([]);
  const frame = useRef<number | null>(null);
  const nextId = useRef(1);
  const dragId = useRef<number | null>(null);
  const toolRef = useRef<Kind>("small");
  const [tool, setTool] = useState<Kind>("small");
  toolRef.current = tool;

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
      if (dust.current.length === 0) {
        dust.current = Array.from({ length: 36 }, () => ({
          id: nextId.current++,
          kind: "small" as const,
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
        }));
      }
    };

    const draw = (now: number) => {
      if (!alive) return;
      const rect = canvas.getBoundingClientRect();
      const hasSun = bodies.current.some((body) => body.kind === "sun");
      const hasMoon = bodies.current.some((body) => body.kind === "moon");
      const sky = context.createLinearGradient(0, 0, 0, rect.height);
      if (hasSun && hasMoon) {
        sky.addColorStop(0, "#6A4A78");
        sky.addColorStop(1, "#E7B4A2");
      } else if (hasSun) {
        sky.addColorStop(0, "#F3C9B0");
        sky.addColorStop(1, "#8E6A9A");
      } else {
        sky.addColorStop(0, "#2C1C44");
        sky.addColorStop(1, "#7A4E78");
      }
      context.fillStyle = sky;
      context.fillRect(0, 0, rect.width, rect.height);

      for (const speck of dust.current) {
        context.beginPath();
        context.arc(speck.x, speck.y, 0.8, 0, Math.PI * 2);
        context.fillStyle = "rgba(255, 240, 246, 0.4)";
        context.fill();
      }

      const order: Kind[] = ["cloud", "sun", "moon", "big", "small"];
      for (const kind of order) {
        bodies.current
          .filter((body) => body.kind === kind)
          .forEach((body, index) => {
            const glow = reduceMotion ? 0.8 : 0.62 + Math.sin(now / 800 + index) * 0.2;
            if (body.kind === "cloud") drawCloud(context, body.x, body.y);
            else if (body.kind === "sun") drawSun(context, body.x, body.y, !!reduceMotion, now);
            else if (body.kind === "moon") drawMoon(context, body.x, body.y);
            else drawStar(context, body.x, body.y, body.kind === "big" ? 4.5 : 1.7, glow);
          });
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

  const remember = () => {
    history.current.push(bodies.current.map((body) => ({ ...body })));
    if (history.current.length > 20) history.current.shift();
  };

  const place = (x: number, y: number) => {
    const kind = toolRef.current;
    remember();
    if (kind === "moon" || kind === "sun") {
      const existing = bodies.current.find((body) => body.kind === kind);
      if (existing) {
        existing.x = x;
        existing.y = y;
        return;
      }
    }
    const next = { id: nextId.current++, kind, x, y };
    const stars = bodies.current.filter((body) => body.kind === "small" || body.kind === "big");
    bodies.current = [...bodies.current, next];
    if (stars.length >= 70 && (kind === "small" || kind === "big")) {
      const oldest = bodies.current.find((body) => body.kind === "small" || body.kind === "big");
      if (oldest) bodies.current = bodies.current.filter((body) => body.id !== oldest.id);
    }
  };

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const undo = () => {
    const previous = history.current.pop();
    if (previous) bodies.current = previous;
  };

  return (
    <div className="flex h-full min-h-[280px] flex-col gap-3">
      <canvas
        ref={canvasRef}
        tabIndex={0}
        aria-label="Night sky. Choose small star, big star, moon, sun, or cloud, then tap to place it. Drag a shape to move it."
        onPointerDown={(event) => {
          const next = point(event);
          const hit = [...bodies.current]
            .reverse()
            .find((body) => Math.hypot(body.x - next.x, body.y - next.y) <= reach(body.kind));
          if (hit) {
            remember();
            dragId.current = hit.id;
            event.currentTarget.setPointerCapture(event.pointerId);
            return;
          }
          place(next.x, next.y);
        }}
        onPointerMove={(event) => {
          if (dragId.current == null) return;
          const next = point(event);
          const body = bodies.current.find((item) => item.id === dragId.current);
          if (!body) return;
          body.x = next.x;
          body.y = next.y;
        }}
        onPointerUp={() => {
          dragId.current = null;
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          const rect = event.currentTarget.getBoundingClientRect();
          place(rect.width * (0.28 + Math.random() * 0.44), rect.height * (0.22 + Math.random() * 0.5));
        }}
        className="min-h-0 w-full flex-1 touch-none rounded-[22px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
      />
      <div className="flex flex-wrap items-center gap-2">
        {TOOLS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={tool === item.id}
            onClick={() => setTool(item.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]",
              tool === item.id
                ? "border-[#E7B4D4] bg-[#FFF0F6] text-[#49263D]"
                : "border-[#EADCE5] bg-white text-[#795A70]"
            )}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={undo}
          className="ml-auto rounded-full border border-[#EADCE5] bg-white px-3 py-1.5 text-xs font-semibold text-[#795A70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={() => {
            remember();
            bodies.current = [];
          }}
          className="rounded-full border border-[#EADCE5] bg-white px-3 py-1.5 text-xs font-semibold text-[#795A70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
