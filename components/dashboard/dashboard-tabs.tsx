"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  ChevronRight,
  Heart,
  ListChecks,
  Sparkle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type DashTabId = "insights" | "checkins" | "todo" | "care";

const TABS: {
  id: DashTabId;
  label: string;
  hint: string;
  icon: LucideIcon;
  ink: string;
}[] = [
  {
    id: "insights",
    label: "Insights",
    hint: "Just for you",
    icon: Sparkle,
    ink: "text-[#B74783]",
  },
  {
    id: "checkins",
    label: "Check-ins",
    hint: "Your day",
    icon: CalendarDays,
    ink: "text-[#B74783]",
  },
  {
    id: "todo",
    label: "To-do",
    hint: "Plans",
    icon: ListChecks,
    ink: "text-[#7A5BB8]",
  },
  {
    id: "care",
    label: "Care",
    hint: "Support",
    icon: Heart,
    ink: "text-[#B74783]",
  },
];

export function DashboardTabs({
  value,
  onChange,
}: {
  value: DashTabId;
  onChange: (id: DashTabId) => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative shrink-0 px-3 py-2.5 sm:px-4 sm:py-3">
      <nav
        role="tablist"
        aria-label="Dashboard sections"
        className={cn(
          "mx-auto flex w-full items-stretch gap-1 rounded-[24px] p-1.5",
          "bg-[linear-gradient(180deg,rgba(255,248,251,0.9),rgba(244,232,255,0.55))]",
          "ring-1 ring-[#EADCE5]/90",
          "overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        {TABS.map((tab) => {
          const active = value === tab.id;
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              layout={reduceMotion ? false : "position"}
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative flex min-h-[64px] min-w-[148px] items-center gap-3 rounded-[18px] px-3 py-2 text-left sm:min-h-[68px] sm:min-w-0 sm:px-3.5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4] focus-visible:ring-offset-2",
                active ? "flex-[1.45]" : "flex-1 hover:bg-white/50"
              )}
            >
              {active && (
                <motion.span
                  layoutId={reduceMotion ? undefined : "dash-tab-stage"}
                  aria-hidden
                  className="absolute inset-0 overflow-hidden rounded-[18px] bg-white shadow-[0_10px_28px_rgba(123,57,98,0.1)] ring-1 ring-[#F0CADA]"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 420, damping: 34 }
                  }
                >
                  <span className="absolute inset-y-3 left-0 w-[3px] rounded-full bg-[linear-gradient(180deg,#E58AAF,#C9A4E0)]" />
                  <span className="absolute -right-6 -top-8 h-20 w-20 rounded-full bg-[#FFE5F0]/80" />
                </motion.span>
              )}

              <span
                className={cn(
                  "relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl",
                  active
                    ? "bg-[#B74783] text-white shadow-[0_6px_14px_rgba(183,71,131,0.28)]"
                    : cn("bg-white/80 ring-1 ring-[#EADCE5]", tab.ink)
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2.1} />
              </span>

              <span className="relative z-[1] min-w-0 flex-1">
                <span
                  className={cn(
                    "block truncate font-bold tracking-[-0.02em]",
                    active
                      ? "text-[15px] text-[#49263D]"
                      : "text-[13px] text-[#795A70]"
                  )}
                >
                  {tab.label}
                </span>
                <span
                  className={cn(
                    "mt-0.5 block truncate text-[11px] font-medium",
                    active ? "text-[#B74783]" : "text-[#927C8B]"
                  )}
                >
                  {tab.hint}
                </span>
              </span>

              {active && (
                <ChevronRight
                  aria-hidden
                  className="relative z-[1] h-4 w-4 shrink-0 text-[#C9A4E0]"
                  strokeWidth={2}
                />
              )}
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}
