"use client";

import { cn } from "@/lib/utils";

interface ProgressRingProps {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  label?: string;
  /** Matches Dashboard rose accent by default */
  trackColor?: string;
  progressColor?: string;
  textClassName?: string;
}

export function ProgressRing({
  value,
  size = 120,
  stroke = 8,
  className,
  label,
  trackColor = "rgba(183,71,131,0.16)",
  progressColor = "#B74783",
  textClassName = "text-[#49263D]",
}: ProgressRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "font-display text-2xl font-bold tracking-tight",
            textClassName
          )}
        >
          {clamped}%
        </span>
        {label && (
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#927C8B]">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
