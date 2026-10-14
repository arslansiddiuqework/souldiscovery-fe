"use client";

import { motion } from "framer-motion";
import {
  Flame,
  Heart,
  Moon,
  Sparkles,
  Trophy,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WeeklyReport } from "@/lib/wellness-plan/types";
import { Button } from "@/components/ui/button";

interface WeeklyReviewProps {
  reports: WeeklyReport[];
  onGenerate?: () => void;
}

const trendLabel = (t: string) =>
  t.charAt(0).toUpperCase() + t.slice(1);

export function WeeklyReview({ reports, onGenerate }: WeeklyReviewProps) {
  const latest = reports[reports.length - 1];

  if (!latest) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Weekly Wellness Report</CardTitle>
          <CardDescription>
            Your first automated review appears after completing a week of the plan.
          </CardDescription>
        </CardHeader>
        {onGenerate && (
          <CardContent>
            <Button variant="outline" className="rounded-xl" onClick={onGenerate}>
              Generate preview report
            </Button>
          </CardContent>
        )}
      </Card>
    );
  }

  const metrics = [
    {
      label: "Mood Trend",
      value: trendLabel(latest.moodTrend),
      icon: Heart,
    },
    {
      label: "Stress Trend",
      value: trendLabel(latest.stressTrend),
      icon: Activity,
    },
    {
      label: "Sleep Trend",
      value: trendLabel(latest.sleepTrend),
      icon: Moon,
    },
    {
      label: "Completion",
      value: `${latest.completionRate}%`,
      icon: Trophy,
    },
    {
      label: "Most Helpful",
      value: latest.mostHelpfulActivity,
      icon: Sparkles,
    },
    {
      label: "Streak",
      value: `${latest.currentStreak} days`,
      icon: Flame,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
    >
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/[0.08] to-transparent" />
        <CardHeader className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#927C8B]">
            Week {latest.weekNumber}
          </p>
          <CardTitle className="text-lg md:text-xl">Weekly Wellness Report</CardTitle>
          <CardDescription>
            Generated{" "}
            {new Date(latest.generatedAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-2xl border border-[#EADCE5] bg-white p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <m.icon className="h-3.5 w-3.5 text-[#B74783]" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#927C8B]">
                    {m.label}
                  </p>
                </div>
                <p className="font-display text-base font-semibold text-[#49263D]">
                  {m.value}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-[#B74783]/20 bg-[#B74783]/10 p-5">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#B74783]">
              <Sparkles className="h-3.5 w-3.5" />
              AI Summary
            </p>
            <p className="text-sm leading-relaxed text-[#795A70]">
              {latest.aiSummary}
            </p>
          </div>

          {latest.insights.length > 0 && (
            <ul className="space-y-2">
              {latest.insights.map((insight) => (
                <li
                  key={insight}
                  className="rounded-xl border border-[#EADCE5] bg-white/[0.02] px-4 py-3 text-sm text-[#795A70]"
                >
                  {insight}
                </li>
              ))}
            </ul>
          )}

          {onGenerate && (
            <Button variant="outline" className="rounded-xl" onClick={onGenerate}>
              Refresh report
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
