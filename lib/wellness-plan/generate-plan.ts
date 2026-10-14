import {
  Achievement,
  DailyTime,
  PlanDay,
  PlanTask,
  PlanWeek,
  PreferredActivity,
  PrimaryGoal,
  TaskType,
  WellnessAssessment,
  WellnessPlan,
  GOAL_LABELS,
} from "./types";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function minutesForDailyTime(t: DailyTime): number {
  const map: Record<DailyTime, number> = {
    "5_minutes": 5,
    "10_minutes": 10,
    "15_minutes": 15,
    "30_minutes": 30,
    "60_minutes": 60,
  };
  return map[t];
}

function activityToTaskType(a: PreferredActivity): TaskType {
  const map: Record<PreferredActivity, TaskType> = {
    meditation: "meditation",
    breathing: "breathing",
    journaling: "journal",
    walking: "walk",
    ai_conversations: "ai_conversation",
    gratitude: "gratitude",
    mindfulness: "mindfulness",
    reading: "reading",
  };
  return map[a];
}

function taskMeta(
  type: TaskType,
  goal: PrimaryGoal,
  minutes: number
): Pick<PlanTask, "title" | "description" | "estimatedMinutes"> {
  const goalHint = GOAL_LABELS[goal].toLowerCase();
  const catalog: Record<
    TaskType,
    { title: string; description: string; base: number }
  > = {
    mood_checkin: {
      title: "Mood Check-In",
      description: "Pause and rate how you feel right now.",
      base: 2,
    },
    ai_conversation: {
      title: "AI Reflection Session",
      description: `Talk with Soul Discovery about your ${goalHint} journey.`,
      base: 8,
    },
    journal: {
      title: "Journal Entry",
      description: "Write freely about thoughts, emotions, or patterns.",
      base: 8,
    },
    gratitude: {
      title: "Gratitude Practice",
      description: "Note three things you appreciate today.",
      base: 5,
    },
    breathing: {
      title: "Breathing Exercise",
      description: "A guided breathing session to settle your nervous system.",
      base: 5,
    },
    mindfulness: {
      title: "Mindfulness Session",
      description: "A short present-moment awareness practice.",
      base: 7,
    },
    walk: {
      title: "Mindful Walk",
      description: "A gentle walk focused on breath and surroundings.",
      base: 10,
    },
    reading: {
      title: "Calm Reading",
      description: "Read something nourishing — even a few pages counts.",
      base: 10,
    },
    meditation: {
      title: "Meditation",
      description: "Sit quietly and observe your breath without judgment.",
      base: 7,
    },
  };

  const item = catalog[type];
  const estimated = Math.max(2, Math.min(minutes, item.base));
  return {
    title: item.title,
    description: item.description,
    estimatedMinutes: estimated,
  };
}

function dayTheme(goal: PrimaryGoal, dayNumber: number): string {
  const themes: Record<PrimaryGoal, string[]> = {
    reduce_anxiety: [
      "Ground & Arrive",
      "Name the Worry",
      "Body Softening",
      "Thought Distancing",
      "Safe Space",
      "Gentle Exposure",
      "Integrate Calm",
    ],
    reduce_stress: [
      "Release Tension",
      "Protect Energy",
      "Reset Breath",
      "Boundary Practice",
      "Micro-Recovery",
      "Perspective Shift",
      "Restore Balance",
    ],
    improve_sleep: [
      "Wind-Down Ritual",
      "Quiet the Mind",
      "Body Scan Ease",
      "Evening Softness",
      "Sleep Hygiene",
      "Dream Prep",
      "Restful Close",
    ],
    build_confidence: [
      "Self-Witness",
      "Small Wins",
      "Kind Voice",
      "Courage Micro-Step",
      "Own Your Story",
      "Strength Inventory",
      "Stand Tall",
    ],
    increase_focus: [
      "Single Task",
      "Attention Anchor",
      "Distraction Audit",
      "Deep Work Spark",
      "Mental Clarity",
      "Flow Reset",
      "Focus Integration",
    ],
    improve_mood: [
      "Mood Lift Seed",
      "Lightness Practice",
      "Connection Moment",
      "Joy Spotting",
      "Energy Nudge",
      "Warmth Ritual",
      "Mood Momentum",
    ],
    reduce_overthinking: [
      "Thought Parking",
      "Present Anchor",
      "Decision Lightness",
      "Worry Window",
      "Body Over Brain",
      "Enough for Today",
      "Quiet Mind",
    ],
    mindfulness: [
      "Arrive Here",
      "Sense Awareness",
      "Breath as Home",
      "Open Attention",
      "Compassion Pause",
      "Stillness Practice",
      "Mindful Living",
    ],
    custom: [
      "Begin Intention",
      "Deepen Practice",
      "Notice Patterns",
      "Gentle Challenge",
      "Reflect & Adjust",
      "Strengthen Habit",
      "Integrate Growth",
    ],
  };
  const list = themes[goal];
  return list[(dayNumber - 1) % list.length];
}

