"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Compass,
  Heart,
  History,
  LayoutGrid,
  Leaf,
  Loader2,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import {
  AssessmentCard,
  ComingSoonSection,
} from "@/components/assessments/assessment-card";
import { AssessmentIcon } from "@/components/assessments/assessment-icons";
import { NeedSupportNow } from "@/components/assessments/crisis-support";
import { AssessmentLearnMoreModal } from "@/components/assessments/assessment-learn-more-modal";
import { HelpMeChoose } from "@/components/assessments/help-me-choose";
import {
  fetchAssessmentCatalog,
  fetchAssessmentHistory,
  type AssessmentCard as AssessmentCardType,
  type CrisisPayload,
} from "@/lib/api/assessments";
import {
  availableFeelings,
  matchesDuration,
  matchesFeeling,
  matchesSearch,
  type DurationBand,
  type FeelingId,
} from "@/lib/assessments/feeling-discovery";
import { useSession } from "@/lib/contexts/session-context";
import { cn } from "@/lib/utils";

type HistoryEntry = {
  resultId: string;
  assessmentSlug: string;
  completedAt: string;
};

type StatusFilter = "all" | "not_started" | "completed";

const HERO_LANDSCAPE_SRC =
  "/branding/a_serene_minimal_pastel_dreamy_landscape_illustr.png";

const FEELING_VISUAL: Record<
  FeelingId,
  { wash: string; iconWrap: string; arrow: string }
> = {
  anxiety: {
    wash: "from-[#F3EEFF] via-white to-white",
    iconWrap: "bg-[#EDE5FF] text-[#7863C6]",
    arrow: "bg-[#EDE5FF] text-[#7863C6]",
  },
  low_mood: {
    wash: "from-[#FFF0F6] via-white to-white",
    iconWrap: "bg-[#FFE5F0] text-[#B74783]",
    arrow: "bg-[#FFE5F0] text-[#B74783]",
  },
  stress: {
    wash: "from-[#EEF4FF] via-white to-white",
    iconWrap: "bg-[#DCEBFF] text-[#4F7FE8]",
    arrow: "bg-[#DCEBFF] text-[#4F7FE8]",
  },
  sleep: {
    wash: "from-[#F0EAFE] via-white to-white",
    iconWrap: "bg-[#E2D6FF] text-[#5B3FA8]",
    arrow: "bg-[#E2D6FF] text-[#5B3FA8]",
  },
  social: {
    wash: "from-[#FFF5F0] via-white to-white",
    iconWrap: "bg-[#FFE8DC] text-[#C46B4A]",
    arrow: "bg-[#FFE8DC] text-[#C46B4A]",
  },
  general: {
    wash: "from-[#EEF8F4] via-white to-white",
    iconWrap: "bg-[#D8F0E6] text-[#287D58]",
    arrow: "bg-[#D8F0E6] text-[#287D58]",
  },
};

