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

export function findVisibleTourTarget(target: TourTargetId): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const nodes = document.querySelectorAll<HTMLElement>(`[data-tour="${target}"]`);
  let bestInView: HTMLElement | null = null;
  let bestInViewArea = 0;
  let bestAny: HTMLElement | null = null;
  let bestAnyArea = 0;

  for (const el of nodes) {
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
      continue;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;
    const area = rect.width * rect.height;

    if (area > bestAnyArea) {
      bestAny = el;
      bestAnyArea = area;
    }

    const inViewport =
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < window.innerHeight &&
      rect.left < window.innerWidth;

    if (inViewport && area > bestInViewArea) {
      bestInView = el;
      bestInViewArea = area;
    }
  }

  return bestInView || bestAny;
}
