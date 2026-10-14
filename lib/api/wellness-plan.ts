/**
 * Wellness Plan API client.
 * Local persistence + backend sync so admin can track enrollments.
 */
import type {
  WellnessAssessment,
  WellnessPlan,
  PlanTask,
} from "@/lib/wellness-plan/types";
import { generateWellnessPlan } from "@/lib/wellness-plan/generate-plan";
import {
  clearWellnessPlan,
  getEnrollmentBySlug,
  listEnrollments,
  loadWellnessPlan,
  pauseActiveEnrollmentsForSlug,
  saveWellnessPlan,
  setActiveEnrollment,
  upsertEnrollment,
} from "@/lib/wellness-plan/storage";
import {
  completeTaskInPlan,
  suggestionFromEmotion,
} from "@/lib/wellness-plan/adaptive";
import {
  evaluateAchievements,
  generateWeeklyReport,
} from "@/lib/wellness-plan/achievements";
import type { WeeklyReport } from "@/lib/wellness-plan/types";
import { getPlanBySlug } from "@/lib/wellness-plan/catalog";

function authHeaders(): HeadersInit | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function syncPlanToBackend(plan: WellnessPlan): Promise<void> {
  const headers = authHeaders();
  if (!headers) return;
  try {
    await fetch("/api/wellness-plan", {
      method: "PUT",
      headers,
      body: JSON.stringify(plan),
    });
  } catch {
    /* offline — local copy remains */
  }
}

async function pullEnrollmentsFromBackend(): Promise<WellnessPlan[] | null> {
  const headers = authHeaders();
  if (!headers) return null;
  try {
    const response = await fetch("/api/wellness-plan", {
      headers,
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (!Array.isArray(data.enrollments)) return null;
    return data.enrollments as WellnessPlan[];
  } catch {
    return null;
  }
}

export async function getWellnessPlan(): Promise<WellnessPlan | null> {
  const remote = await pullEnrollmentsFromBackend();
  if (remote?.length) {
    for (const plan of remote) {
      upsertEnrollment(plan);
    }
  }
  return loadWellnessPlan();
}

export async function listWellnessEnrollments(): Promise<WellnessPlan[]> {
  const local = listEnrollments();
  const remote = await pullEnrollmentsFromBackend();

  // Push any local-only enrollments so admin can see pre-sync progress
  if (authHeaders() && local.length) {
    const remoteIds = new Set((remote || []).map((p) => p.id));
    for (const plan of local) {
      if (!remoteIds.has(plan.id)) {
        await syncPlanToBackend(plan);
      }
    }
  }

  if (remote?.length) {
    for (const plan of remote) {
      upsertEnrollment(plan);
    }
    // Prefer merged local view after upserts
    return listEnrollments();
  }
  return local;
}

export async function getEnrollmentForCatalogSlug(
  slug: string
): Promise<WellnessPlan | null> {
  return getEnrollmentBySlug(slug);
}

export interface CreateWellnessPlanInput {
  assessment: WellnessAssessment;
  userId?: string;
  catalogSlug?: string;
  /** Force a new enrollment even if one exists for this slug */
  forceNew?: boolean;
}

export async function createWellnessPlan(
  assessmentOrInput: WellnessAssessment | CreateWellnessPlanInput,
  userId?: string
): Promise<WellnessPlan> {
  const input: CreateWellnessPlanInput =
    "assessment" in assessmentOrInput
      ? assessmentOrInput
      : { assessment: assessmentOrInput, userId };

  const catalog = input.catalogSlug
    ? getPlanBySlug(input.catalogSlug)
    : undefined;

  if (input.catalogSlug && !input.forceNew) {
    const existing = getEnrollmentBySlug(input.catalogSlug);
    if (existing?.status === "active") {
      setActiveEnrollment(existing.id);
      return existing;
    }
    // Resume paused enrollment instead of creating a duplicate
    if (existing?.status === "paused") {
      const resumed = setActiveEnrollment(existing.id);
      return resumed || existing;
    }
  }

  const slug = input.catalogSlug || catalog?.slug;
  // Start Again / new enrollment: pause prior active rows for this slug so
  // getEnrollmentBySlug prefers the new plan and Reduce Anxiety history stays.
  if (slug) {
    pauseActiveEnrollmentsForSlug(slug);
  }

  const plan = generateWellnessPlan(input.assessment, {
    userId: input.userId,
    catalogSlug: slug,
    title: catalog?.title,
    durationDays: catalog?.suggestedDurationDays,
    outline: catalog?.activityOutline,
  });

  upsertEnrollment(plan);
  await syncPlanToBackend(plan);
  // Also sync any plans paused for this slug so admin sees accurate statuses
  for (const enrollment of listEnrollments()) {
    if (enrollment.id !== plan.id) {
      await syncPlanToBackend(enrollment);
    }
  }
  return plan;
}

export async function activateEnrollment(
  enrollmentId: string
): Promise<WellnessPlan | null> {
  const next = setActiveEnrollment(enrollmentId);
  if (next) await syncPlanToBackend(next);
  return next;
}

export async function updateWellnessPlan(
  plan: WellnessPlan
): Promise<WellnessPlan> {
  const next = evaluateAchievements(plan);
  saveWellnessPlan(next);
  await syncPlanToBackend(next);
  return next;
}

export async function completeWellnessTask(
  taskId: string,
  extras?: { journalEntry?: string; notes?: string }
): Promise<WellnessPlan | null> {
  const plan = loadWellnessPlan();
  if (!plan) return null;
  let next = completeTaskInPlan(plan, taskId, extras);
  next = evaluateAchievements(next);
  saveWellnessPlan(next);
  await syncPlanToBackend(next);
  return next;
}

export async function deleteWellnessPlan(): Promise<void> {
  const plan = loadWellnessPlan();
  clearWellnessPlan();
  if (!plan) return;
  const headers = authHeaders();
  if (!headers) return;
  try {
    await fetch(`/api/wellness-plan/${plan.id}`, {
      method: "DELETE",
      headers,
    });
  } catch {
    /* ignore */
  }
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
  await syncPlanToBackend(next);
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

function isValidPendingSuggestion(value: unknown): value is {
  reason: string;
  emotion: string;
  action: "create" | "adapt" | "review";
  message: string;
} {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.message === "string" &&
    v.message.length > 0 &&
    v.message.length <= 500 &&
    typeof v.emotion === "string" &&
    v.emotion.length <= 64 &&
    (v.action === "create" || v.action === "adapt" || v.action === "review")
  );
}

export function getPendingChatSuggestion() {
  try {
    const fromPlan = loadWellnessPlan()?.pendingSuggestion;
    if (isValidPendingSuggestion(fromPlan)) return fromPlan;
    const raw = localStorage.getItem("aurapulse_wellness_suggestion");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isValidPendingSuggestion(parsed) ? parsed : null;
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
