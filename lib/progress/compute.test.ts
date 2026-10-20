/**
 * Progress calculations. Run with:
 * node --experimental-strip-types lib/progress/compute.test.ts
 */
import {
  activeDayKeys,
  buildActivityBars,
  buildInsights,
  buildMoodSeries,
  buildTypeBreakdown,
  finishedActivities,
  groupAssessments,
  inPeriod,
  latestAssessmentSummary,
  localDateKey,
  parseMoodPayload,
  parsePlanPayload,
  periodBounds,
  previousBounds,
  scoresAreComparable,
  type ActivityRecord,
  type AssessmentRecord,
  type MoodRecord,
  type PlanTaskRecord,
} from "./compute";

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string, detail?: string) {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${name}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

const now = new Date(2026, 9, 20, 15, 30, 0); // local afternoon

function iso(date: Date): string {
  return date.toISOString();
}

function at(dayOffset: number, hour = 12, minute = 0): string {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, hour, minute, 0, 0);
  return iso(date);
}

console.log("\nProgress calculations\n");

const week = periodBounds(7, now);
assert(week.start != null, "7-day period has a start");
assert(localDateKey(week.start!) === "2026-10-14", "7-day period starts six days before today", localDateKey(week.start!) ?? "");
assert(localDateKey(week.end) === "2026-10-20", "today is included");
assert(inPeriod(at(0, 23, 30), week), "late today is inside the period");
assert(!inPeriod(at(-7, 12), week), "the day before the window is outside");

const previous = previousBounds(7, now);
assert(previous != null && localDateKey(previous.start!) === "2026-10-07", "previous 7 days start immediately before");
assert(previous != null && localDateKey(previous.end) === "2026-10-13", "previous period ends the day before this one");
assert(previousBounds("all", now) === null, "all time has no previous comparison window");

const moods: MoodRecord[] = [
  { id: "m1", score: 70, timestamp: at(-1, 9) },
  { id: "m1", score: 10, timestamp: at(-1, 10) },
  { id: "m2", score: 0, timestamp: at(-2, 9) },
  { id: "m3", score: 80, timestamp: at(-2, 18) },
  { id: "m4", score: 90, timestamp: at(0, 8) },
];

const dedupedMoods = moods.filter((mood, index) => moods.findIndex((item) => item.id === mood.id) === index);
const dedupedSeries = buildMoodSeries(dedupedMoods, week, 7);
assert(dedupedSeries.points.length === 7, "mood chart keeps every day in the window", String(dedupedSeries.points.length));
const missing = dedupedSeries.points.find((point) => point.key === "2026-10-14");
assert(missing?.averageMood === null && missing.count === 0, "a day with no check-in stays empty");
const zeroDay = dedupedSeries.points.find((point) => point.key === "2026-10-18");
assert(zeroDay?.count === 2, "two check-ins on one day stay two check-ins", String(zeroDay?.count));
assert(zeroDay?.averageMood === 40, "same-day scores are averaged, including a real zero", String(zeroDay?.averageMood));
assert(zeroDay?.moodLabel === "Uneasy", "average uses the stored 0–100 mood scale");
assert(dedupedSeries.points.every((point) => point.averageMood !== 0 || point.count > 0), "missing days are not stored as zero");

const activities: ActivityRecord[] = [
  { id: "a1", type: "meditation", name: "Morning meditation", duration: 0, completed: true, timestamp: at(-1, 7) },
  { id: "a1", type: "meditation", name: "duplicate", duration: 99, completed: true, timestamp: at(-1, 8) },
  { id: "a2", type: "walking", name: "Walk", duration: 12, completed: true, timestamp: at(0, 18) },
  { id: "a3", type: "reading", name: "Started chapter", completed: false, timestamp: at(0, 19) },
  { id: "a4", type: "music", name: "Playlist", completed: true, timestamp: at(-10, 12) },
];
const plans: PlanTaskRecord[] = [
  {
    id: "plan-1:task-1",
    planId: "plan-1",
    taskId: "task-1",
    type: "breathing",
    title: "Slow breathing",
    completed: true,
    completedAt: at(-1, 21),
  },
  {
    id: "plan-1:task-1",
    planId: "plan-1",
    taskId: "task-1",
    type: "breathing",
    title: "Slow breathing duplicate",
    completed: true,
    completedAt: at(-1, 22),
  },
  {
    id: "plan-1:task-2",
    planId: "plan-1",
    taskId: "task-2",
    type: "journal",
    title: "Open journal",
    completed: false,
    completedAt: at(0, 9),
  },
];

