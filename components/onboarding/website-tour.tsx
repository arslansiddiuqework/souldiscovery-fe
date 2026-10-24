"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { usePathname, useSearchParams } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { Compass, X } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { BRAND_CAPTION, BRAND_NAME } from "@/lib/branding";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOnboarding } from "@/lib/onboarding/onboarding-context";
import {
  findVisibleTourTarget,
  isTourRouteReady,
  TOUR_TOTAL_STEPS,
} from "@/lib/onboarding/tour-steps";

type Rect = { top: number; left: number; width: number; height: number };

const PAD = 10;

function measure(el: HTMLElement): Rect {
  const r = el.getBoundingClientRect();
  return {
    top: r.top,
    left: r.left,
    width: r.width,
    height: r.height,
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function rectsClose(a: Rect | null, b: Rect | null) {
  if (!a || !b) return a === b;
  return (
    Math.abs(a.top - b.top) < 1 &&
    Math.abs(a.left - b.left) < 1 &&
    Math.abs(a.width - b.width) < 1 &&
    Math.abs(a.height - b.height) < 1
  );
}

export function WebsiteTour() {
  const {
    phase,
    currentStep,
    stepLabel,
    next,
    back,
    skip,
    finish,
    beginSpotlight,
  } = useOnboarding();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ? `?${searchParams.toString()}` : "";
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const descId = useId();
  const liveRef = useRef<HTMLDivElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [missingTarget, setMissingTarget] = useState(false);
  const [routeSettling, setRouteSettling] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<number | null>(null);
  const lastStepIdRef = useRef<string | null>(null);

  useEffect(() => setMounted(true), []);

  const updateViewport = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const refreshTarget = useCallback(
    (opts?: { allowScroll?: boolean }) => {
      if (phase !== "spotlight" || !currentStep) {
        setTargetRect(null);
        setMissingTarget(false);
        setRouteSettling(false);
        return;
      }

      const routeReady = isTourRouteReady(
        pathname,
        currentStep.href,
        search
      );
      if (!routeReady) {
        setRouteSettling(true);
        setMissingTarget(false);
        setTargetRect(null);
        return;
      }

      setRouteSettling(false);
      const el = findVisibleTourTarget(currentStep.target);
      if (!el) {
        setMissingTarget(true);
        return;
      }

      setMissingTarget(false);
      const rect = measure(el);
      setTargetRect((prev) => (rectsClose(prev, rect) ? prev : rect));

      if (opts?.allowScroll === false) return;

      const fullyVisible =
        rect.top >= 72 &&
        rect.top + rect.height <= window.innerHeight - 24 &&
        rect.left >= 8 &&
        rect.left + rect.width <= window.innerWidth - 8;

      if (!fullyVisible) {
        if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current);
        el.scrollIntoView({
          block: "center",
          inline: "nearest",
          behavior: reduceMotion ? "auto" : "smooth",
        });
        scrollTimerRef.current = window.setTimeout(() => {
          const again = findVisibleTourTarget(currentStep.target);
          if (again) {
            const nextRect = measure(again);
            setTargetRect((prev) =>
              rectsClose(prev, nextRect) ? prev : nextRect
            );
          }
        }, reduceMotion ? 40 : 280);
      }
    },
    [currentStep, phase, pathname, reduceMotion, search]
  );

  useLayoutEffect(() => {
    if (!mounted) return;
    updateViewport();
    refreshTarget({ allowScroll: true });
  }, [mounted, phase, currentStep, pathname, search, updateViewport, refreshTarget]);

  // Re-measure while spotlight is open (layout shifts, fonts, tabs)
  useEffect(() => {
    if (phase !== "spotlight" || !currentStep) return;

    const onResize = () => {
      updateViewport();
      refreshTarget({ allowScroll: false });
    };
    const onScroll = () => refreshTarget({ allowScroll: false });

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);

    const boots = [80, 220, 500, 900, 1400].map((ms) =>
      window.setTimeout(() => refreshTarget({ allowScroll: ms <= 500 }), ms)
    );
    const interval = window.setInterval(
      () => refreshTarget({ allowScroll: false }),
      700
    );

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
      boots.forEach((id) => window.clearTimeout(id));
      window.clearInterval(interval);
      if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current);
    };
  }, [phase, currentStep, pathname, search, refreshTarget, updateViewport]);

  // Only auto-advance when the route is ready AND the target stays missing.
  // Prevents skipping a step during client-side navigation.
  useEffect(() => {
    if (phase !== "spotlight" || !currentStep || !missingTarget || routeSettling) {
      return;
    }
    if (!isTourRouteReady(pathname, currentStep.href, search)) return;

    const timer = window.setTimeout(() => {
      // Re-check once more before skipping
      if (findVisibleTourTarget(currentStep.target)) {
        setMissingTarget(false);
        refreshTarget({ allowScroll: true });
        return;
      }
      next();
    }, 2800);

    return () => window.clearTimeout(timer);
  }, [
    missingTarget,
    next,
    phase,
    currentStep,
    pathname,
    search,
    routeSettling,
    refreshTarget,
  ]);

  useEffect(() => {
    if (phase === "idle") return;
    const announcement =
      phase === "welcome"
        ? "Welcome to Soul Discovery. Tour dialog open."
        : phase === "complete"
          ? "Tour complete. You're ready to begin."
          : currentStep
            ? `${currentStep.title}. ${currentStep.description}`
            : "";
    if (liveRef.current && announcement) {
      liveRef.current.textContent = announcement;
    }
  }, [phase, currentStep]);

  // Focus primary action when a new spotlight step lands
  useEffect(() => {
    if (phase !== "spotlight" || !currentStep) return;
    if (lastStepIdRef.current === currentStep.id) return;
    lastStepIdRef.current = currentStep.id;
    const t = window.setTimeout(() => nextBtnRef.current?.focus(), 180);
    return () => window.clearTimeout(t);
  }, [phase, currentStep]);

  useEffect(() => {
    if (phase === "idle") {
      lastStepIdRef.current = null;
      return;
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        skip();
        return;
      }
      if (phase === "spotlight" && (e.key === "Enter" || e.key === "ArrowRight")) {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        next();
      }
      if (phase === "spotlight" && e.key === "ArrowLeft") {
        e.preventDefault();
        back();
      }
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    // Keep page scrollable under spotlight so scrollIntoView can settle,
    // but lock scroll for modal phases.
    if (phase === "welcome" || phase === "complete") {
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [phase, skip, next, back]);

  if (!mounted || phase === "idle") return null;

  const showSpotlightChrome =
    phase === "spotlight" &&
    !!currentStep &&
    (!!targetRect || routeSettling || missingTarget);

  const spotlightPad = {
    top: targetRect ? Math.max(8, targetRect.top - PAD) : 0,
    left: targetRect ? Math.max(8, targetRect.left - PAD) : 0,
    width: targetRect ? targetRect.width + PAD * 2 : 0,
    height: targetRect ? targetRect.height + PAD * 2 : 0,
  };

  const tooltipStyle = (() => {
    if (isMobile || !targetRect) {
      return undefined;
    }
    const tipW = 320;
    const tipH = tooltipRef.current?.offsetHeight || 200;
    const gap = 14;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const spaceBelow = vh - (spotlightPad.top + spotlightPad.height) - 16;
    const spaceAbove = spotlightPad.top - 16;
    const spaceRight = vw - (spotlightPad.left + spotlightPad.width) - 16;
    const spaceLeft = spotlightPad.left - 16;

    let top: number;
    let left: number;

    // Prefer below / above for compact targets; side only when vertical space is tight.
    if (spaceBelow >= tipH + gap || spaceBelow >= spaceAbove) {
      top = spotlightPad.top + spotlightPad.height + gap;
      left = spotlightPad.left + spotlightPad.width / 2 - tipW / 2;
      if (top + tipH > vh - 16 && spaceAbove >= tipH + gap) {
        top = spotlightPad.top - tipH - gap;
      }
    } else if (spaceAbove >= tipH + gap) {
      top = spotlightPad.top - tipH - gap;
      left = spotlightPad.left + spotlightPad.width / 2 - tipW / 2;
    } else if (spaceRight >= tipW + gap) {
      left = spotlightPad.left + spotlightPad.width + gap;
      top = clamp(
        spotlightPad.top + spotlightPad.height / 2 - tipH / 2,
        16,
        vh - tipH - 16
      );
    } else if (spaceLeft >= tipW + gap) {
      left = spotlightPad.left - tipW - gap;
      top = clamp(
        spotlightPad.top + spotlightPad.height / 2 - tipH / 2,
        16,
        vh - tipH - 16
      );
    } else {
      top = clamp(
        spotlightPad.top + spotlightPad.height + gap,
        16,
        vh - tipH - 16
      );
      left = spotlightPad.left + spotlightPad.width / 2 - tipW / 2;
    }

    left = clamp(left, 16, vw - tipW - 16);
    top = clamp(top, 16, vh - tipH - 16);

    return { top, left, width: tipW };
  })();

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[90]" aria-live="polite">
      <div ref={liveRef} className="sr-only" aria-atomic="true" />

      {/* Welcome */}
      {phase === "welcome" && (
        <div className="pointer-events-auto fixed inset-0 z-[91] flex items-end justify-center bg-[rgba(73,38,61,0.32)] p-4 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className={cn(
              "w-full max-w-[400px] rounded-[28px] border border-[#EADCE5] bg-white p-6 shadow-[0_20px_60px_rgba(123,57,98,0.14)] sm:p-8",
              !reduceMotion && "animate-in fade-in-0 zoom-in-95 duration-300"
            )}
          >
            <div className="mb-5 flex justify-center">
              <BrandLogo variant="stacked" size={56} />
            </div>
            <h2
              id={titleId}
              className="text-center text-2xl font-bold tracking-tight text-[#49263D]"
            >
              Welcome to {BRAND_NAME}
            </h2>
            <p
              id={descId}
              className="mt-2 text-center text-sm leading-relaxed text-[#795A70]"
            >
              A calmer way to understand yourself and build healthier habits.
            </p>
            <p className="mt-1 text-center text-xs text-[#927C8B]">{BRAND_CAPTION}</p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Button
                type="button"
                className="h-11 w-full rounded-full bg-[#B74783] text-white hover:bg-[#9F376F]"
                onClick={beginSpotlight}
                autoFocus
              >
                Show me around
              </Button>
              <button
                type="button"
                onClick={skip}
                className="rounded-full px-4 py-2.5 text-sm font-semibold text-[#795A70] transition hover:bg-[#FFF0F6] hover:text-[#49263D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
              >
                Explore on my own
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spotlight + tooltip */}
      {showSpotlightChrome && currentStep && (
        <>
          {targetRect ? (
            <div
              aria-hidden
              className="pointer-events-none fixed z-[91] rounded-[20px] ring-2 ring-[#D9B8F5] ring-offset-2 ring-offset-transparent transition-[top,left,width,height,opacity] duration-300 ease-out"
              style={{
                top: spotlightPad.top,
                left: spotlightPad.left,
                width: spotlightPad.width,
                height: spotlightPad.height,
                boxShadow: "0 0 0 9999px rgba(73, 38, 61, 0.3)",
              }}
            />
          ) : (
            <div
              aria-hidden
              className="pointer-events-none fixed inset-0 z-[91] bg-[rgba(73,38,61,0.22)] transition-opacity duration-300"
            />
          )}

          {/* Soft interaction shield — Escape / Skip close the tour */}
          <div className="pointer-events-auto fixed inset-0 z-[90]" aria-hidden />

          <div
            ref={tooltipRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className={cn(
              "pointer-events-auto fixed z-[92] border border-[#EADCE5] bg-white shadow-[0_16px_40px_rgba(123,57,98,0.14)]",
              isMobile || !tooltipStyle
                ? "inset-x-3 bottom-3 rounded-[24px] p-4 sm:inset-x-auto"
                : "rounded-[22px] p-4",
              !reduceMotion &&
                "animate-in fade-in-0 slide-in-from-bottom-2 duration-250"
            )}
            style={
              isMobile || !tooltipStyle
                ? undefined
                : {
                    top: tooltipStyle.top,
                    left: tooltipStyle.left,
                    width: tooltipStyle.width,
                  }
            }
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#927C8B]">
                  {stepLabel}
                  {routeSettling ? " · loading…" : null}
                </p>
                <h3
                  id={titleId}
                  className="mt-1 text-base font-bold tracking-tight text-[#49263D]"
                >
                  {currentStep.title}
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close tour"
                onClick={skip}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#927C8B] transition hover:bg-[#FFF0F6] hover:text-[#49263D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p id={descId} className="text-sm leading-relaxed text-[#795A70]">
              {currentStep.description}
            </p>
            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={skip}
                className="rounded-md px-1 text-xs font-semibold text-[#927C8B] transition hover:text-[#B74783] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
              >
                Skip tour
              </button>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full border-[#EADCE5]"
                  onClick={back}
                >
                  Back
                </Button>
                <Button
                  ref={nextBtnRef}
                  type="button"
                  size="sm"
                  className="rounded-full bg-[#B74783] text-white hover:bg-[#9F376F]"
                  onClick={next}
                  disabled={routeSettling}
                >
                  {stepLabel.startsWith(`${TOUR_TOTAL_STEPS} of`)
                    ? "Done"
                    : "Next"}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Completion */}
      {phase === "complete" && (
        <div className="pointer-events-auto fixed inset-0 z-[91] flex items-end justify-center bg-[rgba(73,38,61,0.32)] p-4 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className={cn(
              "w-full max-w-[400px] rounded-[28px] border border-[#EADCE5] bg-white p-6 shadow-[0_20px_60px_rgba(123,57,98,0.14)] sm:p-8",
              !reduceMotion && "animate-in fade-in-0 zoom-in-95 duration-300"
            )}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFE5F0] text-[#B74783]">
              <Compass className="h-6 w-6" aria-hidden />
            </div>
            <h2
              id={titleId}
              className="text-center text-2xl font-bold tracking-tight text-[#49263D]"
            >
              You&apos;re ready to begin
            </h2>
            <p
              id={descId}
              className="mt-2 text-center text-sm leading-relaxed text-[#795A70]"
            >
              Small steps can make a meaningful difference.
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Button
                type="button"
                className="h-11 w-full rounded-full bg-[#B74783] text-white hover:bg-[#9F376F]"
                onClick={() => finish({ navigateToDashboard: true })}
                autoFocus
              >
                Explore My Dashboard
              </Button>
              <button
                type="button"
                onClick={() => finish()}
                className="rounded-full px-4 py-2.5 text-sm font-semibold text-[#795A70] transition hover:bg-[#FFF0F6] hover:text-[#49263D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
              >
                Finish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
