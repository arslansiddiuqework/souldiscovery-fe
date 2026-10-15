"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  FileText,
  HeartHandshake,
  Plus,
  UserRound,
} from "lucide-react";
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
  compact = false,
}: {
  refreshKey?: number;
  onBook?: () => void;
  compact?: boolean;
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

  if (compact) {
    const preview = filtered.slice(0, 6);
    const counts = {
      upcoming: sessions.filter(
        (s) => s.status === "scheduled" && s.date >= today
      ).length,
      completed: sessions.filter((s) => s.status === "completed").length,
      cancelled: sessions.filter((s) => s.status === "cancelled").length,
    };

    return (
      <div className="relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-[24px] bg-gradient-to-b from-white to-[#FFF8FB]/80 shadow-[0_14px_36px_rgba(123,57,98,0.08)] ring-1 ring-[#EADCE5]/90">
        <div className="pointer-events-none absolute -right-10 top-0 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(183,71,131,0.08),transparent_70%)]" />

        <div className="relative flex shrink-0 flex-wrap items-center gap-3 px-4 pb-3 pt-4 sm:px-5">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C45A92] to-[#B74783] text-white shadow-[0_8px_18px_rgba(183,71,131,0.28)]">
              <HeartHandshake className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-base font-bold tracking-tight text-[#49263D]">
                My sessions
              </p>
              <p className="text-[11px] font-medium text-[#927C8B]">
                Professional care · {counts[tab]} {tab}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-full bg-[#F4EEF3] p-1 ring-1 ring-[#EADCE5]/80">
              {(["upcoming", "completed", "cancelled"] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[10px] font-bold capitalize transition",
                    tab === t
                      ? "bg-white text-[#49263D] shadow-[0_4px_10px_rgba(123,57,98,0.12)]"
                      : "text-[#927C8B] hover:text-[#795A70]"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            {onBook && (
              <button
                type="button"
                onClick={onBook}
                aria-label="Book session"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#C45A92] to-[#B74783] text-white shadow-[0_8px_18px_rgba(183,71,131,0.28)] transition hover:scale-[1.04] active:scale-[0.97]"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        <div className="relative mx-4 mb-4 flex min-h-[220px] flex-1 flex-col overflow-hidden rounded-[20px] bg-white/80 p-3 ring-1 ring-[#F1E9EF] sm:mx-5">
          {preview.length === 0 ? (
            <div className="flex h-full min-h-[196px] flex-col items-center justify-center px-4 py-6 text-center">
              <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF0F6] text-[#B74783] ring-1 ring-[#F0D9E6]">
                <Calendar className="h-6 w-6" />
              </span>
              <p className="font-display text-sm font-bold text-[#49263D]">
                Nothing {tab} yet
              </p>
              <p className="mt-1 max-w-[240px] text-[12px] leading-relaxed text-[#927C8B]">
                Book a psychologist and your sessions will land here.
              </p>
              {/* Reserve CTA space on every tab so height stays stable */}
              <div className="mt-4 flex h-9 items-center justify-center">
                {onBook && tab === "upcoming" ? (
                  <button
                    type="button"
                    onClick={onBook}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF0F6] px-3.5 py-2 text-[11px] font-bold text-[#B74783] ring-1 ring-[#F0D9E6] transition hover:bg-white"
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                    Schedule one now
                  </button>
                ) : (
                  <span className="invisible inline-flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-bold">
                    <Plus className="h-3.5 w-3.5" />
                    Schedule one now
                  </span>
                )}
              </div>
            </div>
          ) : (
            <ul className="min-h-[196px] flex-1 space-y-2 overflow-y-auto">
              {preview.map((session) => (
                <li
                  key={session.id}
                  className="flex items-center gap-3 rounded-2xl bg-[#FBF9FF] px-3 py-2.5 transition hover:bg-[#FFF0F6]/60"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FFE5F0] to-[#F4E8FF] text-[#B74783]">
                    <UserRound className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#49263D]">
                      {session.psychologistName}
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium text-[#927C8B]">
                      {format(parseISO(session.date), "EEE, MMM d")} ·{" "}
                      {session.time}
                    </p>
                  </div>
                  {session.status === "scheduled" && (
                    <button
                      type="button"
                      className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold text-[#A8939E] transition hover:bg-[#FFF0F2] hover:text-[#B4233D]"
                      onClick={() => handleCancel(session.id)}
                    >
                      Cancel
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

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
