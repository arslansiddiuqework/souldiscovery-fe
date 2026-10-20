"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const COLORS = ["#C45A92", "#8B6BC7", "#E7B4D4", "#7D9B8A", "#49263D"];

export function ZenCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const history = useRef<ImageData[]>([]);
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(10);
  const colorRef = useRef(color);
  const sizeRef = useRef(size);
  colorRef.current = color;
  sizeRef.current = size;

  const contextOf = () => canvasRef.current?.getContext("2d") ?? null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fit = () => {
      const context = canvas.getContext("2d");
      if (!context) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width === width && canvas.height === height) return;
      const previous = document.createElement("canvas");
      previous.width = canvas.width;
      previous.height = canvas.height;
      if (canvas.width > 1 && canvas.height > 1) {
        previous.getContext("2d")?.drawImage(canvas, 0, 0);
      }
      canvas.width = width;
      canvas.height = height;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (previous.width > 1) {
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.drawImage(previous, 0, 0, width, height);
        context.restore();
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const snapshot = () => {
    const canvas = canvasRef.current;
    const context = contextOf();
    if (!canvas || !context) return;
    try {
      history.current.push(
        context.getImageData(0, 0, canvas.width, canvas.height)
      );
      if (history.current.length > 12) history.current.shift();
    } catch {
      /* canvas may be empty on first stroke */
    }
  };

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const strokeTo = (x: number, y: number) => {
    const context = contextOf();
    if (!context) return;
    context.lineTo(x, y);
    context.strokeStyle = colorRef.current;
    context.lineWidth = sizeRef.current;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.globalAlpha = 0.85;
    context.stroke();
    context.beginPath();
    context.moveTo(x, y);
  };

  const undo = () => {
    const context = contextOf();
    const canvas = canvasRef.current;
    const previous = history.current.pop();
    if (!context || !canvas || !previous) return;
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.putImageData(previous, 0, 0);
    context.restore();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const context = contextOf();
    if (!canvas || !context) return;
    snapshot();
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="flex h-full min-h-[280px] flex-col gap-3">
      <canvas
        ref={canvasRef}
        aria-label="Drawing canvas. Drag to draw a soft line."
        onPointerDown={(event) => {
          drawing.current = true;
          snapshot();
          event.currentTarget.setPointerCapture(event.pointerId);
          const start = point(event);
          const context = contextOf();
          context?.beginPath();
          context?.moveTo(start.x, start.y);
          strokeTo(start.x, start.y);
        }}
        onPointerMove={(event) => {
          if (!drawing.current) return;
          const next = point(event);
          strokeTo(next.x, next.y);
        }}
        onPointerUp={() => {
          drawing.current = false;
          contextOf()?.beginPath();
        }}
        className="min-h-0 w-full flex-1 touch-none rounded-[22px] bg-[#FFF8FB] ring-1 ring-[#EADCE5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
      />
      <div className="flex flex-wrap items-center gap-2">
        {COLORS.map((swatch) => (
          <button
            key={swatch}
            type="button"
            aria-label={`Color ${swatch}`}
            aria-pressed={color === swatch}
            onClick={() => setColor(swatch)}
            className={cn(
              "h-8 w-8 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]",
              color === swatch && "ring-2 ring-[#49263D] ring-offset-2"
            )}
            style={{ background: swatch }}
          />
        ))}
        <button
          type="button"
          aria-pressed={size === 6}
          onClick={() => setSize(6)}
          className="rounded-full border border-[#EADCE5] bg-white px-3 py-1.5 text-xs font-semibold text-[#795A70]"
        >
          Fine
        </button>
        <button
          type="button"
          aria-pressed={size === 16}
          onClick={() => setSize(16)}
          className="rounded-full border border-[#EADCE5] bg-white px-3 py-1.5 text-xs font-semibold text-[#795A70]"
        >
          Soft
        </button>
        <button
          type="button"
          onClick={undo}
          className="ml-auto rounded-full border border-[#EADCE5] bg-white px-3 py-1.5 text-xs font-semibold text-[#795A70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={clear}
          className="rounded-full border border-[#EADCE5] bg-white px-3 py-1.5 text-xs font-semibold text-[#795A70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
