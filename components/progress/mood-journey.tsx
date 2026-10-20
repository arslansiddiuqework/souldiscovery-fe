"use client";

import { Smile } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  MOOD_AXIS_TICKS,
  moodGrainCaption,
  type MoodPoint,
} from "@/lib/progress/compute";
import { cn } from "@/lib/utils";
import { progressFocusClass, progressPanelClass } from "./panel";

function MoodTick({ y, payload }: { y?: number; payload?: { value?: number } }) {
  if (y == null || payload?.value == null) return null;
  const tick = MOOD_AXIS_TICKS.find((item) => item.value === payload.value);
  if (!tick) return null;
  return (
    <g transform={`translate(0,${y})`}>
      <text x={52} y={0} dy={3} textAnchor="end" fill="#795A70" fontSize={10}>
        {tick.label}
      </text>
    </g>
  );
}

function pointSentence(point: MoodPoint): string {
  if (point.averageMood == null) return point.fullLabel;
  const score = Math.round(point.averageMood);
  const name = `${point.emoji ? `${point.emoji} ` : ""}${point.moodLabel}`;
  if (point.count > 1) {
    return `${point.fullLabel}. Average of ${point.count} check-ins: ${name}, ${score} out of 100.`;
  }
  return `${point.fullLabel}. ${name}, ${score} out of 100.`;
}

function MoodDot(props: { cx?: number; cy?: number; payload?: MoodPoint }) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || payload?.averageMood == null) return null;
  const label = pointSentence(payload);
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4.5}
      fill="#B74783"
      stroke="#fff"
      strokeWidth={2}
      tabIndex={0}
      role="img"
      aria-label={label}
      className="outline-none focus:stroke-[#49263D]"
    >
      <title>{label}</title>
    </circle>
  );
}

export function MoodJourney({
  points,
  grain,
  pattern,
  unavailable,
  onRetry,
}: {
  points: MoodPoint[];
  grain: "day" | "week" | "month";
  pattern: string | null;
  unavailable: boolean;
  onRetry: () => void;
  latestLabel?: string | null;
}) {
  const reduceMotion = useReducedMotion();
  const logged = points.filter((point) => point.averageMood != null);

  return (
    <section
      className={cn(progressPanelClass, "flex min-h-0 min-w-0 flex-col p-3 lg:h-full")}
      aria-labelledby="mood-journey-title"
    >
      <div className="flex shrink-0 items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFF0F6] text-[#B74783]">
          <Smile className="h-3.5 w-3.5" aria-hidden />
        </span>
        <h2 id="mood-journey-title" className="text-sm font-bold text-[#49263D]">
          Mood
        </h2>
        {logged.length > 0 ? (
          <span className="ml-auto text-[11px] font-semibold text-[#795A70]">
            {logged.length} logged
          </span>
        ) : null}
      </div>
      <p className="sr-only">
        {moodGrainCaption(grain)} Scale from 0 to 100:{" "}
        {MOOD_AXIS_TICKS.map((tick) => tick.label).join(", ")}. Blank days are missing check-ins,
        not a low mood.
        {pattern ? ` ${pattern}` : ""}
      </p>

      {unavailable ? (
        <Status message="Mood check-ins couldn't load." onRetry={onRetry} />
      ) : logged.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm font-semibold text-[#795A70]">No check-ins</p>
        </div>
      ) : (
        <div className="mt-1 min-h-0 w-full flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 8, right: 6, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="#F0E4EC" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#957F94", fontSize: 10 }}
                interval="preserveStartEnd"
                minTickGap={16}
              />
              <YAxis
                domain={[0, 100]}
                ticks={MOOD_AXIS_TICKS.map((tick) => tick.value)}
                axisLine={false}
                tickLine={false}
                width={54}
                tick={<MoodTick />}
              />
              <Tooltip
                cursor={{ stroke: "#E8C5D8", strokeWidth: 1 }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const point = payload[0]?.payload as MoodPoint | undefined;
                  if (!point || point.averageMood == null) return null;
                  return (
                    <div className="rounded-xl border border-[#EADCE5] bg-white px-3 py-2 shadow-md">
                      <p className="text-[11px] text-[#957F94]">{point.fullLabel}</p>
                      <p className="mt-0.5 text-sm font-semibold text-[#49263D]">
                        {point.emoji} {point.moodLabel} ({Math.round(point.averageMood)}/100)
                      </p>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="averageMood"
                name="Mood"
                stroke="#B74783"
                strokeWidth={2.25}
                connectNulls={false}
                isAnimationActive={!reduceMotion}
                dot={<MoodDot />}
                activeDot={{ r: 5.5, fill: "#A63F79", stroke: "#fff", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <ul className="sr-only">
        {logged.map((point) => (
          <li key={point.key}>{pointSentence(point)}</li>
        ))}
      </ul>
    </section>
  );
}

function Status({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2">
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
