"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useSession } from "@/lib/contexts/session-context";
import {
  WellnessAssessment,
  WellnessPlan,
  PlanTask,
} from "@/lib/wellness-plan/types";
import {
  createWellnessPlan,
  getWellnessPlan,
  completeWellnessTask,
  deleteWellnessPlan,
  refreshWeeklyReport,
  updateWellnessPlan,
  getPendingChatSuggestion,
  clearPendingChatSuggestion,
} from "@/lib/api/wellness-plan";
import { adaptPlanIfNeeded } from "@/lib/wellness-plan/adaptive";
import { WellnessEmptyState } from "./empty-state";
import { AssessmentFlow } from "./assessment-flow";
import { PlanDashboard } from "./plan-dashboard";
import { TaskRunner } from "./task-runner";

type View = "loading" | "empty" | "assessment" | "dashboard";

export function WellnessPlanApp() {
  const { user } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<View>("loading");
  const [plan, setPlan] = useState<WellnessPlan | null>(null);
  const [generating, setGenerating] = useState(false);
  const [activeTask, setActiveTask] = useState<PlanTask | null>(null);
  const [suggestionMsg, setSuggestionMsg] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const existing = await getWellnessPlan();
    if (existing && existing.status !== "paused" && existing.weeks.length > 0) {
      setPlan(existing);
      setView("dashboard");
    } else {
      setPlan(null);
      setView("empty");
      const pending = getPendingChatSuggestion();
      if (pending?.message) setSuggestionMsg(pending.message);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "create" || action === "assess") {
      setView("assessment");
    }
  }, [searchParams]);

  const handleCreate = () => setView("assessment");

  const handleAssessmentComplete = async (assessment: WellnessAssessment) => {
    setGenerating(true);
    try {
      // Brief pause for premium generation feel
      await new Promise((r) => setTimeout(r, 1400));
      const created = await createWellnessPlan(assessment, user?._id);
      clearPendingChatSuggestion();
      setSuggestionMsg(null);
      setPlan(created);
      setView("dashboard");
      router.replace("/wellness-plan", { scroll: false });
    } finally {
      setGenerating(false);
    }
  };

  const findTask = (taskId: string): PlanTask | null => {
    if (!plan) return null;
    for (const week of plan.weeks) {
      for (const day of week.days) {
        const t = day.tasks.find((x) => x.id === taskId);
        if (t) return t;
      }
    }
    return null;
  };

  const handleTaskClick = (taskId: string) => {
    const task = findTask(taskId);
    if (task && !task.completed) setActiveTask(task);
  };

  const handleTaskComplete = async (
    taskId: string,
    extras?: { journalEntry?: string; notes?: string }
  ) => {
    const next = await completeWellnessTask(taskId, extras);
    if (next) setPlan(next);
  };

  const handleRefreshReport = async () => {
    const next = await refreshWeeklyReport();
    if (next) setPlan(next);
  };

  const handleReset = async () => {
    await deleteWellnessPlan();
    setPlan(null);
    setView("empty");
  };

  const handleDismissSuggestion = async () => {
    if (!plan) return;
    const next = await updateWellnessPlan({
      ...plan,
      pendingSuggestion: null,
    });
    setPlan(next);
  };

  const handleApplySuggestion = async () => {
    if (!plan) return;
    // Re-run adaptive engine + clear suggestion
    let next = adaptPlanIfNeeded({
      ...plan,
      challengeLevel:
        plan.challengeLevel === "elevated" ? "standard" : "light",
      adaptationNotes: [
        ...plan.adaptationNotes,
        `${new Date().toISOString().slice(0, 10)}: Plan adjusted from AI conversation signals.`,
      ],
      pendingSuggestion: null,
    });
    next = await updateWellnessPlan(next);
    setPlan(next);
  };

  return (
    <div className="page-shell pb-16 text-[#f3eefa] md:pb-24">
      <Container className="space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => router.push("/dashboard")}
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {view !== "dashboard" && (
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#f3eefa] md:text-3xl">
                Wellness Plan
              </h1>
              <p className="mt-1 text-sm text-[rgba(231,218,237,0.55)]">
                Your personalized AI wellness journey
              </p>
            </div>
          )}
        </div>

        {view === "loading" && (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          </div>
        )}

        {view === "empty" && (
          <WellnessEmptyState
            onCreate={handleCreate}
            suggestionMessage={suggestionMsg}
          />
        )}

        {view === "assessment" && (
          <AssessmentFlow
            onComplete={handleAssessmentComplete}
            onCancel={() => setView(plan ? "dashboard" : "empty")}
            isGenerating={generating}
          />
        )}

        {view === "dashboard" && plan && (
          <PlanDashboard
            plan={plan}
            onTaskClick={handleTaskClick}
            onRefreshReport={handleRefreshReport}
            onReset={handleReset}
            onDismissSuggestion={handleDismissSuggestion}
            onApplySuggestion={handleApplySuggestion}
          />
        )}
      </Container>

      <TaskRunner
        task={activeTask}
        open={!!activeTask}
        onClose={() => setActiveTask(null)}
        onComplete={handleTaskComplete}
      />
    </div>
  );
}
