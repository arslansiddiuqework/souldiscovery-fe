"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  filterCatalogPlans,
  MORE_CATEGORIES,
  PLAN_CATEGORIES,
  WELLNESS_PLAN_CATALOG,
  type CatalogPlan,
} from "@/lib/wellness-plan/catalog";
import { WellnessPlanCard } from "./wellness-plan-card";
import type { WellnessPlan } from "@/lib/wellness-plan/types";

interface WellnessPlanExplorerProps {
  enrollments: WellnessPlan[];
  highlightSlugs?: string[];
  onOpenPlan: (slug: string) => void;
}

export function WellnessPlanExplorer({
  enrollments,
  highlightSlugs = [],
  onOpenPlan,
}: WellnessPlanExplorerProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [moreOpen, setMoreOpen] = useState(false);

  const plans = useMemo(
    () => filterCatalogPlans({ query, category }),
    [query, category]
  );

  const statusFor = (plan: CatalogPlan) => {
    const match = enrollments.find(
      (e) =>
        e.catalogSlug === plan.slug ||
        (plan.slug === "reduce-anxiety" &&
          e.primaryGoal === "reduce_anxiety" &&
          !e.catalogSlug)
    );
    if (!match) return "available" as const;
    if (match.status === "completed") return "completed" as const;
    if (match.status === "active") return "active" as const;
    return "available" as const;
  };

  const primaryFilters = PLAN_CATEGORIES.filter((c) => c !== "More");

  return (
    <section className="space-y-4 md:space-y-5">
      <div data-particles-mask className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-[#BE4A8B]" aria-hidden />
            <h2 className="text-xl font-bold tracking-[-0.02em] text-[#512943] md:text-[1.65rem]">
              Explore Wellness Plans
            </h2>
          </div>
          <p className="mt-1.5 max-w-[48ch] text-sm leading-relaxed text-[#957F94]">
            Find the right plan for how you&apos;re feeling. Each plan gives you
            simple, step-by-step support.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
        <div className="relative min-w-0 flex-1 lg:max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#957F94]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search wellness plans..."
            className="h-11 rounded-full border-[#EEDCE9] bg-white pl-10 shadow-[0_4px_14px_rgba(123,57,98,0.04)]"
            aria-label="Search wellness plans"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {primaryFilters.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                setCategory(chip);
                setMoreOpen(false);
              }}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                category === chip
                  ? "border-[#BE4A8B] bg-[#BE4A8B] text-white shadow-[0_4px_12px_rgba(190,74,139,0.2)]"
                  : "border-[#EEDCE9] bg-white text-[#795A70] hover:border-[#DFC7D6]"
              )}
            >
              {chip}
            </button>
          ))}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                category === "More" ||
                  MORE_CATEGORIES.includes(
                    category as (typeof MORE_CATEGORIES)[number]
                  )
                  ? "border-[#BE4A8B] bg-[#BE4A8B] text-white"
                  : "border-[#EEDCE9] bg-white text-[#795A70] hover:border-[#DFC7D6]"
              )}
            >
              More
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {moreOpen && (
              <div className="absolute right-0 z-20 mt-2 min-w-[180px] rounded-[14px] border border-[#EEDCE9] bg-white p-1.5 shadow-[0_12px_32px_rgba(123,57,98,0.12)]">
                {MORE_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCategory(c);
                      setMoreOpen(false);
                    }}
                    className={cn(
                      "block w-full rounded-[10px] px-3 py-2 text-left text-xs font-semibold text-[#512943] hover:bg-[#FFF0F6]",
                      category === c && "bg-[#FFF0F6] text-[#BE4A8B]"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
          {(query || category !== "All") && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full text-[#957F94]"
              onClick={() => {
                setQuery("");
                setCategory("All");
                setMoreOpen(false);
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {highlightSlugs.length > 0 && !query && category === "All" && (
        <p className="text-xs font-medium text-[#BE4A8B]">
          Suggested from your mood — still free to browse everything.
        </p>
      )}

      {plans.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-[#EEDCE9] bg-white px-6 py-12 text-center">
          <p className="font-semibold text-[#512943]">No plans match</p>
          <p className="mt-1 text-sm text-[#957F94]">
            Try a different search or clear filters.
          </p>
          <Button
            className="mt-4 rounded-full"
            variant="outline"
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
          >
            Reset filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 xl:gap-4">
          {(highlightSlugs.length
            ? [
                ...plans.filter((p) => highlightSlugs.includes(p.slug)),
                ...plans.filter((p) => !highlightSlugs.includes(p.slug)),
              ]
            : plans
          ).map((plan) => (
            <WellnessPlanCard
              key={plan.slug}
              plan={plan}
              status={statusFor(plan)}
              highlighted={highlightSlugs.includes(plan.slug)}
              onOpen={onOpenPlan}
            />
          ))}
        </div>
      )}

      <p className="text-center text-xs text-[#957F94]">
        Showing {plans.length} of {WELLNESS_PLAN_CATALOG.length} plans
      </p>
    </section>
  );
}
