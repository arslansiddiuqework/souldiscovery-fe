/**
 * Progress tab calculations.
 * Every number comes from saved records. Missing mood days stay null.
 * Activity counts use an explicit completion flag. Assessment scores are
 * compared only when the same assessment, version, and scale match.
 */

import { getMoodCategory } from "../utils/moodMapper";

export type ProgressRange = 7 | 30 | 90 | "all";

export type PeriodBounds = {
  start: Date | null;
  end: Date;
};

export type MoodRecord = {
  id: string;
  score: number;
  /** Stored label, when the check-in saved one. The chart still uses the 0–100 score. */
  mood?: string | null;
  timestamp: string;
};

export type ActivityRecord = {
  id: string;
  type: string;
  name: string;
  duration?: number | null;
  completed?: boolean;
  timestamp: string;
};

export type PlanTaskRecord = {
  id: string;
  planId: string;
  taskId: string;
  type: string;
  title: string;
  completed: boolean;
  completedAt: string;
};

export type AssessmentRecord = {
  resultId: string;
  assessmentSlug: string;
  title: string;
  instrumentVersion: string;
  interpretationLabel: string | null;
  clinicallyValidated: boolean;
  completedAt: string;
  totalScore: number | null;
  maxScore: number | null;
  scoringMethod: string | null;
};

export type FinishedActivity = {
  id: string;
  source: "log" | "plan";
  type: string;
  label: string;
  name: string;
  timestamp: string;
  /** Minutes only when a duration was actually stored and is greater than 0. */
  storedMinutes: number | null;
};

export type MoodPoint = {
  key: string;
  label: string;
  fullLabel: string;
  averageMood: number | null;
  count: number;
  moodLabel: string | null;
  emoji: string | null;
};

export type ActivityBar = {
  key: string;
  label: string;
  fullLabel: string;
  count: number;
};

export type TypeBreakdownRow = {
  key: string;
  source: "log" | "plan";
  label: string;
  count: number;
};

export type CalendarDay = {
  key: string;
  inPeriod: boolean;
  dayNum: number | null;
  moodCount: number;
  activityCount: number;
  detail: string;
};

export type AssessmentGroup = {
  key: string;
  title: string;
  version: string;
  clinicallyValidated: boolean;
  attempts: AssessmentRecord[];
  /** Chronological points that share one numeric scale. Empty when comparison is not valid. */
  comparablePoints: Array<{
    resultId: string;
    completedAt: string;
    label: string;
    totalScore: number;
    maxScore: number;
  }>;
};

const ACTIVITY_LABELS: Record<string, string> = {
  meditation: "Meditation",
  exercise: "Exercise",
  walking: "Walking",
  reading: "Reading",
  journaling: "Journaling",
  therapy: "Therapy",
  game: "Calm game",
  music: "Music",
};

const PLAN_LABELS: Record<string, string> = {
  mood_checkin: "Mood check-in",
  ai_conversation: "AI conversation",
  journal: "Journal",
  gratitude: "Gratitude",
  breathing: "Breathing",
  mindfulness: "Mindfulness",
  walk: "Walk",
  reading: "Reading",
  meditation: "Meditation",
};

/** Methods that do not produce one comparable total. */
const NON_COMPARABLE_METHODS = new Set([
  "reflection_domains",
  "starting_point_routing",
  "none",
  "",
]);

export const MOOD_AXIS_TICKS: Array<{ value: number; label: string }> = [
  { value: 7, label: "Down" },
  { value: 22, label: "Stressed" },
  { value: 37, label: "Uneasy" },
  { value: 50, label: "Neutral" },
  { value: 63, label: "Calm" },
  { value: 78, label: "Happy" },
  { value: 93, label: "Excited" },
];

export function moodParts(score: number): { emoji: string; label: string } {
  const raw = getMoodCategory(score);
  const space = raw.indexOf(" ");
  if (space === -1) return { emoji: "", label: raw };
  return { emoji: raw.slice(0, space), label: raw.slice(space + 1) };
}

