import {
  WellnessEnrollmentStore,
  WellnessPlan,
  WellnessPlanState,
} from "./types";
import { adaptPlanIfNeeded } from "./adaptive";
import { ensureWeeklyReport, evaluateAchievements } from "./achievements";

const STORAGE_KEY_V1 = "aurapulse_wellness_plan_v1";
const STORAGE_KEY_V2 = "aurapulse_wellness_plans_v2";
const ACTIVE_USER_KEY = "aurapulse_wellness_active_user";

function emptyStore(): WellnessEnrollmentStore {
  return { version: 2, enrollments: [], activeEnrollmentId: null };
}

function currentUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACTIVE_USER_KEY);
  } catch {
    return null;
  }
}

function keyV2(): string {
  const uid = currentUserId();
  return uid ? `${STORAGE_KEY_V2}:${uid}` : STORAGE_KEY_V2;
}

function keyV1(): string {
  const uid = currentUserId();
  return uid ? `${STORAGE_KEY_V1}:${uid}` : STORAGE_KEY_V1;
}

/**
 * Bind wellness localStorage to the signed-in user so account switches
 * do not show another user's enrollments. Preserves existing Reduce Anxiety
 * progress by migrating the unscoped v2 blob into the user key once.
 */
export function setWellnessStorageUserId(userId: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!userId) {
      localStorage.removeItem(ACTIVE_USER_KEY);
      return;
    }
    const prev = localStorage.getItem(ACTIVE_USER_KEY);
    localStorage.setItem(ACTIVE_USER_KEY, userId);
    if (prev === userId) return;

    const scopedKey = `${STORAGE_KEY_V2}:${userId}`;
    const scoped = localStorage.getItem(scopedKey);
    if (scoped) return;

    // First login on this browser after multi-user support: claim unscoped store
    const unscoped = localStorage.getItem(STORAGE_KEY_V2);
    if (unscoped) {
      localStorage.setItem(scopedKey, unscoped);
      const unscopedV1 = localStorage.getItem(STORAGE_KEY_V1);
      if (unscopedV1) {
        localStorage.setItem(`${STORAGE_KEY_V1}:${userId}`, unscopedV1);
      }
    }
  } catch {
    /* quota / private mode */
  }
}

function refreshPlan(plan: WellnessPlan): WellnessPlan {
  let next = adaptPlanIfNeeded(plan);
  next = evaluateAchievements(next);
  next = ensureWeeklyReport(next);
  return next;
}

function migrateV1IfNeeded(): WellnessEnrollmentStore | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      localStorage.getItem(keyV1()) ||
      (!currentUserId() ? localStorage.getItem(STORAGE_KEY_V1) : null);
    if (!raw) return null;
    const state = JSON.parse(raw) as WellnessPlanState;
    if (!state?.plan) return null;

    const plan = refreshPlan(state.plan);
    // Infer catalog slug for reduce anxiety legacy plans
    if (!plan.catalogSlug && plan.primaryGoal === "reduce_anxiety") {
      plan.catalogSlug = "reduce-anxiety";
    }

    const store: WellnessEnrollmentStore = {
      version: 2,
      enrollments: [plan],
      activeEnrollmentId: plan.status === "paused" ? null : plan.id,
    };
    localStorage.setItem(keyV2(), JSON.stringify(store));
    // Keep v1 as backup; do not delete so older code paths still recoverable
    return store;
  } catch {
    return null;
  }
}

/**
 * If v2 exists but is missing Reduce Anxiety while v1 still has it,
 * merge the legacy plan in so progress is not orphaned.
 */
function mergeOrphanedV1ReduceAnxiety(
  store: WellnessEnrollmentStore
): WellnessEnrollmentStore {
  if (typeof window === "undefined") return store;
  const hasReduce = store.enrollments.some(
    (p) =>
      p.catalogSlug === "reduce-anxiety" || p.primaryGoal === "reduce_anxiety"
  );
  if (hasReduce) return store;
  try {
    const raw =
      localStorage.getItem(keyV1()) ||
      localStorage.getItem(STORAGE_KEY_V1);
    if (!raw) return store;
    const state = JSON.parse(raw) as WellnessPlanState;
    if (!state?.plan) return store;
    const plan = refreshPlan(state.plan);
    if (
      plan.catalogSlug !== "reduce-anxiety" &&
      plan.primaryGoal !== "reduce_anxiety"
    ) {
      return store;
    }
    if (!plan.catalogSlug) plan.catalogSlug = "reduce-anxiety";
    const next: WellnessEnrollmentStore = {
      ...store,
      enrollments: [...store.enrollments, plan],
      activeEnrollmentId:
        store.activeEnrollmentId ||
        (plan.status === "active" ? plan.id : store.activeEnrollmentId),
    };
    saveEnrollmentStore(next);
    return next;
  } catch {
    return store;
  }
}

