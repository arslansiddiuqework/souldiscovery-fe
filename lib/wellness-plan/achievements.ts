import { Achievement, WellnessPlan, WeeklyReport } from "./types";
import {
  computePlanProgress,
  getCurrentWeek,
} from "./generate-plan";
import {
  countCompletionStreakDays,
  mostHelpfulTaskType,
} from "./adaptive";

function unlock(list: Achievement[], id: string): Achievement[] {
  return list.map((a) =>
    a.id === id && !a.unlockedAt
      ? { ...a, unlockedAt: new Date().toISOString() }
      : a
  );
}

export function evaluateAchievements(plan: WellnessPlan): WellnessPlan {
  let achievements = [...plan.achievements];
  const streak = countCompletionStreakDays(plan);

  const hasMood = plan.weeks.some((w) =>
    w.days.some((d) =>
      d.tasks.some((t) => t.type === "mood_checkin" && t.completed)
    )
  );
  const hasJournal = plan.weeks.some((w) =>
    w.days.some((d) =>
      d.tasks.some(
        (t) =>
          (t.type === "journal" || t.type === "gratitude") && t.completed
      )
    )
  );

  if (hasMood) achievements = unlock(achievements, "first_checkin");
  if (hasJournal) achievements = unlock(achievements, "first_journal");
  if (streak >= 3) achievements = unlock(achievements, "streak_3");
  if (streak >= 7) achievements = unlock(achievements, "streak_7");
  if (streak >= 14) achievements = unlock(achievements, "streak_14");

  const week1 = plan.weeks.find((w) => w.weekNumber === 1);
  if (week1 && week1.days.every((d) => d.completed)) {
    achievements = unlock(achievements, "week_1");
  }

  const { percent } = computePlanProgress(plan);
  if (percent >= 100 || plan.status === "completed") {
    achievements = unlock(achievements, "plan_complete");
  }

  const achievementsChanged = achievements.some(
    (item, index) => item.unlockedAt !== plan.achievements[index]?.unlockedAt
  );
  if (!achievementsChanged && streak === plan.currentStreak) {
    return plan;
  }

  return { ...plan, achievements, currentStreak: streak };
}

export function generateWeeklyReport(plan: WellnessPlan): WeeklyReport {
  const week = getCurrentWeek(plan);
  const weekNumber = week?.weekNumber || 1;
  const days = week?.days || [];
  const tasks = days.flatMap((d) => d.tasks);
  const completed = tasks.filter((t) => t.completed).length;
  const completionRate =
    tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);
  const streak = countCompletionStreakDays(plan);
  const helpful = mostHelpfulTaskType(plan);

  // Completion is not a mood, stress, or sleep measurement.
  const moodTrend = "unknown" as const;
  const stressTrend = "unknown" as const;
  const sleepTrend = "unknown" as const;

  const insights: string[] = [];
  if (completionRate >= 70) {
    insights.push("You completed most of this week's plan activities.");
  } else if (completionRate < 40 && tasks.length > 0) {
    insights.push("A few plan activities are still open. You can return to them whenever you want.");
  }
  if (plan.assessment.preferredTime === "evening") {
    insights.push("You tend to prefer evening wellness — protect that window when possible.");
  }
  if (helpful) {
    insights.push(`${helpful} appears to be your most completed activity.`);
  }
  if (plan.adaptationNotes.length) {
    insights.push("Your plan adapted based on recent engagement patterns.");
  }

  const helpfulLine = helpful
    ? ` The activity you finished most often was ${helpful.toLowerCase()}.`
    : "";
  const aiSummary =
    tasks.length === 0
      ? `There isn't enough recorded activity yet for a summary of ${plan.title}.`
      : `This note only counts activities saved in ${plan.title}: ${completed} of ${tasks.length} (${completionRate}%).${helpfulLine} It is not a clinical assessment.`;

  return {
    id: `report_w${weekNumber}_${Date.now().toString(36)}`,
    weekNumber,
    generatedAt: new Date().toISOString(),
    moodTrend,
    stressTrend,
    sleepTrend,
    completionRate,
    mostHelpfulActivity: helpful,
    currentStreak: streak,
    aiSummary,
    insights,
  };
}

export function ensureWeeklyReport(plan: WellnessPlan): WellnessPlan {
  const week = getCurrentWeek(plan);
  if (!week) return plan;

  // Generate if week ended (all days past) or day 7 of week and no report yet
  const hasReport = plan.weeklyReports.some(
    (r) => r.weekNumber === week.weekNumber
  );
  if (hasReport) return plan;

  const lastDay = week.days[week.days.length - 1];
  const today = new Date().toISOString().slice(0, 10);
  if (!lastDay || lastDay.date > today) return plan;

  const report = generateWeeklyReport(plan);
  return {
    ...plan,
    weeklyReports: [...plan.weeklyReports, report],
    updatedAt: new Date().toISOString(),
  };
}
