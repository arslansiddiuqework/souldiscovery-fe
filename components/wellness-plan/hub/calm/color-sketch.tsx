"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser, Images, PaintBucket, Paintbrush } from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = [
  "#C45A92",
  "#E7B4D4",
  "#F7D5E8",
  "#8B6BC7",
  "#D7C4E8",
  "#7D9B8A",
  "#C9D7C8",
  "#F0C27A",
  "#F6D2B8",
  "#49263D",
  "#FFF8FB",
];

const SIZES = [
  { id: "fine", label: "Fine", width: 5 },
  { id: "soft", label: "Soft", width: 14 },
  { id: "broad", label: "Broad", width: 26 },
] as const;

type Tool = "paint" | "brush" | "eraser";

type Region =
  | { id: string; label: string; type: "path"; d: string }
  | { id: string; label: string; type: "circle"; cx: number; cy: number; r: number }
  | { id: string; label: string; type: "ellipse"; cx: number; cy: number; rx: number; ry: number }
  | { id: string; label: string; type: "rect"; x: number; y: number; width: number; height: number; rx?: number };

type Step =
  | { kind: "fill"; fills: Record<string, string> }
  | { kind: "ink"; bitmap: ImageData }
  | { kind: "all"; fills: Record<string, string>; bitmap: ImageData | null };

function flower(id: string, label: string, cx: number, cy: number): Region[] {
  return [
    { id: `${id}-stem`, label: `${label} stem`, type: "rect", x: cx - 3, y: cy, width: 6, height: 52, rx: 3 },
    { id: `${id}-leaf`, label: `${label} leaf`, type: "ellipse", cx: cx + 16, cy: cy + 24, rx: 14, ry: 7 },
    { id: `${id}-n`, label: `${label} petal`, type: "circle", cx, cy: cy - 16, r: 13 },
    { id: `${id}-e`, label: `${label} petal`, type: "circle", cx: cx + 16, cy, r: 13 },
    { id: `${id}-s`, label: `${label} petal`, type: "circle", cx, cy: cy + 14, r: 13 },
    { id: `${id}-w`, label: `${label} petal`, type: "circle", cx: cx - 16, cy, r: 13 },
    { id: `${id}-heart`, label: `${label} center`, type: "circle", cx, cy, r: 8 },
  ];
}

