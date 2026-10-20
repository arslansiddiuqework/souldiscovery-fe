"use client";

import { useEffect, useState } from "react";
import {
  Flame,
  CheckCircle2,
  AlertTriangle,
  BrainCircuit,
  Trophy,
  Heart,
  Loader2,
  ArrowRight,
  CalendarDays,
  Lock,
  Sparkles,
  PenLine,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WellnessPlan } from "@/lib/wellness-plan/types";
import {
  computePlanProgress,
  getCurrentDay,
  getCurrentWeek,
  getPlanDayNumber,
} from "@/lib/wellness-plan/generate-plan";
import { generateWellnessInsights } from "@/lib/wellness-plan/insights";
import { TodaysMission } from "./todays-mission";
import { PlanRoadmap } from "./plan-roadmap";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getMoodHistory } from "@/lib/api/mood";
import { format, subDays } from "date-fns";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const ACHIEVEMENT_ICONS: Record<string, typeof Flame> = {
  heart: Heart,
  flame: Flame,
  trophy: Trophy,
  pen: PenLine,
  sparkles: Sparkles,
  check: CheckCircle2,
  star: Star,
};

interface PlanDashboardProps {
  plan: WellnessPlan;
  onTaskClick: (taskId: string) => void;
  onRefreshReport: () => void;
  onReset?: () => void;
  onDismissSuggestion?: () => void;
  onApplySuggestion?: () => void;
  savedNote?: string | null;
  onDismissSaved?: () => void;
}

