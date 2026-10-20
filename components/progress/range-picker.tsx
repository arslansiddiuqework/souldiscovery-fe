"use client";

import { cn } from "@/lib/utils";
import type { ProgressRange } from "@/lib/progress/compute";
import { progressFocusClass } from "./panel";

const OPTIONS: Array<{ id: ProgressRange; label: string }> = [
  { id: 7, label: "7d" },
  { id: 30, label: "30d" },
  { id: 90, label: "90d" },
  { id: "all", label: "All" },
];

export function RangePicker({
  range,
  periodLabel,
  onChange,
}: {
  range: ProgressRange;
  periodLabel: string;
  onChange: (range: ProgressRange) => void;
}) {
  const windowLabel =
    range === "all" ? "All saved history through today" : `Last ${range} days, including today`;

  return (
    <div className="flex min-w-0 shrink-0 items-center gap-2">
      <p className="hidden text-[11px] font-medium text-[#957F94] sm:block">{periodLabel}</p>
      <div
        role="radiogroup"
        aria-label={`${windowLabel}. ${periodLabel}. Dates use your local time.`}
        className="flex rounded-full border border-[#EADCE5] bg-white p-0.5"
      >
        {OPTIONS.map((option) => {
          const selected = range === option.id;
          const name = option.id === "all" ? "All time" : `${option.id} days`;
          return (
            <button
              key={String(option.id)}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={name}
              onClick={() => onChange(option.id)}
              className={cn(
                "min-h-7 rounded-full px-2.5 text-xs font-semibold sm:px-3",
                progressFocusClass,
                selected ? "bg-[#B74783] text-white" : "text-[#795A70] hover:text-[#49263D]"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
