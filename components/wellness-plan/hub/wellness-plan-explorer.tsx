"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  CalendarDays,
  ChevronDown,
  Clock,
  CloudRain,
  Focus,
  HeartHandshake,
  LayoutGrid,
  Moon,
  Search,
  Sparkles,
  Sprout,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ACCENT_CLASSES,
  filterCatalogPlans,
  MORE_CATEGORIES,
  PLAN_CATEGORIES,
  WELLNESS_PLAN_CATALOG,
  type CatalogPlan,
} from "@/lib/wellness-plan/catalog";
import { getCatalogIcon } from "@/lib/wellness-plan/catalog/icons";
import type { WellnessPlan } from "@/lib/wellness-plan/types";
import {
  computePlanProgress,
  getCurrentWeek,
} from "@/lib/wellness-plan/generate-plan";

const FILTER_META: Record<
  string,
  {
    icon: typeof LayoutGrid;
    idle: string;
    active: string;
  }
> = {
  All: {
    icon: LayoutGrid,
    idle: "border-[#D5E6DD] bg-white text-[#3A4F47] hover:border-[#A8CFBE] hover:bg-[#F0FAF5]",
    active:
      "border-transparent bg-gradient-to-r from-[#3D9B84] to-[#2F8A74] text-white shadow-[0_8px_18px_rgba(61,155,132,0.32)]",
  },
  Anxiety: {
    icon: CloudRain,
    idle: "border-[#F0CADA] bg-[#FFF7FB] text-[#9F376F] hover:border-[#E5B8D4] hover:bg-[#FFF0F6]",
    active:
      "border-transparent bg-gradient-to-r from-[#B74783] to-[#9F376F] text-white shadow-[0_8px_18px_rgba(183,71,131,0.3)]",
  },
  Mood: {
    icon: Sparkles,
    idle: "border-[#E0CBF0] bg-[#FAF6FF] text-[#6B3D8A] hover:border-[#D0B4EA] hover:bg-[#F4E8FF]",
    active:
      "border-transparent bg-gradient-to-r from-[#9658B7] to-[#7A3F9A] text-white shadow-[0_8px_18px_rgba(150,88,183,0.3)]",
  },
  Sleep: {
    icon: Moon,
    idle: "border-[#D5E0FF] bg-[#F5F8FF] text-[#3D5BB5] hover:border-[#B8C8F5] hover:bg-[#EDF2FF]",
    active:
      "border-transparent bg-gradient-to-r from-[#5B7CDA] to-[#4566C4] text-white shadow-[0_8px_18px_rgba(91,124,218,0.3)]",
  },
  Stress: {
    icon: Zap,
    idle: "border-[#F5DCCB] bg-[#FFF8F3] text-[#B56A3F] hover:border-[#EBC4A8] hover:bg-[#FFF1E9]",
    active:
      "border-transparent bg-gradient-to-r from-[#D4845A] to-[#C06F45] text-white shadow-[0_8px_18px_rgba(212,132,90,0.3)]",
  },
};

const MORE_ICONS: Record<string, typeof Sprout> = {
  Confidence: Sprout,
  Relationships: Users,
  Focus: Focus,
  "Personal Growth": Brain,
  "Emotional Wellbeing": HeartHandshake,
};

interface WellnessPlanExplorerProps {
  enrollments: WellnessPlan[];
  highlightSlugs?: string[];
  activePlan?: WellnessPlan | null;
  onOpenPlan: (slug: string) => void;
  onContinueActive?: () => void;
}

