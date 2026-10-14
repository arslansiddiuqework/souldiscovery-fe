"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  ChevronDown,
  Clock,
  Lock,
  Sparkles,
  Users,
} from "lucide-react";
import type { AssessmentCard as AssessmentCardType } from "@/lib/api/assessments";
import { AssessmentIcon, categoryLabel, typeBadgeLabel } from "./assessment-icons";
import { cn } from "@/lib/utils";

const CARD_THEMES = [
  {
    wash: "from-[#FFF0F7] via-white to-[#F8F0FF]",
    orb: "bg-[#B74783]/25",
    iconBg: "bg-gradient-to-br from-[#FFE0EF] to-[#F0EAFE]",
    iconColor: "text-[#B74783]",
    accent: "group-hover:border-[#B74783]/35 group-hover:shadow-[0_20px_50px_rgba(183,71,131,0.16)]",
    cta: "group-hover:bg-[#B74783] group-hover:text-white group-hover:border-[#B74783]",
    bar: "from-[#B74783] to-[#7863C6]",
  },
  {
    wash: "from-[#F0EAFE] via-white to-[#EEF6FF]",
    orb: "bg-[#7863C6]/25",
    iconBg: "bg-gradient-to-br from-[#E8E0FF] to-[#DCEBFF]",
    iconColor: "text-[#7863C6]",
    accent: "group-hover:border-[#7863C6]/35 group-hover:shadow-[0_20px_50px_rgba(120,99,198,0.16)]",
    cta: "group-hover:bg-[#7863C6] group-hover:text-white group-hover:border-[#7863C6]",
    bar: "from-[#7863C6] to-[#5B8DEF]",
  },
  {
    wash: "from-[#EEF8F4] via-white to-[#FFF5F0]",
    orb: "bg-[#287D58]/20",
    iconBg: "bg-gradient-to-br from-[#D8F0E6] to-[#FFE8DC]",
    iconColor: "text-[#287D58]",
    accent: "group-hover:border-[#287D58]/30 group-hover:shadow-[0_20px_50px_rgba(40,125,88,0.14)]",
    cta: "group-hover:bg-[#287D58] group-hover:text-white group-hover:border-[#287D58]",
    bar: "from-[#287D58] to-[#B74783]",
  },
] as const;

function themeFor(slug: string) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash + slug.charCodeAt(i) * (i + 1)) % 997;
  return CARD_THEMES[hash % CARD_THEMES.length];
}