export default function AssessmentCenterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useSession();
  const reduceMotion = useReducedMotion();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [feelingId, setFeelingId] = useState<FeelingId | null>(null);
  const [durationBand, setDurationBand] = useState<DurationBand | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [assessments, setAssessments] = useState<AssessmentCardType[]>([]);
  const [featured, setFeatured] = useState<
    (AssessmentCardType & { headline: string; cta: string }) | null
  >(null);
  const [crisis, setCrisis] = useState<CrisisPayload | null>(null);
  const [historyBySlug, setHistoryBySlug] = useState<Map<string, HistoryEntry>>(
    new Map()
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [learnSlug, setLearnSlug] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const openLearnMore = useCallback(
    (slug: string) => {
      setLearnSlug(slug);
      const params = new URLSearchParams(searchParams.toString());
      params.set("learn", slug);
      router.replace(`/assessments?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const closeLearnMore = useCallback(() => {
    setLearnSlug(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("learn");
    const qs = params.toString();
    router.replace(qs ? `/assessments?${qs}` : "/assessments", { scroll: false });
  }, [router, searchParams]);

  useEffect(() => {
    const fromQuery = searchParams.get("learn");
    if (fromQuery) setLearnSlug(fromQuery);
  }, [searchParams]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 220);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAssessmentCatalog({});
        if (!active) return;
        setAssessments(data.assessments ?? []);
        setFeatured(data.featured ?? null);
        setCrisis(data.crisis ?? null);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load assessments");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    if (!isAuthenticated) {
      setHistoryBySlug(new Map());
      return;
    }
    let active = true;
    fetchAssessmentHistory()
      .then((data) => {
        if (!active) return;
        const map = new Map<string, HistoryEntry>();
        for (const item of data.history ?? []) {
          const existing = map.get(item.assessmentSlug);
          if (
            !existing ||
            new Date(item.completedAt) > new Date(existing.completedAt)
          ) {
            map.set(item.assessmentSlug, {
              resultId: item.resultId,
              assessmentSlug: item.assessmentSlug,
              completedAt: item.completedAt,
            });
          }
        }
        setHistoryBySlug(map);
      })
      .catch(() => {
        if (active) setHistoryBySlug(new Map());
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated, reloadKey]);

  const catalogForFeelings = useMemo(() => {
    const list = [...assessments];
    if (featured && !list.some((a) => a.slug === featured.slug)) {
      list.push(featured);
    }
    return list;
  }, [assessments, featured]);

  const feelings = useMemo(
    () => availableFeelings(catalogForFeelings),
    [catalogForFeelings]
  );

  const hasDurationMeta = useMemo(
    () =>
      assessments.some(
        (a) => typeof a.estimatedMinutes === "number" && a.estimatedMinutes > 0
      ),
    [assessments]
  );

  const publishedPool = useMemo(() => {
    const map = new Map<string, AssessmentCardType>();
    for (const a of assessments) {
      if (a.status === "published") map.set(a.slug, a);
    }
    if (featured && featured.status === "published") {
      map.set(featured.slug, featured);
    }
    return Array.from(map.values());
  }, [assessments, featured]);

  const comingSoon = useMemo(
    () => assessments.filter((a) => a.status === "coming_soon"),
    [assessments]
  );

  const filteredPublished = useMemo(() => {
    return publishedPool.filter((a) => {
      if (!matchesSearch(a, debouncedSearch)) return false;
      if (feelingId && !matchesFeeling(a, feelingId)) return false;
      if (
        durationBand !== "all" &&
        !matchesDuration(a, durationBand as DurationBand)
      ) {
        return false;
      }
      if (statusFilter === "completed" && !historyBySlug.has(a.slug)) {
        return false;
      }
      if (statusFilter === "not_started" && historyBySlug.has(a.slug)) {
        return false;
      }
      return true;
    });
  }, [
    publishedPool,
    debouncedSearch,
    feelingId,
    durationBand,
    statusFilter,
    historyBySlug,
  ]);

  const filteredComingSoon = useMemo(() => {
    return comingSoon.filter((a) => {
      if (!matchesSearch(a, debouncedSearch)) return false;
      if (feelingId && !matchesFeeling(a, feelingId)) return false;
      if (
        durationBand !== "all" &&
        !matchesDuration(a, durationBand as DurationBand)
      ) {
        return false;
      }
      // Coming soon never completed
      if (statusFilter === "completed") return false;
      return true;
    });
  }, [comingSoon, debouncedSearch, feelingId, durationBand, statusFilter]);

  const hasActiveFilters =
    !!feelingId ||
    durationBand !== "all" ||
    statusFilter !== "all" ||
    debouncedSearch.trim().length > 0;

  const clearFilters = () => {
    setFeelingId(null);
    setDurationBand("all");
    setStatusFilter("all");
    setSearch("");
    setDebouncedSearch("");
  };

  const scrollToLibrary = () => {
    document
      .getElementById("assessment-library")
      ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  const toggleFeeling = (id: FeelingId) => {
    setFeelingId((prev) => (prev === id ? null : id));
    requestAnimationFrame(() => {
      document
        .getElementById("assessment-library")
        ?.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "nearest",
        });
    });
  };

  return (
    <div className="relative min-h-screen bg-[#FBF9FF] text-[#49263D]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,_rgba(183,71,131,0.14),_transparent_58%),radial-gradient(ellipse_at_top_right,_rgba(120,99,198,0.1),_transparent_45%)]"
      />

      <div className="page-shell relative z-10 pb-16 pt-24 sm:pt-28">
        <div className="container-app space-y-10 sm:space-y-12">
          {/* —— Hero (design match) —— */}
          <section className="relative">
            <div className="relative overflow-hidden rounded-[28px] shadow-[0_22px_60px_rgba(120,99,198,0.16)] sm:rounded-[32px]">
              <div className="absolute inset-0">
                <Image
                  src={HERO_LANDSCAPE_SRC}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 1120px) 100vw, 1120px"
                  className="object-cover object-[center_40%]"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-r from-white/75 via-white/35 to-transparent"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-[#FBF9FF]/50 via-transparent to-white/20"
                />
              </div>

              <div className="relative z-10 grid gap-6 px-5 pb-8 pt-5 sm:px-8 sm:pb-10 sm:pt-6 lg:min-h-[320px] lg:grid-cols-[minmax(0,1.15fr)_minmax(160px,0.7fr)_minmax(240px,280px)] lg:items-center lg:gap-5 lg:px-10 lg:pb-12 lg:pt-8">
                <div
                  className="max-w-lg"
                  data-tour="assessments"
                  data-tour-priority="high"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-[#EDE5FF]/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#6D5BD0] shadow-sm backdrop-blur">
                      Wellness check-in
                    </span>
                    <NeedSupportNow crisis={crisis} compact />
                  </div>

                  <h1 className="mt-5 font-display text-[2rem] font-bold leading-[1.1] tracking-tight text-[#302B3D] sm:text-[2.55rem]">
                    How are you{" "}
                    <span className="text-gradient-brand">feeling?</span>
                  </h1>
                  <p className="mt-3 max-w-md text-[14px] leading-relaxed text-[#5C5670] sm:text-[15px]">
                    Take a few simple assessments to better understand your
                    well-being and discover helpful next steps.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setHelpOpen(true)}
                      className="inline-flex h-11 items-center gap-2 rounded-full bg-[#7C69EF] px-5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(124,105,239,0.35)] transition hover:bg-[#6A58E0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8A9FF] focus-visible:ring-offset-2"
                    >
                      <LayoutGrid className="h-4 w-4" aria-hidden />
                      Find My Assessment
                    </button>
                    <button
                      type="button"
                      onClick={scrollToLibrary}
                      className="inline-flex h-11 items-center gap-1.5 rounded-full border border-[#7C69EF]/35 bg-white/70 px-4 text-sm font-semibold text-[#6D5BD0] backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8A9FF]"
                    >
                      <Compass className="h-4 w-4" aria-hidden />
                      Explore All
                      <span aria-hidden>›</span>
                    </button>
                    <Link
                      href="/dashboard/assessment-history"
                      aria-label="Assessment history"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/70 text-[#6D5BD0] backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8A9FF]"
                    >
                      <History className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                {/* Own column so it never sits under the Help Me Choose card */}
                <div
                  aria-hidden
                  className="pointer-events-none hidden px-2 text-center lg:block"
                >
                  <p
                    className="mx-auto max-w-[11rem] text-[1.4rem] leading-[1.15] text-[#8B6BB8]/95"
                    style={{ fontFamily: "var(--font-script), cursive" }}
                  >
                    Small steps make a big difference
                  </p>
                  <Heart
                    className="mx-auto mt-1.5 h-3.5 w-3.5 fill-[#E9A8C8]/85 text-[#E9A8C8]"
                  />
                </div>

                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="relative z-20 w-full max-w-[280px] justify-self-end lg:max-w-none lg:justify-self-stretch"
                >
                  <div className="rounded-[24px] border border-white/90 bg-white/95 p-5 shadow-[0_20px_50px_rgba(90,70,140,0.18)] backdrop-blur-md">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F0EAFE] text-[#7C69EF] ring-1 ring-[#E9E2F2]">
                      <Compass className="h-6 w-6" aria-hidden />
                    </span>
                    <p className="mt-3 font-display text-[15px] font-bold leading-snug text-[#302B3D]">
                      Not sure where to start?
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[#716B7D]">
                      Let&apos;s find the right assessment for you.
                    </p>
                    <button
                      type="button"
                      onClick={() => setHelpOpen(true)}
                      className="mt-4 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-[#F4F1FA] px-4 text-xs font-bold text-[#5C5670] transition hover:bg-[#EDE5FF] hover:text-[#6D5BD0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8A9FF]"
                    >
                      Help Me Choose
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* —— Feeling discovery —— */}
          <section aria-labelledby="feeling-heading" className="pt-1">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EDE5FF] text-[#7C69EF]">
                  <Leaf className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <h2
                    id="feeling-heading"
                    className="font-display text-lg font-bold tracking-tight text-[#302B3D] sm:text-xl"
                  >
                    What would you like to understand?
                  </h2>
                  <p className="mt-1 text-sm text-[#716B7D]">
                    Choose what feels closest to what you&apos;re experiencing.
                  </p>
                </div>
              </div>
              {feelingId && (
                <button
                  type="button"
                  onClick={() => setFeelingId(null)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#7C69EF] ring-1 ring-[#E9E2F2] transition hover:bg-[#F0EAFE]"
                >
                  <X className="h-3 w-3" />
                  Clear
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex h-28 items-center justify-center rounded-[24px] border border-[#E9E2F2] bg-white/70">
                <Loader2 className="h-6 w-6 animate-spin text-[#7C69EF]" />
              </div>
            ) : feelings.length === 0 ? null : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {feelings.map((f, i) => {
                  const count = catalogForFeelings.filter((a) =>
                    matchesFeeling(a, f.id)
                  ).length;
                  const selected = feelingId === f.id;
                  const visual = FEELING_VISUAL[f.id];
                  return (
                    <motion.button
                      key={f.id}
                      type="button"
                      aria-pressed={selected}
                      aria-label={`${f.title}, ${count} assessment${count === 1 ? "" : "s"}. ${f.description}`}
                      title={f.description}
                      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: Math.min(i * 0.04, 0.2),
                        duration: 0.35,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      onClick={() => toggleFeeling(f.id)}
                      className={cn(
                        "group relative flex min-h-[148px] flex-col items-start overflow-hidden rounded-[22px] border bg-gradient-to-b p-4 text-left shadow-[0_10px_28px_rgba(90,70,140,0.06)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8A9FF] focus-visible:ring-offset-2",
                        visual.wash,
                        selected
                          ? "border-[#7C69EF]/45 shadow-[0_16px_36px_rgba(124,105,239,0.16)] ring-2 ring-[#7C69EF]/25"
                          : "border-[#E9E2F2]/90 hover:-translate-y-1 hover:border-[#D4C8F0] hover:shadow-[0_16px_40px_rgba(124,105,239,0.12)]"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full transition",
                          visual.iconWrap,
                          selected && "ring-2 ring-white/80"
                        )}
                      >
                        <AssessmentIcon name={f.icon} className="h-5 w-5" />
                      </span>
                      <span className="mt-3 text-[13px] font-bold leading-snug text-[#302B3D]">
                        {f.title}
                      </span>
                      <span className="mt-1 text-[11px] font-medium text-[#8A8499]">
                        {count} assessment{count === 1 ? "" : "s"}
                      </span>
                      <span
                        className={cn(
                          "mt-auto flex h-7 w-7 items-center justify-center self-end rounded-full transition group-hover:translate-x-0.5",
                          visual.arrow
                        )}
                      >
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </section>

          {/* —— Assessment library —— */}
          <section
            id="assessment-library"
            className="scroll-mt-28"
            aria-labelledby="library-heading"
          >
            <div className="overflow-hidden rounded-[28px] border border-[#EADCE5]/90 bg-white/85 shadow-[0_18px_50px_rgba(123,57,98,0.08)] backdrop-blur-xl">
              <div className="border-b border-[#EADCE5]/80 bg-gradient-to-r from-[#FFF8FB] via-white to-[#F8F0FF]/60 px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF0F7] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#B74783]">
                      <Sparkles className="h-3 w-3" aria-hidden />
                      Library
                    </span>
                    <h2
                      id="library-heading"
                      className="mt-2 font-display text-xl font-bold tracking-tight text-[#49263D] sm:text-2xl"
                    >
                      Explore Assessments
                    </h2>
                    <p className="mt-1 text-sm text-[#795A70]">
                      Choose an assessment that matches what you want to explore.
                      {!loading && (
                        <>
                          {" "}
                          <span className="font-semibold text-[#49263D]">
                            {filteredPublished.length}
                          </span>{" "}
                          available
                          {feelingId || debouncedSearch || durationBand !== "all"
                            ? " matching your filters"
                            : ""}
                          .
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
                    <label className="relative block min-w-0 flex-1 sm:w-[240px] sm:flex-none">
                      <span className="sr-only">Search assessments</span>
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#927C8B]" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search assessments..."
                        className="h-10 w-full rounded-full border border-[#EADCE5] bg-white pl-9 pr-9 text-sm text-[#49263D] shadow-sm transition placeholder:text-[#927C8B] focus:border-[#B74783]/40 focus:outline-none focus:ring-2 focus:ring-[#B74783]/15"
                      />
                      {search && (
                        <button
                          type="button"
                          aria-label="Clear search"
                          onClick={() => setSearch("")}
                          className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-[#927C8B] hover:bg-[#FFF0F6] hover:text-[#B74783]"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </label>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {hasDurationMeta && (
                    <div
                      className="flex flex-wrap items-center gap-1.5"
                      role="group"
                      aria-label="Duration filter"
                    >
                      {(
                        [
                          { id: "all", label: "Any time" },
                          { id: "few", label: "≤ 3 min" },
                          { id: "medium", label: "4–10 min" },
                          { id: "longer", label: "10+ min" },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          aria-pressed={durationBand === opt.id}
                          onClick={() => setDurationBand(opt.id)}
                          className={cn(
                            "rounded-full px-3 py-1.5 text-[11px] font-semibold transition",
                            durationBand === opt.id
                              ? "bg-[#B74783] text-white"
                              : "bg-white text-[#795A70] ring-1 ring-[#EADCE5] hover:bg-[#FFF0F6]"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {isAuthenticated && (
                    <div
                      className="flex flex-wrap items-center gap-1.5"
                      role="group"
                      aria-label="Completion status"
                    >
                      {(
                        [
                          { id: "all", label: "All" },
                          { id: "not_started", label: "Not started" },
                          { id: "completed", label: "Completed" },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          aria-pressed={statusFilter === opt.id}
                          onClick={() => setStatusFilter(opt.id)}
                          className={cn(
                            "rounded-full px-3 py-1.5 text-[11px] font-semibold transition",
                            statusFilter === opt.id
                              ? "bg-[#7863C6] text-white"
                              : "bg-white text-[#795A70] ring-1 ring-[#EADCE5] hover:bg-[#F0EAFE]"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-semibold text-[#B74783] hover:underline"
                    >
                      <X className="h-3 w-3" />
                      Clear filters
                    </button>
                  )}
                </div>
              </div>

              <div className="px-5 py-5 sm:px-6 sm:py-6">
                {loading ? (
                  <div className="flex min-h-[240px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#B74783]" />
                  </div>
                ) : error ? (
                  <div className="rounded-2xl border border-[#EADCE5] bg-[#FBF9FF] p-8 text-center">
                    <p className="font-display text-base font-semibold text-[#49263D]">
                      Couldn&apos;t load assessments
                    </p>
                    <p className="mt-2 text-sm text-[#795A70]">{error}</p>
                    <button
                      type="button"
                      className="mt-4 inline-flex h-10 items-center rounded-full bg-[#B74783] px-5 text-sm font-bold text-white"
                      onClick={() => setReloadKey((n) => n + 1)}
                    >
                      Retry
                    </button>
                  </div>
                ) : filteredPublished.length === 0 &&
                  filteredComingSoon.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#EADCE5] bg-[#FBF9FF] p-10 text-center">
                    <p className="font-display text-base font-semibold text-[#49263D]">
                      No assessments found
                    </p>
                    <p className="mt-2 text-sm text-[#795A70]">
                      Try another search or clear your filters.
                    </p>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-4 inline-flex h-10 items-center rounded-full border border-[#EADCE5] bg-white px-5 text-sm font-bold text-[#49263D] transition hover:bg-[#FFF0F6]"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <>
                    {filteredPublished.length === 0 ? (
                      <div className="mb-4 rounded-2xl border border-dashed border-[#EADCE5] bg-[#FBF9FF] p-6 text-center text-sm text-[#795A70]">
                        No available assessments match these filters.
                        {filteredComingSoon.length > 0
                          ? " See Coming soon below, or clear filters."
                          : " Try clearing your filters."}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {filteredPublished.map((a, i) => {
                          const past = historyBySlug.get(a.slug);
                          return (
                            <AssessmentCard
                              key={a.id}
                              assessment={a}
                              index={i}
                              onLearnMore={openLearnMore}
                              statusLabel={past ? "Completed" : null}
                              primaryAction={{
                                label: past
                                  ? "Retake Assessment"
                                  : "Start Assessment",
                                onClick: () => openLearnMore(a.slug),
                              }}
                              secondaryAction={
                                past
                                  ? {
                                      label: "View Results",
                                      onClick: () =>
                                        router.push(
                                          `/assessments/results/${past.resultId}`
                                        ),
                                    }
                                  : undefined
                              }
                            />
                          );
                        })}
                      </div>
                    )}
                    <ComingSoonSection assessments={filteredComingSoon} />
                  </>
                )}

                <p className="mt-8 text-xs leading-relaxed text-[#927C8B]">
                  Screening and reflection results are not a diagnosis. Explore
                  wellness activities anytime in your{" "}
                  <Link
                    href="/wellness-plan"
                    className="font-semibold text-[#9F376F] hover:underline"
                  >
                    Wellness Plan
                  </Link>
                  .
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <AssessmentLearnMoreModal
        slug={learnSlug}
        open={!!learnSlug}
        onClose={closeLearnMore}
      />

      <HelpMeChoose
        open={helpOpen}
        onOpenChange={setHelpOpen}
        assessments={catalogForFeelings}
        featured={featured}
        onSelectAssessment={openLearnMore}
      />
    </div>
  );
}
