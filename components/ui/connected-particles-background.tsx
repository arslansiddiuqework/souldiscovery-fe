"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  baseAlpha: number;
  tint: 0 | 1 | 2;
  phase: number;
};

type Palette = {
  fill: string;
};

type MaskRect = { l: number; t: number; r: number; b: number };

const PALETTES: Palette[] = [
  { fill: "155,55,110" },
  { fill: "120,45,90" },
  { fill: "130,70,155" },
];

/** UI that should keep blanks free of dots */
const MASK_SELECTORS = [
  "[data-particles-mask]",
  ".nav-pill",
  ".glass-panel",
  ".glass-panel-light",
  "footer",
  "[role='dialog']",
  "main h1",
  "main h2",
  "main h3",
  "main .bg-white",
].join(",");

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isCoarsePointer(): boolean {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window
  );
}

function particleCountFor(width: number, height: number): number {
  const area = width * height;
  if (width < 640) {
    return Math.max(28, Math.min(48, Math.round(area / 16000)));
  }
  if (width < 1024) {
    return Math.max(45, Math.min(75, Math.round(area / 13000)));
  }
  return Math.max(70, Math.min(110, Math.round(area / 11000)));
}

function connectionDistanceFor(width: number): number {
  if (width < 640) return 85;
  if (width < 1024) return 110;
  return 130;
}

function createParticles(
  width: number,
  height: number,
  count: number
): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const speed = 0.07 + Math.random() * 0.13;
    const angle = Math.random() * Math.PI * 2;
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: width < 640 ? 1.4 + Math.random() * 1.0 : 1.9 + Math.random() * 1.7,
      // A little faded from the original denser look
      baseAlpha: 0.36 + Math.random() * 0.18,
      tint: (Math.random() < 0.55
        ? 0
        : Math.random() < 0.65
          ? 1
          : 2) as 0 | 1 | 2,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return particles;
}

function pointInMasks(x: number, y: number, masks: MaskRect[]): boolean {
  for (let i = 0; i < masks.length; i++) {
    const m = masks[i];
    if (x >= m.l && x <= m.r && y >= m.t && y <= m.b) return true;
  }
  return false;
}

/**
 * Calm connected-dot atmosphere.
 * Slightly faded; dots/lines are not drawn over text, cards, or nav.
 */
