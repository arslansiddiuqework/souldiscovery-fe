"use client";

import Link from "next/link";
import { ArrowUpRight, ClipboardList } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AssessmentGroup } from "@/lib/progress/compute";
import { cn } from "@/lib/utils";
import { progressFocusClass, progressPanelClass } from "./panel";

export function AssessmentPanel({
  groups,
  unavailable,
  onRetry,
}: {
  groups: AssessmentGroup[];
  unavailable: boolean;
  onRetry: () => void;
}) {
  const chartGroup = groups.find((group) => group.comparablePoints.length >= 2) ?? null;
  const attempts = groups.flatMap((group) =>
    group.attempts.map((attempt) => ({
      ...attempt,
      groupTitle: group.title,
    }))
  );

  return (
    <section
      className={cn(progressPanelClass, "flex h-full min-h-0 min-w-0 flex-col overflow-hidden p-3")}
      aria-labelledby="assessment-history-title"
    >
      <div className="flex shrink-0 items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFF4EC] text-[#C47A62]">
          <ClipboardList className="h-3.5 w-3.5" aria-hidden />
        </span>
        <h2 id="assessment-history-title" className="text-sm font-bold text-[#49263D]">
          Assessments
        </h2>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-[#C4A8B6]">
          Not a diagnosis
        </span>
      </div>
      <p className="sr-only">
        Results stay grouped by assessment and version. A line is drawn only when two results share
        the same score scale. These reflections are not a diagnosis.
      </p>

      {unavailable ? (
        <div className="mt-2 flex flex-1 items-center gap-2">
          <p className="text-sm text-[#795A70]">Couldn't load.</p>
          <button
            type="button"
            onClick={onRetry}
            className={cn(
              "rounded-full bg-[#B74783] px-3 py-1 text-xs font-semibold text-white",
              progressFocusClass
            )}
          >
            Try again
          </button>
        </div>
      ) : attempts.length === 0 ? (
        <div className="mt-1 flex flex-1 items-center justify-between gap-2">
          <p className="text-sm text-[#795A70]">None yet</p>
          <Link
            href="/assessments"
            className={cn(
              "inline-flex items-center gap-1 rounded-full bg-[#B74783] px-3 py-1.5 text-xs font-semibold text-white",
              progressFocusClass
            )}
          >
            Assessment Center
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      ) : (
        <div className="mt-1 flex min-h-0 flex-1 gap-2 overflow-hidden">
          {chartGroup ? <TrendChart group={chartGroup} /> : null}
          <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto">
            {attempts.map((attempt) => {
              const when = new Date(attempt.completedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              const score =
                attempt.totalScore != null && attempt.maxScore
                  ? `${attempt.totalScore}/${attempt.maxScore}`
                  : attempt.interpretationLabel || "Saved";
              return (
                <li key={attempt.resultId} className="flex items-center gap-2 text-[11px]">
                  <time className="w-12 shrink-0 font-semibold text-[#49263D]">{when}</time>
                  <span className="min-w-0 flex-1 truncate text-[#795A70]">{attempt.groupTitle}</span>
                  <span className="shrink-0 font-semibold text-[#49263D]">{score}</span>
                  <Link
                    href={`/assessments/results/${attempt.resultId}`}
                    aria-label={`View ${attempt.groupTitle} result from ${when}`}
                    className={cn(
                      "inline-flex h-5 w-5 items-center justify-center text-[#B74783]",
                      progressFocusClass
                    )}
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

function TrendChart({ group }: { group: AssessmentGroup }) {
  const reduceMotion = useReducedMotion();
  const maxScore = group.comparablePoints[0]?.maxScore ?? 0;
  return (
    <div className="hidden w-[36%] min-w-[110px] sm:block">
      <p className="sr-only">
        {group.title}. Same version and scale, out of {maxScore}. The line does not say whether a
        change is better or worse.
      </p>
      <div className="h-14 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={group.comparablePoints} margin={{ top: 4, right: 2, left: -28, bottom: 0 }}>
            <XAxis dataKey="label" hide />
            <YAxis domain={[0, maxScore]} hide />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const point = payload[0]?.payload as (typeof group.comparablePoints)[number] | undefined;
                if (!point) return null;
                return (
                  <div className="rounded-lg border border-[#EADCE5] bg-white px-2 py-1 text-xs shadow">
                    {point.totalScore} of {point.maxScore}
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="totalScore"
              stroke="#8B6BC7"
              strokeWidth={2}
              isAnimationActive={!reduceMotion}
              dot={{ r: 2.5, fill: "#8B6BC7", stroke: "#fff", strokeWidth: 1 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
