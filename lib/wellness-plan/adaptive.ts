import {
  ChallengeLevel,
  PlanTask,
  TaskType,
  WellnessPlan,
} from "./types";
import { computePlanProgress, getCurrentDay } from "./generate-plan";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(iso: string, n: number) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Count consecutive missed days ending yesterday (or today if nothing done). */
export function countMissedDays(plan: WellnessPlan): number {
  const today = todayISO();
  let missed = 0;
  for (let i = 0; i < 7; i++) {
    const date = addDays(today, -i);
    const day = plan.weeks
      .flatMap((w) => w.days)
      .find((d) => d.date === date);
    if (!day) continue;
    const anyDone = day.tasks.some((t) => t.completed);
    if (anyDone) break;
    // Don't count future or day 0 before plan start
    if (date < (plan.weeks[0]?.days[0]?.date || today)) break;
    if (i === 0 && date === today) continue; // today still in progress
    missed += 1;
  }
  return missed;
}

export function countCompletionStreakDays(plan: WellnessPlan): number {
  const today = todayISO();
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const date = addDays(today, -i);
    const day = plan.weeks
      .flatMap((w) => w.days)
      .find((d) => d.date === date);
    if (!day) {
      if (i === 0) continue;
      break;
    }
    const allOrSome =
      day.tasks.length > 0 &&
      day.tasks.filter((t) => t.completed).length >=
        Math.ceil(day.tasks.length / 2);
    if (!allOrSome) {
      if (i === 0) continue;
      break;
    }
    streak += 1;
  }
  return streak;
}

function shrinkTask(task: PlanTask): PlanTask {
  const lightMinutes = Math.max(2, Math.round(task.estimatedMinutes * 0.4));
  return {
    ...task,
    estimatedMinutes: lightMinutes,
    description:
      task.estimatedMinutes > lightMinutes
        ? `${task.description} (shortened for easier momentum)`
        : task.description,
  };
}

function expandTask(task: PlanTask): PlanTask {
  const elev = Math.min(20, Math.round(task.estimatedMinutes * 1.35) + 1);
  return {
    ...task,
    estimatedMinutes: elev,
    description:
      elev > task.estimatedMinutes
        ? `${task.description} (gently elevated challenge)`
        : task.description,
  };
}

/**
 * Adaptive engine: adjusts future (incomplete) tasks based on engagement.
 * - Miss 4+ days → lighten remaining tasks
 * - Strong streak (7+) at standard → elevate remaining
 */
export function adaptPlanIfNeeded(plan: WellnessPlan): WellnessPlan {
  const missed = countMissedDays(plan);
  const streak = countCompletionStreakDays(plan);
  const now = new Date().toISOString();
  let challengeLevel: ChallengeLevel = plan.challengeLevel;
  const notes = [...plan.adaptationNotes];
  let changed = false;

  const mapFutureTasks = (
    mapper: (t: PlanTask) => PlanTask
  ): WellnessPlan["weeks"] =>
    plan.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) => {
        if (day.date < todayISO()) return day;
        return {
          ...day,
          tasks: day.tasks.map((t) => (t.completed ? t : mapper(t))),
        };
      }),
    }));

  if (missed >= 4 && challengeLevel !== "light") {
    challengeLevel = "light";
    notes.push(
      `${todayISO()}: Low engagement detected (${missed} quiet days). Shortened remaining sessions to rebuild momentum.`
    );
    changed = true;
    return {
      ...plan,
      weeks: mapFutureTasks(shrinkTask),
      challengeLevel,
      adaptationNotes: notes,
      lastAdaptationAt: now,
      updatedAt: now,
    };
  }

  if (streak >= 7 && challengeLevel === "standard") {
    challengeLevel = "elevated";
    notes.push(
      `${todayISO()}: Strong consistency (${streak}-day streak). Gently increased challenge on upcoming tasks.`
    );
    changed = true;
    return {
      ...plan,
      weeks: mapFutureTasks(expandTask),
      challengeLevel,
      adaptationNotes: notes,
      lastAdaptationAt: now,
      updatedAt: now,
    };
  }

  if (streak >= 5 && challengeLevel === "light") {
    challengeLevel = "standard";
    notes.push(
      `${todayISO()}: Momentum restored. Returning tasks to standard duration.`
    );
    changed = true;
    return {
      ...plan,
      challengeLevel,
      adaptationNotes: notes,
      lastAdaptationAt: now,
      updatedAt: now,
    };
  }

  // Refresh streak metrics even when no adaptation
  const currentStreak = streak;
  const longestStreak = Math.max(plan.longestStreak, currentStreak);
  if (
    currentStreak !== plan.currentStreak ||
    longestStreak !== plan.longestStreak
  ) {
    return {
      ...plan,
      currentStreak,
      longestStreak,
      updatedAt: now,
    };
  }

  return changed ? { ...plan, updatedAt: now } : plan;
}