export function ConnectedParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let connectDist = 130;
    let reduced = prefersReducedMotion();
    let touchDevice = isCoarsePointer();
    let running = true;
    let maskEls: Element[] = [];
    let masks: MaskRect[] = [];

    const mouse = { x: -9999, y: -9999, active: false };

    const refreshMaskEls = () => {
      try {
        maskEls = Array.from(document.querySelectorAll(MASK_SELECTORS));
      } catch {
        maskEls = [];
      }
    };

    const updateMaskRects = () => {
      const next: MaskRect[] = [];
      for (let i = 0; i < maskEls.length; i++) {
        const el = maskEls[i];
        if (!(el instanceof HTMLElement)) continue;
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") continue;
        if (Number(style.opacity) === 0) continue;

        const r = el.getBoundingClientRect();
        if (r.width < 8 || r.height < 8) continue;
        if (r.bottom < 0 || r.top > height || r.right < 0 || r.left > width) {
          continue;
        }
        // Ignore near-fullscreen layers
        if (r.width > width * 0.92 && r.height > height * 0.7) continue;

        const padX = Math.max(12, Math.min(32, r.width * 0.05));
        const padY = Math.max(10, Math.min(28, r.height * 0.15));
        next.push({
          l: r.left - padX,
          t: r.top - padY,
          r: r.right + padX,
          b: r.bottom + padY,
        });
      }
      masks = next;
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      connectDist = connectionDistanceFor(width);
      particles = createParticles(width, height, particleCountFor(width, height));
      refreshMaskEls();
      updateMaskRects();
    };

    const drawFrame = (time: number, animate: boolean) => {
      ctx.clearRect(0, 0, width, height);
      updateMaskRects();

      const maxDist = connectDist;
      const maxDistSq = maxDist * maxDist;
      const mouseRadius = 140;
      const mouseRadiusSq = mouseRadius * mouseRadius;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (animate) {
          p.phase += 0.0025;
          p.x += p.vx + Math.cos(p.phase) * 0.04;
          p.y += p.vy + Math.sin(p.phase * 0.9) * 0.04;

          if (mouse.active && !touchDevice) {
            const mdx = p.x - mouse.x;
            const mdy = p.y - mouse.y;
            const mDistSq = mdx * mdx + mdy * mdy;
            if (mDistSq < mouseRadiusSq && mDistSq > 0.01) {
              const mDist = Math.sqrt(mDistSq);
              const force = ((mouseRadius - mDist) / mouseRadius) * 0.035;
              p.x += (mdx / mDist) * force;
              p.y += (mdy / mDist) * force;
            }
          }

          if (p.x < -20) p.x = width + 20;
          else if (p.x > width + 20) p.x = -20;
          if (p.y < -20) p.y = height + 20;
          else if (p.y > height + 20) p.y = -20;
        }

        if (pointInMasks(p.x, p.y, masks)) continue;

        const pulse = animate
          ? 0.9 + Math.sin(time * 0.001 + p.phase) * 0.1
          : 1;
        const alpha = p.baseAlpha * pulse;
        const palette = PALETTES[p.tint];

        ctx.beginPath();
        ctx.fillStyle = `rgba(${palette.fill},${alpha})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        if (pointInMasks(a.x, a.y, masks)) continue;

        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          if (pointInMasks(b.x, b.y, masks)) continue;

          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq > maxDistSq) continue;

          // Skip links that cross through masked content
          const mx = (a.x + b.x) * 0.5;
          const my = (a.y + b.y) * 0.5;
          if (pointInMasks(mx, my, masks)) continue;

          const dist = Math.sqrt(distSq);
          let t = 1 - dist / maxDist;
          t = t * t;
          let alpha = t * 0.2;

          if (mouse.active && !touchDevice) {
            const cx = mx - mouse.x;
            const cy = my - mouse.y;
            if (cx * cx + cy * cy < mouseRadiusSq) {
              alpha = Math.min(0.3, alpha * 1.35);
            }
          }

          if (alpha < 0.014) continue;

          ctx.beginPath();
          ctx.strokeStyle = `rgba(155,55,110,${alpha})`;
          ctx.lineWidth = 1;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    };

    const tick = (time: number) => {
      if (!running) return;
      drawFrame(time, true);
      raf = window.requestAnimationFrame(tick);
    };

    const onResize = () => {
      resize();
      if (reduced) drawFrame(0, false);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const onMouseLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const onMotionChange = (e: MediaQueryListEvent) => {
      reduced = e.matches;
      window.cancelAnimationFrame(raf);
      resize();
      if (reduced) {
        drawFrame(0, false);
      } else {
        raf = window.requestAnimationFrame(tick);
      }
    };

    resize();

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    motionQuery.addEventListener("change", onMotionChange);
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("scroll", updateMaskRects, { passive: true });
    const maskInterval = window.setInterval(() => {
      refreshMaskEls();
      updateMaskRects();
    }, 1200);

    if (!touchDevice) {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
      window.addEventListener("mouseleave", onMouseLeave);
      document.documentElement.addEventListener("mouseleave", onMouseLeave);
    }

    if (reduced) {
      drawFrame(0, false);
    } else {
      raf = window.requestAnimationFrame(tick);
    }

    return () => {
      running = false;
      window.cancelAnimationFrame(raf);
      window.clearInterval(maskInterval);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", updateMaskRects);
      motionQuery.removeEventListener("change", onMotionChange);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full opacity-75"
    />
  );
}
