"use client";

import { motion } from "framer-motion";
import {
  Flame,
  CheckCircle2,
  Calendar,
  Sparkles,
  BrainCircuit,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WellnessPlan } from "@/lib/wellness-plan/types";
import {
  computePlanProgress,
  getCurrentDay,
  getCurrentWeek,
} from "@/lib/wellness-plan/generate-plan";
import { generateWellnessInsights } from "@/lib/wellness-plan/insights";
import { ProgressRing } from "./progress-ring";
import { TodaysMission } from "./todays-mission";
import { PlanRoadmap } from "./plan-roadmap";
import { WeeklyReview } from "./weekly-review";
import { AchievementsPanel } from "./achievements-panel";
import { MoodTrendChart } from "./mood-trend-chart";
import Link from "next/link";

interface PlanDashboardProps {
  plan: WellnessPlan;
  onTaskClick: (taskId: string) => void;
  onRefreshReport: () => void;
  onReset?: () => void;
  onDismissSuggestion?: () => void;
  onApplySuggestion?: () => void;
}

export function PlanDashboard({
  plan,
  onTaskClick,
  onRefreshReport,
  onReset,
  onDismissSuggestion,
  onApplySuggestion,
}: PlanDashboardProps) {
  const { percent, completedTasks, totalTasks } = computePlanProgress(plan);
  const today = getCurrentDay(plan);
  const week = getCurrentWeek(plan);
  const insights = generateWellnessInsights(plan);

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-wrap items-end justify-between gap-4 border-b border-[#EADCE5] pb-8"
      >
        <div className="space-y-3">
          <span className="badge-soft">
            <Sparkles className="h-3.5 w-3.5" />
            Wellness Plan · {plan.challengeLevel} mode
          </span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#49263D] md:text-4xl">
            {plan.title}
          </h1>
          <p className="max-w-xl text-sm text-[#927C8B] md:text-base">
            {plan.durationDays}-day personalized journey ·{" "}
            {week?.title || "In progress"}
          </p>
        </div>
        {onReset && (
          <Button
            variant="ghost"
            size="sm"
            className="text-[#927C8B]"
            onClick={onReset}
          >
            Start new plan
          </Button>
        )}
      </motion.div>

      {plan.pendingSuggestion && (
        <Card className="border-[#B74783]/30 bg-[rgba(183,71,131,0.1)]">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#B74783]" />
              <div>
                <p className="font-display text-sm font-semibold text-[#49263D]">
                  Plan adaptation suggested
                </p>
                <p className="mt-1 text-sm text-[#795A70]">
                  {plan.pendingSuggestion.message}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {onDismissSuggestion && (
                <Button variant="ghost" size="sm" onClick={onDismissSuggestion}>
                  Dismiss
                </Button>
              )}
              {onApplySuggestion && (
                <Button className="btn-spatium" size="sm" onClick={onApplySuggestion}>
                  Update plan
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats row */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
        <Card interactive className="flex flex-col items-center justify-center p-6">
          <ProgressRing value={percent} label="Progress" />
          <p className="mt-3 text-sm text-[#927C8B]">
            Overall Progress
          </p>
        </Card>

        <StatCard
          title="Current Streak"
          value={`${plan.currentStreak}`}
          suffix="Days"
          icon={Flame}
          description={`Longest: ${plan.longestStreak} days`}
        />
        <StatCard
          title="Completed Tasks"
          value={`${completedTasks}`}
          suffix={`/ ${totalTasks}`}
          icon={CheckCircle2}
          description="Across your full plan"
        />
        <StatCard
          title="Current Week"
          value={`Week ${week?.weekNumber || 1}`}
          icon={Calendar}
          description={week?.focus || "Stay consistent"}
        />
      </div>

      {/* Today's mission */}
      <TodaysMission day={today} onTaskClick={onTaskClick} />

      {/* Roadmap + Insights */}
      <div className="grid gap-4 lg:grid-cols-3 md:gap-5">
        <div className="lg:col-span-2">
          <PlanRoadmap plan={plan} onTaskClick={onTaskClick} />
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFE5F0]">
                <BrainCircuit className="h-5 w-5 text-[#B74783]" />
              </div>
              <div>
                <CardTitle className="text-lg">Plan Insights</CardTitle>
                <CardDescription>Patterns from your journey</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((insight) => (
              <div
                key={insight.title}
                className="rounded-[16px] border border-[#EADCE5] bg-white p-4"
              >
                <p className="font-display text-sm font-semibold text-[#49263D]">
                  {insight.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[#927C8B]">
                  {insight.description}
                </p>
              </div>
            ))}
            <Button asChild variant="outline" className="w-full rounded-xl">
              <Link href="/progress">View full insights</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <MoodTrendChart />

      <WeeklyReview
        reports={plan.weeklyReports}
        onGenerate={onRefreshReport}
      />

      <AchievementsPanel achievements={plan.achievements} />
    </div>
  );
}

function StatCard({
  title,
  value,
  suffix,
  icon: Icon,
  description,
}: {
  title: string;
  value: string;
  suffix?: string;
  icon: typeof Flame;
  description: string;
}) {
  return (
    <Card interactive className="p-6 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#927C8B]">
          {title}
        </p>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFE5F0]">
          <Icon className="h-5 w-5 text-[#B74783]" />
        </div>
      </div>
      <p className="mt-6 font-display text-3xl font-bold tracking-tight text-[#49263D]">
        {value}
        {suffix && (
          <span className="ml-1 text-lg font-semibold text-[#927C8B]">
            {suffix}
          </span>
        )}
      </p>
      <p className="mt-1.5 text-sm text-[#927C8B]">
        {description}
      </p>
    </Card>
  );
}