const SKETCHES: { id: string; title: string; regions: Region[] }[] = [
  {
    id: "garden",
    title: "Garden",
    regions: [
      { id: "sky", label: "Sky", type: "rect", x: 0, y: 0, width: 480, height: 300 },
      { id: "sun", label: "Sun", type: "circle", cx: 78, cy: 58, r: 26 },
      { id: "cloud-a", label: "Cloud", type: "ellipse", cx: 250, cy: 52, rx: 28, ry: 16 },
      { id: "cloud-b", label: "Cloud", type: "ellipse", cx: 278, cy: 58, rx: 22, ry: 14 },
      { id: "cloud-c", label: "Cloud", type: "ellipse", cx: 226, cy: 60, rx: 18, ry: 12 },
      { id: "hill-far", label: "Far hill", type: "path", d: "M0 168C90 132 170 146 250 162C330 178 400 146 480 160V300H0Z" },
      { id: "hill-near", label: "Near hill", type: "path", d: "M0 210C100 176 190 198 280 214C360 228 420 198 480 214V300H0Z" },
      { id: "path", label: "Path", type: "path", d: "M168 300C190 262 236 240 286 226L304 244C246 260 206 280 188 300Z" },
      { id: "trunk", label: "Trunk", type: "rect", x: 428, y: 156, width: 16, height: 74, rx: 4 },
      { id: "canopy", label: "Tree", type: "circle", cx: 436, cy: 142, r: 34 },
      { id: "house", label: "House", type: "rect", x: 292, y: 148, width: 86, height: 78, rx: 2 },
      { id: "roof", label: "Roof", type: "path", d: "M278 150L335 96L392 150Z" },
      { id: "door", label: "Door", type: "rect", x: 318, y: 184, width: 22, height: 42, rx: 2 },
      { id: "window", label: "Window", type: "rect", x: 350, y: 168, width: 18, height: 18, rx: 2 },
      ...flower("left", "Left flower", 150, 228),
      ...flower("mid", "Middle flower", 206, 236),
    ],
  },
  {
    id: "seaside",
    title: "Seaside",
    regions: [
      { id: "sky", label: "Sky", type: "rect", x: 0, y: 0, width: 480, height: 300 },
      { id: "sun", label: "Sun", type: "circle", cx: 400, cy: 58, r: 28 },
      { id: "cloud-a", label: "Cloud", type: "ellipse", cx: 150, cy: 48, rx: 34, ry: 16 },
      { id: "cloud-b", label: "Cloud", type: "ellipse", cx: 184, cy: 60, rx: 22, ry: 13 },
      { id: "cloud-c", label: "Cloud", type: "ellipse", cx: 118, cy: 62, rx: 18, ry: 12 },
      { id: "sea", label: "Sea", type: "path", d: "M0 150C90 132 180 168 270 150C360 132 420 168 480 148V208H0Z" },
      { id: "wave-l", label: "Wave", type: "path", d: "M8 162C40 150 90 174 150 160C118 172 70 158 8 174Z" },
      { id: "wave-r", label: "Wave", type: "path", d: "M330 160C390 148 440 172 472 158C440 172 390 158 330 174Z" },
      { id: "sand", label: "Sand", type: "rect", x: 0, y: 208, width: 480, height: 92 },
      { id: "hull", label: "Boat", type: "path", d: "M188 172L292 172L272 208H208Z" },
      { id: "mast", label: "Mast", type: "rect", x: 236, y: 104, width: 6, height: 70, rx: 2 },
      { id: "sail", label: "Sail", type: "path", d: "M242 110L300 172H242Z" },
      { id: "shell", label: "Shell", type: "ellipse", cx: 86, cy: 252, rx: 18, ry: 11 },
      { id: "star", label: "Starfish", type: "circle", cx: 390, cy: 256, r: 14 },
    ],
  },
  {
    id: "window",
    title: "Window",
    regions: [
      { id: "wall", label: "Wall", type: "rect", x: 0, y: 0, width: 480, height: 214 },
      { id: "floor", label: "Floor", type: "rect", x: 0, y: 200, width: 480, height: 100 },
      { id: "rug", label: "Rug", type: "ellipse", cx: 250, cy: 268, rx: 130, ry: 22 },
      { id: "curtain-l", label: "Left curtain", type: "path", d: "M108 24H158V188C142 176 124 176 108 188Z" },
      { id: "curtain-r", label: "Right curtain", type: "path", d: "M372 24H322V188C338 176 356 176 372 188Z" },
      { id: "frame", label: "Frame", type: "rect", x: 156, y: 36, width: 168, height: 128, rx: 4 },
      { id: "pane-tl", label: "Window", type: "rect", x: 164, y: 44, width: 72, height: 52 },
      { id: "pane-tr", label: "Window", type: "rect", x: 244, y: 44, width: 72, height: 52 },
      { id: "pane-bl", label: "Window", type: "rect", x: 164, y: 104, width: 72, height: 52 },
      { id: "pane-br", label: "Window", type: "rect", x: 244, y: 104, width: 72, height: 52 },
      { id: "sill", label: "Sill", type: "rect", x: 140, y: 164, width: 200, height: 12, rx: 3 },
      { id: "pot", label: "Pot", type: "path", d: "M214 214H266L256 252H224Z" },
      { id: "leaf-l", label: "Leaf", type: "ellipse", cx: 206, cy: 200, rx: 24, ry: 12 },
      { id: "leaf-r", label: "Leaf", type: "ellipse", cx: 274, cy: 196, rx: 24, ry: 12 },
      { id: "bloom", label: "Bloom", type: "circle", cx: 240, cy: 180, r: 16 },
      { id: "book", label: "Book", type: "rect", x: 340, y: 236, width: 52, height: 12, rx: 2 },
    ],
  },
];

const TOOLS: { id: Tool; label: string; icon: typeof Paintbrush }[] = [
  { id: "paint", label: "Paint", icon: PaintBucket },
  { id: "brush", label: "Brush", icon: Paintbrush },
  { id: "eraser", label: "Eraser", icon: Eraser },
];

