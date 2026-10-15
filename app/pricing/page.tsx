"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Award,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Globe,
  Shield,
  Sparkles,
  Stethoscope,
  UserRound,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/contexts/session-context";
import {
  DEFAULT_PSYCHOLOGIST,
  SESSION_DURATION_MINUTES,
  SESSION_PRICE_USD,
} from "@/lib/consultation/types";
import { BookingFlow } from "@/components/consultation/booking-flow";
import { MySessions } from "@/components/consultation/my-sessions";

const FREE_FEATURES = [
  "Unlimited AI Chat",
  "AI Wellness Plans",
  "Mood Tracking",
  "Daily Missions",
  "Wellness Reports",
  "Journal & Insights",
];

const SESSION_FEATURES = [
  "Licensed Psychologist",
  "Private One-to-One Video",
  "Personalized Guidance",
  "Follow-Up Notes",
  "Flexible Scheduling",
  "Complements Your AI Plan",
];

const FAQS = [
  {
    q: "How long is a session?",
    a: `Each psychologist consultation is ${SESSION_DURATION_MINUTES} minutes.`,
  },
  {
    q: "How much does it cost?",
    a: `$${SESSION_PRICE_USD} per session. No subscriptions — you only pay when you book.`,
  },
  {
    q: "Is Soul Discovery free?",
    a: "Yes. All AI wellness features stay free. Psychologist sessions are optional and paid separately.",
  },
  {
    q: "Are sessions private?",
    a: "Yes. Sessions are confidential one-to-one online consultations with a licensed psychologist.",
  },
];

type DetailTab = "psychologist" | "sessions" | "faq";