const finished = finishedActivities(activities, plans);
assert(finished.length === 4, "duplicates and incomplete records are left out", String(finished.length));
assert(finished.filter((item) => inPeriod(item.timestamp, week)).length === 3, "only this period's finished activities count");
assert(
  finished.find((item) => item.id === "a1")?.storedMinutes == null,
  "a stored duration of 0 is not turned into minutes"
);
assert(finished.find((item) => item.id === "a2")?.storedMinutes === 12, "a real stored duration is kept");

const days = activeDayKeys(dedupedMoods, finished, week);
assert(days.includes("2026-10-18") && days.includes("2026-10-19") && days.includes("2026-10-20"), "active days include mood or finished activity");
assert(!days.includes("2026-10-14"), "a blank day is not an active day");

const bars = buildActivityBars(finished, week, 7);
assert(bars.grain === "day" && bars.bars.length === 7, "seven-day activity chart is daily");
assert(bars.bars.reduce((sum, bar) => sum + bar.count, 0) === 3, "daily bars sum to finished activities in the period");
const monthBars = buildActivityBars(finished, periodBounds(30, now), 30);
assert(monthBars.grain === "week", "longer ranges group activities by week");
assert(monthBars.bars.some((bar) => bar.count === 0), "weeks inside the period with no finished activity stay at zero");

const breakdown = buildTypeBreakdown(finished, week);
assert(breakdown.logged.some((row) => row.label === "Meditation" && row.count === 1), "logged types use the activity record");
assert(breakdown.plan.some((row) => row.label === "Breathing" && row.count === 1), "finished plan tasks are counted separately");
assert(!breakdown.logged.some((row) => row.label === "Reading"), "an incomplete activity is not in the breakdown");

assert(buildInsights({ range: 7, activities: 0, previousActivities: 0, moodDays: 0 }).length === 0, "no insight when there is nothing to say");
const insight = buildInsights({ range: 7, activities: 4, previousActivities: 2, moodDays: 5 });
assert(insight[0].includes("4 wellness activities"), "insight states the real activity count");
assert(insight[0].includes("2 more"), "increase uses the previous matching window");
assert(!insight.join(" ").toLowerCase().includes("improv"), "insight does not claim a mood improvement");
const quieter = buildInsights({ range: 7, activities: 1, previousActivities: 4, moodDays: 0 });
assert(!quieter[0].includes("fewer") && !quieter[0].includes("less"), "a lower count is not phrased as a failure");

function assessment(partial: Partial<AssessmentRecord> & Pick<AssessmentRecord, "resultId">): AssessmentRecord {
  return {
    assessmentSlug: "stress-checkin",
    title: "Stress check-in",
    instrumentVersion: "1.0.0",
    interpretationLabel: null,
    clinicallyValidated: false,
    completedAt: at(0, 11),
    totalScore: null,
    maxScore: null,
    scoringMethod: "reflection_domains",
    ...partial,
  };
}

const reflectionA = assessment({ resultId: "r1", completedAt: at(-20, 10) });
const reflectionB = assessment({ resultId: "r2", completedAt: at(-1, 10), interpretationLabel: "A mixed picture" });
assert(!scoresAreComparable(reflectionA, reflectionB), "reflection results are not placed on one score scale");

