"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ClipboardList,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import {
  completeWellnessTask,
  getWellnessPlan,
  uncompleteWellnessTask,
} from "@/lib/api/wellness-plan";
import { fetchAssessmentHistory } from "@/lib/api/assessments";
import { getCurrentDay } from "@/lib/wellness-plan/generate-plan";
import { taskRequiresGuidedFlow } from "@/lib/wellness-plan/adaptive";
import type { PlanTask, WellnessPlan } from "@/lib/wellness-plan/types";
import { TaskRunner } from "@/components/wellness-plan/task-runner";

type LoadState = "loading" | "ready" | "error";

export function YourDayPanel() {
  const reduceMotion = useReducedMotion();
  const { toast } = useToast();
  const [plan, setPlan] = useState<WellnessPlan | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<PlanTask | null>(null);
  const [assessmentHref, setAssessmentHref] = useState("/assessments");
  const [assessmentLabel, setAssessmentLabel] = useState(
    "Your Latest Assessment"
  );

  const refresh = useCallback(async () => {
    try {
      const next = await getWellnessPlan();
      setPlan(next);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    let alive = true;
    fetchAssessmentHistory()
      .then((data) => {
        if (!alive) return;
        const latest = data.history?.[0];
        if (latest?.resultId) {
          setAssessmentHref(`/assessments/results/${latest.resultId}`);
          setAssessmentLabel("Your Latest Assessment");
        } else {
          setAssessmentHref("/assessments");
          setAssessmentLabel("Take an assessment");
        }
      })
      .catch(() => {
        if (!alive) return;
        setAssessmentHref("/assessments");
        setAssessmentLabel("Your Latest Assessment");
      });
    return () => {
      alive = false;
    };
  }, []);

  const today = useMemo(
    () => (plan?.status === "active" ? getCurrentDay(plan) : null),
    [plan]
  );
  const tasks = today?.tasks ?? [];
  const done = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const remaining = Math.max(0, total - done);
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  const applyPlan = (next: WellnessPlan | null) => {
    if (next) setPlan(next);
  };

  const mapTaskCompletion = (
    source: WellnessPlan,
    taskId: string,
    completed: boolean
  ): WellnessPlan => ({
    ...source,
    weeks: source.weeks.map((w) => ({
      ...w,
      days: w.days.map((d) => ({
        ...d,
        tasks: d.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                completed,
                completedAt: completed
                  ? new Date().toISOString()
                  : undefined,
              }
            : t
        ),
      })),
    })),
  });

  const handleToggleSimple = async (task: PlanTask) => {
    if (pendingId) return;
    if (taskRequiresGuidedFlow(task.type) && !task.completed) {
      setActiveTask(task);
      return;
    }

    const previous = plan;
    setPendingId(task.id);

    if (previous) {
      setPlan(mapTaskCompletion(previous, task.id, !task.completed));
    }

    try {
      const next = task.completed
        ? await uncompleteWellnessTask(task.id, { requireSync: true })
        : await completeWellnessTask(task.id, undefined, { requireSync: true });
      applyPlan(next);
    } catch (error) {
      if (previous) setPlan(previous);
      toast({
        title: "Couldn't save",
        description:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setPendingId(null);
    }
  };

  const handleGuidedComplete = async (
    taskId: string,
    extras?: { journalEntry?: string; notes?: string }
  ) => {
    const previous = plan;
    setPendingId(taskId);
    try {
      const next = await completeWellnessTask(taskId, extras, {
        requireSync: true,
      });
      applyPlan(next);
    } catch (error) {
      if (previous) setPlan(previous);
      toast({
        title: "Couldn't save",
        description:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setPendingId(null);
    }
  };

  return (
    <>
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[24px] bg-white p-4 shadow-[0_14px_36px_rgba(123,57,98,0.08)] ring-1 ring-[#EADCE5]/90 sm:p-5"
      >
        <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(183,71,131,0.12),transparent_70%)]" />

        <div className="relative flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C45A92] to-[#B74783] text-white shadow-[0_8px_18px_rgba(183,71,131,0.28)]">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-base font-bold tracking-tight text-[#49263D] sm:text-lg">
              Your Day
            </h3>
            <p className="mt-0.5 text-[12px] leading-relaxed text-[#927C8B]">
              Small steps from your wellness plan — one gentle check at a time.
            </p>
          </div>
        </div>

        <div className="relative mt-4">
          <div className="mb-2 flex items-end justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#927C8B]">
              Today&apos;s Activities
            </p>
            {loadState === "ready" && total > 0 && (
              <p className="font-display text-sm font-bold tabular-nums text-[#49263D]">
                {done}
                <span className="text-[#A8939E]">/{total}</span>
              </p>
            )}
          </div>

          {loadState === "ready" && total > 0 && (
            <div className="mb-3.5 h-2 overflow-hidden rounded-full bg-[#F1E9EF]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#C45A92] to-[#B74783]"
                initial={false}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          )}

          {loadState === "loading" && (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-[#FBF9FF] px-4 py-10 text-[#927C8B]">
              <Loader2 className="h-4 w-4 animate-spin text-[#B74783]" />
              <span className="text-sm">Loading today&apos;s activities…</span>
            </div>
          )}

          {loadState === "error" && (
            <div className="rounded-2xl bg-[#FFF0F2] px-4 py-6 text-center">
              <p className="text-sm font-semibold text-[#49263D]">
                Something went wrong
              </p>
              <p className="mt-1 text-xs text-[#927C8B]">
                We couldn&apos;t load your plan just now.
              </p>
              <button
                type="button"
                onClick={() => {
                  setLoadState("loading");
                  void refresh();
                }}
                className="mt-3 text-xs font-bold text-[#B74783] hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {loadState === "ready" && !plan && (
            <div className="rounded-2xl bg-[#FBF9FF] px-4 py-8 text-center ring-1 ring-[#F1E9EF]">
              <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF0F6] text-[#B74783]">
                <ClipboardList className="h-5 w-5" />
              </span>
              <p className="text-sm font-bold text-[#49263D]">
                No active plan yet
              </p>
              <p className="mx-auto mt-1 max-w-[240px] text-xs leading-relaxed text-[#927C8B]">
                Start a wellness plan to see simple daily activities here.
              </p>
              <Link
                href="/wellness-plan"
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#B74783] hover:underline"
              >
                Browse plans
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {loadState === "ready" && plan && total === 0 && (
            <div className="rounded-2xl bg-[#FBF9FF] px-4 py-8 text-center ring-1 ring-[#F1E9EF]">
              <p className="text-sm font-bold text-[#49263D]">
                Nothing scheduled today
              </p>
              <p className="mx-auto mt-1 max-w-[240px] text-xs leading-relaxed text-[#927C8B]">
                {plan.status !== "active"
                  ? "Your plan is paused or finished. Open it to continue."
                  : "Enjoy the rest day — or peek at your full plan anytime."}
              </p>
            </div>
          )}

          {loadState === "ready" && total > 0 && (
            <ul className="space-y-2">
              {tasks.map((task) => {
                const guided = taskRequiresGuidedFlow(task.type);
                const busy = pendingId === task.id;
                return (
                  <li
                    key={task.id}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-3 py-2.5 transition",
                      task.completed
                        ? "bg-[#FBF9FF]/80"
                        : "bg-[#FFF8FB] ring-1 ring-[#F0D9E6]/70"
                    )}
                  >
                    {guided && !task.completed ? (
                      <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#D9B8F5] bg-white" />
                    ) : (
                      <button
                        type="button"
                        aria-label={
                          task.completed
                            ? `Mark ${task.title} incomplete`
                            : `Complete ${task.title}`
                        }
                        disabled={busy}
                        onClick={() => void handleToggleSimple(task)}
                        className={cn(
                          "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition",
                          task.completed
                            ? "border-[#B74783] bg-[#B74783] text-white shadow-[0_4px_10px_rgba(183,71,131,0.28)]"
                            : "border-[#D9B8F5] bg-white hover:border-[#B74783] hover:bg-[#FFF0F6]",
                          busy && "opacity-60"
                        )}
                      >
                        {busy ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          task.completed && (
                            <Check className="h-3 w-3" strokeWidth={3} />
                          )
                        )}
                      </button>
                    )}

                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-[13px] font-bold leading-snug text-[#49263D]",
                          task.completed &&
                            "text-[#A8939E] line-through decoration-[#DFC7D6]"
                        )}
                      >
                        {task.title}
                      </p>
                    </div>

                    {guided && !task.completed && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setActiveTask(task)}
                        className="shrink-0 rounded-full bg-gradient-to-r from-[#C45A92] to-[#B74783] px-3 py-1.5 text-[10px] font-bold text-white shadow-[0_6px_14px_rgba(183,71,131,0.25)] transition hover:brightness-[1.03] disabled:opacity-50"
                      >
                        Open
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="relative mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#F1E9EF] pt-3">
          <p className="text-[11px] font-medium text-[#927C8B]">
            {loadState === "ready" && total > 0
              ? `${done} completed · ${remaining} remaining`
              : "Your private daily checklist"}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={assessmentHref}
              className="text-[11px] font-bold text-[#7A4FB0] hover:underline"
            >
              {assessmentLabel}
            </Link>
            <Link
              href="/wellness-plan"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B74783] hover:underline"
            >
              View plan
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </motion.section>

      <TaskRunner
        task={activeTask}
        open={!!activeTask}
        onClose={() => setActiveTask(null)}
        onComplete={handleGuidedComplete}
      />
    </>
  );
}
