"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  Compass,
  History,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import {
  AssessmentCard,
  ComingSoonSection,
} from "@/components/assessments/assessment-card";
import { AssessmentIcon } from "@/components/assessments/assessment-icons";
import { NeedSupportNow } from "@/components/assessments/crisis-support";
import { AssessmentLearnMoreModal } from "@/components/assessments/assessment-learn-more-modal";
import {
  fetchAssessmentCatalog,
  type AssessmentCard as AssessmentCardType,
  type CrisisPayload,
} from "@/lib/api/assessments";

export default function AssessmentCenterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [assessments, setAssessments] = useState<AssessmentCardType[]>([]);
  const [featured, setFeatured] = useState<
    (AssessmentCardType & { headline: string; cta: string }) | null
  >(null);
  const [categories, setCategories] = useState<Array<{ id: string; label: string }>>([]);
  const [trust, setTrust] = useState<string[]>([]);
  const [crisis, setCrisis] = useState<CrisisPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [learnSlug, setLearnSlug] = useState<string | null>(null);

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
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAssessmentCatalog({ search, category });
        if (!active) return;
        setAssessments(data.assessments ?? []);
        setFeatured(data.featured ?? null);
        setCategories(data.categories ?? []);
        setTrust(data.trust ?? []);
        setCrisis(data.crisis ?? null);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load assessments");
      } finally {
        if (active) setLoading(false);
      }
    };
    const t = setTimeout(load, search ? 250 : 0);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [search, category]);

  const available = useMemo(
    () => assessments.filter((a) => a.status === "published"),
    [assessments]
  );
  const comingSoon = useMemo(
    () => assessments.filter((a) => a.status === "coming_soon"),
    [assessments]
  );

  return (
    <div className="relative min-h-screen bg-[#FBF9FF] text-[#302B3D]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(183,71,131,0.12),transparent_60%)]"
      />

      <div className="page-shell relative z-10 pb-14 pt-24 sm:pt-28">
        <div className="container-app">
          {/* Mobile intro strip */}
          <div className="mb-5 flex flex-col gap-3 lg:hidden">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7863C6]">
                Assessment Center
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#302B3D]">
                Understand yourself a little better.
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/dashboard/assessment-history"
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#EADCE5] bg-white px-3 text-xs font-bold text-[#49263D] shadow-sm"
              >
                <History className="h-3.5 w-3.5 text-[#7863C6]" />
                History
              </Link>
              <NeedSupportNow crisis={crisis} compact className="shrink-0" />
            </div>
          </div>

          <div className="min-h-[calc(100dvh-9.5rem)] overflow-hidden rounded-[28px] border border-[#EADCE5] bg-white/90 shadow-[0_16px_48px_rgba(123,57,98,0.08)] backdrop-blur lg:min-h-[calc(100dvh-10.5rem)]">
            <div className="grid h-full min-h-[inherit] lg:grid-cols-[300px_minmax(0,1fr)]">
              {/* Left rail — shared top padding with right header */}
              <aside className="relative flex h-full flex-col border-b border-[#EADCE5] bg-gradient-to-b from-[#FFF5FA] via-[#FBF9FF] to-white px-5 py-4 sm:px-6 lg:border-b-0 lg:border-r">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-8 top-10 h-40 w-40 rounded-full bg-[#7863C6]/10 blur-3xl"
                />

                <div className="relative hidden lg:block">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7863C6]">
                      Assessment Center
                    </p>
                    <NeedSupportNow crisis={crisis} compact />
                  </div>
                  <h1 className="mt-3 text-[1.45rem] font-bold leading-[1.2] tracking-tight text-[#302B3D]">
                    Understand yourself a little better.
                  </h1>
                  <p className="mt-2 text-sm leading-relaxed text-[#716B7D]">
                    Check in with your feelings, explore patterns, and find small steps toward
                    well-being.
                  </p>
                </div>

                <div className="relative mt-4 grid grid-cols-1 gap-2">
                  <a
                    href="#catalog"
                    className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#B74783] px-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(183,71,131,0.25)] transition hover:bg-[#9F376F]"
                  >
                    Explore assessments
                  </a>
                  {featured && (
                    <button
                      type="button"
                      onClick={() => openLearnMore(featured.slug)}
                      className="inline-flex h-11 w-full items-center justify-center rounded-full border border-[#EADCE5] bg-white px-4 text-sm font-bold text-[#49263D] transition hover:bg-[#FFF0F6]"
                    >
                      Starting point
                    </button>
                  )}
                  <Link
                    href="/dashboard/assessment-history"
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#EADCE5] bg-white px-4 text-sm font-bold text-[#49263D] transition hover:bg-[#F0EAFE]"
                  >
                    <History className="h-4 w-4 text-[#7863C6]" />
                    History
                  </Link>
                </div>

                {featured && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="relative mt-5 overflow-hidden rounded-2xl border border-[#E9E2F2] bg-gradient-to-br from-[#F0EAFE] via-white to-[#FFF0F7] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#7863C6] shadow-sm">
                        {featured.icon ? (
                          <AssessmentIcon name={featured.icon} className="h-5 w-5" />
                        ) : (
                          <Compass className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold leading-snug text-[#302B3D]">
                          {featured.headline || featured.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#716B7D]">
                          {featured.shortDescription}
                        </p>
                        <button
                          type="button"
                          onClick={() => openLearnMore(featured.slug)}
                          className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#B74783] transition hover:underline"
                        >
                          {featured.cta || "Find a starting point"}
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {trust.length > 0 && (
                  <ul className="relative mt-5 space-y-2.5">
                    {trust.map((item, i) => (
                      <motion.li
                        key={item}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * i, duration: 0.35 }}
                        className="grid grid-cols-[14px_1fr] items-start gap-2.5 text-xs leading-snug text-[#716B7D]"
                      >
                        <CheckCircle2
                          className="mt-px h-3.5 w-3.5 text-[#287D58]"
                          aria-hidden
                        />
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </aside>

              {/* Right: catalog */}
              <section id="catalog" className="flex h-full min-h-0 flex-col scroll-mt-24">
                <div className="border-b border-[#EADCE5] bg-white px-5 py-3 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="min-w-0">
                      <span className="inline-flex h-5 items-center gap-1 rounded-full bg-[#FFF0F7] px-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#B74783]">
                        <Sparkles className="h-3 w-3" aria-hidden />
                        Ready to start
                      </span>
                      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <h2 className="text-xl font-bold tracking-tight text-[#302B3D]">
                          Available now
                        </h2>
                        <p className="text-sm text-[#716B7D]">
                          {available.length} free reflection
                          {available.length === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>

                    <div className="flex w-full items-center gap-2 sm:w-auto sm:shrink-0">
                      <label className="relative block min-w-0 flex-1 sm:w-[200px] sm:flex-none">
                        <span className="sr-only">Search assessments</span>
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#927C8B]" />
                        <input
                          value={search}
                          onChange={(e) => {
                            const v = e.target.value;
                            startTransition(() => setSearch(v));
                          }}
                          placeholder="Search assessments"
                          className="input-field h-9 w-full rounded-full border border-[#EADCE5] bg-[#FBF9FF] pl-9 pr-3 text-sm transition focus:border-[#B74783]/40 focus:ring-2 focus:ring-[#B74783]/15"
                        />
                      </label>
                      <label className="shrink-0">
                        <span className="sr-only">Filter by category</span>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="select-field w-[120px] sm:w-[150px]"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-4">
                  {loading ? (
                    <div className="flex min-h-[280px] items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-[#B74783]" />
                    </div>
                  ) : error ? (
                    <div className="rounded-2xl border border-[#EADCE5] bg-[#FBF9FF] p-8 text-center">
                      <p className="text-[#49263D]">{error}</p>
                      <button
                        type="button"
                        className="mt-4 text-sm font-semibold text-[#B74783]"
                        onClick={() => setCategory((c) => c)}
                      >
                        Try again
                      </button>
                    </div>
                  ) : available.length === 0 && comingSoon.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#EADCE5] bg-[#FBF9FF] p-10 text-center text-[#716B7D]">
                      No assessments match your search.
                    </div>
                  ) : (
                    <>
                      {available.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-[#EADCE5] bg-[#FBF9FF] p-8 text-center text-sm text-[#716B7D]">
                          No available assessments match this filter. Check Coming soon below, or
                          clear your search.
                        </div>
                      ) : (
                        <div
                          className={`grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3 ${
                            isPending ? "opacity-70" : ""
                          }`}
                        >
                          {available.map((a, i) => (
                            <AssessmentCard
                              key={a.id}
                              assessment={a}
                              index={i}
                              onLearnMore={openLearnMore}
                            />
                          ))}
                        </div>
                      )}
                      <ComingSoonSection assessments={comingSoon} />
                    </>
                  )}

                  <p className="mt-auto pt-8 text-left text-xs leading-relaxed text-[#927C8B]">
                    Screening and reflection results are not a diagnosis. Explore free wellness
                    activities anytime in your{" "}
                    <Link
                      href="/wellness-plan"
                      className="font-semibold text-[#9F376F] hover:underline"
                    >
                      Wellness Plan
                    </Link>
                    .
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <AssessmentLearnMoreModal
        slug={learnSlug}
        open={!!learnSlug}
        onClose={closeLearnMore}
      />
    </div>
  );
}
