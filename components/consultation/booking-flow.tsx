"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  CreditCard,
  Loader2,
  Sparkles,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  SESSION_DURATION_MINUTES,
  SESSION_PRICE_USD,
  TIME_SLOTS,
} from "@/lib/consultation/types";
import { createConsultationBooking } from "@/lib/api/consultation";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";

interface BookingFlowProps {
  open: boolean;
  onClose: () => void;
  onBooked?: () => void;
  defaultName?: string;
  defaultEmail?: string;
}

const STEPS = ["Date", "Time", "Details", "Summary", "Payment"] as const;

export function BookingFlow({
  open,
  onClose,
  onBooked,
  defaultName = "",
  defaultEmail = "",
}: BookingFlowProps) {
  const [step, setStep] = useState(0);
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setName(defaultName);
      setEmail(defaultEmail);
    }
  }, [open, defaultName, defaultEmail]);

  const reset = () => {
    setStep(0);
    setSelectedDate(null);
    setSelectedTime(null);
    setName(defaultName);
    setEmail(defaultEmail);
    setReason("");
    setNotes("");
    setSubmitting(false);
    setDone(false);
    setMonth(new Date());
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  const today = startOfDay(new Date());

  const canContinue = () => {
    if (step === 0) return !!selectedDate;
    if (step === 1) return !!selectedTime;
    if (step === 2)
      return (
        name.trim().length > 1 &&
        email.trim().includes("@") &&
        reason.trim().length > 2
      );
    if (step === 3) return true;
    return true;
  };

  const confirmBooking = async () => {
    if (!selectedDate || !selectedTime) return;
    setSubmitting(true);
    try {
      await createConsultationBooking({
        date: format(selectedDate, "yyyy-MM-dd"),
        time: selectedTime,
        clientName: name,
        clientEmail: email,
        reason,
        notes,
      });
      setDone(true);
      onBooked?.();
    } finally {
      setSubmitting(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogContent className="max-h-[92vh] overflow-y-auto border-[rgba(216,191,227,0.22)] bg-[rgba(16,11,32,0.97)] text-[#f3eefa] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl md:text-2xl">
            {done ? "Session Scheduled" : "Schedule Consultation"}
          </DialogTitle>
          <DialogDescription className="text-[rgba(231,218,237,0.55)]">
            {done
              ? "Your psychologist session is reserved. Payment gateway coming soon."
              : `90-minute online session · $${SESSION_PRICE_USD}`}
          </DialogDescription>
        </DialogHeader>

        {!done && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[rgba(231,218,237,0.45)]">
              <span>
                Step {step + 1} of {STEPS.length} · {STEPS[step]}
              </span>
              <span className="text-[#b384c9]">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5 py-4 text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(179,132,201,0.18)]">
                <Check className="h-7 w-7 text-[#b384c9]" />
              </div>
              <div className="space-y-2">
                <p className="font-display text-lg font-semibold text-[#f3eefa]">
                  You&apos;re booked
                </p>
                <p className="text-sm text-[rgba(231,218,237,0.55)]">
                  {selectedDate &&
                    format(selectedDate, "EEEE, MMMM d, yyyy")}{" "}
                  at {selectedTime}
                </p>
                <p className="rounded-2xl border border-[#b384c9]/25 bg-[#b384c9]/10 px-4 py-3 text-xs text-[#d8bfe3]">
                  Payment via Stripe is coming soon. Your session is saved to
                  your dashboard as Scheduled.
                </p>
              </div>
              <Button className="btn-spatium w-full" onClick={handleClose}>
                Done
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.25 }}
              className="min-h-[280px] space-y-5 py-2"
            >
              {step === 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMonth(addMonths(month, -1))}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <p className="font-display text-sm font-semibold">
                      {format(month, "MMMM yyyy")}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMonth(addMonths(month, 1))}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wider text-[rgba(231,218,237,0.4)]">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                      <div key={d} className="py-1">
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((day) => {
                      const disabled =
                        isBefore(day, today) || !isSameMonth(day, month);
                      const selected =
                        selectedDate && isSameDay(day, selectedDate);
                      return (
                        <button
                          key={day.toISOString()}
                          type="button"
                          disabled={disabled}
                          onClick={() => setSelectedDate(day)}
                          className={cn(
                            "flex h-10 items-center justify-center rounded-xl text-sm transition",
                            disabled &&
                              "cursor-not-allowed opacity-25",
                            !disabled &&
                              !selected &&
                              "hover:bg-white/[0.06] text-[rgba(231,218,237,0.85)]",
                            selected &&
                              "bg-[#b384c9] font-semibold text-[#1c1033]"
                          )}
                        >
                          {format(day, "d")}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-3">
                  <p className="text-sm text-[rgba(231,218,237,0.55)]">
                    Available slots for{" "}
                    {selectedDate
                      ? format(selectedDate, "MMMM d, yyyy")
                      : "your date"}
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={cn(
                          "rounded-2xl border px-3 py-3 text-sm font-semibold transition",
                          selectedTime === slot
                            ? "border-[#b384c9]/45 bg-[rgba(179,132,201,0.16)] text-[#f3eefa]"
                            : "border-[rgba(216,191,227,0.16)] bg-white/[0.03] text-[rgba(231,218,237,0.75)] hover:border-[rgba(216,191,227,0.28)]"
                        )}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bk-name">Name</Label>
                    <Input
                      id="bk-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="h-11 rounded-2xl border-[rgba(216,191,227,0.22)] bg-white/[0.04]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bk-email">Email</Label>
                    <Input
                      id="bk-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-11 rounded-2xl border-[rgba(216,191,227,0.22)] bg-white/[0.04]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bk-reason">Reason for Consultation</Label>
                    <Input
                      id="bk-reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="What would you like support with?"
                      className="h-11 rounded-2xl border-[rgba(216,191,227,0.22)] bg-white/[0.04]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bk-notes">Optional Notes</Label>
                    <textarea
                      id="bk-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Anything helpful for your psychologist to know…"
                      className="w-full resize-none rounded-2xl border border-[rgba(216,191,227,0.22)] bg-white/[0.04] px-3 py-2.5 text-sm text-[#f3eefa] outline-none placeholder:text-[rgba(231,218,237,0.35)] focus:border-[#b384c9]/40"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3 rounded-[20px] border border-[rgba(216,191,227,0.18)] bg-white/[0.03] p-5">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[rgba(231,218,237,0.45)]">
                    <Sparkles className="h-3.5 w-3.5 text-[#b384c9]" />
                    Booking Summary
                  </p>
                  <h3 className="font-display text-xl font-bold text-[#f3eefa]">
                    Psychologist Session
                  </h3>
                  <SummaryRow
                    icon={Clock}
                    label="Duration"
                    value={`${SESSION_DURATION_MINUTES} Minutes`}
                  />
                  <SummaryRow
                    icon={CreditCard}
                    label="Price"
                    value={`$${SESSION_PRICE_USD}`}
                  />
                  <SummaryRow
                    icon={Calendar}
                    label="Date"
                    value={
                      selectedDate
                        ? format(selectedDate, "EEEE, MMM d, yyyy")
                        : "—"
                    }
                  />
                  <SummaryRow
                    icon={Clock}
                    label="Time"
                    value={selectedTime || "—"}
                  />
                  <SummaryRow icon={User} label="Name" value={name} />
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5 py-2 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(216,191,227,0.22)] bg-[rgba(179,132,201,0.12)]">
                    <CreditCard className="h-6 w-6 text-[#b384c9]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display text-xl font-bold text-[#f3eefa]">
                      Coming Soon
                    </h3>
                    <p className="text-sm leading-relaxed text-[rgba(231,218,237,0.55)]">
                      Stripe Integration / Payment Gateway Integration is being
                      prepared. Confirm to reserve your session — payment will
                      be collected when the gateway goes live.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#b384c9]/25 bg-[#b384c9]/10 px-4 py-3 text-left text-xs text-[#d8bfe3]">
                    Amount due: <strong>${SESSION_PRICE_USD}</strong> · Structured
                    for future Stripe Checkout
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!done && (
          <div className="flex items-center justify-between gap-3 border-t border-white/8 pt-4">
            <Button
              variant="ghost"
              onClick={() => (step === 0 ? handleClose() : setStep((s) => s - 1))}
              className="gap-2 text-[rgba(231,218,237,0.7)]"
            >
              <ArrowLeft className="h-4 w-4" />
              {step === 0 ? "Cancel" : "Back"}
            </Button>
            {step < STEPS.length - 1 ? (
              <Button
                className="btn-spatium gap-2"
                disabled={!canContinue()}
                onClick={() => setStep((s) => s + 1)}
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                className="btn-spatium gap-2"
                disabled={submitting}
                onClick={confirmBooking}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Confirm Booking
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-3 text-sm">
      <span className="flex items-center gap-2 text-[rgba(231,218,237,0.5)]">
        <Icon className="h-3.5 w-3.5 text-[#b384c9]" />
        {label}
      </span>
      <span className="font-semibold text-[#f3eefa]">{value}</span>
    </div>
  );
}
