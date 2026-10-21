"use client";

import { Compass } from "lucide-react";
import { useSession } from "@/lib/contexts/session-context";
import { useOnboarding } from "@/lib/onboarding/onboarding-context";
import { cn } from "@/lib/utils";

export function StartWebsiteTourButton({
  className,
}: {
  className?: string;
}) {
  const { isAuthenticated } = useSession();
  const { startTour, isActive } = useOnboarding();

  if (!isAuthenticated) return null;

  return (
    <button
      type="button"
      disabled={isActive}
      onClick={startTour}
      className={cn(
        "group flex h-full flex-col rounded-[20px] border border-[#EADCE5] bg-white p-6 text-left shadow-[0_8px_28px_rgba(123,57,98,0.06)] transition-all hover:-translate-y-0.5 hover:border-[#DFC7D6] hover:shadow-[0_12px_32px_rgba(123,57,98,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4] disabled:opacity-60",
        className
      )}
    >
      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFE5F0] text-[#B74783]">
        <Compass className="h-5 w-5" />
      </span>
      <span className="text-lg font-semibold text-[#49263D] group-hover:text-[#B74783]">
        Take a Website Tour
      </span>
      <span className="mt-2 flex-1 text-sm leading-relaxed text-[#795A70]">
        A short walkthrough of Dashboard, Wellness Plans, Assessments, and Calm tools.
      </span>
    </button>
  );
}