export function WellnessPlanExplorer({
  enrollments,
  highlightSlugs = [],
  activePlan = null,
  onOpenPlan,
  onContinueActive,
}: WellnessPlanExplorerProps) {
  const reduceMotion = useReducedMotion();
  const moreRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [moreOpen, setMoreOpen] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string>(
    activePlan?.catalogSlug || WELLNESS_PLAN_CATALOG[0]?.slug || ""
  );

  const plans = useMemo(
    () => filterCatalogPlans({ query, category }),
    [query, category]
  );

  const orderedPlans = useMemo(() => {
    if (!highlightSlugs.length) return plans;
    return [
      ...plans.filter((p) => highlightSlugs.includes(p.slug)),
      ...plans.filter((p) => !highlightSlugs.includes(p.slug)),
    ];
  }, [plans, highlightSlugs]);

  useEffect(() => {
    if (!orderedPlans.length) return;
    if (!orderedPlans.some((p) => p.slug === activeSlug)) {
      setActiveSlug(orderedPlans[0].slug);
    }
  }, [orderedPlans, activeSlug]);

  useEffect(() => {
    if (highlightSlugs[0]) {
      setActiveSlug(highlightSlugs[0]);
      setCategory("All");
    }
  }, [highlightSlugs]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const selected =
    orderedPlans.find((p) => p.slug === activeSlug) || orderedPlans[0] || null;

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
  const moreSelected = MORE_CATEGORIES.includes(
    category as (typeof MORE_CATEGORIES)[number]
  );
  const status = selected ? statusFor(selected) : "available";
  const Icon = selected ? getCatalogIcon(selected.icon) : Sparkles;
  const accent = selected ? ACCENT_CLASSES[selected.accent] : ACCENT_CLASSES.mint;

  const isActiveEnrollment =
    !!activePlan &&
    activePlan.status === "active" &&
    selected &&
    (activePlan.catalogSlug === selected.slug ||
      (!activePlan.catalogSlug && selected.slug === "reduce-anxiety"));
  const progress =
    isActiveEnrollment && activePlan ? computePlanProgress(activePlan) : null;
  const week =
    isActiveEnrollment && activePlan ? getCurrentWeek(activePlan) : null;

  const ctaLabel =
    status === "active"
      ? "Continue Plan"
      : status === "completed"
        ? "Review Plan"
        : "Start Plan";

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      {/* Library toolbar */}
      <div className="shrink-0 border-b border-[#DCE9E2] bg-gradient-to-b from-[#F7FBF9] to-white px-4 py-3.5 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#EAF6F2] to-[#D8F0E8] text-[#3D9B84] shadow-sm ring-1 ring-[#C8E8DE]/80">
              <LayoutGrid className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <h2 className="text-base font-bold tracking-tight text-[#2A3D36]">
                Plan library
              </h2>
              <p className="text-[11px] font-medium text-[#6F857C]">
                {orderedPlans.length} of {WELLNESS_PLAN_CATALOG.length} paths
                {highlightSlugs.length > 0 ? " · mood matches first" : ""}
              </p>
            </div>
          </div>
          <label className="relative block w-full sm:w-[220px]">
            <span className="sr-only">Search plans</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6F857C]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search plans…"
              className="h-10 w-full rounded-full border border-[#D5E6DD] bg-white pl-9 pr-3 text-xs font-medium shadow-[0_4px_14px_rgba(42,80,64,0.05)] transition placeholder:text-[#9BB0A6] focus:border-[#3D9B84]/45 focus:outline-none focus:ring-2 focus:ring-[#3D9B84]/15"
            />
          </label>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {primaryFilters.map((chip) => {
            const meta = FILTER_META[chip] || FILTER_META.All;
            const ChipIcon = meta.icon;
            const isOn = category === chip;
            return (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setCategory(chip);
                  setMoreOpen(false);
                }}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12px] font-bold transition",
                  isOn ? meta.active : meta.idle
                )}
              >
                <ChipIcon className="h-3.5 w-3.5" strokeWidth={2.25} />
                {chip}
              </button>
            );
          })}

          <div className="relative shrink-0" ref={moreRef}>
            <button
              type="button"
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              onClick={() => setMoreOpen((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12px] font-bold transition",
                moreSelected || moreOpen
                  ? "border-transparent bg-gradient-to-r from-[#6B8F7E] to-[#4F7364] text-white shadow-[0_8px_18px_rgba(79,115,100,0.28)]"
                  : "border-[#D5E6DD] bg-white text-[#3A4F47] hover:border-[#A8CFBE] hover:bg-[#F0FAF5]"
              )}
            >
              {moreSelected ? category : "More"}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition",
                  moreOpen && "rotate-180"
                )}
              />
            </button>
            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  role="menu"
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 z-30 mt-2 min-w-[200px] overflow-hidden rounded-2xl border border-[#D5E6DD] bg-white p-1.5 shadow-[0_16px_40px_rgba(42,80,64,0.14)]"
                >
                  {MORE_CATEGORIES.map((c) => {
                    const MoreIcon = MORE_ICONS[c] || Sprout;
                    return (
                      <button
                        key={c}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setCategory(c);
                          setMoreOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition",
                          category === c
                            ? "bg-[#EAF6F2] text-[#2A7A66]"
                            : "text-[#3A4F47] hover:bg-[#F7FBF9]"
                        )}
                      >
                        <MoreIcon className="h-4 w-4 text-[#3D9B84]" />
                        {c}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Selected plan — richer editorial card */}
      <div className="shrink-0 border-b border-[#DCE9E2] px-4 py-3.5 sm:px-5">
        {selected ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={selected.slug}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-[22px] border border-[#D5E6DD] bg-gradient-to-br from-white via-[#F7FBF9] to-[#EAF6F2]/70 p-4 shadow-[0_10px_28px_rgba(42,80,64,0.07)] sm:p-5"
            >
              <div
                aria-hidden
                className={cn(
                  "absolute -right-8 -top-10 h-32 w-32 rounded-full blur-3xl opacity-70",
                  accent.soft
                )}
              />
              <div className="relative flex flex-col gap-3.5 sm:flex-row sm:items-center sm:gap-5">
                <div
                  className={cn(
                    "flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] shadow-sm ring-1 ring-black/5 sm:h-16 sm:w-16",
                    accent.bg,
                    accent.icon
                  )}
                >
                  <Icon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.55} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#5A7268] shadow-sm ring-1 ring-[#D5E6DD]">
                      {selected.category}
                    </span>
                    {status === "active" && (
                      <span className="rounded-full bg-[#EAF6F2] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#3D9B84] ring-1 ring-[#C8E8DE]">
                        Active
                      </span>
                    )}
                    {highlightSlugs.includes(selected.slug) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF0F6] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#BE4A8B] ring-1 ring-[#F0CADA]">
                        <Sparkles className="h-3 w-3" />
                        Mood match
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1.5 text-lg font-bold tracking-tight text-[#2A3D36] sm:text-xl">
                    {selected.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[#6F857C]">
                    {selected.shortDescription}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-[11px] font-semibold text-[#6F857C]">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 ring-1 ring-[#D5E6DD]/80">
                      <CalendarDays className="h-3 w-3 text-[#3D9B84]" />
                      {selected.suggestedDurationDays} days
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 ring-1 ring-[#D5E6DD]/80">
                      <Clock className="h-3 w-3 text-[#3D9B84]" />
                      {selected.estimatedMinutesPerDay}
                    </span>
                    {progress && (
                      <span className="inline-flex items-center rounded-full bg-[#EAF6F2] px-2.5 py-1 text-[#2A7A66] ring-1 ring-[#C8E8DE]">
                        {progress.percent}% · Week {week?.weekNumber ?? 1}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (isActiveEnrollment && onContinueActive) {
                      onContinueActive();
                    } else {
                      onOpenPlan(selected.slug);
                    }
                  }}
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-gradient-to-r from-[#3D9B84] to-[#2F8A74] px-6 text-sm font-bold text-white shadow-[0_10px_24px_rgba(61,155,132,0.32)] transition hover:brightness-[1.03] sm:self-center"
                >
                  {ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#D5E6DD] bg-[#F7FBF9] py-6 text-center text-sm text-[#6F857C]">
            No plans match. Try clearing filters.
          </div>
        )}
      </div>

      {/* Plan rows — constrained height so overflow-y can scroll */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2.5 sm:px-4 [scrollbar-gutter:stable]">
        {orderedPlans.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-[#D5E6DD] bg-[#F7FBF9] p-8 text-center">
            <div>
              <p className="font-semibold text-[#2A3D36]">No plans match</p>
              <button
                type="button"
                className="mt-2 text-sm font-semibold text-[#3D9B84]"
                onClick={() => {
                  setQuery("");
                  setCategory("All");
                }}
              >
                Reset filters
              </button>
            </div>
          </div>
        ) : (
          <ul className="space-y-2" role="listbox" aria-label="Wellness plans">
            {orderedPlans.map((plan, index) => {
              const PlanIcon = getCatalogIcon(plan.icon);
              const isOn = plan.slug === selected?.slug;
              const planAccent = ACCENT_CLASSES[plan.accent];
              const planStatus = statusFor(plan);
              return (
                <motion.li
                  key={plan.slug}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: Math.min(index * 0.02, 0.2),
                    duration: 0.25,
                  }}
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={isOn}
                    onClick={() => setActiveSlug(plan.slug)}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition",
                      isOn
                        ? "border-[#3D9B84]/30 bg-gradient-to-r from-[#EAF6F2] to-white shadow-[0_8px_20px_rgba(61,155,132,0.12)]"
                        : "border-[#E8F0EC] bg-white hover:border-[#C8E8DE] hover:bg-[#F7FBF9] hover:shadow-[0_6px_16px_rgba(42,80,64,0.06)]"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-black/[0.03]",
                        planAccent.bg,
                        planAccent.icon
                      )}
                    >
                      <PlanIcon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span
                          className={cn(
                            "truncate text-sm font-bold",
                            isOn ? "text-[#2A3D36]" : "text-[#3A4F47]"
                          )}
                        >
                          {plan.title.replace(/ Plan$/, "")}
                        </span>
                        {planStatus === "active" && (
                          <span className="rounded-full bg-[#EAF6F2] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#3D9B84]">
                            Active
                          </span>
                        )}
                        {highlightSlugs.includes(plan.slug) && (
                          <Sparkles className="h-3 w-3 shrink-0 text-[#BE4A8B]" />
                        )}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] font-medium text-[#6F857C]">
                        {plan.category} · {plan.suggestedDurationDays}d ·{" "}
                        {plan.estimatedMinutesPerDay}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition",
                        isOn
                          ? "bg-[#3D9B84] text-white"
                          : "bg-[#F0F6F3] text-[#6F857C] group-hover:bg-[#EAF6F2] group-hover:text-[#3D9B84]"
                      )}
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
