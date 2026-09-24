/**
 * Wellness Plan API client.
 * Currently backed by local persistence; shaped for future backend endpoints.
 */
import type { WellnessAssessment, WellnessPlan, PlanTask } from "@/lib/wellness-plan/types";
import { generateWellnessPlan } from "@/lib/wellness-plan/generate-plan";
import {
  clearWellnessPlan,
  loadWellnessPlan,
  saveWellnessPlan,
} from "@/lib/wellness-plan/storage";
import { completeTaskInPlan, suggestionFromEmotion } from "@/lib/wellness-plan/adaptive";
import { evaluateAchievements, generateWeeklyReport } from "@/lib/wellness-plan/achievements";
import type { WeeklyReport } from "@/lib/wellness-plan/types";

export async function getWellnessPlan(): Promise<WellnessPlan | null> {
  // Future: GET /api/wellness-plan
  return loadWellnessPlan();
}

export async function createWellnessPlan(
  assessment: WellnessAssessment,
  userId?: string
): Promise<WellnessPlan> {
  // Future: POST /api/wellness-plan
  const plan = generateWellnessPlan(assessment, userId);
  saveWellnessPlan(plan);
  return plan;
}

export async function updateWellnessPlan(
  plan: WellnessPlan
): Promise<WellnessPlan> {
  // Future: PUT /api/wellness-plan/:id
  const next = evaluateAchievements(plan);
  saveWellnessPlan(next);
  return next;
}

export async function completeWellnessTask(
  taskId: string,
  extras?: { journalEntry?: string; notes?: string }
): Promise<WellnessPlan | null> {
  // Future: POST /api/wellness-plan/tasks/:id/complete
  const plan = loadWellnessPlan();
  if (!plan) return null;
  let next = completeTaskInPlan(plan, taskId, extras);
  next = evaluateAchievements(next);
  saveWellnessPlan(next);
  return next;
}

export async function deleteWellnessPlan(): Promise<void> {
  // Future: DELETE /api/wellness-plan
  clearWellnessPlan();
}

export async function refreshWeeklyReport(): Promise<WellnessPlan | null> {
  const plan = loadWellnessPlan();
  if (!plan) return null;
  const report = generateWeeklyReport(plan);
  const filtered = plan.weeklyReports.filter(
    (r: WeeklyReport) => r.weekNumber !== report.weekNumber
  );
  const next = {
    ...plan,
    weeklyReports: [...filtered, report],
    updatedAt: new Date().toISOString(),
  };
  saveWellnessPlan(next);
  return next;
}

export function applyChatWellnessHint(
  emotion: string,
  intensity: number
): WellnessPlan | null {
  const plan = loadWellnessPlan();
  const suggestion = suggestionFromEmotion(emotion, intensity, !!plan);
  if (!suggestion) return plan;

  if (!plan) {
    // Persist a lightweight pending flag for empty-state CTA
    const pending = {
      id: "pending",
      title: "",
      primaryGoal: "reduce_stress" as const,
      assessment: {
        primaryGoal: "reduce_stress" as const,
        stressLevel: 7,
        sleepQuality: "average" as const,
        dailyTime: "10_minutes" as const,
        activities: [],
        preferredTime: "flexible" as const,
        completedAt: new Date().toISOString(),
      },
      durationDays: 0,
      weeks: [],
      challengeLevel: "light" as const,
      currentStreak: 0,
      longestStreak: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "paused" as const,
      progressRecords: [],
      weeklyReports: [],
      achievements: [],
      adaptationNotes: [],
      pendingSuggestion: suggestion,
    };
    // Don't overwrite with fake plan — store suggestion separately
    try {
      localStorage.setItem(
        "aurapulse_wellness_suggestion",
        JSON.stringify(suggestion)
      );
    } catch {
      /* ignore */
    }
    return pending;
  }

  const next = {
    ...plan,
    pendingSuggestion: suggestion,
    updatedAt: new Date().toISOString(),
  };
  saveWellnessPlan(next);
  return next;
}

export function getPendingChatSuggestion() {
  try {
    const fromPlan = loadWellnessPlan()?.pendingSuggestion;
    if (fromPlan) return fromPlan;
    const raw = localStorage.getItem("aurapulse_wellness_suggestion");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearPendingChatSuggestion() {
  const plan = loadWellnessPlan();
  if (plan?.pendingSuggestion) {
    saveWellnessPlan({ ...plan, pendingSuggestion: null });
  }
  localStorage.removeItem("aurapulse_wellness_suggestion");
}

export type { WellnessPlan, WellnessAssessment, PlanTask };