export default function PricingPage() {
  const { isAuthenticated, user } = useSession();
  const reduceMotion = useReducedMotion();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [sessionsKey, setSessionsKey] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [tab, setTab] = useState<DetailTab>("psychologist");

  const startBooking = () => {
    if (!isAuthenticated) {
      window.location.href = "/login?next=/pricing";
      return;
    }
    setBookingOpen(true);
  };

  const tabs: { id: DetailTab; label: string; hide?: boolean }[] = [
    { id: "psychologist", label: "Psychologist" },
    { id: "sessions", label: "My Sessions", hide: !isAuthenticated },
    { id: "faq", label: "FAQ" },
  ];

  const psychologist = DEFAULT_PSYCHOLOGIST;

  return (
    <div className="relative h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#FFF6F1] text-[#3D2A28]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(183,71,131,0.14),transparent_55%)]" />
        <div className="absolute -left-16 top-40 h-72 w-72 rounded-full bg-[rgba(212,132,90,0.12)] blur-3xl" />
        <div className="absolute -right-10 bottom-10 h-80 w-80 rounded-full bg-[rgba(183,71,131,0.1)] blur-3xl" />
      </div>

      <div className="relative z-10 flex h-full flex-col px-3 pb-3 pt-[5.4rem] sm:px-5 sm:pb-4 sm:pt-24 lg:px-7 lg:pt-28">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto flex h-full w-full max-w-[1180px] flex-col overflow-hidden rounded-[28px] border border-[#F0D9CE] bg-white/75 shadow-[0_20px_55px_rgba(120,50,40,0.1)] backdrop-blur-xl"
        >
          {/* Header */}
          <header className="flex shrink-0 flex-col gap-3 border-b border-[#F0D9CE] bg-gradient-to-r from-[#FFF8F4] via-white to-[#FFF0F6] px-4 py-3.5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F0CADA] bg-[#FFF0F6] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#B74783]">
                <Sparkles className="h-3 w-3" aria-hidden />
                Pricing & Care
              </span>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#3D2A28] sm:text-[1.85rem]">
                Support that fits{" "}
                <span className="text-gradient-brand">your pace</span>
              </h1>
              <p className="mt-1 max-w-xl text-sm text-[#8A6B66]">
                Free AI wellness every day. Optional licensed sessions when you
                want human guidance.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-[#F0D9CE] bg-white/90 px-3 py-2 shadow-sm">
              <Shield className="h-4 w-4 text-[#B74783]" aria-hidden />
              <p className="text-[11px] font-semibold leading-snug text-[#6F4E4A]">
                AI forever free · Sessions pay-as-you-go
              </p>
            </div>
          </header>

          <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)]">
            {/* Offer panels */}
            <div className="flex min-h-0 flex-col gap-3 overflow-y-auto overscroll-contain border-b border-[#F0D9CE] p-3 sm:p-4 lg:border-b-0 lg:border-r lg:p-5">
              <div className="grid min-h-0 flex-1 gap-3 sm:grid-cols-2">
                {/* Free tier */}
                <motion.article
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05, duration: 0.35 }}
                  className="flex flex-col rounded-[22px] border border-[#F0D9CE] bg-gradient-to-b from-white to-[#FFF8F4] p-4 shadow-[0_8px_24px_rgba(120,50,40,0.05)] sm:p-5"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF0F6] text-[#B74783]">
                      <Zap className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8A6B66]">
                        Everyday care
                      </p>
                      <h2 className="text-base font-bold text-[#3D2A28]">
                        Soul Discovery Free
                      </h2>
                    </div>
                  </div>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight text-[#3D2A28]">
                      $0
                    </span>
                    <span className="text-sm font-semibold text-[#8A6B66]">
                      forever
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#8A6B66]">
                    Full AI wellness toolkit — no card needed.
                  </p>

                  <ul className="mt-4 space-y-2">
                    {FREE_FEATURES.map((f) => (
                      <FeatureRow key={f} label={f} tone="soft" />
                    ))}
                  </ul>

                  <Link
                    href={isAuthenticated ? "/dashboard" : "/signup"}
                    className="mt-auto inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#F0CADA] bg-white px-4 text-sm font-bold text-[#49263D] transition hover:bg-[#FFF0F6]"
                  >
                    Start Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.article>

                {/* Session tier */}
                <motion.article
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.35 }}
                  className="relative flex flex-col overflow-hidden rounded-[22px] border border-[#E5B8D4] bg-gradient-to-br from-[#FFF0F6] via-white to-[#FFE8DF] p-4 shadow-[0_14px_36px_rgba(183,71,131,0.16)] sm:p-5"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[rgba(183,71,131,0.18)] blur-3xl"
                  />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#B74783] to-[#9F376F] text-white shadow-sm">
                          <Stethoscope className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#B74783]">
                            Human support
                          </p>
                          <h2 className="text-base font-bold text-[#3D2A28]">
                            Psychologist Session
                          </h2>
                        </div>
                      </div>
                      <span className="rounded-full bg-[#B74783] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-white">
                        Popular
                      </span>
                    </div>

                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-4xl font-bold tracking-tight text-[#3D2A28]">
                        ${SESSION_PRICE_USD}
                      </span>
                      <span className="text-sm font-semibold text-[#8A6B66]">
                        / session
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-[#6F4E4A]">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 ring-1 ring-[#F0CADA]">
                        <Clock className="h-3 w-3 text-[#B74783]" />
                        {SESSION_DURATION_MINUTES} min
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 ring-1 ring-[#F0CADA]">
                        <CalendarDays className="h-3 w-3 text-[#B74783]" />
                        Online · 1:1
                      </span>
                    </div>

                    <ul className="mt-4 space-y-2">
                      {SESSION_FEATURES.map((f) => (
                        <FeatureRow key={f} label={f} tone="strong" />
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={startBooking}
                      className="btn-spatium mt-5 inline-flex h-11 w-full items-center justify-center gap-2"
                    >
                      Book Session
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.article>
              </div>
            </div>

            {/* Detail pane with tabs */}
            <aside className="flex min-h-0 flex-col bg-gradient-to-b from-[#FFF8F4] to-white">
              <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-[#F0D9CE] px-3 py-2.5 [scrollbar-width:none] sm:px-4 [&::-webkit-scrollbar]:hidden">
                {tabs
                  .filter((t) => !t.hide)
                  .map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTab(t.id)}
                      className={cn(
                        "shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-bold transition",
                        tab === t.id
                          ? "bg-[#B74783] text-white shadow-[0_6px_16px_rgba(183,71,131,0.28)]"
                          : "bg-white text-[#6F4E4A] ring-1 ring-[#F0D9CE] hover:bg-[#FFF0F6]"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
                <AnimatePresence mode="wait">
                  {tab === "psychologist" && (
                    <motion.div
                      key="psychologist"
                      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-3"
                    >
                      <div className="overflow-hidden rounded-[22px] border border-[#F0D9CE] bg-white p-4 shadow-[0_8px_24px_rgba(120,50,40,0.06)]">
                        <div className="flex items-start gap-3">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFE5F0] to-[#FFE8DF] text-[#B74783] ring-1 ring-[#F0CADA]">
                            <UserRound className="h-7 w-7" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#B74783]">
                              Licensed psychologist
                            </p>
                            <h3 className="mt-0.5 text-lg font-bold text-[#3D2A28]">
                              {psychologist.name}
                            </h3>
                            <p className="text-xs font-medium text-[#8A6B66]">
                              {psychologist.title}
                            </p>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-[#6F4E4A] line-clamp-4">
                          {psychologist.about}
                        </p>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div className="rounded-xl bg-[#FFF8F4] p-3 ring-1 ring-[#F0D9CE]">
                            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8A6B66]">
                              <Award className="h-3 w-3 text-[#B74783]" />
                              Experience
                            </p>
                            <p className="mt-1 text-sm font-bold text-[#3D2A28]">
                              {psychologist.yearsExperience}+ years
                            </p>
                          </div>
                          <div className="rounded-xl bg-[#FFF8F4] p-3 ring-1 ring-[#F0D9CE]">
                            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8A6B66]">
                              <Globe className="h-3 w-3 text-[#B74783]" />
                              Languages
                            </p>
                            <p className="mt-1 text-sm font-bold text-[#3D2A28]">
                              {psychologist.languages.join(" · ")}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8A6B66]">
                            Focus areas
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {psychologist.specializations.map((s) => (
                              <span
                                key={s}
                                className="rounded-full bg-[#FFF0F6] px-2.5 py-1 text-[11px] font-semibold text-[#9F376F] ring-1 ring-[#F0CADA]"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={startBooking}
                          className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#B74783] text-sm font-bold text-white shadow-[0_8px_20px_rgba(183,71,131,0.28)] transition hover:bg-[#9F376F]"
                        >
                          Book with {psychologist.name.split(" ").slice(-1)[0]}
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {tab === "sessions" && isAuthenticated && (
                    <motion.div
                      key="sessions"
                      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                      transition={{ duration: 0.25 }}
                    >
                      <MySessions
                        refreshKey={sessionsKey}
                        onBook={startBooking}
                        compact
                      />
                    </motion.div>
                  )}

                  {tab === "faq" && (
                    <motion.div
                      key="faq"
                      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-2"
                    >
                      {FAQS.map((faq, i) => {
                        const open = openFaq === i;
                        return (
                          <div
                            key={faq.q}
                            className="overflow-hidden rounded-2xl border border-[#F0D9CE] bg-white shadow-sm"
                          >
                            <button
                              type="button"
                              onClick={() => setOpenFaq(open ? null : i)}
                              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                            >
                              <span className="text-sm font-bold text-[#3D2A28]">
                                {faq.q}
                              </span>
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 shrink-0 text-[#8A6B66] transition-transform",
                                  open && "rotate-180"
                                )}
                              />
                            </button>
                            <AnimatePresence initial={false}>
                              {open && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <p className="border-t border-[#F0D9CE] px-4 py-3 text-sm leading-relaxed text-[#8A6B66]">
                                    {faq.a}
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </aside>
          </div>
        </motion.div>
      </div>

      <BookingFlow
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        onBooked={() => setSessionsKey((k) => k + 1)}
        defaultName={user?.name || ""}
        defaultEmail={user?.email || ""}
      />
    </div>
  );
}

function FeatureRow({
  label,
  tone,
}: {
  label: string;
  tone: "soft" | "strong";
}) {
  return (
    <li className="flex items-start gap-2.5 text-[13px] font-medium text-[#6F4E4A]">
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
          tone === "strong"
            ? "bg-[#B74783] text-white"
            : "bg-[#FFF0F6] text-[#B74783] ring-1 ring-[#F0CADA]"
        )}
      >
        <Check className="h-3 w-3" strokeWidth={2.5} />
      </span>
      {label}
    </li>
  );
}
