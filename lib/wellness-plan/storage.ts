import { WellnessPlan, WellnessPlanState } from "./types";
import { adaptPlanIfNeeded } from "./adaptive";
import { ensureWeeklyReport, evaluateAchievements } from "./achievements";

const STORAGE_KEY = "aurapulse_wellness_plan_v1";

export function loadWellnessPlan(): WellnessPlan | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw) as WellnessPlanState;
    if (!state?.plan) return null;
    let plan = adaptPlanIfNeeded(state.plan);
    plan = evaluateAchievements(plan);
    plan = ensureWeeklyReport(plan);
    if (plan !== state.plan) {
      saveWellnessPlan(plan);
    }
    return plan;
  } catch {
    return null;
  }
}

export function saveWellnessPlan(plan: WellnessPlan | null): void {
  if (typeof window === "undefined") return;
  const state: WellnessPlanState = { plan, version: 1 };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearWellnessPlan(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
