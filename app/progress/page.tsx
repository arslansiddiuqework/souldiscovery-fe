"use client";

import { WeeklySummary } from "@/components/progress/weekly-summary";

export default function ProgressPage() {
  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden text-[#49263D]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(183,71,131,0.08),transparent_65%)]"
      />
      <div className="container-app relative z-10 pb-10 pt-[5.5rem] sm:pb-12 sm:pt-24 lg:pt-[6.5rem]">
        <WeeklySummary />
      </div>
    </div>
  );
}
