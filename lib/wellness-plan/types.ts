/** Wellness Plan domain types — structured for future backend sync. */

export type PrimaryGoal =
  | "reduce_anxiety"
  | "reduce_stress"
  | "improve_sleep"
  | "build_confidence"
  | "increase_focus"
  | "improve_mood"
  | "reduce_overthinking"
  | "mindfulness"
  | "custom";

export type SleepQuality = "poor" | "average" | "good" | "excellent";

export type DailyTime =
  | "5_minutes"
  | "10_minutes"
  | "15_minutes"
  | "30_minutes"
  | "60_minutes";

export type PreferredActivity =
  | "meditation"
  | "breathing"
  | "journaling"
  | "walking"
  | "ai_conversations"
  | "gratitude"
  | "mindfulness"
  | "reading";

export type PreferredTime = "morning" | "afternoon" | "evening" | "flexible";

export type TaskType =
  | "mood_checkin"
  | "ai_conversation"
  | "journal"
  | "gratitude"
  | "breathing"
  | "mindfulness"
  | "walk"
  | "reading"
  | "meditation";

export type ChallengeLevel = "light" | "standard" | "elevated";

export interface WellnessAssessment {
  primaryGoal: PrimaryGoal;
  customGoal?: string;
  stressLevel: number; // 1-10
  sleepQuality: SleepQuality;
  dailyTime: DailyTime;
  activities: PreferredActivity[];
  preferredTime: PreferredTime;
  completedAt: string;
}

export interface PlanTask {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  estimatedMinutes: number;
  completed: boolean;
  completedAt?: string;
  journalEntry?: string;
  notes?: string;
}

export interface PlanDay {
  id: string;
  dayNumber: number;
  date: string; // ISO date YYYY-MM-DD
  theme: string;
  tasks: PlanTask[];
  completed: boolean;
}

export interface PlanWeek {
  id: string;
  weekNumber: number;
  title: string;
  focus: string;
  days: PlanDay[];
}

export interface ProgressRecord {
  date: string;
  tasksCompleted: number;
  tasksTotal: number;
  moodScore?: number;
  engagement: "low" | "medium" | "high";
}

export interface WeeklyReport {
  id: string;
  weekNumber: number;
  generatedAt: string;
  moodTrend: "improving" | "stable" | "declining" | "unknown";
  stressTrend: "improving" | "stable" | "elevated" | "unknown";
  sleepTrend: "improving" | "stable" | "declining" | "unknown";
  completionRate: number;
  mostHelpfulActivity: string;
  currentStreak: number;
  aiSummary: string;
  insights: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt?: string;
  icon: string;
}

export interface WellnessPlanSuggestion {
  reason: string;
  emotion: string;
  action: "create" | "adapt" | "review";
  message: string;
}

export interface WellnessPlan {
  id: string;
  userId?: string;
  /** Catalog slug when started from the 18-plan explorer */
  catalogSlug?: string;
  title: string;
  primaryGoal: PrimaryGoal;
  assessment: WellnessAssessment;
  durationDays: number;
  weeks: PlanWeek[];
  challengeLevel: ChallengeLevel;
  currentStreak: number;
  longestStreak: number;
  createdAt: string;
  updatedAt: string;
  status: "active" | "completed" | "paused";
  progressRecords: ProgressRecord[];
  weeklyReports: WeeklyReport[];
  achievements: Achievement[];
  adaptationNotes: string[];
  lastAdaptationAt?: string;
  pendingSuggestion?: WellnessPlanSuggestion | null;
}

/** Legacy single-plan storage (v1) */
export interface WellnessPlanState {
  plan: WellnessPlan | null;
  version: number;
}

/** Multi-enrollment storage (v2) */
export interface WellnessEnrollmentStore {
  version: 2;
  enrollments: WellnessPlan[];
  activeEnrollmentId: string | null;
}

export const GOAL_LABELS: Record<PrimaryGoal, string> = {
  reduce_anxiety: "Reduce Anxiety",
  reduce_stress: "Reduce Stress",
  improve_sleep: "Improve Sleep",
  build_confidence: "Build Confidence",
  increase_focus: "Increase Focus",
  improve_mood: "Improve Mood",
  reduce_overthinking: "Reduce Overthinking",
  mindfulness: "Mindfulness",
  custom: "Custom Goal",
};

export const ACTIVITY_LABELS: Record<PreferredActivity, string> = {
  meditation: "Meditation",
  breathing: "Breathing Exercises",
  journaling: "Journaling",
  walking: "Walking",
  ai_conversations: "AI Conversations",
  gratitude: "Gratitude Practice",
  mindfulness: "Mindfulness Sessions",
  reading: "Reading",
};

export const TIME_LABELS: Record<DailyTime, string> = {
  "5_minutes": "5 Minutes",
  "10_minutes": "10 Minutes",
  "15_minutes": "15 Minutes",
  "30_minutes": "30 Minutes",
  "60_minutes": "60 Minutes",
};

export const SLEEP_LABELS: Record<SleepQuality, string> = {
  poor: "Poor",
  average: "Average",
  good: "Good",
  excellent: "Excellent",
};

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  mood_checkin: "Mood Check-In",
  ai_conversation: "AI Conversation",
  journal: "Journal Entry",
  gratitude: "Gratitude Exercise",
  breathing: "Breathing Exercise",
  mindfulness: "Mindfulness Session",
  walk: "Walk",
  reading: "Reading",
  meditation: "Meditation",
};