const sumOld = assessment({
  resultId: "s1",
  assessmentSlug: "sample-scale",
  title: "Sample scale",
  instrumentVersion: "2",
  scoringMethod: "sum",
  totalScore: 12,
  maxScore: 27,
  completedAt: at(-10, 10),
});
const sumNew = assessment({
  resultId: "s2",
  assessmentSlug: "sample-scale",
  title: "Sample scale",
  instrumentVersion: "2",
  scoringMethod: "sum",
  totalScore: 9,
  maxScore: 27,
  completedAt: at(-1, 10),
});
const otherVersion = assessment({
  resultId: "s3",
  assessmentSlug: "sample-scale",
  title: "Sample scale",
  instrumentVersion: "3",
  scoringMethod: "sum",
  totalScore: 4,
  maxScore: 27,
  completedAt: at(0, 10),
});
const otherScale = assessment({
  resultId: "s4",
  assessmentSlug: "sample-scale",
  title: "Sample scale",
  instrumentVersion: "2",
  scoringMethod: "sum",
  totalScore: 4,
  maxScore: 40,
  completedAt: at(-2, 10),
});
assert(scoresAreComparable(sumOld, sumNew), "same assessment version and scale can be compared");
assert(!scoresAreComparable(sumNew, otherVersion), "a different version is not compared");
assert(!scoresAreComparable(sumNew, otherScale), "a different maximum score is not compared");
assert(!scoresAreComparable(sumNew, reflectionB), "unrelated assessments are not compared");

const groups = groupAssessments([reflectionA, reflectionB, sumOld, sumNew, otherVersion, otherScale, sumNew]);
const sample = groups.find((group) => group.key === "sample-scale@@2");
assert(sample?.comparablePoints.length === 2, "only the matching numeric results are charted", String(sample?.comparablePoints.length));
assert(sample?.comparablePoints[0].totalScore === 12 && sample?.comparablePoints[1].totalScore === 9, "comparable points stay in date order");
assert(
  groups.find((group) => group.key === "stress-checkin@@1.0.0")?.comparablePoints.length === 0,
  "reflections do not get a shared score chart"
);

const latest = latestAssessmentSummary([sumOld, sumNew, reflectionB], week);
assert(latest.state === "result", "latest card uses a result inside the period");
assert(
  Boolean(latest.comparison && latest.comparison.includes("12 of 27") && latest.comparison.includes("9 of 27")),
  "comparison quotes both scores"
);
assert(!latest.comparison?.toLowerCase().includes("improv") && !latest.comparison?.toLowerCase().includes("worse"), "comparison does not judge the direction");

const noneInPeriod = latestAssessmentSummary([sumOld], week);
assert(noneInPeriod.state === "none-in-period", "an older result is not described as happening this period");
assert(latestAssessmentSummary([], week).state === "none", "no saved assessment stays empty");

const parsedMoods = parseMoodPayload([
  { _id: "m", score: 0, note: "private reflection", timestamp: at(0, 9), mood: "😔 Down" },
  { _id: "bad", score: "nope", timestamp: at(0, 10) },
]);
assert(parsedMoods.length === 1 && parsedMoods[0].score === 0, "a saved score of zero is kept");
assert(!("note" in parsedMoods[0]), "mood notes are not copied into progress data");

const parsedPlans = parsePlanPayload({
  enrollments: [
    {
      id: "plan",
      weeks: [
        {
          days: [
            {
              tasks: [
                { id: "done", type: "breathing", title: "Breathing", completed: true, completedAt: at(0, 8), journalEntry: "secret" },
                { id: "open", type: "journal", title: "Journal", completed: false, completedAt: at(0, 9), journalEntry: "secret" },
                { id: "undated", type: "walk", title: "Walk", completed: true },
              ],
            },
          ],
        },
      ],
    },
  ],
});
assert(parsedPlans.length === 1 && parsedPlans[0].taskId === "done", "only a completed plan task with a time is kept");
assert(!("journalEntry" in parsedPlans[0]), "journal text is not copied into progress data");

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
