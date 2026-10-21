"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Brain,
  Dumbbell,
  Lightbulb,
  Loader2,
  Moon,
  Sparkles,
} from "lucide-react";
import { useReducedMotion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  activeDayKeys,
  buildActivityBars,
  buildInsights,
  buildMoodSeries,
  buildTypeBreakdown,
  countInPeriod,
  finishedActivities,
  inPeriod,
  localDateKey,
  moodParts,
  periodBounds,
  previousBounds,
  type ActivityRecord,
  type AssessmentRecord,
  type MoodRecord,
  type PlanTaskRecord,
  type ProgressRange,
} from "@/lib/progress/compute";
import { loadProgressSources, type SourceKey } from "@/lib/progress/load";
import { useSession } from "@/lib/contexts/session-context";
import { cn } from "@/lib/utils";
import { progressFocusClass, progressPanelClass } from "./panel";

const EMPTY_SOURCES = {
  moods: [] as MoodRecord[],
  activities: [] as ActivityRecord[],
  planTasks: [] as PlanTaskRecord[],
  assessments: [] as AssessmentRecord[],
};

const RANGE_OPTIONS: Array<{ id: Exclude<ProgressRange, "all">; label: string }> = [
  { id: 7, label: "Week" },
  { id: 30, label: "Month" },
  { id: 90, label: "90 Days" },
];

const HABIT_META = [
  {
    key: "mindfulness",
    label: "Mindfulness",
    Icon: Brain,
    match: /meditat|mindful|breath|journal|reflect/i,
    bar: "from-[#C45A96] to-[#B74783]",
    iconBg: "bg-[#FFF0F6] text-[#B74783]",
    target: 5,
  },
  {
    key: "rest",
    label: "Rest & recovery",
    Icon: Moon,
    match: /sleep|rest|relax|calm|zen|ocean|wave/i,
    bar: "from-[#E8A06A] to-[#D4845A]",
    iconBg: "bg-[#FFF1E9] text-[#D4845A]",
    target: 4,
  },
  {
    key: "movement",
    label: "Movement",
    Icon: Dumbbell,
    match: /exercise|walk|yoga|stretch|run|fitness|sport/i,
    bar: "from-[#E8A0C4] to-[#D96BA0]",
    iconBg: "bg-[#FCE8F2] text-[#C0448B]",
    target: 4,
  },
] as const;

