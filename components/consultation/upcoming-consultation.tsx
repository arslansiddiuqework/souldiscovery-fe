"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  Clock,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ConsultationBooking,
  SESSION_PRICE_USD,
} from "@/lib/consultation/types";
import { getUpcomingConsultation } from "@/lib/api/consultation";
import { format, parseISO } from "date-fns";

interface ConsultationWidgetsProps {
  refreshKey?: number;
  onBook: () => void;
  compact?: boolean;
}

export function UpcomingConsultationCard({
  refreshKey,
  onBook,
  compact = false,
}: ConsultationWidgetsProps) {
  const [upcoming, setUpcoming] = useState<ConsultationBooking | null>(null);

  useEffect(() => {
    let active = true;
    getUpcomingConsultation().then((b) => {
      if (active) setUpcoming(b);
    });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  if (compact) {
    if (upcoming) {
      return (
        <div className="relative overflow-hidden rounded-[24px] bg-white p-4 shadow-[0_14px_36px_rgba(123,57,98,0.08)] ring-1 ring-[#EADCE5]/90">
          <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(183,71,131,0.14),transparent_70%)]" />
          <div className="relative flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C45A92] to-[#B74783] text-white shadow-[0_8px_18px_rgba(183,71,131,0.28)]">
              <Calendar className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#B74783]">
                Next session
              </p>
              <p className="mt-0.5 truncate font-display text-base font-bold text-[#49263D]">
                {upcoming.psychologistName}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF0F6] px-2.5 py-1 text-[11px] font-semibold text-[#795A70]">
                  <Calendar className="h-3 w-3 text-[#B74783]" />
                  {format(parseISO(upcoming.date), "EEE, MMM d")}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F4E8FF] px-2.5 py-1 text-[11px] font-semibold text-[#795A70]">
                  <Clock className="h-3 w-3 text-[#7A4FB0]" />
                  {upcoming.time}
                </span>
              </div>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="relative mt-3.5 h-9 w-full rounded-full border-[#EADCE5] text-xs font-bold"
          >
            <Link href="/pricing">View details</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="relative flex h-full min-h-[280px] flex-col overflow-hidden rounded-[24px] bg-gradient-to-br from-[#C45A92] via-[#B74783] to-[#8B4FA0] p-5 text-white shadow-[0_16px_40px_rgba(183,71,131,0.28)]">
        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 left-6 h-24 w-24 rounded-full bg-[#D9B8F5]/25 blur-xl" />

        <div className="relative">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/18 ring-1 ring-white/25 backdrop-blur-sm">
            <Stethoscope className="h-5 w-5" />
          </span>
          <p className="mt-4 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/75">
            <Sparkles className="h-3 w-3" />
            Optional care
          </p>
          <p className="mt-1.5 font-display text-xl font-bold leading-snug">
            Book a psychologist
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-white/80">
            ${SESSION_PRICE_USD} · 90-min private session when you need deeper
            support.
          </p>
        </div>

        <div className="relative mt-auto flex flex-col gap-2 pt-6">
          <button
            type="button"
            onClick={onBook}
            className="inline-flex h-11 w-full items-center justify-center gap-1 rounded-full bg-white text-[13px] font-bold text-[#B74783] shadow-sm transition hover:bg-white/95 active:scale-[0.98]"
          >
            Schedule
            <ChevronRight className="h-4 w-4" />
          </button>
          <Link
            href="/pricing"
            className="inline-flex h-10 w-full items-center justify-center rounded-full bg-white/15 text-[12px] font-bold text-white ring-1 ring-white/25 transition hover:bg-white/20"
          >
            Pricing
          </Link>
        </div>
      </div>
    );
  }

  if (upcoming) {
    return (
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/[0.1] to-transparent" />
        <CardHeader className="relative pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#927C8B]">
            Upcoming Consultation
          </p>
          <CardTitle className="text-lg md:text-xl">
            {upcoming.psychologistName}
          </CardTitle>
          <CardDescription>Online · 90-minute session</CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="flex flex-wrap gap-4 text-sm text-[#795A70]">
            <span className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#B74783]" />
              {format(parseISO(upcoming.date), "EEEE, MMM d")}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#B74783]" />
              {upcoming.time}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-[rgba(183,71,131,0.14)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#D9B8F5]">
              Scheduled
            </span>
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link href="/pricing">View details</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-primary/[0.08] to-transparent" />
      <CardHeader className="relative">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#EADCE5] bg-[#FFE5F0]">
            <Stethoscope className="h-5 w-5 text-[#B74783]" />
          </div>
          <div>
            <CardTitle className="text-lg md:text-xl">
              Professional Consultation
            </CardTitle>
            <CardDescription>
              Book a 90-minute session with a licensed psychologist.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative flex flex-wrap gap-3">
        <Button className="btn-spatium gap-2" onClick={onBook}>
          Schedule Session
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/pricing">View pricing</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
