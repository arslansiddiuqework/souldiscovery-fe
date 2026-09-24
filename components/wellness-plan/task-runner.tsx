"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Heart,
  MessageSquare,
  PenLine,
  Timer,
  Footprints,
  BookOpen,
  Sparkles,
  Wind,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MoodForm } from "@/components/mood/mood-form";
import { PlanTask, TASK_TYPE_LABELS } from "@/lib/wellness-plan/types";
import { cn } from "@/lib/utils";

interface TaskRunnerProps {
  task: PlanTask | null;
  open: boolean;
  onClose: () => void;
  onComplete: (
    taskId: string,
    extras?: { journalEntry?: string; notes?: string }
  ) => void;
}

export function TaskRunner({ task, open, onClose, onComplete }: TaskRunnerProps) {
  const router = useRouter();
  const [journalText, setJournalText] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);

  useEffect(() => {
    if (!task || !open) {
      setJournalText("");
      setTimerRunning(false);
      setTimerDone(false);
      return;
    }
    const mins = Math.max(1, task.estimatedMinutes);
    setTimerSeconds(mins * 60);
    setTimerDone(false);
    setTimerRunning(false);
    setJournalText("");
  }, [task, open]);

  useEffect(() => {
    if (!timerRunning || timerSeconds <= 0) return;
    const id = setInterval(() => {
      setTimerSeconds((s) => {
        if (s <= 1) {
          setTimerRunning(false);
          setTimerDone(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning, timerSeconds]);

  if (!task) return null;

  const finish = (extras?: { journalEntry?: string; notes?: string }) => {
    onComplete(task.id, extras);
    onClose();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const totalForTask = Math.max(1, task.estimatedMinutes) * 60;
  const timerProgress =
    totalForTask === 0
      ? 0
      : Math.round(((totalForTask - timerSeconds) / totalForTask) * 100);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-[rgba(216,191,227,0.22)] bg-[rgba(16,11,32,0.96)] text-[#f3eefa] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {task.title}
          </DialogTitle>
          <DialogDescription className="text-[rgba(231,218,237,0.55)]">
            {task.description} · ~{task.estimatedMinutes} min
          </DialogDescription>
        </DialogHeader>

        {task.type === "mood_checkin" && (
          <div className="space-y-4 pt-2">
            <MoodForm onSuccess={() => finish()} />
            <Button
              variant="ghost"
              className="w-full text-[rgba(231,218,237,0.55)]"
              onClick={() => finish({ notes: "Check-in acknowledged" })}
            >
              Mark check-in complete
            </Button>
          </div>
        )}

        {task.type === "ai_conversation" && (
          <div className="space-y-5 py-2">
            <div className="rounded-2xl border border-[rgba(216,191,227,0.18)] bg-white/[0.03] p-4 text-sm leading-relaxed text-[rgba(231,218,237,0.7)]">
              Open a reflection session with Soul Discovery. When you return, this
              mission will be marked complete.
            </div>
            <Button
              className="btn-spatium w-full gap-2"
              onClick={() => {
                finish({ notes: "Launched AI conversation" });
                router.push(
                  `/therapy/new?prefill=${encodeURIComponent(
                    "I'd like to reflect on my wellness plan and how I'm feeling today."
                  )}`
                );
              }}
            >
              <MessageSquare className="h-4 w-4" />
              Start AI Reflection
            </Button>
          </div>
        )}

        {(task.type === "journal" || task.type === "gratitude") && (
          <div className="space-y-4 py-2">
            <textarea
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              rows={6}
              placeholder={
                task.type === "gratitude"
                  ? "List three things you're grateful for…"
                  : "Write freely. Nothing has to be polished."
              }
              className="w-full resize-none rounded-2xl border border-[rgba(216,191,227,0.22)] bg-white/[0.04] px-4 py-3 text-sm text-[#f3eefa] outline-none placeholder:text-[rgba(231,218,237,0.35)] focus:border-[#b384c9]/40"
            />
            <Button
              className="btn-spatium w-full gap-2"
              disabled={journalText.trim().length < 3}
              onClick={() => finish({ journalEntry: journalText.trim() })}
            >
              <PenLine className="h-4 w-4" />
              Save & Complete
            </Button>
          </div>
        )}

        {(task.type === "breathing" ||
          task.type === "mindfulness" ||
          task.type === "meditation") && (
          <div className="space-y-6 py-4 text-center">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-[#b384c9]/30 bg-[#b384c9]/10">
              <span className="font-display text-3xl font-bold tabular-nums text-[#f3eefa]">
                {formatTime(timerSeconds)}
              </span>
            </div>
            <Progress value={timerProgress} className="h-1.5" />
            <p className="text-sm text-[rgba(231,218,237,0.55)]">
              {timerDone
                ? "Session complete — well done."
                : task.type === "breathing"
                  ? "Breathe slowly. Inhale calm, exhale tension."
                  : "Stay with your breath. Let thoughts pass without chasing them."}
            </p>
            <div className="flex gap-3">
              {!timerDone ? (
                <Button
                  className="btn-spatium flex-1 gap-2"
                  onClick={() => setTimerRunning((v) => !v)}
                >
                  <Timer className="h-4 w-4" />
                  {timerRunning ? "Pause" : "Start"}
                </Button>
              ) : (
                <Button
                  className="btn-spatium flex-1 gap-2"
                  onClick={() => finish()}
                >
                  <Check className="h-4 w-4" />
                  Complete
                </Button>
              )}
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => finish({ notes: "Marked complete manually" })}
              >
                Mark done
              </Button>
            </div>
          </div>
        )}

        {(task.type === "walk" || task.type === "reading") && (
          <div className="space-y-5 py-2">
            <div className="rounded-2xl border border-[rgba(216,191,227,0.18)] bg-white/[0.03] p-5 text-center">
              {task.type === "walk" ? (
                <Footprints className="mx-auto mb-3 h-8 w-8 text-[#b384c9]" />
              ) : (
                <BookOpen className="mx-auto mb-3 h-8 w-8 text-[#b384c9]" />
              )}
              <p className="text-sm leading-relaxed text-[rgba(231,218,237,0.65)]">
                {task.type === "walk"
                  ? "Take your mindful walk. When you return, mark this mission complete."
                  : "Read something that nourishes you. Mark complete when finished."}
              </p>
            </div>
            <Button className="btn-spatium w-full gap-2" onClick={() => finish()}>
              <Check className="h-4 w-4" />
              Mark Complete
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function taskIcon(type: PlanTask["type"]) {
  switch (type) {
    case "mood_checkin":
      return Heart;
    case "ai_conversation":
      return MessageSquare;
    case "journal":
    case "gratitude":
      return PenLine;
    case "breathing":
      return Wind;
    case "mindfulness":
    case "meditation":
      return Sparkles;
    case "walk":
      return Footprints;
    case "reading":
      return BookOpen;
    default:
      return Check;
  }
}

export function TaskTypeBadge({ type }: { type: PlanTask["type"] }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(231,218,237,0.4)]">
      {TASK_TYPE_LABELS[type]}
    </span>
  );
}

export function MissionCheckbox({
  completed,
  className,
}: {
  completed: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition",
        completed
          ? "border-[#b384c9] bg-[#b384c9] text-[#1c1033]"
          : "border-[rgba(216,191,227,0.3)] bg-transparent",
        className
      )}
    >
      {completed && <Check className="h-3.5 w-3.5" />}
    </span>
  );
}
