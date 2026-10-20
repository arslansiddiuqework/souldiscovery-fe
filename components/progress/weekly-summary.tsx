"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  CalendarDays,
  Flame,
  Lightbulb,
  Loader2,
  Smile,
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
  formatPeriodLabel,
  inPeriod,
  localDateKey,
  MOOD_AXIS_TICKS,
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
import { cn } from "@/lib/utils";
import { progressFocusClass, progressPanelClass } from "./panel";

const EMPTY_SOURCES = {
  moods: [] as MoodRecord[],
  activities: [] as ActivityRecord[],
  planTasks: [] as PlanTaskRecord[],
  assessments: [] as AssessmentRecord[],
};

const RANGE_OPTIONS: Array<{ id: Exclude<ProgressRange, "all">; label: string }> = [
  { id: 7, label: "7 Days" },
  { id: 30, label: "30 Days" },
  { id: 90, label: "90 Days" },
];

function MoodYTick({ y, payload }: { y?: number; payload?: { value?: number } }) {
  if (y == null || payload?.value == null) return null;
  const tick = MOOD_AXIS_TICKS.find((item) => item.value === payload.value);
  if (!tick) return null;
  return (
    <g transform={`translate(0,${y})`}>
      <text x={-4} y={0} dy={3} textAnchor="end" fill="#795A70" fontSize={10}>
        {tick.label}
      </text>
    </g>
  );
}

function MiniSparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(1, ...values);
  const points = values
    .map((value, index) => {
      const x = values.length <= 1 ? 28 : (index / (values.length - 1)) * 56;
      const y = 28 - (value / max) * 22;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width="56" height="32" viewBox="0 0 56 32" aria-hidden className="opacity-80">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" points={points} />
    </svg>
  );
}

