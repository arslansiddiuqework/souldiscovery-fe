"use client";

import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Brain,
  TrendingUp,
  Calendar,
  Activity,
  Target,
  Smile,
  Frown,
  Meh,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Enhanced dummy data
const moodData = {
  daily: [
    {
      day: "Mon",
      value: 65,
      activities: [
        { name: "Exercise", duration: "30min", impact: "positive" },
        { name: "Meditation", duration: "15min", impact: "positive" },
      ],
      energy: 70,
      sleep: 7.5,
    },
    {
      day: "Tue",
      value: 75,
      activities: [
        { name: "Therapy", duration: "1hr", impact: "positive" },
        { name: "Reading", duration: "45min", impact: "neutral" },
      ],
      energy: 75,
      sleep: 8,
    },
    // ... other days with similar structure
  ],
  monthly: [
    { week: 1, average: 72, peak: 85, low: 60 },
    { week: 2, average: 78, peak: 90, low: 65 },
    { week: 3, average: 75, peak: 88, low: 62 },
    { week: 4, average: 82, peak: 95, low: 70 },
  ],
  insights: [
    {
      title: "Weekly Progress",
      description: "Your mood stability has improved by 15% this week",
      trend: "up",
    },
    {
      title: "Activity Impact",
      description: "Exercise and meditation show the most positive impact",
      trend: "up",
    },
  ],
};

const getMoodEmoji = (value: number) => {
  if (value >= 80) return { icon: Smile, color: "text-green-500" };
  if (value >= 60) return { icon: Meh, color: "text-yellow-500" };
  return { icon: Frown, color: "text-red-500" };
};

const getImpactColor = (impact: string) => {
  switch (impact) {
    case "positive":
      return "bg-green-500/10 text-green-500";
    case "negative":
      return "bg-red-500/10 text-red-500";
    default:
      return "bg-yellow-500/10 text-yellow-500";
  }
};

export function MoodTracker() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFE5F0]">
              <Brain className="h-5 w-5 text-[#B74783]" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg md:text-xl">Mood Insights</CardTitle>
              <p className="text-sm text-[#927C8B]">
                Your emotional journey over time
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-[#EADCE5]">
              Week
            </Button>
            <Button variant="ghost" size="sm">
              Month
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Enhanced Daily Mood Chart */}
        <div className="space-y-4">
          <div className="flex h-[200px] items-end justify-between">
            {moodData.daily.map((day, index) => (
              <div
                key={day.day}
                className="group relative flex flex-col items-center space-y-2"
                onClick={() =>
                  setSelectedDay(selectedDay === index ? null : index)
                }
              >
                <AnimatePresence>
                  {selectedDay === index && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute -top-4 left-1/2 z-10 w-64 -translate-x-1/2 space-y-3 rounded-[16px] border border-[#EADCE5] bg-[#FFF0F6]/95 p-4 shadow-premium backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-display text-sm font-semibold text-foreground">
                          {day.day}&apos;s Activities
                        </h4>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4 text-[#B74783]" />
                          <span className="text-sm font-medium">{day.value}%</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {day.activities.map((activity, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded-xl bg-muted/50 p-2.5"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`rounded-lg p-1.5 ${getImpactColor(
                                  activity.impact
                                )}`}
                              >
                                <Activity className="h-3 w-3" />
                              </div>
                              <span className="text-sm font-medium">
                                {activity.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#927C8B]">
                                {activity.duration}
                              </span>
                              <div
                                className={`h-1.5 w-1.5 rounded-full ${
                                  activity.impact === "positive"
                                    ? "bg-green-500"
                                    : activity.impact === "negative"
                                    ? "bg-red-500"
                                    : "bg-yellow-500"
                                }`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-2 border-t border-[#EADCE5] pt-2">
                        <div className="text-center">
                          <p className="text-xs text-[#927C8B]">
                            Energy
                          </p>
                          <Progress value={day.energy} className="mt-1 h-1" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-[#927C8B]">Sleep</p>
                          <p className="text-sm font-medium">{day.sleep}hrs</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative w-12 cursor-pointer">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${day.value}%` }}
                    transition={{ delay: index * 0.1 }}
                    className={`absolute bottom-0 left-1/2 w-8 -translate-x-1/2 rounded-full bg-gradient-to-t from-[rgba(183,71,131,0.2)] to-[rgba(183,71,131,0.4)] transition-all group-hover:from-[rgba(183,71,131,0.3)] group-hover:to-[rgba(183,71,131,0.5)] ${
                      selectedDay === index ? "ring-2 ring-[#B74783]" : ""
                    }`}
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      {React.createElement(getMoodEmoji(day.value).icon, {
                        className: `w-4 h-4 ${getMoodEmoji(day.value).color}`,
                      })}
                    </div>
                  </motion.div>
                </div>
                <span
                  className={`text-sm font-medium transition-colors ${
                    selectedDay === index
                      ? "text-[#B74783]"
                      : "text-[#927C8B]"
                  }`}
                >
                  {day.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-2 gap-4 border-t border-[#EADCE5] pt-6">
          {moodData.insights.map((insight, index) => (
            <div
              key={index}
              className="space-y-2 rounded-[16px] border border-[#EADCE5] bg-[rgba(183,71,131,0.06)] p-4"
            >
              <div className="flex items-center gap-2">
                {insight.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <LineChart className="h-4 w-4 text-yellow-500" />
                )}
                <h4 className="font-display text-sm font-semibold text-foreground">
                  {insight.title}
                </h4>
              </div>
              <p className="text-sm leading-relaxed text-[#927C8B]">
                {insight.description}
              </p>
            </div>
          ))}
        </div>

        {/* Monthly Overview */}
        <div className="border-t border-[#EADCE5] pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
              <Calendar className="h-4 w-4 text-[#B74783]" />
              Monthly Overview
            </h4>
            <p className="text-sm text-[#927C8B]">Average mood: 77%</p>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {moodData.monthly.map((week) => (
              <div
                key={week.week}
                className="rounded-[16px] border border-[#EADCE5] bg-white p-3 text-center"
              >
                <p className="font-display text-sm font-semibold text-foreground">
                  Week {week.week}
                </p>
                <p className="mt-1 text-xs text-[#927C8B]">
                  Avg: {week.average}%
                </p>
                <div className="mt-1 space-x-2 text-xs text-[#927C8B]">
                  <span className="text-green-500">↑{week.peak}</span>
                  <span className="text-yellow-500">↓{week.low}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