/** Suggest plan adaptation based on chat emotion signals. */
export function suggestionFromEmotion(
  emotion: string,
  intensity: number,
  hasPlan: boolean
): {
  reason: string;
  emotion: string;
  action: "create" | "adapt" | "review";
  message: string;
} | null {
  const safeEmotion = String(emotion || "").slice(0, 64);
  const e = safeEmotion.toLowerCase();
  const safeIntensity =
    typeof intensity === "number" && Number.isFinite(intensity)
      ? Math.min(1, Math.max(0, intensity))
      : 0;
  const stressful =
    e.includes("stress") ||
    e.includes("anxiety") ||
    e.includes("panic") ||
    e === "low" ||
    e.includes("overwhelm");

  if (!stressful && safeIntensity < 0.6) return null;

  if (!hasPlan) {
    return {
      reason: "elevated_distress",
      emotion: safeEmotion,
      action: "create",
      message:
        "We noticed elevated stress signals. Creating a personalized wellness plan can help you rebuild calm with small daily steps.",
    };
  }

  return {
    reason: "elevated_distress",
    emotion: safeEmotion,
    action: "adapt",
    message:
      "We recommend updating your wellness plan based on what came up in this conversation.",
  };
}

export function markDayCompletionFlags(plan: WellnessPlan): WellnessPlan {
  return {
    ...plan,
    weeks: plan.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) => ({
        ...day,
        completed:
          day.tasks.length > 0 && day.tasks.every((t) => t.completed),
      })),
    })),
  };
}

function refreshTodayProgress(plan: WellnessPlan): WellnessPlan {
  const today = getCurrentDay(plan);
  if (!today) return plan;
  const done = today.tasks.filter((t) => t.completed).length;
  const records = plan.progressRecords.filter((r) => r.date !== today.date);
  records.push({
    date: today.date,
    tasksCompleted: done,
    tasksTotal: today.tasks.length,
    engagement:
      done === 0 ? "low" : done / today.tasks.length >= 0.7 ? "high" : "medium",
  });
  return { ...plan, progressRecords: records };
}

export function completeTaskInPlan(
  plan: WellnessPlan,
  taskId: string,
  extras?: { journalEntry?: string; notes?: string }
): WellnessPlan {
  const now = new Date().toISOString();
  let found = false;
  let alreadyComplete = false;

  let updated: WellnessPlan = {
    ...plan,
    weeks: plan.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) => ({
        ...day,
        tasks: day.tasks.map((task) => {
          if (task.id !== taskId) return task;
          found = true;
          if (task.completed) {
            alreadyComplete = true;
            // Idempotent: keep original completedAt; allow note merge only
            return {
              ...task,
              journalEntry: extras?.journalEntry ?? task.journalEntry,
              notes: extras?.notes ?? task.notes,
            };
          }
          return {
            ...task,
            completed: true,
            completedAt: now,
            journalEntry: extras?.journalEntry ?? task.journalEntry,
            notes: extras?.notes ?? task.notes,
          };
        }),
      })),
    })),
    updatedAt: alreadyComplete ? plan.updatedAt : now,
  };

  if (!found) return plan;

  updated = markDayCompletionFlags(updated);
  updated = adaptPlanIfNeeded(updated);
  updated = refreshTodayProgress(updated);

  // Auto-complete plan if all done
  const { percent } = computePlanProgress(updated);
  if (percent >= 100) {
    updated = { ...updated, status: "completed" };
  }

  return updated;
}

/** Clear a task completion (same plan model — no new storage). */
export function uncompleteTaskInPlan(
  plan: WellnessPlan,
  taskId: string
): WellnessPlan {
  let found = false;

  let updated: WellnessPlan = {
    ...plan,
    weeks: plan.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) => ({
        ...day,
        tasks: day.tasks.map((task) => {
          if (task.id !== taskId) return task;
          found = true;
          if (!task.completed) return task;
          return {
            ...task,
            completed: false,
            completedAt: undefined,
          };
        }),
      })),
    })),
    updatedAt: new Date().toISOString(),
    status: plan.status === "completed" ? "active" : plan.status,
  };

  if (!found) return plan;

  updated = markDayCompletionFlags(updated);
  updated = refreshTodayProgress(updated);
  return updated;
}

/** Tasks that need a guided flow instead of a plain checkbox. */
export function taskRequiresGuidedFlow(type: TaskType): boolean {
  return type !== "walk" && type !== "reading";
}

export function mostHelpfulTaskType(plan: WellnessPlan): string {
  const counts: Partial<Record<TaskType, number>> = {};
  for (const week of plan.weeks) {
    for (const day of week.days) {
      for (const task of day.tasks) {
        if (task.completed) {
          counts[task.type] = (counts[task.type] || 0) + 1;
        }
      }
    }
  }
  const entries = Object.entries(counts) as [TaskType, number][];
  if (!entries.length) return "Mood Check-In";
  entries.sort((a, b) => b[1] - a[1]);
  const labels: Record<string, string> = {
    mood_checkin: "Mood Check-In",
    ai_conversation: "AI Conversations",
    journal: "Journaling",
    gratitude: "Gratitude Practice",
    breathing: "Breathing Exercises",
    mindfulness: "Mindfulness",
    walk: "Walking",
    reading: "Reading",
    meditation: "Meditation",
  };
  return labels[entries[0][0]] || entries[0][0];
}
