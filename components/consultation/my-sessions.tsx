"use client";

import { useCallback, useEffect, useState } from "react";
import { Calendar, Clock, FileText, UserRound } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ConsultationBooking } from "@/lib/consultation/types";
import {
  cancelConsultation,
  getConsultations,
} from "@/lib/api/consultation";
import { format, parseISO } from "date-fns";

type Tab = "upcoming" | "completed" | "cancelled";

export function MySessions({
  refreshKey,
  onBook,
}: {
  refreshKey?: number;
  onBook?: () => void;
}) {
  const [sessions, setSessions] = useState<ConsultationBooking[]>([]);
  const [tab, setTab] = useState<Tab>("upcoming");

  const load = useCallback(async () => {
    const data = await getConsultations();
    setSessions(data);
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const today = new Date().toISOString().slice(0, 10);

  const filtered = sessions.filter((s) => {
    if (tab === "upcoming")
      return s.status === "scheduled" && s.date >= today;
    if (tab === "completed") return s.status === "completed";
    return s.status === "cancelled";
  });

  const handleCancel = async (id: string) => {
    await cancelConsultation(id);
    await load();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg md:text-xl">My Sessions</CardTitle>
            <CardDescription>
              Your professional psychologist consultations
            </CardDescription>
          </div>
          {onBook && (
            <Button className="btn-spatium" size="sm" onClick={onBook}>
              Book Session
            </Button>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["upcoming", "completed", "cancelled"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition",
                tab === t
                  ? "border-[#B74783]/40 bg-[rgba(183,71,131,0.14)] text-[#49263D]"
                  : "border-[#EADCE5] text-[#927C8B] hover:bg-white"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#EADCE5] px-4 py-10 text-center text-sm text-[#927C8B]">
            No {tab} sessions yet.
          </div>
        ) : (
          filtered.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onCancel={
                session.status === "scheduled"
                  ? () => handleCancel(session.id)
                  : undefined
              }
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

function SessionCard({
  session,
  onCancel,
}: {
  session: ConsultationBooking;
  onCancel?: () => void;
}) {
  const statusStyles: Record<string, string> = {
    scheduled: "bg-[rgba(183,71,131,0.14)] text-[#D9B8F5]",
    completed: "bg-[#FFF0F6] text-[#795A70]",
    cancelled: "bg-red-500/10 text-red-300/80",
  };

  return (
    <div className="rounded-[18px] border border-[#EADCE5] bg-white p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFE5F0]">
            <UserRound className="h-4 w-4 text-[#B74783]" />
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-[#49263D]">
              {session.psychologistName}
            </p>
            <p className="mt-0.5 text-xs text-[#927C8B]">
              Psychologist Session · ${session.priceUsd}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em]",
            statusStyles[session.status]
          )}
        >
          {session.status === "scheduled" ? "Scheduled" : session.status}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Meta
          icon={Calendar}
          label="Date"
          value={format(parseISO(session.date), "MMM d, yyyy")}
        />
        <Meta icon={Clock} label="Time" value={session.time} />
        <Meta
          icon={Clock}
          label="Duration"
          value={`${session.durationMinutes} min`}
        />
      </div>

      {(session.reason || session.notes) && (
        <div className="mt-3 flex gap-2 rounded-xl border border-[#EADCE5] bg-white/[0.02] px-3 py-2.5 text-xs text-[#927C8B]">
          <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B74783]" />
          <span>
            {session.reason}
            {session.notes ? ` · ${session.notes}` : ""}
          </span>
        </div>
      )}

      {onCancel && (
        <div className="mt-3 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-[#927C8B]"
            onClick={onCancel}
          >
            Cancel session
          </Button>
        </div>
      )}
    </div>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-[#927C8B]">
      <Icon className="h-3.5 w-3.5 text-[#B74783]" />
      <span>
        <span className="text-[#927C8B]">{label}: </span>
        {value}
      </span>
    </div>
  );
}
