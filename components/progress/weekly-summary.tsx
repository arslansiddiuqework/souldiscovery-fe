"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  format,
  parseISO,
  subDays,
  eachDayOfInterval,
  startOfDay,
} from "date-fns";
import {
  getWeeklyProgress,
  type DailyProgressData,
  type WeeklyProgressResponse,
} from "@/lib/api/progress";
import { getMoodHistory } from "@/lib/api/mood";
import { getActivityHistory } from "@/lib/api/activity";
import {
  Loader2,
  Activity,
  Clock,
  HeartPulse,
  Flame,
  ChevronRight,
  Smile,
  Lightbulb,
  BarChart3,
  Brain,
  Heart,
  Footprints,
  Moon,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";

type MoodRange = 7 | 30 | 90;

const DAILY_ACTIVITY_GOAL = 3;

const MOOD_BANDS = [
  { key: "great", label: "Great", emoji: "😄", min: 80, color: "#3D9B84" },
  { key: "good", label: "Good", emoji: "🙂", min: 65, color: "#5BB89A" },
  { key: "okay", label: "Okay", emoji: "😐", min: 45, color: "#D4A017" },
  { key: "low", label: "Low", emoji: "😔", min: 25, color: "#D4845A" },
  { key: "stressed", label: "Stressed", emoji: "😣", min: 0, color: "#C45A6A" },
] as const;

function moodFromScore(score: number | null | undefined) {
  if (score == null || Number.isNaN(score)) {
    return { label: "—", emoji: "·", color: "#B8A3B2" };
  }
  for (const band of MOOD_BANDS) {
    if (score >= band.min) {
      return { label: band.label, emoji: band.emoji, color: band.color };
    }
  }
  return MOOD_BANDS[MOOD_BANDS.length - 1];
}

function formatDuration(totalMinutes: number): string {
  const mins = Math.max(0, Math.round(totalMinutes));
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

const GAME_DURATION_BY_NAME: Record<string, number> = {
  breathing: 5,
  garden: 10,
  forest: 15,
  waves: 8,
  rain: 5,
  campfire: 5,
};

/** Match backend estimation when activity.duration was logged as 0. */
function effectiveActivityMinutes(activity: {
  type?: string;
  name?: string;
  duration?: number | null;
}): number {
  const stored = Number(activity.duration);
  if (Number.isFinite(stored) && stored > 0) return stored;

  const type = String(activity.type || "").toLowerCase();
  const name = String(activity.name || "").toLowerCase();
  if (type === "game" || GAME_DURATION_BY_NAME[name] != null) {
    return GAME_DURATION_BY_NAME[name] ?? 5;
  }
  switch (type) {
    case "meditation":
      return 10;
    case "exercise":
      return 20;
    case "walking":
      return 15;
    case "journaling":
      return 10;
    case "reading":
      return 15;
    case "music":
      return 10;
    case "therapy":
      return 15;
    default:
      return 5;
  }
}

function formatRangeLabel(daily: DailyProgressData[]): string {
  if (!daily.length) return "This week";
  const start = parseISO(daily[0].date);
  const end = parseISO(daily[daily.length - 1].date);
  return `${format(start, "MMM d, yyyy")} – ${format(end, "MMM d, yyyy")}`;
}

/** Compare second half of series vs first half; returns null if not enough data. */
function trendPercent(values: number[]): number | null {
  const nums = values.filter((v) => Number.isFinite(v));
  if (nums.length < 4) return null;
  const mid = Math.floor(nums.length / 2);
  const first = nums.slice(0, mid);
  const second = nums.slice(mid);
  const avg = (arr: number[]) =>
    arr.reduce((s, n) => s + n, 0) / Math.max(1, arr.length);
  const a = avg(first);
  const b = avg(second);
  if (a === 0) return b > 0 ? 100 : 0;
  return Math.round(((b - a) / Math.abs(a)) * 100);
}

function MiniSparkline({
  values,
  color = "#B74783",
}: {
  values: number[];
  color?: string;
}) {
  const w = 72;
  const h = 36;
  const max = Math.max(...values, 1);
  const pts = values
    .map((v, i) => {
      const x = values.length === 1 ? w / 2 : (i / (values.length - 1)) * w;
      const y = h - (v / max) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="opacity-90">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
    </svg>
  );
}

function MiniBars({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-9 items-end gap-0.5" aria-hidden>
      {values.map((v, i) => (
        <span
          key={i}
          className="w-1.5 rounded-t-sm bg-gradient-to-t from-[#C45A96] to-[#E8A0C8]"
          style={{ height: `${Math.max(12, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

function MoodYTick({ y, payload }: { y?: number; payload?: { value: number } }) {
  if (y == null || payload?.value == null) return null;
  const band = moodFromScore(payload.value);
  // Only render labels at band anchors
  const anchors = [90, 72, 55, 35, 12];
  if (!anchors.includes(payload.value)) return null;
  return (
    <g transform={`translate(0,${y})`}>
      <text x={-8} y={0} dy={4} textAnchor="end" fill="#795A70" fontSize={11}>
        {band.emoji} {band.label}
      </text>
    </g>
  );
}

export function WeeklySummary() {
  const [data, setData] =
    useState<WeeklyProgressResponse["data"] | null>(null);
  const [moodSeries, setMoodSeries] = useState<
    { date: string; dayLabel: string; averageMood: number | null }[]
  >([]);
  const [moodRange, setMoodRange] = useState<MoodRange>(7);
  const [breakdown, setBreakdown] = useState({
    mindfulnessMin: 0,
    therapySessions: 0,
    movementMin: 0,
    sleepHrs: null as number | null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [progressRes, activitiesRes] = await Promise.all([
          getWeeklyProgress(),
          getActivityHistory().catch(() => ({ success: false, data: [] })),
        ]);
        if (cancelled) return;
        if (!progressRes.success || !progressRes.data) {
          setError("Failed to fetch progress data");
          return;
        }
        setData(progressRes.data);

        // Activity type breakdown for this week
        const weekDates = new Set(progressRes.data.dailyData.map((d) => d.date));
        const acts = Array.isArray(activitiesRes.data) ? activitiesRes.data : [];
        let mindfulnessMin = 0;
        let movementMin = 0;
        let estimatedWeekMinutes = 0;
        for (const a of acts) {
          const ts = a.timestamp || a.createdAt;
          if (!ts) continue;
          const day = format(new Date(ts), "yyyy-MM-dd");
          if (!weekDates.has(day)) continue;
          const dur = effectiveActivityMinutes(a);
          estimatedWeekMinutes += dur;
          const type = String(a.type || a.name || "").toLowerCase();
          if (
            type.includes("mindful") ||
            type.includes("meditat") ||
            type.includes("breath") ||
            type.includes("journal") ||
            type === "game"
          ) {
            mindfulnessMin += dur;
          } else if (
            type.includes("walk") ||
            type.includes("exercise") ||
            type.includes("movement") ||
            type.includes("yoga")
          ) {
            movementMin += dur;
          }
        }

        // If API duration is 0 but we have activities, prefer estimated minutes
        const apiDuration = progressRes.data.summary.totalDuration || 0;
        const chartDuration = progressRes.data.dailyData.reduce(
          (s, d) => s + (d.activityDuration || 0),
          0
        );
        const resolvedDuration = Math.max(
          apiDuration,
          chartDuration,
          estimatedWeekMinutes
        );
        if (resolvedDuration > apiDuration) {
          setData({
            ...progressRes.data,
            summary: {
              ...progressRes.data.summary,
              totalDuration: resolvedDuration,
            },
            dailyData:
              chartDuration > 0
                ? progressRes.data.dailyData
                : progressRes.data.dailyData.map((d) => {
                    const dayActs = acts.filter((a) => {
                      const ts = a.timestamp || a.createdAt;
                      return (
                        ts &&
                        format(new Date(ts), "yyyy-MM-dd") === d.date
                      );
                    });
                    const dayMins = dayActs.reduce(
                      (s: number, a) => s + effectiveActivityMinutes(a),
                      0
                    );
                    return {
                      ...d,
                      activityDuration: Math.max(d.activityDuration || 0, dayMins),
                    };
                  }),
          });
        }

        setBreakdown({
          mindfulnessMin,
          therapySessions: progressRes.data.summary.therapySessionsCount,
          movementMin,
          sleepHrs: null,
        });
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "An error occurred");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const end = new Date();
        const start = startOfDay(subDays(end, moodRange - 1));
        const res = await getMoodHistory({
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          limit: 500,
        });
        if (cancelled) return;
        const entries = Array.isArray(res.data) ? res.data : [];
        const days = eachDayOfInterval({ start, end });
        const series = days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayMoods = entries.filter((m) => {
            const t = m.timestamp || m.createdAt;
            return t && format(new Date(t), "yyyy-MM-dd") === dateStr;
          });
          const averageMood =
            dayMoods.length > 0
              ? dayMoods.reduce(
                  (s: number, m: { score?: number }) => s + (m.score || 0),
                  0
                ) / dayMoods.length
              : null;
          return {
            date: dateStr,
            dayLabel:
              moodRange === 7
                ? format(day, "EEE d")
                : format(day, moodRange === 30 ? "MMM d" : "M/d"),
            averageMood,
          };
        });
        setMoodSeries(series);
      } catch {
        // Fall back to weekly progress moods when history fails
        if (!cancelled && data?.dailyData) {
          setMoodSeries(
            data.dailyData.map((d) => ({
              date: d.date,
              dayLabel: `${d.dayLabel} ${d.date.slice(8)}`,
              averageMood: d.averageMood,
            }))
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [moodRange, data]);

  const chartMood = useMemo(() => {
    if (moodSeries.length) return moodSeries;
    return (
      data?.dailyData.map((d) => ({
        date: d.date,
        dayLabel: `${d.dayLabel} ${d.date.slice(8)}`,
        averageMood: d.averageMood,
      })) || []
    );
  }, [moodSeries, data]);

  const insight = useMemo(() => {
    const scores = chartMood
      .map((d) => d.averageMood)
      .filter((v): v is number => v != null);
    const trend = trendPercent(scores);
    if (trend == null) {
      return "Log your mood a few more days to unlock personalized insights.";
    }
    if (trend > 5) {
      return "Good progress! Your mood has been improving this week. Keep up the positive habits!";
    }
    if (trend < -5) {
      return "This stretch looks heavier. Be gentle with yourself — small check-ins and rest still count.";
    }
    return "Your mood has been fairly steady. Consistency is a win — keep noticing what helps.";
  }, [chartMood]);

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-[22px] border border-[#EEDCE9] bg-white shadow-[0_8px_28px_rgba(123,57,98,0.06)]">
        <Loader2 className="h-8 w-8 animate-spin text-[#B74783]" />
        <p className="text-sm text-[#927C8B]">Loading your progress…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-64 items-center justify-center rounded-[22px] border border-[#EEDCE9] bg-white px-6 text-center shadow-[0_8px_28px_rgba(123,57,98,0.06)]">
        <p className="text-sm text-destructive">
          {error || "No data available"}
        </p>
      </div>
    );
  }

  const { summary, dailyData } = data;
  const activityTrend = trendPercent(dailyData.map((d) => d.activitiesCount));
  const durationTrend = trendPercent(dailyData.map((d) => d.activityDuration));
  const therapyProxy = dailyData.map((d) =>
    d.activitiesCount > 0 || (d.averageMood != null) ? 1 : 0
  );
  // Approximate therapy trend from session density vs week midpoint using summary spread
  const therapyTrend =
    summary.therapySessionsCount > 0
      ? trendPercent(
          dailyData.map((_, i) =>
            i >= dailyData.length - summary.therapySessionsCount ? 1 : 0
          )
        )
      : null;

  const summaryCards = [
    {
      title: "Activities",
      value: String(summary.totalActivities),
      description: "Total this week",
      icon: Activity,
      iconBg: "bg-[#EDF2FF] text-[#5B7CDA]",
      trend: activityTrend,
      visual: (
        <MiniSparkline
          values={dailyData.map((d) => d.activitiesCount)}
          color="#8B6BC7"
        />
      ),
    },
    {
      title: "Duration",
      value: formatDuration(summary.totalDuration),
      description: "Time spent active",
      icon: Clock,
      iconBg: "bg-[#FFF0F6] text-[#B74783]",
      trend: durationTrend,
      visual: <MiniBars values={dailyData.map((d) => d.activityDuration)} />,
    },
    {
      title: "Therapy",
      value: String(summary.therapySessionsCount),
      description: "Sessions this week",
      icon: HeartPulse,
      iconBg: "bg-[#EAF6F2] text-[#3D9B84]",
      trend: therapyTrend,
      visual: (
        <MiniSparkline
          values={therapyProxy}
          color="#3D9B84"
        />
      ),
    },
    {
      title: "Streak",
      value: `${summary.currentStreak} ${
        summary.currentStreak === 1 ? "day" : "days"
      }`,
      description: "Keep it up!",
      icon: Flame,
      iconBg: "bg-[#FFF1E9] text-[#D4845A]",
      trend: null,
      visual: (
        <Flame className="h-10 w-10 text-[#E8A06A]" strokeWidth={1.5} aria-hidden />
      ),
    },
  ];

  const rangeLabel = formatRangeLabel(dailyData);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500">
      {/* Date range chip (page header can also show this) */}
      <div className="flex justify-end md:hidden">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#EEDCE9] bg-white px-3.5 py-2 text-xs font-semibold text-[#795A70] shadow-sm">
          <CalendarDays className="h-3.5 w-3.5 text-[#B74783]" />
          {rangeLabel}
        </span>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((stat) => (
          <article
            key={stat.title}
            className="group relative overflow-hidden rounded-[22px] border border-[#EEDCE9] bg-white p-5 shadow-[0_8px_28px_rgba(123,57,98,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(123,57,98,0.09)]"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    stat.iconBg
                  )}
                >
                  <stat.icon className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#957F94]">
                  {stat.title}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-[#D4C0CE] transition group-hover:text-[#B74783]" />
            </div>

            <div className="mt-4 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[1.75rem] font-bold leading-none tracking-[-0.03em] text-[#49263D]">
                  {stat.value}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {stat.trend != null && stat.trend !== 0 && (
                    <span
                      className={cn(
                        "text-xs font-bold",
                        stat.trend > 0 ? "text-[#3D9B84]" : "text-[#C45A6A]"
                      )}
                    >
                      {stat.trend > 0 ? "↑" : "↓"} {Math.abs(stat.trend)}%
                    </span>
                  )}
                  <span className="text-xs text-[#957F94]">{stat.description}</span>
                </div>
              </div>
              <div className="shrink-0">{stat.visual}</div>
            </div>
          </article>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Mood Trends */}
        <section className="flex flex-col rounded-[22px] border border-[#EEDCE9] bg-white p-5 shadow-[0_8px_28px_rgba(123,57,98,0.05)] md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0F6] text-[#B74783]">
                <Smile className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold tracking-[-0.02em] text-[#49263D]">
                  Mood Trends
                </h2>
                <p className="mt-0.5 text-sm text-[#957F94]">
                  Your mood pattern over the last {moodRange} days.
                </p>
              </div>
            </div>
            <div
              role="tablist"
              aria-label="Mood range"
              className="flex rounded-full border border-[#EEDCE9] bg-[#FCF8FC] p-1"
            >
              {([7, 30, 90] as const).map((range) => (
                <button
                  key={range}
                  type="button"
                  role="tab"
                  aria-selected={moodRange === range}
                  onClick={() => setMoodRange(range)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                    moodRange === range
                      ? "bg-gradient-to-r from-[#C45A96] to-[#A63F79] text-white shadow-sm"
                      : "text-[#795A70] hover:text-[#49263D]"
                  )}
                >
                  {range} Days
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartMood}
                margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C45A96" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#C45A96" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F0E4EC"
                />
                <XAxis
                  dataKey="dayLabel"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#957F94", fontSize: 11 }}
                  interval={moodRange === 7 ? 0 : "preserveStartEnd"}
                  minTickGap={moodRange === 7 ? 8 : 24}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[12, 35, 55, 72, 90]}
                  axisLine={false}
                  tickLine={false}
                  width={72}
                  tick={<MoodYTick />}
                />
                <Tooltip
                  cursor={{ stroke: "#E8C5D8", strokeWidth: 1 }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const score = payload[0]?.value as number | null;
                    const mood = moodFromScore(score);
                    return (
                      <div className="rounded-2xl border border-[#EEDCE9] bg-white px-3.5 py-2.5 shadow-[0_12px_32px_rgba(123,57,98,0.14)]">
                        <p className="text-[11px] font-medium text-[#957F94]">
                          {label}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#49263D]">
                          <span>{mood.emoji}</span>
                          Mood: {mood.label}
                          {score != null && (
                            <span className="font-medium text-[#957F94]">
                              ({Math.round(score)})
                            </span>
                          )}
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
                  fill="url(#moodFill)"
                  connectNulls
                  dot={{ r: 4, fill: "#B74783", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#A63F79" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex items-start gap-2.5 rounded-[16px] border border-[#F3D4E6] bg-[#FFF0F6] px-4 py-3">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#B74783]" />
            <p className="flex-1 text-sm leading-relaxed text-[#512943]">
              {insight}
            </p>
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[#D4A0C0]" />
          </div>
        </section>

        {/* Activity Volume */}
        <section className="flex flex-col rounded-[22px] border border-[#EEDCE9] bg-white p-5 shadow-[0_8px_28px_rgba(123,57,98,0.05)] md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2ECFF] text-[#8B6BC7]">
                <BarChart3 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold tracking-[-0.02em] text-[#49263D]">
                  Activity Volume
                </h2>
                <p className="mt-0.5 text-sm text-[#957F94]">
                  Number of activities completed per day.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center rounded-full border border-[#EEDCE9] bg-[#FCF8FC] px-3 py-1.5 text-xs font-semibold text-[#795A70]">
              This Week
            </span>
          </div>

          <div className="mt-4 h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyData}
                margin={{ top: 12, right: 8, left: -8, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C45A96" />
                    <stop offset="100%" stopColor="#8B6BC7" />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F0E4EC"
                />
                <XAxis
                  dataKey="dayLabel"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#957F94", fontSize: 11 }}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#957F94", fontSize: 11 }}
                  width={28}
                />
                <Tooltip
                  cursor={{ fill: "rgba(183,71,131,0.08)" }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-2xl border border-[#EEDCE9] bg-white px-3.5 py-2.5 shadow-[0_12px_32px_rgba(123,57,98,0.14)]">
                        <p className="text-[11px] text-[#957F94]">{label}</p>
                        <p className="mt-1 text-sm font-semibold text-[#49263D]">
                          {payload[0].value as number} activities
                        </p>
                      </div>
                    );
                  }}
                />
                <ReferenceLine
                  y={DAILY_ACTIVITY_GOAL}
                  stroke="#E8A0C8"
                  strokeDasharray="5 5"
                  label={{
                    value: `Daily goal ${DAILY_ACTIVITY_GOAL}`,
                    position: "insideTopRight",
                    fill: "#B74783",
                    fontSize: 11,
                  }}
                />
                <Bar dataKey="activitiesCount" radius={[10, 10, 4, 4]} maxBarSize={36}>
                  {dailyData.map((_, i) => (
                    <Cell key={i} fill="url(#barFill)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              {
                label: "Mindfulness",
                value:
                  breakdown.mindfulnessMin > 0
                    ? formatDuration(breakdown.mindfulnessMin)
                    : "—",
                icon: Brain,
                tint: "bg-[#F2ECFF] text-[#8B6BC7]",
              },
              {
                label: "Therapy",
                value: `${breakdown.therapySessions} session${
                  breakdown.therapySessions === 1 ? "" : "s"
                }`,
                icon: Heart,
                tint: "bg-[#FFF0F6] text-[#B74783]",
              },
              {
                label: "Movement",
                value:
                  breakdown.movementMin > 0
                    ? formatDuration(breakdown.movementMin)
                    : "—",
                icon: Footprints,
                tint: "bg-[#EAF6F2] text-[#3D9B84]",
              },
              {
                label: "Active time",
                value: formatDuration(summary.totalDuration),
                icon: Moon,
                tint: "bg-[#EDF2FF] text-[#5B7CDA]",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[14px] border border-[#EEDCE9] bg-[#FCF8FC] px-3 py-2.5"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full",
                      item.tint
                    )}
                  >
                    <item.icon className="h-3 w-3" />
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-[#957F94]">
                    {item.label}
                  </span>
                </div>
                <p className="mt-1.5 text-sm font-bold text-[#49263D]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function ProgressDateRangeChip({
  className,
}: {
  className?: string;
}) {
  const [label, setLabel] = useState("This week");
  useEffect(() => {
    getWeeklyProgress()
      .then((res) => {
        if (res.success && res.data?.dailyData?.length) {
          setLabel(formatRangeLabel(res.data.dailyData));
        }
      })
      .catch(() => undefined);
  }, []);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[#EEDCE9] bg-white px-3.5 py-2 text-xs font-semibold text-[#795A70] shadow-[0_4px_14px_rgba(123,57,98,0.05)]",
        className
      )}
    >
      <CalendarDays className="h-3.5 w-3.5 text-[#B74783]" />
      {label}
    </span>
  );
}
