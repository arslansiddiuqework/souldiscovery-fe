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
import { BreathingGame } from "@/components/games/breathing-game";
import { PlanTask, TASK_TYPE_LABELS } from "@/lib/wellness-plan/types";
import { cn } from "@/lib/utils";
import { GroundingExperience } from "./hub/grounding-experience";

interface TaskRunnerProps {
  task: PlanTask | null;
  open: boolean;
  onClose: () => void;
  onComplete: (
    taskId: string,
    extras?: { journalEntry?: string; notes?: string }
  ) => void | Promise<void>;
}

export function TaskRunner({ task, open, onClose, onComplete }: TaskRunnerProps) {
  const router = useRouter();
  const [journalText, setJournalText] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
    setSaving(false);
    setSaveError(null);
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

  const finish = async (extras?: { journalEntry?: string; notes?: string }) => {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      await onComplete(task.id, extras);
      onClose();
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Couldn't save. This activity is still unfinished."
      );
    } finally {
      setSaving(false);
    }
  };

  const leave = () => {
    if (saving) return;
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
      <DialogContent className="max-h-[90vh] overflow-y-auto border-[#EADCE5] bg-white text-[#49263D] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {task.title}
          </DialogTitle>
          <DialogDescription className="text-[#927C8B]">
            {task.description} · about {task.estimatedMinutes} min. You can leave
            whenever you want. This does not diagnose or treat a condition.
          </DialogDescription>
        </DialogHeader>

        {saveError && (
          <p className="rounded-xl bg-[#FFF0F6] px-3 py-2 text-sm text-[#9F376F]" role="alert">
            {saveError}
          </p>
        )}

        {task.type === "mood_checkin" && (
          <div className="space-y-4 pt-2">
            <MoodForm onSuccess={() => finish()} />
            <Button
              variant="ghost"
              className="w-full text-[#927C8B]"
              onClick={() => finish({ notes: "Check-in acknowledged" })}
            >
              Mark check-in complete
            </Button>
          </div>
        )}

        {task.type === "ai_conversation" && (
          <div className="space-y-5 py-2">
            <div className="rounded-2xl border border-[#EADCE5] bg-white p-4 text-sm leading-relaxed text-[#795A70]">
              Open a conversation when you want to talk something through. It stays
              unfinished until you mark it complete. The companion is not a
              clinician or an emergency service.
            </div>
            <Button
              className="btn-spatium w-full gap-2"
              onClick={() => {
                router.push(
                  `/therapy/new?prefill=${encodeURIComponent(
                    "I'd like to reflect on my wellness plan and how I'm feeling today."
                  )}`
                );
              }}
            >
              <MessageSquare className="h-4 w-4" />
              Open the conversation
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-xl"
              disabled={saving}
              onClick={() => finish({ notes: "Conversation marked complete" })}
            >
              I&apos;ve finished this conversation
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
              className="w-full resize-none rounded-2xl border border-[#EADCE5] bg-white px-4 py-3 text-sm text-[#49263D] outline-none placeholder:text-[#927C8B] focus:border-[#B74783]/40"
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

        {task.type === "breathing" && (
          <div className="space-y-4 py-2">
            <div className="overflow-hidden rounded-[18px] border border-[#EEDCE9] bg-[#FCF8FC] p-2">
              <BreathingGame />
            </div>
            <p className="text-xs text-[#927C8B]">
              Stop anytime if breath focus feels uncomfortable. This does not
              claim to stop panic or treat medical conditions.
            </p>
            <Button
              className="btn-spatium w-full gap-2"
              onClick={() => finish({ notes: "Breathing session completed" })}
            >
              <Check className="h-4 w-4" />
              Mark complete
            </Button>
          </div>
        )}

        {task.type === "mindfulness" &&
          /ground/i.test(task.title) && (
            <div className="py-2">
              <GroundingExperience onClose={() => finish({ notes: "Grounding completed" })} />
            </div>
          )}

        {((task.type === "mindfulness" && !/ground/i.test(task.title)) ||
          task.type === "meditation") && (
          <div className="space-y-6 py-4 text-center">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-[#B74783]/30 bg-[#B74783]/10">
              <span className="font-display text-3xl font-bold tabular-nums text-[#49263D]">
                {formatTime(timerSeconds)}
              </span>
            </div>
            <Progress value={timerProgress} className="h-1.5" />
            <p className="text-sm text-[#927C8B]">
              {timerDone
                ? "Session complete — well done."
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
            <div className="rounded-2xl border border-[#EADCE5] bg-white p-5 text-center">
              {task.type === "walk" ? (
                <Footprints className="mx-auto mb-3 h-8 w-8 text-[#B74783]" />
              ) : (
                <BookOpen className="mx-auto mb-3 h-8 w-8 text-[#B74783]" />
              )}
              <p className="text-sm leading-relaxed text-[#795A70]">
                {task.type === "walk"
                  ? "Take your mindful walk. When you return, mark this mission complete."
                  : "Read something that nourishes you. Mark complete when finished."}
              </p>
            </div>
            <Button
              className="btn-spatium w-full gap-2"
              disabled={saving}
              onClick={() => finish()}
            >
              <Check className="h-4 w-4" />
              Mark Complete
            </Button>
          </div>
        )}

        <Button
          type="button"
          variant="ghost"
          className="w-full text-[#927C8B]"
          onClick={leave}
          disabled={saving}
        >
          Leave for now
        </Button>
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
    <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#927C8B]">
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
          ? "border-[#B74783] bg-[#B74783] text-white"
          : "border-[#EADCE5] bg-transparent",
        className
      )}
    >
      {completed && <Check className="h-3.5 w-3.5" />}
    </span>
  );
}