function pickTasksForDay(
  assessment: WellnessAssessment,
  dayNumber: number,
  budget: number
): PlanTask[] {
  const preferred = assessment.activities.length
    ? assessment.activities
    : (["breathing", "gratitude", "ai_conversations"] as PreferredActivity[]);

  const types: TaskType[] = ["mood_checkin"];

  // Rotate preferred activities across days
  const primary = preferred[(dayNumber - 1) % preferred.length];
  types.push(activityToTaskType(primary));

  if (budget >= 10) {
    const secondary = preferred[dayNumber % preferred.length];
    const t = activityToTaskType(secondary);
    if (!types.includes(t)) types.push(t);
  }

  if (budget >= 20 && dayNumber % 2 === 0 && !types.includes("ai_conversation")) {
    types.push("ai_conversation");
  }

  if (budget >= 15 && dayNumber % 3 === 0 && !types.includes("gratitude")) {
    types.push("gratitude");
  }

  // Cap to fit budget
  const remaining = Math.max(3, budget);
  const perTask = Math.max(2, Math.floor(remaining / types.length));

  return types.map((type) => {
    const meta = taskMeta(type, assessment.primaryGoal, perTask);
    return {
      id: uid("task"),
      type,
      ...meta,
      completed: false,
    };
  });
}

function buildWeek(
  weekNumber: number,
  startDate: string,
  assessment: WellnessAssessment,
  budget: number
): PlanWeek {
  const focuses: Record<number, { title: string; focus: string }> = {
    1: {
      title: "Week 1 — Foundations",
      focus: "Build gentle daily habits and awareness.",
    },
    2: {
      title: "Week 2 — Deepening",
      focus: "Strengthen consistency and refine what helps most.",
    },
  };

  const meta = focuses[weekNumber] || {
    title: `Week ${weekNumber}`,
    focus: "Continue your personalized wellness path.",
  };

  const days: PlanDay[] = [];
  for (let i = 0; i < 7; i++) {
    const dayNumber = (weekNumber - 1) * 7 + i + 1;
    const date = addDays(startDate, dayNumber - 1);
    const tasks = pickTasksForDay(assessment, dayNumber, budget);
    days.push({
      id: uid("day"),
      dayNumber,
      date,
      theme: dayTheme(assessment.primaryGoal, dayNumber),
      tasks,
      completed: false,
    });
  }

  return {
    id: uid("week"),
    weekNumber,
    title: meta.title,
    focus: meta.focus,
    days,
  };
}

export function getDefaultAchievements(): Achievement[] {
  return [
    {
      id: "first_checkin",
      title: "First Check-In",
      description: "Completed your first mood check-in.",
      icon: "heart",
    },
    {
      id: "streak_3",
      title: "3 Day Streak",
      description: "Showed up three days in a row.",
      icon: "flame",
    },
    {
      id: "streak_7",
      title: "7 Day Streak",
      description: "A full week of consistency.",
      icon: "flame",
    },
    {
      id: "streak_14",
      title: "14 Day Streak",
      description: "Completed the full plan rhythm.",
      icon: "trophy",
    },
    {
      id: "first_journal",
      title: "First Journal",
      description: "Wrote your first wellness journal entry.",
      icon: "pen",
    },
    {
      id: "first_plan",
      title: "First Wellness Plan",
      description: "Created your personalized wellness plan.",
      icon: "sparkles",
    },
    {
      id: "week_1",
      title: "Completed Week 1",
      description: "Finished the foundation week.",
      icon: "check",
    },
    {
      id: "plan_complete",
      title: "Completed Wellness Plan",
      description: "Finished your full wellness journey.",
      icon: "star",
    },
  ];
}