export function loadEnrollmentStore(): WellnessEnrollmentStore {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = localStorage.getItem(keyV2());
    if (raw) {
      const store = JSON.parse(raw) as WellnessEnrollmentStore;
      if (store?.version === 2 && Array.isArray(store.enrollments)) {
        let dirty = false;
        const enrollments = store.enrollments.map((p) => {
          const next = refreshPlan(p);
          if (next !== p) dirty = true;
          return next;
        });
        let nextStore = { ...store, enrollments };
        const merged = mergeOrphanedV1ReduceAnxiety(nextStore);
        if (merged !== nextStore) {
          dirty = true;
          nextStore = merged;
        }
        if (dirty) saveEnrollmentStore(nextStore);
        return nextStore;
      }
    }
    const migrated = migrateV1IfNeeded();
    if (migrated) return migrated;
    return emptyStore();
  } catch {
    return emptyStore();
  }
}

export function saveEnrollmentStore(store: WellnessEnrollmentStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(keyV2(), JSON.stringify(store));
  // Mirror active plan to v1 for any legacy readers
  const active =
    store.enrollments.find((p) => p.id === store.activeEnrollmentId) || null;
  const legacy: WellnessPlanState = { plan: active, version: 1 };
  localStorage.setItem(keyV1(), JSON.stringify(legacy));
}

/** Active enrollment (compat with previous single-plan API) */
export function loadWellnessPlan(): WellnessPlan | null {
  const store = loadEnrollmentStore();
  if (!store.activeEnrollmentId) {
    // Prefer first active/non-paused enrollment
    const active = store.enrollments.find((p) => p.status === "active");
    return active || null;
  }
  return (
    store.enrollments.find((p) => p.id === store.activeEnrollmentId) || null
  );
}

export function saveWellnessPlan(plan: WellnessPlan | null): void {
  const store = loadEnrollmentStore();
  if (!plan) {
    if (store.activeEnrollmentId) {
      store.enrollments = store.enrollments.filter(
        (p) => p.id !== store.activeEnrollmentId
      );
      store.activeEnrollmentId =
        store.enrollments.find((p) => p.status === "active")?.id || null;
    }
    saveEnrollmentStore(store);
    return;
  }

  const idx = store.enrollments.findIndex((p) => p.id === plan.id);
  if (idx >= 0) {
    store.enrollments[idx] = plan;
  } else {
    store.enrollments.push(plan);
  }
  if (plan.status === "active") {
    store.activeEnrollmentId = plan.id;
  }
  saveEnrollmentStore(store);
}

export function clearWellnessPlan(): void {
  const store = loadEnrollmentStore();
  if (store.activeEnrollmentId) {
    store.enrollments = store.enrollments.filter(
      (p) => p.id !== store.activeEnrollmentId
    );
  }
  store.activeEnrollmentId =
    store.enrollments.find((p) => p.status === "active")?.id || null;
  saveEnrollmentStore(store);
}

export function listEnrollments(): WellnessPlan[] {
  return loadEnrollmentStore().enrollments;
}

export function getEnrollmentById(id: string): WellnessPlan | null {
  return loadEnrollmentStore().enrollments.find((p) => p.id === id) || null;
}

function matchesCatalogSlug(plan: WellnessPlan, slug: string): boolean {
  if (plan.catalogSlug === slug) return true;
  // Legacy reduce anxiety without slug
  return (
    slug === "reduce-anxiety" &&
    !plan.catalogSlug &&
    plan.primaryGoal === "reduce_anxiety"
  );
}

export function getEnrollmentBySlug(slug: string): WellnessPlan | null {
  const store = loadEnrollmentStore();
  const matches = store.enrollments.filter((p) => matchesCatalogSlug(p, slug));
  if (!matches.length) return null;
  const active = matches.find((p) => p.status === "active");
  if (active) return active;
  const paused = matches.find((p) => p.status === "paused");
  if (paused) return paused;
  return [...matches].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];
}

/** Pause other active enrollments for the same catalog slug (Start Again safety). */
export function pauseActiveEnrollmentsForSlug(
  slug: string,
  exceptId?: string
): void {
  const store = loadEnrollmentStore();
  const now = new Date().toISOString();
  let dirty = false;
  store.enrollments = store.enrollments.map((p) => {
    if (
      matchesCatalogSlug(p, slug) &&
      p.status === "active" &&
      p.id !== exceptId
    ) {
      dirty = true;
      return { ...p, status: "paused" as const, updatedAt: now };
    }
    return p;
  });
  if (dirty) saveEnrollmentStore(store);
}

export function setActiveEnrollment(id: string): WellnessPlan | null {
  const store = loadEnrollmentStore();
  const plan = store.enrollments.find((p) => p.id === id);
  if (!plan) return null;
  store.activeEnrollmentId = id;
  if (plan.status === "paused") {
    const idx = store.enrollments.findIndex((p) => p.id === id);
    store.enrollments[idx] = {
      ...plan,
      status: "active",
      updatedAt: new Date().toISOString(),
    };
  }
  saveEnrollmentStore(store);
  return store.enrollments.find((p) => p.id === id) || null;
}

export function upsertEnrollment(plan: WellnessPlan): WellnessPlan {
  saveWellnessPlan(plan);
  return plan;
}