export function localDateKey(input: string | Date): string | null {
  const date = typeof input === "string" ? new Date(input) : input;
  const time = date.getTime();
  if (!Number.isFinite(time)) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function periodBounds(range: ProgressRange, now: Date): PeriodBounds {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  if (range === "all") return { start: null, end };
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setDate(start.getDate() - (range - 1));
  return { start, end };
}

export function previousBounds(range: ProgressRange, now: Date): PeriodBounds | null {
  if (range === "all") return null;
  const current = periodBounds(range, now);
  if (!current.start) return null;
  const prevEndDay = new Date(current.start);
  prevEndDay.setDate(prevEndDay.getDate() - 1);
  const end = new Date(
    prevEndDay.getFullYear(),
    prevEndDay.getMonth(),
    prevEndDay.getDate(),
    23,
    59,
    59,
    999
  );
  const start = new Date(prevEndDay.getFullYear(), prevEndDay.getMonth(), prevEndDay.getDate());
  start.setDate(start.getDate() - (range - 1));
  return { start, end };
}

export function inPeriod(iso: string, bounds: PeriodBounds): boolean {
  const time = new Date(iso).getTime();
  if (!Number.isFinite(time)) return false;
  if (time > bounds.end.getTime()) return false;
  if (bounds.start && time < bounds.start.getTime()) return false;
  return true;
}

export function rangeTitle(range: ProgressRange): string {
  if (range === "all") return "All saved history";
  return `Last ${range} days, including today`;
}

export function rangePhrase(range: ProgressRange): string {
  if (range === "all") return "in your saved history";
  return `in the last ${range} days, including today`;
}

function formatDay(date: Date, withYear = false): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
  });
}

