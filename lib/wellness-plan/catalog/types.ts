import type { LucideIcon } from "lucide-react";
import type { DailyTime, PreferredActivity, PrimaryGoal, TaskType } from "../types";

export type PlanCategory =
  | "Anxiety"
  | "Mood"
  | "Sleep"
  | "Stress"
  | "Confidence"
  | "Relationships"
  | "Focus"
  | "Personal Growth"
  | "Emotional Wellbeing"
  | "Immediate Support";

export type PlanAccent =
  | "blush"
  | "lavender"
  | "blue"
  | "mint"
  | "peach"
  | "orchid";

export interface CatalogActivityOutline {
  title: string;
  type: TaskType;
  description?: string;
}

export interface CatalogPlan {
  slug: string;
  title: string;
  category: PlanCategory;
  tags: PlanCategory[];
  shortDescription: string;
  introduction: string;
  goals: string[];
  whoItsFor: string;
  suggestedDurationDays: number;
  estimatedMinutesPerDay: string;
  accent: PlanAccent;
  /** lucide icon name key resolved in UI */
  icon: string;
  keywords: string[];
  primaryGoal: PrimaryGoal;
  defaultActivities: PreferredActivity[];
  defaultDailyTime: DailyTime;
  activityOutline: CatalogActivityOutline[];
  safetyNotes?: string;
  format?: "standard" | "immediate" | "flexible";
}

export type CatalogIconMap = Record<string, LucideIcon>;

export const ACCENT_CLASSES: Record<
  PlanAccent,
  { bg: string; icon: string; soft: string }
> = {
  blush: {
    bg: "bg-[#FFF0F6]",
    icon: "text-[#BE4A8B]",
    soft: "bg-[#FFF0F6]",
  },
  lavender: {
    bg: "bg-[#F2ECFF]",
    icon: "text-[#8B6BC7]",
    soft: "bg-[#F2ECFF]",
  },
  blue: {
    bg: "bg-[#EDF2FF]",
    icon: "text-[#5B7CDA]",
    soft: "bg-[#EDF2FF]",
  },
  mint: {
    bg: "bg-[#EAF6F2]",
    icon: "text-[#3D9B84]",
    soft: "bg-[#EAF6F2]",
  },
  peach: {
    bg: "bg-[#FFF1E9]",
    icon: "text-[#D4845A]",
    soft: "bg-[#FFF1E9]",
  },
  orchid: {
    bg: "bg-[#F8E8F4]",
    icon: "text-[#B74783]",
    soft: "bg-[#F8E8F4]",
  },
};