export function PlanDashboard({
  plan,
  onTaskClick,
  onRefreshReport,
  onReset,
  onDismissSuggestion,
  onApplySuggestion,
  savedNote,
  onDismissSaved,
}: PlanDashboardProps) {
  const { percent, completedTasks, totalTasks } = computePlanProgress(plan);
  const today = getCurrentDay(plan);
  const week = getCurrentWeek(plan);
  const insights = generateWellnessInsights(plan).slice(0, 2);
  const latestReport = plan.weeklyReports[plan.weeklyReports.length - 1];
  const unlocked = plan.achievements.filter((a) => a.unlockedAt).length;
  const currentDayNumber = getPlanDayNumber(plan);
  const daysLeft = Math.max(plan.durationDays - currentDayNumber, 0);

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-[#EADCE5]/85 bg-white/82 shadow-[0_22px_55px_rgba(183,71,131,0.12)] backdrop-blur-xl">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-[#FFF0F6]/50 via-transparent to-[#F0EAFE]/40"
      />

      <header className="relative shrink-0 border-b border-[#EADCE5]/70 bg-gradient-to-r from-[#FFF8FB]/95 via-white/90 to-[#FFF0F6]/70 px-3 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate font-display text-lg font-bold tracking-tight text-[#49263D] sm:text-xl">
                {plan.title}
              </h1>
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[#FFF0F6] to-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#B74783] ring-1 ring-[#F0CADA]">
                {plan.challengeLevel} · {plan.durationDays} days
              </span>
            </div>
            <p className="mt-0.5 text-[12px] leading-relaxed text-[#927C8B]">
              {week
                ? `Week ${week.weekNumber} of ${plan.weeks.length} · ${week.focus} `
                : ""}
              A short sequence you chose. It does not diagnose or treat a condition.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <MetricChip
              icon={CalendarDays}
              value={`${currentDayNumber}`}
              label="Day"
            />
            <MetricChip
              icon={CheckCircle2}
              value={`${completedTasks}/${totalTasks}`}
              label="Done"
            />
          </div>

          {onReset && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-full text-[12px] text-[#927C8B] hover:bg-[#FFF0F6] hover:text-[#49263D]"
              onClick={onReset}
            >
              New plan
            </Button>
          )}
        </div>
      </header>

      {plan.pendingSuggestion && (
        <div className="shrink-0 border-b border-[#B74783]/15 bg-[#FFF0F6] px-3 py-2 sm:px-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B74783]" />
              <p className="text-[13px] text-[#49263D]">
                {plan.pendingSuggestion.message}
              </p>
            </div>
            <div className="flex gap-1.5">
              {onDismissSuggestion && (
                <Button variant="ghost" size="sm" className="h-8" onClick={onDismissSuggestion}>
                  Later
                </Button>
              )}
              {onApplySuggestion && (
                <Button
                  size="sm"
                  className="h-8 rounded-full bg-gradient-to-r from-[#B74783] to-[#9F376F] text-white hover:brightness-[1.03]"
                  onClick={onApplySuggestion}
                >
                  Update
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 p-3 sm:p-4">
          {savedNote && (
            <div className="flex items-start justify-between gap-3 rounded-2xl border border-[#EADCE5] bg-[#FFF8FB] px-4 py-3">
              <p className="text-sm leading-relaxed text-[#49263D]">{savedNote}</p>
              {onDismissSaved && (
                <button
                  type="button"
                  onClick={onDismissSaved}
                  className="shrink-0 text-xs font-semibold text-[#B74783] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
                >
                  Stay here
                </button>
              )}
            </div>
          )}

          <section>
            <TodaysMission day={today} onTaskClick={onTaskClick} hideAmbience />
          </section>

          <details className="rounded-[22px] border border-[#EADCE5] bg-white px-4 py-3">
            <summary className="cursor-pointer font-display text-sm font-bold text-[#49263D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]">
              Rest of this plan
            </summary>
            <div className="mt-3">
              <PlanRoadmap plan={plan} onTaskClick={onTaskClick} />
            </div>
          </details>

          <details className="rounded-[22px] border border-[#EADCE5] bg-[#FFF8FB] px-4 py-3">
            <summary className="cursor-pointer font-display text-sm font-bold text-[#49263D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]">
              Journey details
            </summary>
          <aside className="mt-3 flex flex-col gap-2.5">
          {/* Journey snapshot */}
          <div className="rounded-[22px] border border-[#EADCE5] bg-gradient-to-br from-white via-[#FFF8FB] to-[#FFF0F6]/80 p-3.5 shadow-[0_10px_28px_rgba(123,57,98,0.07)]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#B74783]">
                  Your journey
                </p>
                <p className="mt-0.5 font-display text-[15px] font-bold text-[#49263D]">
                  Week {week?.weekNumber ?? 1} of {plan.weeks.length}
                </p>
              </div>
              <span className="rounded-full bg-[#FFF0F6] px-2.5 py-1 text-[11px] font-bold tabular-nums text-[#B74783] ring-1 ring-[#F0CADA]">
                {percent}%
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white ring-1 ring-[#F0CADA]/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#B74783] to-[#9F376F] transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px] font-semibold text-[#927C8B]">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 ring-1 ring-[#EADCE5]">
                <CalendarDays className="h-3 w-3 text-[#B74783]" />
                Day {currentDayNumber} of {plan.durationDays}
              </span>
              <span className="rounded-full bg-white/90 px-2 py-1 ring-1 ring-[#EADCE5]">
                {daysLeft} days left
              </span>
              <span className="rounded-full bg-white/90 px-2 py-1 ring-1 ring-[#EADCE5]">
                {completedTasks}/{totalTasks} tasks
              </span>
              <span className="rounded-full bg-white/90 px-2 py-1 ring-1 ring-[#EADCE5]">
                Streak {plan.currentStreak}
              </span>
            </div>
          </div>

          {/* Insights */}
          <div className="rounded-[22px] border border-[#EADCE5] bg-white p-3.5 shadow-[0_8px_22px_rgba(123,57,98,0.06)]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFF0F6] to-[#F4E8FF] text-[#B74783] ring-1 ring-[#F0CADA]/70">
                  <BrainCircuit className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-display text-[15px] font-bold text-[#49263D]">
                    Insights
                  </p>
                  <p className="text-[11px] text-[#927C8B]">
                    Patterns from your plan
                  </p>
                </div>
              </div>
            </div>
            <ul className="mt-3 space-y-2">
              {insights.length === 0 ? (
                <li className="rounded-2xl border border-dashed border-[#EADCE5] bg-[#FFF8FB] px-3 py-3 text-[12.5px] leading-relaxed text-[#927C8B]">
                  Finish a few practices and we&apos;ll surface what&apos;s
                  working for you.
                </li>
              ) : (
                insights.map((insight, index) => (
                  <li
                    key={insight.title}
                    className="relative overflow-hidden rounded-2xl bg-[#FFF8FB] px-3 py-2.5 ring-1 ring-[#EADCE5]/80"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#B74783] to-[#9F376F]"
                    />
                    <div className="flex items-center gap-2 pl-1.5">
                      <span className="text-[10px] font-bold tabular-nums text-[#B74783]">
                        0{index + 1}
                      </span>
                      <p className="text-[13px] font-semibold text-[#49263D]">
                        {insight.title}
                      </p>
                    </div>
                    <p className="mt-1 pl-1.5 text-[12px] leading-snug text-[#927C8B]">
                      {insight.description}
                    </p>
                  </li>
                ))
              )}
            </ul>
            <Link
              href="/progress"
              className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-[#B74783] transition hover:gap-1.5"
            >
              Full progress
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <CompactMoodChart />

          {/* Weekly review */}
          <div className="rounded-[22px] border border-[#EADCE5] bg-white p-3.5 shadow-[0_8px_22px_rgba(123,57,98,0.06)]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-display text-[15px] font-bold text-[#49263D]">
                  Weekly review
                </p>
                <p className="mt-0.5 text-[11px] text-[#927C8B]">
                  Week {week?.weekNumber ?? 1} summary
                </p>
              </div>
              <button
                type="button"
                onClick={onRefreshReport}
                className="rounded-full bg-gradient-to-r from-[#B74783] to-[#9F376F] px-3 py-1.5 text-[11px] font-bold text-white shadow-[0_6px_14px_rgba(183,71,131,0.28)]"
              >
                {latestReport ? "Refresh" : "Preview"}
              </button>
            </div>
            {latestReport ? (
              <div className="mt-3 space-y-2.5">
                <p className="line-clamp-3 text-[12.5px] leading-relaxed text-[#795A70]">
                  {latestReport.aiSummary}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {latestReport.moodTrend !== "unknown" && (
                    <TinyStat label="Mood" value={latestReport.moodTrend} />
                  )}
                  {latestReport.sleepTrend !== "unknown" && (
                    <TinyStat label="Sleep" value={latestReport.sleepTrend} />
                  )}
                  <TinyStat
                    label="Activities"
                    value={`${latestReport.completionRate}%`}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-dashed border-[#EADCE5] bg-[#FFF8FB] px-3 py-3">
                <p className="text-[12.5px] leading-relaxed text-[#927C8B]">
                  Complete Week {week?.weekNumber ?? 1} to unlock your first
                  automated review — or preview one now.
                </p>
              </div>
            )}
          </div>

          {/* Achievements */}
          <div className="rounded-[22px] border border-[#EADCE5] bg-white p-3.5 shadow-[0_8px_22px_rgba(123,57,98,0.06)]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-display text-[15px] font-bold text-[#49263D]">
                  Achievements
                </p>
                <p className="mt-0.5 text-[11px] text-[#927C8B]">
                  {unlocked} of {plan.achievements.length} unlocked
                </p>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF0F6] text-[#B74783] ring-1 ring-[#F0CADA]">
                <Trophy className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {plan.achievements.slice(0, 4).map((a) => {
                const unlockedAt = !!a.unlockedAt;
                const Icon = ACHIEVEMENT_ICONS[a.icon] || Sparkles;
                return (
                  <div
                    key={a.id}
                    className={cn(
                      "relative overflow-hidden rounded-2xl px-2.5 py-2.5 ring-1 transition",
                      unlockedAt
                        ? "bg-gradient-to-br from-[#FFF0F6] to-[#FFF8FB] ring-[#F0CADA] shadow-sm"
                        : "bg-[#FFF8FB] ring-[#EADCE5]"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                          unlockedAt
                            ? "bg-white text-[#B74783] shadow-sm"
                            : "bg-white/70 text-[#A8939E]"
                        )}
                      >
                        {unlockedAt ? (
                          <Icon className="h-3.5 w-3.5" />
                        ) : (
                          <Lock className="h-3 w-3" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-semibold text-[#49263D]">
                          {a.title}
                        </p>
                        <p
                          className={cn(
                            "mt-0.5 text-[10px] font-semibold",
                            unlockedAt ? "text-[#B74783]" : "text-[#A8939E]"
                          )}
                        >
                          {unlockedAt ? "Unlocked" : "Locked"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          </aside>
          </details>
        </div>
      </div>
    </div>
  );
}

function MetricChip({
  icon: Icon,
  value,
  label,
  className,
}: {
  icon: typeof Flame;
  value: string;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-white py-1 pl-1 pr-2.5 shadow-sm ring-1 ring-[#EADCE5]/90",
        className
      )}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#FFF0F6] to-[#F4E8FF]">
        <Icon className="h-3 w-3 text-[#B74783]" />
      </span>
      <span className="font-display text-[12px] font-bold tabular-nums text-[#49263D]">
        {value}
      </span>
      <span className="hidden text-[9px] font-semibold uppercase tracking-[0.06em] text-[#927C8B] md:inline">
        {label}
      </span>
    </div>
  );
}

function TinyStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF0F6] px-2 py-0.5 text-[10px] font-semibold text-[#795A70] ring-1 ring-[#F0CADA]/70">
      <span className="text-[#927C8B]">{label}</span>
      <span className="capitalize text-[#49263D]">{value}</span>
    </span>
  );
}

function CompactMoodChart() {
  const [data, setData] = useState<{ label: string; score: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const start = subDays(new Date(), 7);
        const res = await getMoodHistory({
          startDate: start.toISOString(),
          endDate: new Date().toISOString(),
          limit: 40,
        });
        if (!active) return;
        const entries = (res.data || res || []) as Array<{
          timestamp?: string;
          createdAt?: string;
          score?: number;
        }>;
        const list = Array.isArray(entries) ? entries : [];
        const byDay: Record<string, number[]> = {};
        for (const e of list) {
          const ts = e.timestamp || e.createdAt;
          if (!ts || e.score == null) continue;
          const key = format(new Date(ts), "yyyy-MM-dd");
          if (!byDay[key]) byDay[key] = [];
          byDay[key].push(Number(e.score));
        }
        const points = [];
        for (let i = 6; i >= 0; i--) {
          const d = subDays(new Date(), i);
          const key = format(d, "yyyy-MM-dd");
          const scores = byDay[key];
          if (!scores?.length) continue;
          points.push({
            label: format(d, "EEE"),
            score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
          });
        }
        setData(points);
      } catch {
        if (active) setData([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const scored = data.filter((d) => d.score > 0);
  const hasData = scored.length > 0;
  const avg = hasData
    ? Math.round(scored.reduce((s, d) => s + d.score, 0) / scored.length)
    : 0;

  return (
    <div className="rounded-[22px] border border-[#EADCE5] bg-white p-3.5 shadow-[0_8px_22px_rgba(123,57,98,0.06)]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFF0F6] to-[#F4E8FF] text-[#B74783] ring-1 ring-[#F0CADA]/70">
            <Heart className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display text-[15px] font-bold text-[#49263D]">
              Mood
            </p>
            <p className="text-[11px] text-[#927C8B]">Last 7 days</p>
          </div>
        </div>
        {hasData && (
          <div className="text-right">
            <p className="font-display text-lg font-bold tabular-nums leading-none text-[#49263D]">
              {avg}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#927C8B]">
              avg
            </p>
          </div>
        )}
      </div>
      <div className="mt-2 h-[120px]">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-[#B74783]" />
          </div>
        ) : !hasData ? (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#EADCE5] bg-[#FFF8FB] px-3 text-center">
            <p className="text-[12.5px] font-medium text-[#927C8B]">
              No mood data yet
            </p>
            <p className="mt-0.5 text-[11px] text-[#A8939E]">
              Log a check-in to see your trend.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B74783" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#B74783" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tick={{ fill: "#927C8B", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #EADCE5",
                  borderRadius: 12,
                  fontSize: 12,
                  boxShadow: "0 8px 20px rgba(123,57,98,0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#B74783"
                strokeWidth={2.25}
                fill="url(#moodFill)"
                dot={{ r: 3, fill: "#B74783", strokeWidth: 0 }}
                activeDot={{ r: 4.5, fill: "#9F376F" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
