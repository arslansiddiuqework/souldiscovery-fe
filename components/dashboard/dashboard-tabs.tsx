"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  HeartHandshake,
  ListTodo,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type DashTabId = "insights" | "checkins" | "todo" | "care";

const TABS: {
  id: DashTabId;
  label: string;
  hint: string;
  icon: LucideIcon;
}[] = [
  { id: "insights", label: "Insights", hint: "Just for you", icon: Sparkles },
  { id: "checkins", label: "Check-ins", hint: "Your day", icon: CalendarDays },
  { id: "todo", label: "To-do", hint: "Plans", icon: ListTodo },
  { id: "care", label: "Care", hint: "Support", icon: HeartHandshake },
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
    <div className="relative shrink-0 border-b border-[#EADCE5]/70 bg-[#FFF8FB]/70 px-3 py-2 sm:px-4 sm:py-2.5">
      <nav
        role="tablist"
        aria-label="Dashboard sections"
        className="relative grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5"
      >
        {TABS.map((tab) => {
          const active = value === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.id)}
              className={cn(
                "group relative flex min-h-[72px] items-center gap-3 overflow-hidden rounded-[20px] px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4] sm:min-h-[76px] sm:px-3.5",
                active
                  ? "bg-white shadow-[0_14px_32px_rgba(123,57,98,0.12)] ring-1 ring-[#F0D9E6]"
                  : "bg-white/55 ring-1 ring-[#EADCE5]/80 hover:bg-white hover:shadow-[0_8px_20px_rgba(123,57,98,0.08)]"
              )}
            >
              {active && (
                <motion.span
                  layoutId={reduceMotion ? undefined : "dash-tab-glow"}
                  className="pointer-events-none absolute -right-4 -top-6 h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(183,71,131,0.18),transparent_70%)]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}

              <span
                className={cn(
                  "relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition duration-300",
                  active
                    ? "bg-gradient-to-br from-[#D468A0] via-[#B74783] to-[#9B3A6E] text-white shadow-[0_10px_22px_rgba(183,71,131,0.35)]"
                    : "bg-[#FFF0F6] text-[#C27A9F] ring-1 ring-[#F0D9E6] group-hover:text-[#B74783]"
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={2.15} />
              </span>

              <span className="relative z-[1] min-w-0">
                <span
                  className={cn(
                    "block truncate font-display text-[13px] font-bold tracking-tight sm:text-sm",
                    active ? "text-[#49263D]" : "text-[#795A70]"
                  )}
                >
                  {tab.label}
                </span>
                <span
                  className={cn(
                    "mt-0.5 block truncate text-[10px] font-medium sm:text-[11px]",
                    active ? "text-[#B74783]" : "text-[#A8939E]"
                  )}
                >
                  {tab.hint}
                </span>
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