function formatLong(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatPeriodLabel(bounds: PeriodBounds, earliest?: string | null): string {
  const endLabel = formatDay(bounds.end, true);
  if (!bounds.start) {
    if (!earliest) return "All time";
    const start = new Date(earliest);
    if (!Number.isFinite(start.getTime())) return "All time";
    return `${formatDay(start, true)} – ${endLabel}`;
  }
  return `${formatDay(bounds.start, true)} – ${endLabel}`;
}

function eachLocalDay(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (cursor.getTime() <= last.getTime()) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function startOfWeekMonday(date: Date): Date {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() + diff);
  return start;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

function activityTypeLabel(type: string): string {
  const key = type.toLowerCase();
  return ACTIVITY_LABELS[key] || titleCase(type || "Activity");
}

function planTypeLabel(type: string): string {
  const key = type.toLowerCase();
  return PLAN_LABELS[key] || titleCase(type || "Plan activity");
}

function titleCase(value: string): string {
  const cleaned = value.replace(/[_-]+/g, " ").trim();
  if (!cleaned) return "Activity";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function isCompletedActivity(activity: { completed?: boolean }): boolean {
  return activity.completed !== false;
}

export function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    if (!item.id || seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

export function finishedActivities(
  activities: ActivityRecord[],
  planTasks: PlanTaskRecord[]
): FinishedActivity[] {
  const logged: FinishedActivity[] = [];
  const seen = new Set<string>();
  for (const activity of activities) {
    if (!activity.id || seen.has(activity.id)) continue;
    if (!isCompletedActivity(activity)) continue;
    if (!localDateKey(activity.timestamp)) continue;
    seen.add(activity.id);
    const minutes = Number(activity.duration);
    logged.push({
      id: activity.id,
      source: "log",
      type: activity.type,
      label: activityTypeLabel(activity.type),
      name: activity.name || activityTypeLabel(activity.type),
      timestamp: activity.timestamp,
      storedMinutes: Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes) : null,
    });
  }

  const seenTasks = new Set<string>();
  for (const task of planTasks) {
    const key = task.id || `${task.planId}:${task.taskId}`;
    if (!key || seenTasks.has(key)) continue;
    if (task.completed !== true) continue;
    if (!localDateKey(task.completedAt)) continue;
    seenTasks.add(key);
    logged.push({
      id: key,
      source: "plan",
      type: task.type,
      label: planTypeLabel(task.type),
      name: task.title || planTypeLabel(task.type),
      timestamp: task.completedAt,
      storedMinutes: null,
    });
  }
  return logged;
}

export function countInPeriod<T extends { timestamp: string }>(
  items: T[],
  bounds: PeriodBounds
): T[] {
  return items.filter((item) => inPeriod(item.timestamp, bounds));
}

export function activeDayKeys(moods: MoodRecord[], finished: FinishedActivity[], bounds: PeriodBounds): string[] {
  const days = new Set<string>();
  for (const mood of moods) {
    if (!inPeriod(mood.timestamp, bounds)) continue;
    const key = localDateKey(mood.timestamp);
    if (key) days.add(key);
  }
  for (const activity of finished) {
    if (!inPeriod(activity.timestamp, bounds)) continue;
    const key = localDateKey(activity.timestamp);
    if (key) days.add(key);
  }
  return [...days].sort();
}

function daySpan(start: Date, end: Date): number {
  const ms = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime() -
    new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  return Math.round(ms / 86400000) + 1;
}

export function moodGrain(
  range: ProgressRange,
  bounds: PeriodBounds,
  moods: MoodRecord[]
): "day" | "week" | "month" {
  if (range === 7 || range === 30 || range === 90) return "day";
  const dated = moods
    .map((mood) => localDateKey(mood.timestamp))
    .filter((key): key is string => Boolean(key))
    .sort();
  if (!dated.length) return "day";
  const first = parseKey(dated[0]);
  const span = daySpan(first, bounds.end);
  if (span <= 90) return "day";
  if (span <= 400) return "week";
  return "month";
}

function parseKey(key: string): Date {
  const [y, m, d] = key.split("-").map((part) => Number(part));
  return new Date(y, (m || 1) - 1, d || 1);
}

function average(scores: number[]): number | null {
  const valid = scores.filter((score) => Number.isFinite(score));
  if (!valid.length) return null;
  return valid.reduce((sum, score) => sum + score, 0) / valid.length;
}

function pointFromScores(
  key: string,
  label: string,
  fullLabel: string,
  scores: number[]
): MoodPoint {
  const avg = average(scores);
  const parts = avg == null ? null : moodParts(avg);
  return {
    key,
    label,
    fullLabel,
    averageMood: avg,
    count: scores.length,
    moodLabel: parts?.label ?? null,
    emoji: parts?.emoji ?? null,
  };
}

export function buildMoodSeries(
  moods: MoodRecord[],
  bounds: PeriodBounds,
  range: ProgressRange
): { grain: "day" | "week" | "month"; points: MoodPoint[] } {
  const inRange = moods.filter(
    (mood) => Number.isFinite(mood.score) && inPeriod(mood.timestamp, bounds)
  );
  const grain = moodGrain(range, bounds, inRange);
  if (!inRange.length) return { grain, points: [] };

  const byKey = new Map<string, number[]>();
  for (const mood of inRange) {
    const day = localDateKey(mood.timestamp);
    if (!day) continue;
    const bucket = bucketKey(day, grain);
    const list = byKey.get(bucket) || [];
    list.push(mood.score);
    byKey.set(bucket, list);
  }

  if (grain === "day") {
    const start = bounds.start ?? parseKey([...byKey.keys()].sort()[0]);
    const days = eachLocalDay(start, bounds.end);
    return {
      grain,
      points: days.map((day) => {
        const key = localDateKey(day)!;
        return pointFromScores(
          key,
          days.length <= 14 ? weekdayShort(day) : formatDay(day),
          formatLong(day),
          byKey.get(key) || []
        );
      }),
    };
  }

  const keys = [...byKey.keys()].sort();
  const start = parseKey(grain === "week" ? keys[0] : `${keys[0]}-01`);
  const endKey = bucketKey(localDateKey(bounds.end)!, grain);
  const points: MoodPoint[] = [];
  if (grain === "week") {
    let cursor = startOfWeekMonday(start);
    const last = parseKey(endKey);
    while (cursor.getTime() <= last.getTime()) {
      const key = localDateKey(cursor)!;
      const weekEnd = addDays(cursor, 6);
      points.push(
        pointFromScores(
          key,
          formatDay(cursor),
          `Week of ${formatLong(cursor)} through ${formatLong(weekEnd)}`,
          byKey.get(key) || []
        )
      );
      cursor = addDays(cursor, 7);
    }
    return { grain, points };
  }

  let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = parseKey(`${endKey}-01`);
  while (cursor.getTime() <= last.getTime()) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    points.push(
      pointFromScores(
        key,
        cursor.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        byKey.get(key) || []
      )
    );
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }
  return { grain, points };
}

function bucketKey(dayKey: string, grain: "day" | "week" | "month"): string {
  if (grain === "day") return dayKey;
  const date = parseKey(dayKey);
  if (grain === "week") return localDateKey(startOfWeekMonday(date))!;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function weekdayShort(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
}

export function describeMoodPattern(moods: MoodRecord[], bounds: PeriodBounds): string | null {
  const inRange = moods.filter(
    (mood) => Number.isFinite(mood.score) && inPeriod(mood.timestamp, bounds)
  );
  const days = new Set(
    inRange
      .map((mood) => localDateKey(mood.timestamp))
      .filter((key): key is string => Boolean(key))
  );
  if (days.size < 3) return null;
  const counts = new Map<string, number>();
  for (const mood of inRange) {
    const label = moodParts(mood.score).label;
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const [topLabel, topCount] = ranked[0];
  const second = ranked[1];
  if (second && second[1] === topCount) {
    return `Your check-ins were mostly ${topLabel} and ${second[0]}.`;
  }
  if (topCount >= Math.ceil(inRange.length / 2)) {
    return `Most of your check-ins in this period were ${topLabel}.`;
  }
  return `Your check-ins varied. ${topLabel} showed up most often.`;
}

export function buildActivityBars(
  finished: FinishedActivity[],
  bounds: PeriodBounds,
  range: ProgressRange
): { grain: "day" | "week" | "month"; bars: ActivityBar[] } {
  const inRange = finished.filter((item) => inPeriod(item.timestamp, bounds));
  if (!inRange.length) return { grain: range === 7 ? "day" : "week", bars: [] };

  const grain: "day" | "week" | "month" =
    range === 7 ? "day" : activityGrain(range, bounds, inRange);

  const counts = new Map<string, number>();
  for (const item of inRange) {
    const day = localDateKey(item.timestamp);
    if (!day) continue;
    const key = bucketKey(day, grain);
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  if (grain === "day" && bounds.start) {
    return {
      grain,
      bars: eachLocalDay(bounds.start, bounds.end).map((day) => {
        const key = localDateKey(day)!;
        return {
          key,
          label: weekdayShort(day),
          fullLabel: formatLong(day),
          count: counts.get(key) || 0,
        };
      }),
    };
  }

  const keys = [...counts.keys()].sort();
  const bars: ActivityBar[] = [];
  if (grain === "week") {
    const firstKey = bounds.start
      ? localDateKey(startOfWeekMonday(bounds.start))!
      : keys[0];
    let cursor = parseKey(firstKey);
    const last = parseKey(bucketKey(localDateKey(bounds.end)!, "week"));
    while (cursor.getTime() <= last.getTime()) {
      const key = localDateKey(cursor)!;
      bars.push({
        key,
        label: formatDay(cursor),
        fullLabel: `Week of ${formatLong(cursor)}`,
        count: counts.get(key) || 0,
      });
      cursor = addDays(cursor, 7);
    }
    return { grain, bars };
  }

  let cursor = parseKey(`${keys[0]}-01`);
  const last = parseKey(`${bucketKey(localDateKey(bounds.end)!, "month")}-01`);
  while (cursor.getTime() <= last.getTime()) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    bars.push({
      key,
      label: cursor.toLocaleDateString("en-US", { month: "short" }),
      fullLabel: cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      count: counts.get(key) || 0,
    });
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }
  return { grain, bars };
}

function activityGrain(
  range: ProgressRange,
  bounds: PeriodBounds,
  items: FinishedActivity[]
): "week" | "month" {
  if (range !== "all") return "week";
  const first = items
    .map((item) => localDateKey(item.timestamp))
    .filter((key): key is string => Boolean(key))
    .sort()[0];
  if (!first) return "week";
  return daySpan(parseKey(first), bounds.end) > 400 ? "month" : "week";
}

export function buildTypeBreakdown(finished: FinishedActivity[], bounds: PeriodBounds): {
  logged: TypeBreakdownRow[];
  plan: TypeBreakdownRow[];
} {
  const rows = new Map<string, TypeBreakdownRow>();
  for (const item of finished) {
    if (!inPeriod(item.timestamp, bounds)) continue;
    const key = `${item.source}:${item.label}`;
    const existing = rows.get(key);
    if (existing) existing.count += 1;
    else rows.set(key, { key, source: item.source, label: item.label, count: 1 });
  }
  const all = [...rows.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  return {
    logged: all.filter((row) => row.source === "log"),
    plan: all.filter((row) => row.source === "plan"),
  };
}

export function buildCalendar(
  moods: MoodRecord[],
  finished: FinishedActivity[],
  bounds: PeriodBounds,
  range: ProgressRange
): { weeks: CalendarDay[][]; truncated: boolean; hiddenEarlierWeeks: number } {
  const moodByDay = new Map<string, MoodRecord[]>();
  for (const mood of moods) {
    if (!Number.isFinite(mood.score) || !inPeriod(mood.timestamp, bounds)) continue;
    const key = localDateKey(mood.timestamp);
    if (!key) continue;
    const list = moodByDay.get(key) || [];
    list.push(mood);
    moodByDay.set(key, list);
  }
  const activityByDay = new Map<string, FinishedActivity[]>();
  for (const activity of finished) {
    if (!inPeriod(activity.timestamp, bounds)) continue;
    const key = localDateKey(activity.timestamp);
    if (!key) continue;
    const list = activityByDay.get(key) || [];
    list.push(activity);
    activityByDay.set(key, list);
  }

  let start: Date;
  let truncated = false;
  let hiddenEarlierWeeks = 0;
  if (bounds.start) {
    start = bounds.start;
  } else {
    const keys = [...new Set([...moodByDay.keys(), ...activityByDay.keys()])].sort();
    if (!keys.length) return { weeks: [], truncated: false, hiddenEarlierWeeks: 0 };
    start = parseKey(keys[0]);
    const weeksSpan = Math.ceil(daySpan(startOfWeekMonday(start), bounds.end) / 7);
    if (weeksSpan > 26) {
      truncated = true;
      hiddenEarlierWeeks = weeksSpan - 26;
      start = addDays(startOfWeekMonday(bounds.end), -25 * 7);
    }
  }

  const gridStart = startOfWeekMonday(start);
  const gridEnd = addDays(startOfWeekMonday(bounds.end), 6);
  const days = eachLocalDay(gridStart, gridEnd);
  const periodStartKey = bounds.start ? localDateKey(bounds.start) : null;
  const periodEndKey = localDateKey(bounds.end)!;

  const cells: CalendarDay[] = days.map((day) => {
    const key = localDateKey(day)!;
    const inRange =
      (!periodStartKey || key >= periodStartKey) && key <= periodEndKey;
    if (!inRange) {
      return {
        key,
        inPeriod: false,
        dayNum: null,
        moodCount: 0,
        activityCount: 0,
        detail: "",
      };
    }
    const dayMoods = moodByDay.get(key) || [];
    const dayActivities = activityByDay.get(key) || [];
    return {
      key,
      inPeriod: true,
      dayNum: day.getDate(),
      moodCount: dayMoods.length,
      activityCount: dayActivities.length,
      detail: describeCalendarDay(day, dayMoods, dayActivities),
    };
  });

  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return { weeks, truncated, hiddenEarlierWeeks };
}

function describeCalendarDay(day: Date, moods: MoodRecord[], activities: FinishedActivity[]): string {
  const date = formatLong(day);
  if (!moods.length && !activities.length) {
    return `${date}. Nothing saved this day.`;
  }
  const parts: string[] = [date];
  if (activities.length) {
    const names = activities.map((activity) => activity.name).slice(0, 4);
    const extra = activities.length > names.length ? `, and ${activities.length - names.length} more` : "";
    parts.push(
      `You finished ${activities.length} ${activities.length === 1 ? "activity" : "activities"}: ${names.join(", ")}${extra}.`
    );
  }
  if (moods.length === 1) {
    const partsMood = moodParts(moods[0].score);
    parts.push(`You saved 1 mood check-in: ${partsMood.label}, ${Math.round(moods[0].score)} out of 100.`);
  } else if (moods.length > 1) {
    const avg = average(moods.map((mood) => mood.score));
    const label = avg == null ? "a mix" : moodParts(avg).label;
    parts.push(
      `You saved ${moods.length} mood check-ins, averaging ${label}${avg == null ? "" : `, ${Math.round(avg)} out of 100`}.`
    );
  }
  return parts.join(" ");
}

export function scoresAreComparable(a: AssessmentRecord, b: AssessmentRecord): boolean {
  if (!a.assessmentSlug || a.assessmentSlug !== b.assessmentSlug) return false;
  if (!a.instrumentVersion || a.instrumentVersion !== b.instrumentVersion) return false;
  if (!a.scoringMethod || a.scoringMethod !== b.scoringMethod) return false;
  if (NON_COMPARABLE_METHODS.has(a.scoringMethod)) return false;
  if (!Number.isFinite(a.totalScore) || !Number.isFinite(b.totalScore)) return false;
  if (a.maxScore == null || a.maxScore <= 0 || a.maxScore !== b.maxScore) return false;
  return true;
}

export function groupAssessments(records: AssessmentRecord[]): AssessmentGroup[] {
  const groups = new Map<string, AssessmentRecord[]>();
  const seen = new Set<string>();
  for (const record of records) {
    if (!record.resultId || seen.has(record.resultId)) continue;
    if (!localDateKey(record.completedAt)) continue;
    seen.add(record.resultId);
    const key = `${record.assessmentSlug}@@${record.instrumentVersion}`;
    const list = groups.get(key) || [];
    list.push(record);
    groups.set(key, list);
  }

  const result: AssessmentGroup[] = [];
  for (const [key, attempts] of groups) {
    const ordered = [...attempts].sort(
      (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );
    const latest = ordered[ordered.length - 1];
    const comparablePoints = ordered
      .filter((attempt) => scoresAreComparable(latest, attempt) || attempt.resultId === latest.resultId)
      .filter((attempt) => Number.isFinite(attempt.totalScore) && attempt.maxScore != null && attempt.maxScore > 0)
      .filter((attempt) => scoresAreComparable(attempt, latest))
      .map((attempt) => ({
        resultId: attempt.resultId,
        completedAt: attempt.completedAt,
        label: new Date(attempt.completedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        totalScore: attempt.totalScore as number,
        maxScore: attempt.maxScore as number,
      }));
    const uniqueScale =
      comparablePoints.length >= 2 &&
      comparablePoints.every((point, index) =>
        index === 0 ? true : point.maxScore === comparablePoints[0].maxScore
      );
    result.push({
      key,
      title: latest.title || "Assessment",
      version: latest.instrumentVersion,
      clinicallyValidated: ordered.some((attempt) => attempt.clinicallyValidated),
      attempts: [...ordered].reverse(),
      comparablePoints: uniqueScale ? comparablePoints : [],
    });
  }

  return result.sort(
    (a, b) =>
      new Date(b.attempts[0].completedAt).getTime() - new Date(a.attempts[0].completedAt).getTime()
  );
}

export type LatestAssessmentSummary = {
  state: "none" | "none-in-period" | "result";
  title: string;
  detail: string;
  comparison: string | null;
  previousLabel: string | null;
};

export function latestAssessmentSummary(
  records: AssessmentRecord[],
  bounds: PeriodBounds
): LatestAssessmentSummary {
  const valid = dedupeAssessments(records);
  if (!valid.length) {
    return {
      state: "none",
      title: "None yet",
      detail: "No saved assessment",
      comparison: null,
      previousLabel: null,
    };
  }
  const inRange = valid
    .filter((record) => inPeriod(record.completedAt, bounds))
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  if (!inRange.length) {
    return {
      state: "none-in-period",
      title: "None in this period",
      detail: "Earlier results are listed below",
      comparison: null,
      previousLabel: null,
    };
  }
  const latest = inRange[0];
  const previous = valid
    .filter((record) => record.resultId !== latest.resultId && scoresAreComparable(latest, record))
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];

  let comparison: string | null = null;
  let previousLabel: string | null = null;
  if (
    previous &&
    Number.isFinite(latest.totalScore) &&
    Number.isFinite(previous.totalScore) &&
    latest.maxScore
  ) {
    const when = new Date(previous.completedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    previousLabel = formatScore(previous);
    comparison = `Previous result on this same assessment was ${formatScore(previous)} on ${when}. This result is ${formatScore(latest)}.`;
  }

  const when = new Date(latest.completedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const detail = latest.interpretationLabel
    ? `${latest.interpretationLabel} · ${when}`
    : Number.isFinite(latest.totalScore) && latest.maxScore
      ? `${formatScore(latest)} · ${when}`
      : `Saved ${when}`;

  return {
    state: "result",
    title: latest.title,
    detail,
    comparison,
    previousLabel,
  };
}

function formatScore(record: AssessmentRecord): string {
  return `${record.totalScore} of ${record.maxScore}`;
}

function dedupeAssessments(records: AssessmentRecord[]): AssessmentRecord[] {
  const seen = new Set<string>();
  const out: AssessmentRecord[] = [];
  for (const record of records) {
    if (!record.resultId || seen.has(record.resultId)) continue;
    if (!localDateKey(record.completedAt)) continue;
    seen.add(record.resultId);
    out.push(record);
  }
  return out;
}

export function buildInsights(input: {
  range: ProgressRange;
  activities: number;
  previousActivities: number | null;
  moodDays: number;
}): string[] {
  const lines: string[] = [];
  if (input.activities > 0) {
    const noun = input.activities === 1 ? "activity" : "activities";
    let line = `You finished ${input.activities} wellness ${noun} ${rangePhrase(input.range)}.`;
    if (
      input.range !== "all" &&
      input.previousActivities != null &&
      input.activities > input.previousActivities
    ) {
      const diff = input.activities - input.previousActivities;
      line = `You finished ${input.activities} wellness ${noun} ${rangePhrase(input.range)} — ${diff} more than the ${input.range} days before.`;
    }
    lines.push(line);
  }
  if (input.moodDays > 0 && lines.length < 2) {
    const noun = input.moodDays === 1 ? "day" : "days";
    lines.push(`You recorded your mood on ${input.moodDays} ${noun} ${rangePhrase(input.range)}.`);
  }
  if (input.moodDays >= 3 && lines.length < 2) {
    lines.push(
      input.range === "all"
        ? "You have enough mood check-ins in your saved history to see a pattern on the chart."
        : "You have enough mood check-ins in this period to see a pattern on the chart."
    );
  }
  if (!lines.length) return [];
  return lines.slice(0, 2);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function parseMoodPayload(data: unknown): MoodRecord[] {
  const rows = Array.isArray(data) ? data : [];
  const parsed: MoodRecord[] = [];
  for (const row of rows) {
    const record = asRecord(row);
    if (!record) continue;
    const score = Number(record.score);
    const timestamp = asString(record.timestamp || record.createdAt);
    const id = asString(record._id || record.id);
    if (!id || !Number.isFinite(score) || !localDateKey(timestamp)) continue;
    parsed.push({
      id,
      score,
      mood: asString(record.mood) || null,
      timestamp,
    });
  }
  return dedupeById(parsed);
}

export function parseActivityPayload(data: unknown): ActivityRecord[] {
  const rows = Array.isArray(data) ? data : [];
  const parsed: ActivityRecord[] = [];
  for (const row of rows) {
    const record = asRecord(row);
    if (!record) continue;
    const id = asString(record._id || record.id);
    const timestamp = asString(record.timestamp || record.createdAt);
    if (!id || !localDateKey(timestamp)) continue;
    const duration = Number(record.duration);
    parsed.push({
      id,
      type: asString(record.type),
      name: asString(record.name) || "Activity",
      duration: Number.isFinite(duration) ? duration : null,
      completed: typeof record.completed === "boolean" ? record.completed : undefined,
      timestamp,
    });
  }
  return dedupeById(parsed);
}

export function parsePlanPayload(data: unknown): PlanTaskRecord[] {
  const root = asRecord(data);
  const enrollments = Array.isArray(data)
    ? data
    : Array.isArray(root?.enrollments)
      ? root.enrollments
      : [];
  const parsed: PlanTaskRecord[] = [];
  const seen = new Set<string>();
  for (const planValue of enrollments) {
    const plan = asRecord(planValue);
    if (!plan) continue;
    const planId = asString(plan.id);
    const weeks = Array.isArray(plan.weeks) ? plan.weeks : [];
    if (!planId) continue;
    for (const weekValue of weeks) {
      const week = asRecord(weekValue);
      const days = Array.isArray(week?.days) ? week.days : [];
      for (const dayValue of days) {
        const day = asRecord(dayValue);
        const tasks = Array.isArray(day?.tasks) ? day.tasks : [];
        for (const taskValue of tasks) {
          const task = asRecord(taskValue);
          if (!task || task.completed !== true) continue;
          const taskId = asString(task.id);
          const completedAt = asString(task.completedAt);
          if (!taskId || !localDateKey(completedAt)) continue;
          const id = `${planId}:${taskId}`;
          if (seen.has(id)) continue;
          seen.add(id);
          parsed.push({
            id,
            planId,
            taskId,
            type: asString(task.type) || "activity",
            title: asString(task.title) || "Plan activity",
            completed: true,
            completedAt,
          });
        }
      }
    }
  }
  return parsed;
}

export function parseAssessmentPayload(data: unknown): AssessmentRecord[] {
  const root = asRecord(data);
  const rows = Array.isArray(data) ? data : Array.isArray(root?.history) ? root.history : [];
  const parsed: AssessmentRecord[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    const record = asRecord(row);
    if (!record) continue;
    const resultId = asString(record.resultId);
    const completedAt = asString(record.completedAt);
    if (!resultId || !localDateKey(completedAt) || seen.has(resultId)) continue;
    seen.add(resultId);
    const total = Number(record.totalScore);
    const max = Number(record.maxScore);
    parsed.push({
      resultId,
      assessmentSlug: asString(record.assessmentSlug),
      title: asString(record.title) || "Assessment",
      instrumentVersion: asString(record.instrumentVersion),
      interpretationLabel: asString(record.interpretationLabel) || null,
      clinicallyValidated: record.clinicallyValidated === true,
      completedAt,
      totalScore: Number.isFinite(total) ? total : null,
      maxScore: Number.isFinite(max) ? max : null,
      scoringMethod: asString(record.scoringMethod) || null,
    });
  }
  return parsed;
}

export function moodGrainCaption(grain: "day" | "week" | "month"): string {
  if (grain === "week") {
    return "Each point is the average of check-ins saved that week. Weeks you skipped are left blank.";
  }
  if (grain === "month") {
    return "Each point is the average of check-ins saved that month. Months you skipped are left blank.";
  }
  return "Each point is the average of check-ins saved that day. Days you skipped are left blank.";
}

export function activityGrainCaption(grain: "day" | "week" | "month"): string {
  if (grain === "day") return "Each bar is one day, including today. A bar counts finished activities only.";
  if (grain === "month") return "Each bar is a calendar month. Only finished activities inside this period are counted.";
  return "Each bar is a calendar week, Monday through Sunday. Only finished activities inside this period are counted.";
}
