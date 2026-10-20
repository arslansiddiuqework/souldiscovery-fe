"use client";

import { WeeklySummary } from "@/components/progress/weekly-summary";

export default function ProgressPage() {
  return (
    <div className="relative h-[100dvh] overflow-hidden text-[#49263D]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,rgba(183,71,131,0.07),transparent_70%)]"
      />
      <div className="container-app relative z-10 flex h-full min-h-0 flex-col pb-3 pt-[5.5rem] sm:pb-4 sm:pt-24 lg:pt-[6.5rem]">
        <WeeklySummary />
      </div>
    </div>
  );
}
