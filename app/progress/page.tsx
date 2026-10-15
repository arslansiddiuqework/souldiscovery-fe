"use client";

import {
  WeeklySummary,
  ProgressDateRangeChip,
} from "@/components/progress/weekly-summary";
import { Flower2 } from "lucide-react";
import { Container } from "@/components/ui/container";

export default function ProgressPage() {
  return (
    <div className="page-shell relative overflow-hidden pb-12 text-[#49263D] md:pb-16">
      <Container className="max-w-[1180px] space-y-7">
        <header
          data-particles-mask
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F2ECFF] text-[#8B6BC7]">
              <Flower2 className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div>
              <h1 className="text-[1.85rem] font-bold tracking-[-0.03em] text-[#49263D] md:text-[2.35rem]">
                Your Progress
              </h1>
              <p className="mt-1.5 max-w-[42ch] text-sm leading-relaxed text-[#957F94] md:text-[15px]">
                Track your mood, activities, and therapy sessions over time.
              </p>
            </div>
          </div>
          <ProgressDateRangeChip className="hidden self-start sm:inline-flex md:self-auto" />
        </header>

        <WeeklySummary />
      </Container>
    </div>
  );
}
