"use client";

import { CalendarDays, ClipboardList, Flower2, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProgressRange } from "@/lib/progress/compute";
import { progressPanelClass } from "./panel";

export type LatestMoodCard = {
  score: number;
  emoji: string;
  label: string;
  when: string;
};

export function SummaryCards({
  moodCheckins,
  activities,
  activeDays,
  range,
  activityDelta,
  moodUnavailable,
  activityUnavailable,
  daysUnavailable,
  assessmentTrend,
  latestMood,
}: {
  moodCheckins: number;
  activities: number;
  activeDays: number;
  range: ProgressRange;
  activityDelta: number | null;
  moodUnavailable: boolean;
  activityUnavailable: boolean;
  daysUnavailable: boolean;
  assessmentTrend: {
    title: string;
    latest: number;
    max: number;
    previous: number;
  } | null;
  latestMood: LatestMoodCard | null;
}) {
  const dayMax = range === "all" ? null : range;
  const count = 3 + (latestMood ? 1 : 0) + (assessmentTrend ? 1 : 0);

  return (
    <div
      className={cn(
        "grid min-w-0 shrink-0 gap-2",
        count >= 5
          ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
          : count === 4
            ? "grid-cols-2 lg:grid-cols-4"
            : "grid-cols-3"
      )}
    >
      {latestMood ? (
        <article
          aria-label={`Latest mood: ${latestMood.emoji} ${latestMood.label}, ${latestMood.score} out of 100. ${latestMood.when}`}
          className={cn(progressPanelClass, "flex items-center gap-2 px-2.5 py-2")}
        >
          <span className="text-lg leading-none" aria-hidden>
            {latestMood.emoji || "😐"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold text-[#795A70]">Latest</p>
            <p className="truncate text-sm font-bold text-[#49263D]">{latestMood.label}</p>
            <p className="truncate text-[10px] text-[#957F94]">{latestMood.score}/100</p>
          </div>
        </article>
      ) : null}

      <Metric
        label="Check-ins"
        value={moodUnavailable ? "—" : String(moodCheckins)}
        hint="Mood check-ins saved in this period"
        icon={Smile}
        iconClass="bg-[#FFF0F6] text-[#B74783]"
      />
      <Metric
        label="Activities"
        value={activityUnavailable ? "—" : String(activities)}
        hint="Finished activity-log entries and completed wellness-plan tasks"
        icon={Flower2}
        iconClass="bg-[#F2ECFF] text-[#8B6BC7]"
        extra={
          !activityUnavailable && activityDelta != null && activityDelta > 0
            ? `+${activityDelta}`
            : null
        }
      />
      <Metric
        label="Active days"
        value={daysUnavailable ? "—" : String(activeDays)}
        hint="Days with a mood check-in or a finished activity"
        icon={CalendarDays}
        iconClass="bg-[#F4F0FF] text-[#7A62B8]"
        extra={!daysUnavailable && dayMax ? `/${dayMax}` : null}
      />
      {assessmentTrend ? (
        <Metric
          label={assessmentTrend.title}
          value={String(assessmentTrend.latest)}
          hint={`${assessmentTrend.title}. Latest ${assessmentTrend.latest} of ${assessmentTrend.max}. Previous ${assessmentTrend.previous}. Not a diagnosis.`}
          icon={ClipboardList}
          iconClass="bg-[#FFF4EC] text-[#C47A62]"
          extra={`vs ${assessmentTrend.previous}`}
        />
      ) : null}
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  icon: Icon,
  iconClass,
  extra,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Smile;
  iconClass: string;
  extra?: string | null;
}) {
  return (
    <article
      title={hint}
      aria-label={`${label}: ${value}. ${hint}${extra ? `. ${extra}` : ""}`}
      className={cn(progressPanelClass, "flex items-center gap-2 px-2.5 py-2")}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
          iconClass
        )}
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] font-semibold text-[#795A70]">{label}</p>
        <p className="text-xl font-bold leading-none tracking-tight text-[#49263D]">{value}</p>
      </div>
      {extra ? (
        <span className="shrink-0 text-[11px] font-bold text-[#8B6BC7]">{extra}</span>
      ) : null}
    </article>
  );
}
