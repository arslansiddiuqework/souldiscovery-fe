"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  activityGrainCaption,
  type ActivityBar,
  type CalendarDay,
  type TypeBreakdownRow,
} from "@/lib/progress/compute";
import { cn } from "@/lib/utils";
import { progressFocusClass, progressPanelClass } from "./panel";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function ActivityProgress({
  bars,
  grain,
  logged,
  plan,
  weeks,
  truncated,
  unavailable,
  partialNote,
  onRetry,
}: {
  bars: ActivityBar[];
  grain: "day" | "week" | "month";
  logged: TypeBreakdownRow[];
  plan: TypeBreakdownRow[];
  weeks: CalendarDay[][];
  truncated: boolean;
  unavailable: boolean;
  partialNote: string | null;
  onRetry: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const total = bars.reduce((sum, bar) => sum + bar.count, 0);
  const [picked, setPicked] = useState<string | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const days = useMemo(() => weeks.flat().filter((day) => day.inPeriod), [weeks]);
  const savedDays = days.filter((day) => day.moodCount > 0 || day.activityCount > 0);
  const selected = days.find((day) => day.key === picked) ?? savedDays[savedDays.length - 1] ?? null;

  useEffect(() => {
    const root = calendarRef.current;
    const node = root?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    if (!root || !node) return;
    const rootRect = root.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    if (nodeRect.bottom > rootRect.bottom || nodeRect.top < rootRect.top) {
      root.scrollTop += nodeRect.bottom - rootRect.bottom + 6;
    }
  }, [weeks, selected?.key]);

  return (
    <section
      className={cn(progressPanelClass, "flex min-h-0 min-w-0 flex-col p-3 lg:h-full")}
      aria-labelledby="activity-progress-title"
    >
      <div className="flex shrink-0 items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F2ECFF] text-[#8B6BC7]">
          <BarChart3 className="h-3.5 w-3.5" aria-hidden />
        </span>
        <h2 id="activity-progress-title" className="text-sm font-bold text-[#49263D]">
          Activities
        </h2>
        {!unavailable ? (
          <span className="ml-auto text-sm font-bold text-[#B74783]">{total}</span>
        ) : null}
      </div>
      {partialNote ? <span className="sr-only">{partialNote}</span> : null}
      <p className="sr-only">
        {activityGrainCaption(grain)} Only saved finished activities and completed plan tasks are
        counted.
      </p>
      {truncated ? (
        <p className="sr-only">Calendar shows the latest 6 months. Totals include full history.</p>
      ) : null}

      {unavailable ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <p className="text-sm text-[#795A70]">Couldn't load.</p>
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
      ) : (
        <div className="mt-1 flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden">
          <div className="h-[42%] min-h-[120px] shrink-0">
            {total === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
                <p className="text-sm font-semibold text-[#795A70]">None finished</p>
                <Link
                  href="/dashboard"
                  className={cn(
                    "text-[11px] font-semibold text-[#B74783] underline-offset-2 hover:underline",
                    progressFocusClass
                  )}
                >
                  Log on Dashboard
                </Link>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bars} margin={{ top: 6, right: 2, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="#F0E4EC" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#957F94", fontSize: 10 }}
                    interval="preserveStartEnd"
                    minTickGap={10}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#957F94", fontSize: 10 }}
                    width={24}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(183,71,131,0.06)" }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const bar = payload[0]?.payload as ActivityBar | undefined;
                      if (!bar) return null;
                      return (
                        <div className="rounded-xl border border-[#EADCE5] bg-white px-3 py-2 shadow-md">
                          <p className="text-[11px] text-[#957F94]">{bar.fullLabel}</p>
                          <p className="mt-0.5 text-sm font-semibold text-[#49263D]">
                            {bar.count === 0 ? "None finished" : `${bar.count} finished`}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[5, 5, 2, 2]}
                    maxBarSize={24}
                    isAnimationActive={!reduceMotion}
                  >
                    {bars.map((bar) => (
                      <Cell key={bar.key} fill={bar.count > 0 ? "#C45A96" : "transparent"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <TypeChips logged={logged} plan={plan} />

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="grid shrink-0 grid-cols-7 gap-0.5 text-center text-[9px] font-semibold text-[#B09AAB]">
              {WEEKDAYS.map((day, index) => (
                <div key={`${day}-${index}`} aria-hidden>
                  {day}
                </div>
              ))}
            </div>
            <div ref={calendarRef} className="mt-1 min-h-0 flex-1 space-y-0.5 overflow-y-auto">
              {weeks.map((week, index) => {
                const first = week.find((day) => day.inPeriod);
                const previous = weeks[index - 1]?.find((day) => day.inPeriod);
                const showMonth =
                  Boolean(first) &&
                  (!previous || first!.key.slice(0, 7) !== previous.key.slice(0, 7));
                return (
                  <div key={week[0]?.key ?? index}>
                    {showMonth && first ? (
                      <p className="mb-0.5 text-[9px] font-semibold text-[#957F94]">
                        {monthTitle(first.key)}
                      </p>
                    ) : null}
                    <div className="grid grid-cols-7 gap-0.5">
                      {week.map((day) =>
                        day.inPeriod ? (
                          <button
                            key={day.key}
                            type="button"
                            aria-pressed={selected?.key === day.key}
                            aria-label={day.detail}
                            title={day.detail}
                            onClick={() => setPicked(day.key)}
                            className={cn(
                              "flex h-6 flex-col items-center justify-center rounded-md text-[9px] font-semibold text-[#49263D]",
                              progressFocusClass,
                              dayTone(day),
                              selected?.key === day.key && "ring-1 ring-[#B74783]"
                            )}
                          >
                            {day.dayNum}
                            <span className="flex h-1 gap-px" aria-hidden>
                              {day.moodCount > 0 ? (
                                <span className="h-1 w-1 rounded-full bg-[#7A62B8]" />
                              ) : null}
                              {day.activityCount > 0 ? (
                                <span className="h-1 w-1 rounded-[1px] bg-[#B74783]" />
                              ) : null}
                            </span>
                          </button>
                        ) : (
                          <span key={day.key} className="h-6" />
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {selected ? (
              <p className="mt-1 shrink-0 truncate text-[10px] text-[#512943]" title={selected.detail}>
                {selected.detail}
              </p>
            ) : null}
          </div>
          <ul className="sr-only">
            {bars.map((bar) => (
              <li key={bar.key}>
                {bar.fullLabel}: {bar.count} finished
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function TypeChips({ logged, plan }: { logged: TypeBreakdownRow[]; plan: TypeBreakdownRow[] }) {
  if (!logged.length && !plan.length) return null;
  return (
    <ul className="flex shrink-0 flex-wrap gap-1">
      {logged.map((row) => (
        <li key={row.key}>
          <span className="rounded-full bg-[#F7F2FA] px-2 py-0.5 text-[10px] font-semibold text-[#5C4A66]">
            {row.label} {row.count}
          </span>
        </li>
      ))}
      {plan.map((row) => (
        <li key={row.key}>
          <span className="rounded-full bg-[#FFF0F6] px-2 py-0.5 text-[10px] font-semibold text-[#7A3E5C]">
            Plan {row.label} {row.count}
          </span>
        </li>
      ))}
    </ul>
  );
}

function monthTitle(key: string): string {
  const [year, month, day] = key.split("-").map((part) => Number(part));
  return new Date(year, (month || 1) - 1, day || 1).toLocaleDateString("en-US", {
    month: "short",
  });
}

function dayTone(day: CalendarDay): string {
  const mood = day.moodCount > 0;
  const activity = day.activityCount > 0;
  if (mood && activity) return "bg-[#F8E7F2]";
  if (activity) return "bg-[#FDE8F2]";
  if (mood) return "bg-[#F3ECFF]";
  return "bg-[#FBF7FA]";
}