export interface GeneratePlanOptions {
  userId?: string;
  catalogSlug?: string;
  title?: string;
  durationDays?: number;
  /** Prefer these activity titles when building early days */
  outlineTitles?: string[];
  /** Catalog outline with types — preferred over outlineTitles alone */
  outline?: { title: string; type: TaskType }[];
}

export function generateWellnessPlan(
  assessment: WellnessAssessment,
  userIdOrOptions?: string | GeneratePlanOptions
): WellnessPlan {
  const options: GeneratePlanOptions =
    typeof userIdOrOptions === "string" || userIdOrOptions === undefined
      ? { userId: userIdOrOptions }
      : userIdOrOptions;

  const start = todayISO();
  const budget = minutesForDailyTime(assessment.dailyTime);
  const goalLabel =
    assessment.primaryGoal === "custom" && assessment.customGoal
      ? assessment.customGoal
      : GOAL_LABELS[assessment.primaryGoal];

  const durationDays = options.durationDays ?? 14;
  const weekCount = Math.max(1, Math.ceil(durationDays / 7));
  const weeks = Array.from({ length: weekCount }, (_, i) =>
    buildWeek(i + 1, start, assessment, budget)
  );

  // Cap days to durationDays; map catalog outline onto the primary daily task
  const outlineItems =
    options.outline?.length
      ? options.outline
      : options.outlineTitles?.map((title) => ({
          title,
          type: "journal" as TaskType,
        }));

  let dayIndex = 0;
  for (const week of weeks) {
    week.days = week.days.filter((d) => d.dayNumber <= durationDays);
    for (const day of week.days) {
      if (outlineItems?.length) {
        const item = outlineItems[dayIndex % outlineItems.length];
        if (day.tasks[1] && item) {
          const meta = taskMeta(
            item.type,
            assessment.primaryGoal,
            day.tasks[1].estimatedMinutes
          );
          day.tasks[1] = {
            ...day.tasks[1],
            type: item.type,
            title: item.title,
            description: meta.description,
          };
        }
      }
      dayIndex += 1;
    }
  }

  const achievements = getDefaultAchievements().map((a) =>
    a.id === "first_plan"
      ? { ...a, unlockedAt: new Date().toISOString() }
      : a
  );

  const now = new Date().toISOString();
  const title = options.title || `${goalLabel} Plan`;

  return {
    id: uid("plan"),
    userId: options.userId,
    catalogSlug: options.catalogSlug,
    title,
    primaryGoal: assessment.primaryGoal,
    assessment,
    durationDays,
    weeks,
    challengeLevel:
      assessment.stressLevel >= 8 || assessment.dailyTime === "5_minutes"
        ? "light"
        : "standard",
    currentStreak: 0,
    longestStreak: 0,
    createdAt: now,
    updatedAt: now,
    status: "active",
    progressRecords: [],
    weeklyReports: [],
    achievements,
    adaptationNotes: [],
    pendingSuggestion: null,
  };
}

export function getPlanDayNumber(plan: WellnessPlan, date = todayISO()): number {
  const start = plan.weeks[0]?.days[0]?.date;
  if (!start) return 1;
  const startMs = new Date(start + "T12:00:00").getTime();
  const nowMs = new Date(date + "T12:00:00").getTime();
  const diff = Math.floor((nowMs - startMs) / (1000 * 60 * 60 * 24)) + 1;
  return Math.min(Math.max(diff, 1), plan.durationDays);
}

export function getCurrentDay(plan: WellnessPlan, date = todayISO()): PlanDay | null {
  const dayNumber = getPlanDayNumber(plan, date);
  for (const week of plan.weeks) {
    const day = week.days.find((d) => d.dayNumber === dayNumber);
    if (day) return day;
  }
  return null;
}

export function getCurrentWeek(plan: WellnessPlan, date = todayISO()): PlanWeek | null {
  const day = getCurrentDay(plan, date);
  if (!day) return plan.weeks[0] || null;
  return plan.weeks.find((w) => w.days.some((d) => d.id === day.id)) || null;
}

export function computePlanProgress(plan: WellnessPlan): {
  completedTasks: number;
  totalTasks: number;
  percent: number;
} {
  let completedTasks = 0;
  let totalTasks = 0;
  for (const week of plan.weeks) {
    for (const day of week.days) {
      for (const task of day.tasks) {
        totalTasks += 1;
        if (task.completed) completedTasks += 1;
      }
    }
  }
  const percent =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  return { completedTasks, totalTasks, percent };
}
