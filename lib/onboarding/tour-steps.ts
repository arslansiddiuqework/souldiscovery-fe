export type TourTargetId =
  | "dashboard"
  | "wellness-plan"
  | "assessments"
  | "calm-tools";

export type TourSpotlightStep = {
  id: TourTargetId;
  title: string;
  description: string;
  /** Preferred route so the real UI target exists */
  href: string;
  /** data-tour attribute value */
  target: TourTargetId;
};

/** Spotlight steps after the welcome modal (progress shows these as 2–5 of 5). */
export const TOUR_SPOTLIGHT_STEPS: TourSpotlightStep[] = [
  {
    id: "dashboard",
    title: "Your wellness at a glance",
    description: "See your progress and find your next activity.",
    href: "/dashboard",
    target: "dashboard",
  },
  {
    id: "wellness-plan",
    title: "Your personal wellness plan",
    description: "Explore activities designed to support your daily well-being.",
    href: "/wellness-plan",
    target: "wellness-plan",
  },
  {
    id: "assessments",
    title: "Understand how you're feeling",
    description: "Explore assessments that help you reflect on your well-being.",
    href: "/assessments",
    target: "assessments",
  },
  {
    id: "calm-tools",
    title: "Take a moment for yourself",
    description: "Discover calming activities to help you pause and unwind.",
    href: "/wellness-plan?view=calm",
    target: "calm-tools",
  },
];

export const TOUR_TOTAL_STEPS = 1 + TOUR_SPOTLIGHT_STEPS.length;

function priorityScore(el: HTMLElement): number {
  const raw = (el.getAttribute("data-tour-priority") || "normal").toLowerCase();
  if (raw === "high") return 3;
  if (raw === "low") return 1;
  return 2;
}

/**
 * Pick the best visible tour anchor.
 * Prefers high-priority, in-viewport, mid-sized targets over full-page shells.
 */
export function findVisibleTourTarget(target: TourTargetId): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const nodes = document.querySelectorAll<HTMLElement>(`[data-tour="${target}"]`);
  const viewportArea = Math.max(1, window.innerWidth * window.innerHeight);

  let best: HTMLElement | null = null;
  let bestScore = -Infinity;

  for (const el of nodes) {
    const style = window.getComputedStyle(el);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      Number(style.opacity) === 0
    ) {
      continue;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;

    const area = rect.width * rect.height;
    const inViewport =
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < window.innerHeight &&
      rect.left < window.innerWidth;

    // Huge page shells make a poor spotlight — demote them hard.
    const sizePenalty = area > viewportArea * 0.55 ? -1000 : area > viewportArea * 0.28 ? -120 : 0;
    // Prefer compact-but-readable targets (nav chips, cards, panels).
    const sizeBonus = area > 2400 && area < viewportArea * 0.22 ? 40 : 0;

    const score =
      priorityScore(el) * 500 +
      (inViewport ? 200 : 0) +
      sizeBonus +
      sizePenalty +
      Math.min(area / 4000, 30);

    if (score > bestScore) {
      best = el;
      bestScore = score;
    }
  }

  return best;
}

/**
 * True when the current path (and required query, if any) match a tour step.
 * Query-aware so calm tools wait for `?view=calm` instead of flashing early.
 */
export function isTourRouteReady(
  pathname: string | null | undefined,
  href: string,
  search?: string | null
): boolean {
  if (!pathname) return false;
  const [targetPath, query = ""] = href.split("?");
  const pathOk =
    pathname === targetPath || pathname.startsWith(`${targetPath}/`);
  if (!pathOk) return false;
  if (!query) return true;

  const current = new URLSearchParams(
    (search || "").startsWith("?") ? search!.slice(1) : search || ""
  );
  const required = new URLSearchParams(query);
  for (const [key, value] of required.entries()) {
    if (current.get(key) !== value) return false;
  }
  return true;
}
