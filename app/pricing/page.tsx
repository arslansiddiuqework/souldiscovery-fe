"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Shield,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/contexts/session-context";
import {
  SESSION_DURATION_MINUTES,
  SESSION_PRICE_USD,
} from "@/lib/consultation/types";
import { BookingFlow } from "@/components/consultation/booking-flow";
import { PsychologistProfileCard } from "@/components/consultation/psychologist-card";
import { MySessions } from "@/components/consultation/my-sessions";

const FREE_FEATURES = [
  "Unlimited AI Chat",
  "AI Wellness Plans",
  "Mood Tracking",
  "Daily Missions",
  "Wellness Reports",
  "Journal",
  "Progress Tracking",
  "Insights Dashboard",
];

const SESSION_FEATURES = [
  "Licensed Psychologist",
  "Private One-to-One Session",
  "Video Consultation",
  "Personalized Guidance",
  "Wellness Recommendations",
  "Follow-Up Notes",
  "Flexible Scheduling",
];

const FAQS = [
  {
    q: "How long is a session?",
    a: "Each psychologist consultation is 90 minutes (1 hour 30 minutes).",
  },
  {
    q: "How much does it cost?",
    a: `$${SESSION_PRICE_USD} per session. There are no subscriptions — you only pay when you book.`,
  },
  {
    q: "Can I use Soul Discovery for free?",
    a: "Yes. All AI wellness features — chat, plans, mood tracking, insights, missions, and reports — remain completely free.",
  },
  {
    q: "Are sessions private?",
    a: "Yes. Sessions are confidential one-to-one online consultations with a licensed psychologist.",
  },
];

export default function PricingPage() {
  const { isAuthenticated, user } = useSession();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [sessionsKey, setSessionsKey] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const startBooking = () => {
    if (!isAuthenticated) {
      window.location.href = "/login?next=/pricing";
      return;
    }
    setBookingOpen(true);
  };

  return (
    <div className="page-shell relative pb-20 text-[#f3eefa] md:pb-28">
      <div className="container-app relative z-10 space-y-16 md:space-y-24">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="badge-soft mb-6">Pricing & Sessions</span>
          <h1 className="font-display text-4xl font-bold tracking-tight text-[#f3eefa] md:text-5xl lg:text-[52px]">
            Choose the Support That Fits Your{" "}
            <span className="text-gradient-brand">Journey</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[rgba(231,218,237,0.55)] md:text-lg">
            Start with Soul Discovery AI for free. When you&apos;re ready for
            professional guidance, connect with a licensed psychologist online.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 md:gap-8">
          {/* Free */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <Card className="h-full p-7 md:p-9">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[rgba(231,218,237,0.45)]">
                Free
              </p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold tracking-tight text-[#f3eefa]">
                  $0
                </span>
              </div>
              <p className="mt-2 text-sm text-[rgba(231,218,237,0.55)]">
                Forever Free
              </p>
              <ul className="mt-8 space-y-3">
                {FREE_FEATURES.map((f) => (
                  <FeatureRow key={f} label={f} />
                ))}
              </ul>
              <Button asChild className="btn-spatium mt-10 w-full">
                <Link href={isAuthenticated ? "/dashboard" : "/signup"}>
                  Start Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>
          </motion.div>

          {/* Psychologist — highlighted */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
          >
            <Card className="relative h-full overflow-hidden border-[#b384c9]/35 p-7 shadow-[0_0_0_1px_rgba(179,132,201,0.18),0_24px_80px_rgba(6,3,16,0.5)] md:p-9">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgba(179,132,201,0.16)] via-transparent to-[rgba(179,132,201,0.05)]" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#b384c9]/35 bg-[rgba(179,132,201,0.16)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#d8bfe3]">
                  <Sparkles className="h-3 w-3" />
                  Most Popular
                </div>
                <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[rgba(231,218,237,0.55)]">
                  Psychologist Session
                </p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-5xl font-bold tracking-tight text-[#f3eefa]">
                    ${SESSION_PRICE_USD}
                  </span>
                  <span className="text-sm text-[rgba(231,218,237,0.5)]">
                    Per Session
                  </span>
                </div>
                <p className="mt-3 text-sm text-[rgba(231,218,237,0.65)]">
                  Duration: {SESSION_DURATION_MINUTES} Minutes · Online ·
                  One-to-One
                </p>
                <ul className="mt-8 space-y-3">
                  {SESSION_FEATURES.map((f) => (
                    <FeatureRow key={f} label={f} highlighted />
                  ))}
                </ul>
                <Button
                  className="btn-spatium-lg mt-10 w-full"
                  onClick={startBooking}
                >
                  Book Session
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Trust */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-4xl"
        >
          <Card className="relative overflow-hidden p-8 md:p-12">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[rgba(179,132,201,0.12)] blur-3xl" />
            <div className="relative mx-auto max-w-2xl space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(216,191,227,0.22)] bg-[rgba(179,132,201,0.12)]">
                <Shield className="h-5 w-5 text-[#b384c9]" />
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                Professional Support When You Need It
              </h2>
              <p className="text-base leading-relaxed text-[rgba(231,218,237,0.55)] md:text-lg">
                Soul Discovery AI is designed for daily wellness support. For deeper
                one-to-one conversations, licensed psychologists provide
                personalized guidance through scheduled online sessions.
              </p>
              <p className="text-sm font-semibold text-[#d8bfe3]">
                Everything AI = Free · Professional Psychologist = $
                {SESSION_PRICE_USD} / {SESSION_DURATION_MINUTES} min
              </p>
            </div>
          </Card>
        </motion.section>

        {/* Psychologist profile */}
        <section className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center gap-3">
            <Stethoscope className="h-5 w-5 text-[#b384c9]" />
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              Meet Your Psychologist
            </h2>
          </div>
          <PsychologistProfileCard />
        </section>

        {/* My Sessions — authenticated only */}
        {isAuthenticated && (
          <section className="mx-auto max-w-4xl">
            <MySessions
              refreshKey={sessionsKey}
              onBook={startBooking}
            />
          </section>
        )}

        {/* FAQ */}
        <section className="mx-auto max-w-3xl space-y-6">
          <h2 className="text-center font-display text-2xl font-bold tracking-tight md:text-3xl">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => {
              const open = openFaq === i;
              return (
                <Card key={faq.q} className="overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-display text-base font-semibold text-[#f3eefa]">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 shrink-0 text-[rgba(231,218,237,0.5)] transition-transform",
                        open && "rotate-180"
                      )}
                    />
                  </button>
                  {open && (
                    <CardContent className="border-t border-white/5 pb-5 pt-0">
                      <p className="pt-4 text-sm leading-relaxed text-[rgba(231,218,237,0.55)]">
                        {faq.a}
                      </p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </section>
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
  highlighted,
}: {
  label: string;
  highlighted?: boolean;
}) {
  return (
    <li className="flex items-start gap-3 text-sm text-[rgba(231,218,237,0.75)]">
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
          highlighted
            ? "bg-[rgba(179,132,201,0.22)] text-[#b384c9]"
            : "bg-white/[0.06] text-[#b384c9]"
        )}
      >
        <Check className="h-3 w-3" />
      </span>
      {label}
    </li>
  );
}
