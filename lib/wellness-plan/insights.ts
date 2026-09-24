import { WellnessPlan } from "./types";
import { mostHelpfulTaskType } from "./adaptive";
import { computePlanProgress } from "./generate-plan";

export interface WellnessInsight {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
}

export function generateWellnessInsights(plan: WellnessPlan): WellnessInsight[] {
  const insights: WellnessInsight[] = [];
  const { percent, completedTasks } = computePlanProgress(plan);
  const helpful = mostHelpfulTaskType(plan);
  const preferred = plan.assessment.preferredTime;

  if (completedTasks >= 3) {
    insights.push({
      title: "Activity resonance",
      description: `You complete more ${helpful.toLowerCase()} tasks than other types — keep prioritizing what works.`,
      priority: "high",
    });
  }

  if (preferred === "evening") {
    insights.push({
      title: "Evening rhythm",
      description:
        "You complete more tasks in the evening. Protect a short wind-down window after dinner.",
      priority: "medium",
    });
  } else if (preferred === "morning") {
    insights.push({
      title: "Morning momentum",
      description:
        "Morning practice fits you best. Anchoring one mission before screens can lift your whole day.",
      priority: "medium",
    });
  }

  if (plan.assessment.stressLevel >= 7) {
    insights.push({
      title: "Stress awareness",
      description:
        "Your baseline stress was elevated at assessment. Short breathing missions may reduce Monday spikes.",
      priority: "high",
    });
  }

  if (percent >= 50) {
    insights.push({
      title: "Halfway presence",
      description:
        "You're past the midpoint of your plan. Consistency now matters more than intensity.",
      priority: "medium",
    });
  }

  if (plan.challengeLevel === "light") {
    insights.push({
      title: "Gentle mode active",
      description:
        "Soul Discovery shortened sessions to help you rebuild momentum without overwhelm.",
      priority: "low",
    });
  }

  if (plan.adaptationNotes.length) {
    insights.push({
      title: "Adaptive coaching",
      description: plan.adaptationNotes[plan.adaptationNotes.length - 1],
      priority: "medium",
    });
  }

  if (!insights.length) {
    insights.push({
      title: "Your journey begins",
      description:
        "Complete a few daily missions and Soul Discovery will surface patterns about mood, timing, and what helps most.",
      priority: "low",
    });
  }

  return insights.slice(0, 4);
}
