"use client";

import {
  CheckCircle2,
  Flame,
  Heart,
  PenLine,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Achievement } from "@/lib/wellness-plan/types";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof Flame> = {
  heart: Heart,
  flame: Flame,
  trophy: Trophy,
  pen: PenLine,
  sparkles: Sparkles,
  check: CheckCircle2,
  star: Star,
};

interface AchievementsPanelProps {
  achievements: Achievement[];
}

export function AchievementsPanel({ achievements }: AchievementsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Achievements</CardTitle>
        <CardDescription>
          Quiet milestones along your wellness journey.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {achievements.map((a) => {
            const Icon = ICONS[a.icon] || Sparkles;
            const unlocked = !!a.unlockedAt;
            return (
              <div
                key={a.id}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-4 transition",
                  unlocked
                    ? "border-[#b384c9]/30 bg-[rgba(179,132,201,0.1)]"
                    : "border-[rgba(216,191,227,0.12)] bg-white/[0.02] opacity-50"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    unlocked
                      ? "bg-[rgba(179,132,201,0.18)]"
                      : "bg-white/[0.04]"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      unlocked ? "text-[#b384c9]" : "text-[rgba(231,218,237,0.4)]"
                    )}
                  />
                </div>
                <div>
                  <p className="font-display text-sm font-semibold text-[#f3eefa]">
                    {a.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[rgba(231,218,237,0.5)]">
                    {a.description}
                  </p>
                  {unlocked && a.unlockedAt && (
                    <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#b384c9]/80">
                      Unlocked{" "}
                      {new Date(a.unlockedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