export function AssessmentCard({
  assessment,
  featured = false,
  index = 0,
}: {
  assessment: AssessmentCardType & { headline?: string; cta?: string };
  featured?: boolean;
  index?: number;
}) {
  const href = `/assessments/${assessment.slug}`;
  const theme = themeFor(assessment.slug);

  if (featured) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[28px] border border-[#E9E2F2] bg-gradient-to-br from-[#F0EAFE] via-white to-[#FFF0F7] p-6 shadow-[0_16px_48px_rgba(120,99,198,0.1)] sm:p-8"
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#A78BFA]/25 blur-3xl"
          animate={{ scale: [1, 1.12, 1], opacity: [0.45, 0.7, 0.45] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#7863C6] shadow-sm">
              <AssessmentIcon name={assessment.icon} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#302B3D] sm:text-3xl">
              {assessment.headline || assessment.title}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-[#716B7D]">
              {assessment.shortDescription}
            </p>
          </div>
          <Link
            href={href}
            className="btn-spatium group/cta inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#B74783] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(183,71,131,0.28)] transition hover:bg-[#9F376F]"
          >
            {assessment.cta || "Find a starting point"}
            <ArrowUpRight className="h-4 w-4 transition group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
          </Link>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.45,
        delay: Math.min(index * 0.08, 0.32),
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -3 }}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-[#E9E2F2] bg-gradient-to-br shadow-[0_10px_32px_rgba(123,57,98,0.06)] transition-shadow duration-300",
        theme.wash,
        theme.accent
      )}
    >
      <div
        className={cn("h-1 w-full shrink-0 bg-gradient-to-r opacity-80", theme.bar)}
        aria-hidden
      />

      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-40 blur-3xl",
          theme.orb
        )}
      />

      <div className="relative flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm",
              theme.iconBg,
              theme.iconColor
            )}
          >
            <AssessmentIcon name={assessment.icon} className="h-5 w-5" />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-[#B74783] shadow-sm ring-1 ring-[#B74783]/10">
              <Sparkles className="h-3 w-3" aria-hidden />
              Free
            </span>
            <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-semibold text-[#7863C6] shadow-sm ring-1 ring-[#7863C6]/10">
              {typeBadgeLabel(assessment.typeBadge)}
            </span>
          </div>
        </div>

        <h3 className="mt-3 line-clamp-2 text-[15px] font-bold leading-snug tracking-tight text-[#302B3D]">
          {assessment.title}
        </h3>

        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[#716B7D]">
          {assessment.shortDescription}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-[10px] font-medium text-[#795A70] ring-1 ring-[#EADCE5]/80">
            <Clock className="h-3 w-3 text-[#B74783]" aria-hidden />
            About {assessment.estimatedMinutes} min
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-[10px] font-medium text-[#795A70] ring-1 ring-[#EADCE5]/80">
            <Users className="h-3 w-3 text-[#7863C6]" aria-hidden />
            {assessment.audience}
          </span>
          <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-medium text-[#795A70] ring-1 ring-[#EADCE5]/80">
            {categoryLabel(assessment.category)}
          </span>
        </div>

        {assessment.privacyNote ? (
          <p className="mt-2.5 text-[11px] leading-snug text-[#927C8B]">
            {assessment.privacyNote}
          </p>
        ) : null}

        <div className="mt-auto pt-3">
          <Link
            href={href}
            className={cn(
              "inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border border-[#EADCE5] bg-white/90 px-4 text-sm font-bold text-[#49263D] shadow-sm transition duration-300",
              theme.cta
            )}
          >
            Learn more
            <ArrowUpRight className="h-3.5 w-3.5 opacity-60 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

/** Compact collapsible list for instruments pending licensing review. */
export function ComingSoonSection({
  assessments,
}: {
  assessments: AssessmentCardType[];
}) {
  const [open, setOpen] = useState(false);

  if (assessments.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: 0.15 }}
      className="relative mt-4 w-full overflow-hidden rounded-[20px] border border-[#E9E2F2] bg-gradient-to-r from-[#FBF9FF] via-white to-[#FFF5FA]"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="relative flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-white/60 sm:px-5"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0EAFE] text-[#7863C6]">
            <Lock className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-none text-[#302B3D]">Coming soon</p>
            <p className="mt-1.5 text-xs leading-none text-[#927C8B]">
              {assessments.length} more assessment
              {assessments.length === 1 ? "" : "s"} pending clinical or licensing review
            </p>
          </div>
        </div>
        <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-[#EADCE5] bg-white px-3 text-xs font-semibold text-[#716B7D]">
          {open ? "Hide" : "Show list"}
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="inline-flex"
          >
            <ChevronDown className="h-4 w-4" aria-hidden />
          </motion.span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-[#E9E2F2]"
          >
            {assessments.map((a, i) => (
              <motion.li
                key={a.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
                className="flex items-center gap-3 border-b border-[#E9E2F2]/80 px-4 py-3.5 last:border-b-0 sm:px-5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0EAFE] text-[#7863C6]">
                  <AssessmentIcon name={a.icon} className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-[#49263D]">{a.title}</p>
                    <span className="rounded-full bg-[#F0EAFE] px-2 py-0.5 text-[10px] font-semibold text-[#7863C6]">
                      {typeBadgeLabel(a.typeBadge)}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs leading-relaxed text-[#927C8B]">
                    {a.shortDescription}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-[#FFF0F7] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#B74783]">
                  Soon
                </span>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
