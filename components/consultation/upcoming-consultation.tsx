"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, Stethoscope, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConsultationBooking } from "@/lib/consultation/types";
import { getUpcomingConsultation } from "@/lib/api/consultation";
import { format, parseISO } from "date-fns";

interface ConsultationWidgetsProps {
  refreshKey?: number;
  onBook: () => void;
}

export function UpcomingConsultationCard({
  refreshKey,
  onBook,
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

  if (upcoming) {
    return (
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/[0.1] to-transparent" />
        <CardHeader className="relative pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[rgba(231,218,237,0.45)]">
            Upcoming Consultation
          </p>
          <CardTitle className="text-lg md:text-xl">
            {upcoming.psychologistName}
          </CardTitle>
          <CardDescription>Online · 90-minute session</CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="flex flex-wrap gap-4 text-sm text-[rgba(231,218,237,0.7)]">
            <span className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#b384c9]" />
              {format(parseISO(upcoming.date), "EEEE, MMM d")}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#b384c9]" />
              {upcoming.time}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-[rgba(179,132,201,0.14)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#d8bfe3]">
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
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[rgba(216,191,227,0.22)] bg-[rgba(179,132,201,0.12)]">
            <Stethoscope className="h-5 w-5 text-[#b384c9]" />
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