function greetingFor(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatLongDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function firstName(name?: string | null) {
  if (!name?.trim()) return "there";
  return name.trim().split(/\s+/)[0];
}

/** Concentric progress rings — Mood / Consistency / Active days */
function MoodCheckInRing({
  moodScore,
  moodLabel,
  consistency,
  activeRatio,
}: {
  moodScore: number | null;
  moodLabel: string;
  consistency: number;
  activeRatio: number;
}) {
  const size = 168;
  const cx = size / 2;
  const cy = size / 2;
  const rings = [
    { r: 70, stroke: 10, value: moodScore ?? 0, color: "#B74783", track: "#F7E4EE" },
    { r: 54, stroke: 9, value: consistency, color: "#D4845A", track: "#F8E8DC" },
    { r: 38, stroke: 8, value: activeRatio, color: "#E8A0C4", track: "#FCE8F2" },
  ];

  return (
    <div className="relative mx-auto h-[168px] w-[168px]">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        {rings.map((ring) => {
          const c = 2 * Math.PI * ring.r;
          const pct = Math.max(0, Math.min(100, ring.value)) / 100;
          return (
            <g key={ring.r}>
              <circle
                cx={cx}
                cy={cy}
                r={ring.r}
                fill="none"
                stroke={ring.track}
                strokeWidth={ring.stroke}
              />
              <circle
                cx={cx}
                cy={cy}
                r={ring.r}
                fill="none"
                stroke={ring.color}
                strokeWidth={ring.stroke}
                strokeLinecap="round"
                strokeDasharray={`${c * pct} ${c}`}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            </g>
          );
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-[1.85rem] font-bold leading-none tracking-[-0.04em] text-[#49263D]">
          {moodScore == null ? "—" : Math.round(moodScore)}
        </p>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#957F94]">
          {moodLabel}
        </p>
      </div>
    </div>
  );
}

export function WeeklySummary() {
  const { user } = useSession();
  const reduceMotion = useReducedMotion();
  const [range, setRange] = useState<Exclude<ProgressRange, "all">>(7);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [sources, setSources] = useState(EMPTY_SOURCES);
  const [errors, setErrors] = useState<Partial<Record<SourceKey, string>>>({});
  const [reloadKey, setReloadKey] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [highlightKey, setHighlightKey] = useState<string | null>(null);

  const reload = useCallback(() => setReloadKey((value) => value + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadProgressSources()
      .then((result) => {
        if (cancelled) return;
        setAuthRequired(result.authRequired);
        setSources({
          moods: result.moods,
          activities: result.activities,
          planTasks: result.planTasks,
          assessments: result.assessments,
        });
        setErrors(result.errors);
      })
      .catch(() => {
        if (cancelled) return;
        setErrors({
          moods: "unavailable",
          activities: "unavailable",
          plans: "unavailable",
          assessments: "unavailable",
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    setNow(new Date());
  }, [range, reloadKey]);

  const bounds = useMemo(() => periodBounds(range, now), [range, now]);
  const prior = useMemo(() => previousBounds(range, now), [range, now]);

  const moodsOk = !errors.moods;
  const activitiesOk = !errors.activities;
  const plansOk = !errors.plans;
  const activityTotalsOk = activitiesOk && plansOk;
  const daysOk = moodsOk && activityTotalsOk;

  const finished = useMemo(
    () => finishedActivities(sources.activities, sources.planTasks),
    [sources.activities, sources.planTasks]
  );
  const periodFinished = useMemo(() => countInPeriod(finished, bounds), [finished, bounds]);
  const previousFinished = useMemo(
    () => (prior ? countInPeriod(finished, prior).length : null),
    [finished, prior]
  );
  const periodMoods = useMemo(
    () => sources.moods.filter((mood) => inPeriod(mood.timestamp, bounds)),
    [sources.moods, bounds]
  );
  const moodSeries = useMemo(
    () => buildMoodSeries(moodsOk ? sources.moods : [], bounds, range),
    [moodsOk, sources.moods, bounds, range]
  );
  const activityBars = useMemo(
    () => buildActivityBars(finished, bounds, range),
    [finished, bounds, range]
  );
  const breakdown = useMemo(() => buildTypeBreakdown(finished, bounds), [finished, bounds]);
  const activeDays = useMemo(
    () => (daysOk ? activeDayKeys(sources.moods, finished, bounds).length : 0),
    [daysOk, sources.moods, finished, bounds]
  );
  const moodDayCount = useMemo(() => {
    const days = new Set<string>();
    for (const mood of periodMoods) {
      const key = localDateKey(mood.timestamp);
      if (key) days.add(key);
    }
    return days.size;
  }, [periodMoods]);

  const avgMood = useMemo(() => {
    if (!periodMoods.length) return null;
    const sum = periodMoods.reduce((acc, mood) => acc + mood.score, 0);
    return sum / periodMoods.length;
  }, [periodMoods]);

  const moodMeta = avgMood == null ? { emoji: "", label: "No data" } : moodParts(avgMood);
  const consistency = Math.round((moodDayCount / Math.max(1, range)) * 100);
  const activeRatio = Math.round((activeDays / Math.max(1, range)) * 100);

  const insightLines = useMemo(() => {
    if (!moodsOk && !activityTotalsOk) return [];
    return buildInsights({
      range,
      activities: activityTotalsOk ? periodFinished.length : 0,
      previousActivities: activityTotalsOk ? previousFinished : null,
      moodDays: moodsOk ? moodDayCount : 0,
    });
  }, [moodsOk, activityTotalsOk, range, periodFinished.length, previousFinished, moodDayCount]);

  const habits = useMemo(() => {
    return HABIT_META.map((habit) => {
      const count = periodFinished.filter((item) => {
        const hay = `${item.type} ${item.label} ${item.name}`;
        return habit.match.test(hay);
      }).length;
      const pct = Math.min(100, Math.round((count / habit.target) * 100));
      return { ...habit, count, pct, display: `${count}/${habit.target}` };
    });
  }, [periodFinished]);

  const dualSeries = useMemo(() => {
    const maxAct = Math.max(1, ...activityBars.bars.map((b) => b.count));
    return moodSeries.points.map((point, index) => {
      const act = activityBars.bars[index];
      return {
        key: point.key,
        label: point.label,
        fullLabel: point.fullLabel,
        mood: point.averageMood,
        activityIndex: act ? Math.round((act.count / maxAct) * 100) : 0,
        activityCount: act?.count ?? 0,
      };
    });
  }, [moodSeries.points, activityBars.bars]);

  useEffect(() => {
    const withMood = moodSeries.points.filter((p) => p.averageMood != null);
    if (!withMood.length) {
      setHighlightKey(null);
      return;
    }
    setHighlightKey(withMood[withMood.length - 1].key);
  }, [moodSeries.points]);

  if (loading) {
    return (
      <div className={cn(progressPanelClass, "flex min-h-[420px] items-center justify-center gap-3")}>
        <Loader2 className="h-7 w-7 animate-spin text-[#B74783] motion-reduce:animate-none" />
        <p className="text-sm text-[#927C8B]">Loading your progress…</p>
      </div>
    );
  }

  if (authRequired) {
    return (
      <div
        className={cn(
          progressPanelClass,
          "flex min-h-[420px] flex-col items-center justify-center px-6 text-center"
        )}
      >
        <p className="text-base font-semibold text-[#49263D]">Sign in to see your progress</p>
        <Link
          href="/login"
          className={cn(
            "mt-4 rounded-full bg-[#B74783] px-5 py-2.5 text-sm font-semibold text-white",
            progressFocusClass
          )}
        >
          Sign in
        </Link>
      </div>
    );
  }

  const loggedMood = moodSeries.points.filter((point) => point.averageMood != null);
  const insight =
    insightLines[0] ??
    (moodsOk && loggedMood.length === 0
      ? "Log your mood a few more days to unlock personalized insights."
      : "Keep checking in — small, steady notes help you notice what supports you.");

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* Header — greeting + date + range */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#B74783]">
            Progress
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#49263D] sm:text-[1.85rem]">
            {greetingFor(now)}, {firstName(user?.name)}
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-[#927C8B]">
            Take a moment to see how you&apos;ve been feeling and what you&apos;ve finished.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center rounded-full border border-[#EADCE5] bg-white px-3.5 py-2 text-xs font-semibold text-[#795A70]">
            {formatLongDate(now)}
          </span>
          <div
            role="tablist"
            aria-label="Progress range"
            className="flex rounded-full border border-[#EADCE5] bg-white p-0.5"
          >
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={range === option.id}
                onClick={() => setRange(option.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[11px] font-semibold transition",
                  progressFocusClass,
                  range === option.id
                    ? "bg-gradient-to-r from-[#C45A96] to-[#A63F79] text-white"
                    : "text-[#795A70] hover:text-[#49263D]"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Top row: check-in · mood trend · habits */}
      <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
        <section className={cn(progressPanelClass, "p-5 lg:col-span-3")}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-[#49263D]">Mood check-in</h2>
              <p className="mt-0.5 text-[11px] text-[#957F94]">Period average</p>
            </div>
            <Sparkles className="h-4 w-4 text-[#B74783]" aria-hidden />
          </div>
          <div className="mt-4">
            {!moodsOk ? (
              <Status message="Mood check-ins couldn't load." onRetry={reload} />
            ) : (
              <MoodCheckInRing
                moodScore={avgMood}
                moodLabel={moodMeta.label}
                consistency={consistency}
                activeRatio={activeRatio}
              />
            )}
          </div>
          <ul className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[11px] font-semibold text-[#795A70]">
            <li className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#B74783]" /> Mood
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#D4845A]" /> Check-ins
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#E8A0C4]" /> Active days
            </li>
          </ul>
        </section>

        <section className={cn(progressPanelClass, "flex min-h-[280px] flex-col p-5 lg:col-span-5")}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-[#49263D]">Your mood trend</h2>
              <p className="mt-0.5 text-[11px] text-[#957F94]">
                {range === 7 ? "This week" : `Last ${range} days`}
              </p>
            </div>
          </div>
          <div className="mt-3 min-h-[200px] flex-1">
            {!moodsOk ? (
              <Status message="Mood check-ins couldn't load." onRetry={reload} />
            ) : loggedMood.length === 0 ? (
              <EmptyChart
                title="No check-ins yet"
                href="/dashboard?action=mood"
                cta="Log a mood"
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={moodSeries.points}
                  margin={{ top: 12, right: 4, left: -18, bottom: 0 }}
                  onMouseMove={(state) => {
                    const payload = (
                      state as { activePayload?: Array<{ payload?: { key?: string } }> }
                    )?.activePayload?.[0]?.payload;
                    if (payload?.key) setHighlightKey(payload.key);
                  }}
                >
                  <defs>
                    <linearGradient id="moodBarFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E8A0C4" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#FFF0F6" stopOpacity={0.85} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0E4EC" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#957F94", fontSize: 10 }}
                    interval="preserveStartEnd"
                    minTickGap={range === 7 ? 4 : 16}
                  />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip
                    cursor={{ fill: "rgba(183,71,131,0.06)" }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const point = payload[0]?.payload as (typeof moodSeries.points)[number];
                      if (!point || point.averageMood == null) return null;
                      const parts = moodParts(point.averageMood);
                      return (
                        <div className="rounded-2xl border border-[#EADCE5] bg-white px-3 py-2 shadow-md">
                          <p className="text-[11px] text-[#957F94]">{point.fullLabel}</p>
                          <p className="mt-0.5 text-sm font-semibold text-[#49263D]">
                            Mood score: {Math.round(point.averageMood)}/100
                          </p>
                          <p className="text-[11px] text-[#795A70]">
                            {parts.emoji} {parts.label}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="averageMood"
                    radius={[10, 10, 4, 4]}
                    maxBarSize={range === 7 ? 34 : 18}
                    isAnimationActive={!reduceMotion}
                  >
                    {moodSeries.points.map((point) => (
                      <Cell
                        key={point.key}
                        fill={
                          point.averageMood == null
                            ? "transparent"
                            : point.key === highlightKey
                              ? "#B74783"
                              : "url(#moodBarFill)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className={cn(progressPanelClass, "p-5 lg:col-span-4")}>
          <div>
            <h2 className="text-sm font-bold text-[#49263D]">Wellness habits</h2>
            <p className="mt-0.5 text-[11px] text-[#957F94]">
              Finished activities this period
            </p>
          </div>
          <ul className="mt-5 space-y-5">
            {habits.map((habit) => (
              <li key={habit.key}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                        habit.iconBg
                      )}
                    >
                      <habit.Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#49263D]">
                        {habit.label}
                      </p>
                      <p className="text-[11px] text-[#957F94]">{habit.display} sessions</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#795A70]">{habit.pct}%</span>
                </div>
                <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-[#F7F0F5]">
                  <div
                    className={cn("h-full rounded-full bg-gradient-to-r", habit.bar)}
                    style={{ width: `${habit.pct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          {!activityTotalsOk ? (
            <p className="mt-4 text-xs text-[#957F94]">Some activity sources couldn&apos;t load.</p>
          ) : null}
        </section>
      </div>

      {/* Mood & activity + insight */}
      <section
        className={cn(
          progressPanelClass,
          "relative overflow-hidden p-5 sm:p-6"
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#B74783]/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 left-1/3 h-40 w-40 rounded-full bg-[#D4845A]/10 blur-3xl"
        />

        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-base font-bold tracking-tight text-[#49263D] sm:text-lg">
            Mood & activity
          </h2>
          <ul className="flex items-center gap-3 text-[11px] font-semibold text-[#795A70]">
            <li className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF0F6] px-2.5 py-1">
              <span className="h-2 w-2 rounded-full bg-[#B74783]" />
              Mood
            </li>
            <li className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF1E9] px-2.5 py-1">
              <span className="h-2 w-2 rounded-full bg-[#D4845A]" />
              Activity
            </li>
          </ul>
        </div>

        <div className="relative mt-4 h-[220px] sm:h-[260px]">
          {!moodsOk && !activityTotalsOk ? (
            <Status message="Progress charts couldn't load." onRetry={reload} />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dualSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="dualMoodFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B74783" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#B74783" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="dualActFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4845A" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#D4845A" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0E4EC" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#957F94", fontSize: 10 }}
                  interval="preserveStartEnd"
                  minTickGap={range === 7 ? 8 : 18}
                />
                <YAxis
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                  tick={{ fill: "#957F94", fontSize: 10 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0]?.payload as (typeof dualSeries)[number];
                    if (!row) return null;
                    return (
                      <div className="rounded-2xl border border-[#EADCE5] bg-white px-3 py-2 shadow-md">
                        <p className="text-[11px] text-[#957F94]">{row.fullLabel}</p>
                        <p className="mt-1 text-xs font-semibold text-[#49263D]">
                          Mood: {row.mood == null ? "—" : Math.round(row.mood)}
                        </p>
                        <p className="text-xs font-semibold text-[#D4845A]">
                          Activities: {row.activityCount}
                        </p>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="mood"
                  stroke="#B74783"
                  strokeWidth={2.4}
                  fill="url(#dualMoodFill)"
                  connectNulls={false}
                  isAnimationActive={!reduceMotion}
                  dot={false}
                  activeDot={{ r: 5, fill: "#A63F79" }}
                />
                <Area
                  type="monotone"
                  dataKey="activityIndex"
                  stroke="#D4845A"
                  strokeWidth={2.2}
                  fill="url(#dualActFill)"
                  connectNulls
                  isAnimationActive={!reduceMotion}
                  dot={false}
                  activeDot={{ r: 4.5, fill: "#C56F45" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="relative mt-5 flex flex-col gap-3 rounded-[20px] border border-[#EADCE5]/80 bg-gradient-to-r from-[#FFF8FB] via-white to-[#FFF1E9]/70 p-4 sm:flex-row sm:items-center sm:gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1E9] text-[#D4845A] shadow-sm">
            <Lightbulb className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#D4845A]">
              Insight
            </p>
            <p className="mt-0.5 text-sm font-medium leading-snug text-[#49263D]">
              {insight}
            </p>
          </div>
          {(breakdown.logged.length > 0 || breakdown.plan.length > 0) && (
            <div className="flex flex-wrap gap-1.5 sm:justify-end">
              {breakdown.logged.slice(0, 3).map((row) => (
                <span
                  key={row.key}
                  className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-[#5C4A66] ring-1 ring-[#EADCE5]"
                >
                  {row.label} {row.count}
                </span>
              ))}
              {breakdown.plan.slice(0, 2).map((row) => (
                <span
                  key={row.key}
                  className="rounded-full bg-[#FFF0F6] px-2.5 py-1 text-[10px] font-semibold text-[#7A3E5C] ring-1 ring-[#EADCE5]/80"
                >
                  {row.label} {row.count}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Status({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex h-full min-h-[140px] flex-col items-center justify-center gap-2">
      <p className="text-sm text-[#795A70]">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className={cn(
          "rounded-full bg-[#B74783] px-3 py-1.5 text-xs font-semibold text-white",
          progressFocusClass
        )}
      >
        Try again
      </button>
    </div>
  );
}

function EmptyChart({
  title,
  href,
  cta,
}: {
  title: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="flex h-full min-h-[160px] flex-col items-center justify-center gap-2">
      <p className="text-sm font-semibold text-[#795A70]">{title}</p>
      <Link
        href={href}
        className={cn(
          "text-xs font-semibold text-[#B74783] underline-offset-2 hover:underline",
          progressFocusClass
        )}
      >
        {cta}
      </Link>
    </div>
  );
}
