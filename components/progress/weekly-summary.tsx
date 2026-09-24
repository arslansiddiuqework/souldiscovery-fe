"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { getWeeklyProgress, WeeklyProgressResponse } from "@/lib/api/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Activity, Clock, HeartPulse, Flame } from "lucide-react";

export function WeeklySummary() {
  const [data, setData] =
    useState<WeeklyProgressResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getWeeklyProgress();
        if (response.success) {
          setData(response.data);
        } else {
          setError("Failed to fetch progress data");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-[20px] border border-[rgba(216,191,227,0.18)] bg-white/[0.035] shadow-card">
        <Loader2 className="h-8 w-8 animate-spin text-[#b384c9]" />
        <p className="text-sm text-[rgba(231,218,237,0.55)]">Loading weekly summary…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-64 items-center justify-center rounded-[20px] border border-[rgba(216,191,227,0.18)] bg-white/[0.035] px-6 text-center shadow-card">
        <p className="text-sm text-destructive">
          {error || "No data available"}
        </p>
      </div>
    );
  }

  const summaryCards = [
    {
      title: "Activities",
      value: data.summary.totalActivities,
      suffix: null,
      description: "Total this week",
      icon: Activity,
      iconClass: "text-[#b384c9]",
      valueClass: "text-white",
    },
    {
      title: "Duration",
      value: data.summary.totalDuration,
      suffix: "min",
      description: "Time spent active",
      icon: Clock,
      iconClass: "text-[#b384c9]",
      valueClass: "text-white",
    },
    {
      title: "Therapy",
      value: data.summary.therapySessionsCount,
      suffix: null,
      description: "Sessions this week",
      icon: HeartPulse,
      iconClass: "text-[#b384c9]",
      valueClass: "text-white",
    },
    {
      title: "Streak",
      value: data.summary.currentStreak,
      suffix: "days",
      description: "Keep it up!",
      icon: Flame,
      iconClass: "text-amber-500",
      valueClass: "text-amber-500",
    },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-500">
      {/* Summary Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 md:gap-6">
        {summaryCards.map((stat) => (
          <Card key={stat.title} interactive className="p-6">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[rgba(231,218,237,0.55)]">
                {stat.title}
              </p>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[rgba(179,132,201,0.12)]">
                <stat.icon className={`h-4 w-4 ${stat.iconClass}`} />
              </div>
            </div>
            <div className={`mt-5 font-display text-3xl font-bold tracking-tight ${stat.valueClass}`}>
              {stat.value}
              {stat.suffix && (
                <span className="ml-1 text-lg font-semibold text-[rgba(231,218,237,0.55)]">
                  {stat.suffix}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm text-[rgba(231,218,237,0.55)]">
              {stat.description}
            </p>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        {/* Mood Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Mood Trends</CardTitle>
            <CardDescription>
              Your average mood score over the last 7 days
            </CardDescription>
          </CardHeader>

          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.dailyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={0.3}
                />
                <XAxis
                  dataKey="dayLabel"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid rgba(179,132,201,0.25)",
                    backgroundColor: "rgba(10,10,18,0.95)",
                    color: "#ffffff",
                    boxShadow: "0 12px 40px -8px rgba(179, 132, 201, 0.25)",
                    padding: "10px 14px",
                  }}
                  labelStyle={{
                    color: "rgba(255,255,255,0.55)",
                    marginBottom: "4px",
                  }}
                  formatter={(value: unknown) => {
                    const num =
                      typeof value === "number" ? value : 0;
                    return [`${Math.round(num)}/100`, "Mood"];
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="averageMood"
                  stroke="#b384c9"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#b384c9" }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Volume */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Activity Volume</CardTitle>
            <CardDescription>
              Number of activities completed per day
            </CardDescription>
          </CardHeader>

          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.dailyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={0.3}
                />
                <XAxis
                  dataKey="dayLabel"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid rgba(179,132,201,0.25)",
                    backgroundColor: "rgba(10,10,18,0.95)",
                    color: "#ffffff",
                    boxShadow: "0 12px 40px -8px rgba(179, 132, 201, 0.25)",
                    padding: "10px 14px",
                  }}
                  labelStyle={{
                    color: "rgba(255,255,255,0.55)",
                    marginBottom: "4px",
                  }}
                  formatter={(value: unknown) => {
                    const num =
                      typeof value === "number" ? value : 0;
                    return [num, "Activities"];
                  }}
                  cursor={{ fill: "rgba(179,132,201,0.12)" }}
                />

                <Bar
                  dataKey="activitiesCount"
                  fill="#b384c9"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
