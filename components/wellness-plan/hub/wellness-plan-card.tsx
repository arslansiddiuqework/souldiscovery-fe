"use client";

import { ArrowRight, Clock, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CatalogPlan } from "@/lib/wellness-plan/catalog";
import { ACCENT_CLASSES } from "@/lib/wellness-plan/catalog";
import { getCatalogIcon } from "@/lib/wellness-plan/catalog/icons";

interface WellnessPlanCardProps {
  plan: CatalogPlan;
  status?: "available" | "active" | "completed";
  highlighted?: boolean;
  onOpen: (slug: string) => void;
}

export function WellnessPlanCard({
  plan,
  status = "available",
  highlighted = false,
  onOpen,
}: WellnessPlanCardProps) {
  const Icon = getCatalogIcon(plan.icon);
  const accent = ACCENT_CLASSES[plan.accent];
  const cta =
    status === "active"
      ? "Continue Plan"
      : status === "completed"
        ? "Review Plan"
        : "Start Plan";

  return (
    <article
      className={cn(
        "group flex h-full flex-col rounded-[20px] border bg-white p-4 shadow-[0_6px_22px_rgba(123,57,98,0.05)] transition",
        "hover:-translate-y-0.5 hover:border-[#DFC7D6] hover:shadow-[0_12px_28px_rgba(123,57,98,0.09)]",
        highlighted
          ? "border-[#E5B8D4] ring-1 ring-[#BE4A8B]/15"
          : "border-[#EEDCE9]"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            accent.bg,
            accent.icon
          )}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
        </span>
        {status === "active" ? (
          <span className="rounded-full bg-[#EAF6F2] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#3D9B84]">
            Active
          </span>
        ) : plan.format === "immediate" ? (
          <span className="rounded-full bg-[#FFF0F6] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#BE4A8B]">
            Immediate
          </span>
        ) : null}
      </div>

      <h3 className="mt-3 text-[14px] font-bold leading-snug tracking-[-0.02em] text-[#512943] sm:text-[15px]">
        {plan.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 flex-1 text-[12px] leading-relaxed text-[#957F94]">
        {plan.shortDescription}
      </p>

      <div className="mt-3 flex flex-col gap-2.5">
        <div className="flex flex-col gap-1 text-[11px] font-medium text-[#957F94]">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3 w-3 shrink-0" aria-hidden />
            {plan.suggestedDurationDays} days
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3 shrink-0" aria-hidden />
            {plan.estimatedMinutesPerDay}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onOpen(plan.slug)}
          aria-label={`${cta}: ${plan.title}`}
          className="inline-flex items-center gap-1 self-start text-[13px] font-semibold text-[#BE4A8B] transition group-hover:gap-1.5"
        >
          {cta}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
}