export function ColorSketch() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const moved = useRef(false);
  const origin = useRef({ x: 0, y: 0 });
  const history = useRef<Step[]>([]);

  const [sketchIndex, setSketchIndex] = useState(0);
  const [tool, setTool] = useState<Tool>("paint");
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState<(typeof SIZES)[number]["width"]>(14);
  const [fills, setFills] = useState<Record<string, string>>({});
  const [canUndo, setCanUndo] = useState(false);

  const toolRef = useRef(tool);
  const colorRef = useRef(color);
  const sizeRef = useRef(size);
  const fillsRef = useRef(fills);
  toolRef.current = tool;
  colorRef.current = color;
  sizeRef.current = size;
  fillsRef.current = fills;

  const sketch = SKETCHES[sketchIndex];

  const contextOf = () => canvasRef.current?.getContext("2d") ?? null;

  const remember = (step: Step) => {
    history.current.push(step);
    if (history.current.length > 16) history.current.shift();
    setCanUndo(true);
  };

  const captureInk = () => {
    const canvas = canvasRef.current;
    const context = contextOf();
    if (!canvas || !context || canvas.width < 2) return null;
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    const bitmap = context.getImageData(0, 0, canvas.width, canvas.height);
    context.restore();
    return bitmap;
  };

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    const fit = () => {
      const context = canvas.getContext("2d");
      if (!context) return;
      const rect = stage.getBoundingClientRect();
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
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, width, height);
      if (previous.width > 1) context.drawImage(previous, 0, 0, width, height);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const clearInk = () => {
    const canvas = canvasRef.current;
    const context = contextOf();
    if (!canvas || !context) return;
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.globalCompositeOperation = "source-over";
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.restore();
  };

  const restoreInk = (bitmap: ImageData | null) => {
    const canvas = canvasRef.current;
    const context = contextOf();
    if (!canvas || !context) return;
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (bitmap) context.putImageData(bitmap, 0, 0);
    context.restore();
  };

  const paint = (id: string) => {
    remember({ kind: "fill", fills: fillsRef.current });
    setFills((current) => ({ ...current, [id]: colorRef.current }));
  };

  const eraseFill = (id: string) => {
    if (!fillsRef.current[id]) return;
    remember({ kind: "fill", fills: fillsRef.current });
    setFills((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const undo = () => {
    const step = history.current.pop();
    setCanUndo(history.current.length > 0);
    if (!step) return;
    if (step.kind === "fill") {
      setFills(step.fills);
      return;
    }
    if (step.kind === "all") {
      setFills(step.fills);
      restoreInk(step.bitmap);
      return;
    }
    restoreInk(step.bitmap);
  };

  const clearAll = () => {
    remember({ kind: "all", fills: fillsRef.current, bitmap: captureInk() });
    setFills({});
    clearInk();
  };

  const changeSketch = () => {
    history.current = [];
    setCanUndo(false);
    setFills({});
    clearInk();
    setSketchIndex((index) => (index + 1) % SKETCHES.length);
  };

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const strokeTo = (x: number, y: number) => {
    const context = contextOf();
    if (!context) return;
    const erasing = toolRef.current === "eraser";
    context.globalCompositeOperation = erasing ? "destination-out" : "source-over";
    context.strokeStyle = colorRef.current;
    context.globalAlpha = 1;
    context.lineWidth = erasing ? Math.max(sizeRef.current * 1.8, 16) : sizeRef.current;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineTo(x, y);
    context.stroke();
    context.beginPath();
    context.moveTo(x, y);
  };

  const regionUnder = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    canvas.style.pointerEvents = "none";
    const node = document.elementFromPoint(event.clientX, event.clientY);
    canvas.style.pointerEvents = "";
    const region = node?.closest?.("[data-region]");
    return region?.getAttribute("data-region") ?? null;
  };

  const shared = (id: string, label: string) => ({
    "data-region": id,
    fill: fills[id] ?? "#FFF8FB",
    stroke: "#5A3A4E",
    strokeWidth: 1.6,
    strokeLinejoin: "round" as const,
    className: cn("outline-none", tool === "paint" ? "cursor-pointer" : "cursor-default"),
    tabIndex: tool === "paint" ? 0 : -1,
    role: "button" as const,
    "aria-label": `Color the ${label}`,
    onClick: () => {
      if (toolRef.current !== "paint") return;
      paint(id);
    },
    onKeyDown: (event: React.KeyboardEvent) => {
      if (toolRef.current !== "paint") return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      paint(id);
    },
  });

  return (
    <div className="flex h-full min-h-[280px] flex-col gap-3">
      <div ref={stageRef} className="relative min-h-0 w-full flex-1">
        <svg
          viewBox="0 0 480 300"
          preserveAspectRatio="none"
          className="h-full w-full rounded-[22px] bg-[#FFF8FB] ring-1 ring-[#EADCE5]"
          aria-label={`${sketch.title} sketch. Paint fills a shape. Brush draws on top.`}
        >
          {sketch.regions.map((region) => {
            const props = shared(region.id, region.label);
            if (region.type === "path") return <path key={region.id} d={region.d} {...props} />;
            if (region.type === "circle") {
              return <circle key={region.id} cx={region.cx} cy={region.cy} r={region.r} {...props} />;
            }
            if (region.type === "ellipse") {
              return (
                <ellipse
                  key={region.id}
                  cx={region.cx}
                  cy={region.cy}
                  rx={region.rx}
                  ry={region.ry}
                  {...props}
                />
              );
            }
            return (
              <rect
                key={region.id}
                x={region.x}
                y={region.y}
                width={region.width}
                height={region.height}
                rx={region.rx}
                {...props}
              />
            );
          })}
        </svg>
        <canvas
          ref={canvasRef}
          aria-label={
            tool === "brush"
              ? "Brush layer. Drag to draw."
              : tool === "eraser"
                ? "Eraser. Drag to remove brush marks, or tap a shape to clear its color."
                : "Brush layer"
          }
          className={cn(
            "absolute inset-0 h-full w-full touch-none rounded-[22px]",
            tool === "paint" ? "pointer-events-none" : "cursor-crosshair"
          )}
          onPointerDown={(event) => {
            if (toolRef.current === "paint") return;
            drawing.current = true;
            moved.current = false;
            const start = point(event);
            origin.current = start;
            const bitmap = captureInk();
            if (bitmap) remember({ kind: "ink", bitmap });
            event.currentTarget.setPointerCapture(event.pointerId);
            const context = contextOf();
            context?.beginPath();
            context?.moveTo(start.x, start.y);
            strokeTo(start.x, start.y);
          }}
          onPointerMove={(event) => {
            if (!drawing.current) return;
            const next = point(event);
            if (Math.hypot(next.x - origin.current.x, next.y - origin.current.y) > 5) {
              moved.current = true;
            }
            strokeTo(next.x, next.y);
          }}
          onPointerUp={(event) => {
            drawing.current = false;
            const context = contextOf();
            if (context) {
              context.beginPath();
              context.globalCompositeOperation = "source-over";
            }
            if (toolRef.current === "eraser" && !moved.current) {
              const step = history.current.pop();
              if (step?.kind === "ink") restoreInk(step.bitmap);
              setCanUndo(history.current.length > 0);
              const id = regionUnder(event);
              if (id) eraseFill(id);
            }
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <p className="sr-only" aria-live="polite">
          {sketch.title} sketch
        </p>
        {TOOLS.map((item) => {
          const Icon = item.icon;
          const active = tool === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => setTool(item.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]",
                active
                  ? "bg-[#B74783] text-white"
                  : "border border-[#EADCE5] bg-white text-[#795A70]"
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {item.label}
            </button>
          );
        })}
        {tool !== "paint" &&
          SIZES.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={size === option.width}
              onClick={() => setSize(option.width)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]",
                size === option.width
                  ? "bg-[#49263D] text-white"
                  : "border border-[#EADCE5] bg-white text-[#795A70]"
              )}
            >
              {option.label}
            </button>
          ))}
        <button
          type="button"
          onClick={changeSketch}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#F0CADA] bg-[#FFF0F6] px-3 py-1.5 text-xs font-semibold text-[#9F376F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
        >
          <Images className="h-3.5 w-3.5" aria-hidden />
          Change sketch
          <span className="font-medium text-[#B74783]">· {sketch.title}</span>
        </button>
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          className="ml-auto rounded-full border border-[#EADCE5] bg-white px-3 py-1.5 text-xs font-semibold text-[#795A70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4] disabled:opacity-40"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="rounded-full border border-[#EADCE5] bg-white px-3 py-1.5 text-xs font-semibold text-[#795A70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
        >
          Clear
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {COLORS.map((swatch) => (
          <button
            key={swatch}
            type="button"
            aria-label={`Color ${swatch}`}
            aria-pressed={color === swatch}
            onClick={() => setColor(swatch)}
            className={cn(
              "h-8 w-8 rounded-full border border-[#EADCE5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]",
              color === swatch && "ring-2 ring-[#49263D] ring-offset-2"
            )}
            style={{ background: swatch }}
          />
        ))}
      </div>
    </div>
  );
}
