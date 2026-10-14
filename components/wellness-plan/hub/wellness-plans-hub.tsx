"use client";

import { useMemo, useState } from "react";
import { WellnessWelcomeHero } from "./wellness-welcome-hero";
import { DailyMoodCheckIn } from "./daily-mood-checkin";
import { ImmediateSupportSection } from "./immediate-support-section";
import { ActivePlanSummary } from "./active-plan-summary";
import { WellnessPlanExplorer } from "./wellness-plan-explorer";
import type { WellnessPlan } from "@/lib/wellness-plan/types";

interface WellnessPlansHubProps {
  activePlan: WellnessPlan | null;
  enrollments: WellnessPlan[];
  onContinueActive: () => void;
  onOpenPlan: (slug: string) => void;
}

export function WellnessPlansHub({
  activePlan,
  enrollments,
  onContinueActive,
  onOpenPlan,
}: WellnessPlansHubProps) {
  const [suggestedSlugs, setSuggestedSlugs] = useState<string[]>([]);

  const orderedSuggestions = useMemo(
    () => suggestedSlugs,
    [suggestedSlugs]
  );

  return (
    <div className="relative space-y-5 md:space-y-7">
      {/* Soft pastel wash — left only; live connected-dots stay in root layout */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-6 -top-8 bottom-0 -z-10 overflow-hidden md:-inset-x-10"
      >
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(232,168,198,0.22)_0%,rgba(232,168,198,0)_72%)] blur-2xl" />
      </div>

      <WellnessWelcomeHero />
      <DailyMoodCheckIn onSuggestPlans={setSuggestedSlugs} />
      <ImmediateSupportSection />
      {activePlan && activePlan.status === "active" && (
        <ActivePlanSummary plan={activePlan} onContinue={onContinueActive} />
      )}
      <WellnessPlanExplorer
        enrollments={enrollments}
        highlightSlugs={orderedSuggestions}
        onOpenPlan={onOpenPlan}
      />
    </div>
  );
}