export function WeeklySummary() {
  const reduceMotion = useReducedMotion();
  const [range, setRange] = useState<Exclude<ProgressRange, "all">>(7);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [sources, setSources] = useState(EMPTY_SOURCES);
  const [errors, setErrors] = useState<Partial<Record<SourceKey, string>>>({});
  const [reloadKey, setReloadKey] = useState(0);
  const [now, setNow] = useState(() => new Date());

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

  const insightLines = useMemo(() => {
    if (!moodsOk && !activityTotalsOk) return [];
    return buildInsights({
      range,
      activities: activityTotalsOk ? periodFinished.length : 0,
      previousActivities: activityTotalsOk ? previousFinished : null,
      moodDays: moodsOk ? moodDayCount : 0,
    });
  }, [moodsOk, activityTotalsOk, range, periodFinished.length, previousFinished, moodDayCount]);

  const activityDelta =
    activityTotalsOk && previousFinished != null && periodFinished.length > previousFinished
      ? periodFinished.length - previousFinished
      : null;

  const sparkValues = activityBars.bars.map((bar) => bar.count);
  const periodLabel = formatPeriodLabel(bounds);

  if (loading) {
    return (
      <div className={cn(progressPanelClass, "flex h-full items-center justify-center gap-3")}>
        <Loader2 className="h-7 w-7 animate-spin text-[#B74783] motion-reduce:animate-none" />
        <p className="text-sm text-[#927C8B]">Loading your progress…</p>
      </div>
    );
  }

  if (authRequired) {
    return (
      <div className={cn(progressPanelClass, "flex h-full flex-col items-center justify-center px-6 text-center")}>
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

  const summaryCards = [
    {
      title: "Activities",
      value: activityTotalsOk ? String(periodFinished.length) : "—",
      description: "Finished this period",
      icon: Activity,
      iconBg: "bg-[#EDF2FF] text-[#5B7CDA]",
      extra:
        activityDelta != null && activityDelta > 0 ? (
          <span className="text-xs font-bold text-[#3D9B84]">↑ +{activityDelta}</span>
        ) : null,
      visual: <MiniSparkline values={sparkValues} color="#8B6BC7" />,
    },
    {
      title: "Check-ins",
      value: moodsOk ? String(periodMoods.length) : "—",
      description: "Mood logs saved",
      icon: Smile,
      iconBg: "bg-[#FFF0F6] text-[#B74783]",
      extra: null,
      visual: (
        <MiniSparkline
          values={moodSeries.points.map((point) =>
            point.averageMood == null ? 0 : 1
          )}
          color="#B74783"
        />
      ),
    },
    {
      title: "Mood days",
      value: moodsOk ? String(moodDayCount) : "—",
      description: "Days with a check-in",
      icon: CalendarDays,
      iconBg: "bg-[#EAF6F2] text-[#3D9B84]",
      extra: null,
      visual: <MiniSparkline values={sparkValues.map((v) => (v > 0 ? 1 : 0))} color="#3D9B84" />,
    },
    {
      title: "Active days",
      value: daysOk ? String(activeDays) : "—",
      description: `of ${range} days`,
      icon: Flame,
      iconBg: "bg-[#FFF1E9] text-[#D4845A]",
      extra: null,
      visual: <Flame className="h-9 w-9 text-[#E8A06A]" strokeWidth={1.5} aria-hidden />,
    },
  ];

  const loggedMood = moodSeries.points.filter((point) => point.averageMood != null);
  const insight =
    insightLines[0] ??
    (moodsOk && loggedMood.length === 0
      ? "Log your mood a few more days to unlock personalized insights."
      : null);

  return (
    <div className="flex h-full min-h-0 flex-col gap-2.5 overflow-hidden max-lg:overflow-y-auto">
      <header className="flex shrink-0 flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF0F6] text-[#B74783]">
              <Activity className="h-4 w-4" aria-hidden />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[#49263D]">Your Progress</h1>
          </div>
          <p className="mt-1 text-sm text-[#957F94]">
            Track your mood and finished activities over time.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#EEDCE9] bg-white px-3.5 py-2 text-xs font-semibold text-[#795A70] shadow-sm">
          <CalendarDays className="h-3.5 w-3.5 text-[#B74783]" aria-hidden />
          {periodLabel}
        </span>
      </header>

      <div className="grid shrink-0 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((stat) => (
          <article
            key={stat.title}
            className={cn(progressPanelClass, "px-4 py-3.5")}
            aria-label={`${stat.title}: ${stat.value}. ${stat.description}`}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  stat.iconBg
                )}
              >
                <stat.icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#957F94]">
                {stat.title}
              </p>
            </div>
            <div className="mt-3 flex items-end justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[1.65rem] font-bold leading-none tracking-[-0.03em] text-[#49263D]">
                  {stat.value}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  {stat.extra}
                  <span className="text-xs text-[#957F94]">{stat.description}</span>
                </div>
              </div>
              <div className="shrink-0">{stat.visual}</div>
            </div>
          </article>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 gap-2.5 max-lg:min-h-[560px] lg:grid-cols-2 lg:overflow-hidden">
        <section className={cn(progressPanelClass, "flex min-h-0 flex-col p-4 lg:h-full")}>
          <div className="flex shrink-0 flex-wrap items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF0F6] text-[#B74783]">
                <Smile className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <h2 className="text-base font-bold text-[#49263D]">Mood Trends</h2>
                <p className="text-xs text-[#957F94]">Last {range} days</p>
              </div>
            </div>
            <div
              role="tablist"
              aria-label="Mood range"
              className="flex rounded-full border border-[#EEDCE9] bg-[#FCF8FC] p-0.5"
            >
              {RANGE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={range === option.id}
                  onClick={() => setRange(option.id)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                    progressFocusClass,
                    range === option.id
                      ? "bg-gradient-to-r from-[#C45A96] to-[#A63F79] text-white shadow-sm"
                      : "text-[#795A70] hover:text-[#49263D]"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2 min-h-0 flex-1">
            {!moodsOk ? (
              <Status message="Mood check-ins couldn't load." onRetry={reload} />
            ) : loggedMood.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm font-semibold text-[#795A70]">No check-ins yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={moodSeries.points}
                  margin={{ top: 8, right: 6, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="moodFillClassic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C45A96" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#C45A96" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0E4EC" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#957F94", fontSize: 10 }}
                    interval="preserveStartEnd"
                    minTickGap={range === 7 ? 8 : 20}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={MOOD_AXIS_TICKS.map((tick) => tick.value)}
                    axisLine={false}
                    tickLine={false}
                    width={58}
                    tick={<MoodYTick />}
                  />
                  <Tooltip
                    cursor={{ stroke: "#E8C5D8", strokeWidth: 1 }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const point = payload[0]?.payload as (typeof moodSeries.points)[number];
                      if (!point || point.averageMood == null) return null;
                      const parts = moodParts(point.averageMood);
                      return (
                        <div className="rounded-2xl border border-[#EEDCE9] bg-white px-3 py-2 shadow-md">
                          <p className="text-[11px] text-[#957F94]">{point.fullLabel}</p>
                          <p className="mt-0.5 text-sm font-semibold text-[#49263D]">
                            {parts.emoji} {parts.label} ({Math.round(point.averageMood)})
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="averageMood"
                    stroke="#B74783"
                    strokeWidth={2.5}
                    fill="url(#moodFillClassic)"
                    connectNulls={false}
                    isAnimationActive={!reduceMotion}
                    dot={{ r: 3.5, fill: "#B74783", strokeWidth: 0 }}
                    activeDot={{ r: 5.5, fill: "#A63F79" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {insight ? (
            <div className="mt-2 flex shrink-0 items-start gap-2 rounded-[14px] border border-[#F3D4E6] bg-[#FFF0F6] px-3 py-2">
              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B74783]" aria-hidden />
              <p className="text-xs leading-relaxed text-[#512943]">{insight}</p>
            </div>
          ) : null}
        </section>

        <section className={cn(progressPanelClass, "flex min-h-0 flex-col p-4 lg:h-full")}>
          <div className="flex shrink-0 items-start gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F2ECFF] text-[#8B6BC7]">
              <BarChart3 className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-[#49263D]">Activity Volume</h2>
              <p className="text-xs text-[#957F94]">Finished activities in this period</p>
            </div>
            <span className="rounded-full border border-[#EEDCE9] bg-[#FCF8FC] px-2.5 py-1 text-[11px] font-semibold text-[#795A70]">
              {range === 7 ? "This week" : `Last ${range}d`}
            </span>
          </div>

          <div className="mt-2 min-h-0 flex-1">
            {!activityTotalsOk && errors.activities && errors.plans ? (
              <Status message="Activities couldn't load." onRetry={reload} />
            ) : periodFinished.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-1">
                <p className="text-sm font-semibold text-[#795A70]">None finished yet</p>
                <Link
                  href="/dashboard"
                  className={cn(
                    "text-xs font-semibold text-[#B74783] underline-offset-2 hover:underline",
                    progressFocusClass
                  )}
                >
                  Log on Dashboard
                </Link>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activityBars.bars}
                  margin={{ top: 8, right: 4, left: -12, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0E4EC" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#957F94", fontSize: 10 }}
                    interval="preserveStartEnd"
                    minTickGap={10}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#957F94", fontSize: 10 }}
                    width={26}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(183,71,131,0.06)" }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const bar = payload[0]?.payload as (typeof activityBars.bars)[number];
                      if (!bar) return null;
                      return (
                        <div className="rounded-2xl border border-[#EEDCE9] bg-white px-3 py-2 shadow-md">
                          <p className="text-[11px] text-[#957F94]">{bar.fullLabel}</p>
                          <p className="mt-0.5 text-sm font-semibold text-[#49263D]">
                            {bar.count === 0 ? "None finished" : `${bar.count} finished`}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[6, 6, 2, 2]}
                    maxBarSize={28}
                    isAnimationActive={!reduceMotion}
                  >
                    {activityBars.bars.map((bar) => (
                      <Cell key={bar.key} fill={bar.count > 0 ? "#8B6BC7" : "transparent"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-2 flex shrink-0 flex-wrap gap-1.5">
            {(activitiesOk ? breakdown.logged : []).map((row) => (
              <span
                key={row.key}
                className="rounded-full bg-[#F7F2FA] px-2.5 py-1 text-[10px] font-semibold text-[#5C4A66]"
              >
                {row.label} {row.count}
              </span>
            ))}
            {(plansOk ? breakdown.plan : []).map((row) => (
              <span
                key={row.key}
                className="rounded-full bg-[#FFF0F6] px-2.5 py-1 text-[10px] font-semibold text-[#7A3E5C]"
              >
                Plan {row.label} {row.count}
              </span>
            ))}
            {periodFinished.length === 0 ? (
              <span className="text-[10px] font-semibold text-[#957F94]">No activity types yet</span>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

function Status({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
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
