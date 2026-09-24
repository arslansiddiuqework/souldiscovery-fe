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

  const stress = plan.assessment.stressLevel;
  const sleep = plan.assessment.sleepQuality;

  const moodTrend =
    completionRate >= 70
      ? "improving"
      : completionRate >= 40
        ? "stable"
        : "declining";

  const stressTrend =
    stress <= 4 ? "improving" : stress <= 7 ? "stable" : "elevated";

  const sleepTrend =
    sleep === "excellent" || sleep === "good"
      ? "improving"
      : sleep === "average"
        ? "stable"
        : "declining";

  const insights: string[] = [];
  if (completionRate >= 70) {
    insights.push("You completed most of this week's missions — consistency is compounding.");
  } else if (completionRate < 40) {
    insights.push("Engagement dipped this week. Shorter sessions may help you restart gently.");
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

  const aiSummary =
    completionRate >= 70
      ? `This week you stayed close to your ${plan.title.replace(
          " Plan",
          ""
        ).toLowerCase()} intention. Your completion rate of ${completionRate}% and a ${streak}-day streak show real commitment. Keep leaning into ${helpful.toLowerCase()} — it's clearly resonating.`
      : completionRate >= 40
        ? `You made meaningful progress on your ${plan.title} this week (${completionRate}% of tasks). A ${streak}-day streak is a solid foundation. Next week, prioritize the smallest doable mission first to rebuild momentum.`
        : `This was a quieter week on your ${plan.title} (${completionRate}% completion). That's okay — wellness isn't linear. We've kept your path available with lighter options so returning feels easy, not overwhelming.`;

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
