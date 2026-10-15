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
  activateEnrollment,
  createWellnessPlan,
  getEnrollmentForCatalogSlug,
  getWellnessPlan,
  completeWellnessTask,
  deleteWellnessPlan,
  listWellnessEnrollments,
  refreshWeeklyReport,
  updateWellnessPlan,
  getPendingChatSuggestion,
  clearPendingChatSuggestion,
} from "@/lib/api/wellness-plan";
import { adaptPlanIfNeeded } from "@/lib/wellness-plan/adaptive";
import { getPlanBySlug, type CatalogPlan } from "@/lib/wellness-plan/catalog";
import { setWellnessStorageUserId } from "@/lib/wellness-plan/storage";
import { AssessmentFlow } from "./assessment-flow";
import { PlanDashboard } from "./plan-dashboard";
import { TaskRunner } from "./task-runner";
import { WellnessPlansHub } from "./hub/wellness-plans-hub";
import { WellnessPlanDetails } from "./hub/wellness-plan-details";

type View = "loading" | "hub" | "detail" | "assessment" | "dashboard";

export function WellnessPlanApp() {
  const { user } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<View>("loading");
  const [plan, setPlan] = useState<WellnessPlan | null>(null);
  const [enrollments, setEnrollments] = useState<WellnessPlan[]>([]);
  const [selectedCatalog, setSelectedCatalog] = useState<CatalogPlan | null>(
    null
  );
  const [detailEnrollment, setDetailEnrollment] =
    useState<WellnessPlan | null>(null);
  const [generating, setGenerating] = useState(false);
  const [activeTask, setActiveTask] = useState<PlanTask | null>(null);

  const refresh = useCallback(async () => {
    const [existing, all] = await Promise.all([
      getWellnessPlan(),
      listWellnessEnrollments(),
    ]);
    setEnrollments(all);
    if (existing && existing.status !== "paused" && existing.weeks.length > 0) {
      setPlan(existing);
    } else {
      setPlan(null);
    }
  }, []);

  useEffect(() => {
    setWellnessStorageUserId(user?._id || null);
  }, [user?._id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setWellnessStorageUserId(user?._id || null);
      await refresh();
      if (cancelled) return;

      const action = searchParams.get("action");
      const planSlug = searchParams.get("plan");

      if (action === "create" || action === "assess") {
        setView("assessment");
        return;
      }

      if (planSlug) {
        const catalog = getPlanBySlug(planSlug);
        if (catalog) {
          const enrollment = await getEnrollmentForCatalogSlug(planSlug);
          if (cancelled) return;
          setSelectedCatalog(catalog);
          setDetailEnrollment(enrollment);
          setView("detail");
          return;
        }
      }

      // Refresh enrollments without yanking the user out of an open dashboard
      setView((current) =>
        current === "dashboard" || current === "assessment" ? current : "hub"
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh, searchParams, user?._id]);

  const openHub = () => {
    setSelectedCatalog(null);
    setDetailEnrollment(null);
    setView("hub");
    router.replace("/wellness-plan", { scroll: false });
  };

  const handleOpenPlan = async (slug: string) => {
    const catalog = getPlanBySlug(slug);
    if (!catalog) return;
    const enrollment = await getEnrollmentForCatalogSlug(slug);
    setSelectedCatalog(catalog);
    setDetailEnrollment(enrollment);
    setView("detail");
    router.replace(`/wellness-plan?plan=${slug}`, { scroll: false });
  };

  const handleContinueActive = async () => {
    if (!plan) return;
    setView("dashboard");
  };

  const handleContinueFromDetail = async () => {
    if (detailEnrollment) {
      const activated = await activateEnrollment(detailEnrollment.id);
      if (activated) {
        setPlan(activated);
        setView("dashboard");
      }
    }
  };

  const handleStartFromCatalog = async (
    assessment: WellnessAssessment,
    forceNew?: boolean
  ) => {
    if (!selectedCatalog) return;
    setGenerating(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      const created = await createWellnessPlan({
        assessment,
        userId: user?._id,
        catalogSlug: selectedCatalog.slug,
        forceNew,
      });
      clearPendingChatSuggestion();
      setPlan(created);
      setDetailEnrollment(created);
      await refresh();
      setView("dashboard");
      router.replace("/wellness-plan", { scroll: false });
    } finally {
      setGenerating(false);
    }
  };

  const handleAssessmentComplete = async (assessment: WellnessAssessment) => {
    setGenerating(true);
    try {
      await new Promise((r) => setTimeout(r, 1400));
      const created = await createWellnessPlan(assessment, user?._id);
      clearPendingChatSuggestion();
      setPlan(created);
      await refresh();
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
    if (next) {
      setPlan(next);
      await refresh();
    }
  };

  const handleRefreshReport = async () => {
    const next = await refreshWeeklyReport();
    if (next) setPlan(next);
  };

  const handleReset = async () => {
    await deleteWellnessPlan();
    setPlan(null);
    await refresh();
    setView("hub");
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

  // Consume pending suggestion message once on hub (kept for chat deep-links)
  useEffect(() => {
    getPendingChatSuggestion();
  }, []);

  if (view === "hub") {
    return (
      <>
        <WellnessPlansHub
          activePlan={plan}
          enrollments={enrollments}
          onContinueActive={handleContinueActive}
          onOpenPlan={handleOpenPlan}
        />
        <TaskRunner
          task={activeTask}
          open={!!activeTask}
          onClose={() => setActiveTask(null)}
          onComplete={handleTaskComplete}
        />
      </>
    );
  }

  return (
    <div className="page-shell pb-10 text-[#512943] md:pb-14">
      <Container className="max-w-[1240px] space-y-5">
        {view === "dashboard" && (
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={openHub}
              aria-label="Back to wellness plans"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#BE4A8B]">
                Active plan
              </p>
              <h1 className="text-xl font-bold tracking-tight text-[#512943]">
                {plan?.title || "Wellness Plan"}
              </h1>
            </div>
          </div>
        )}

        {view === "assessment" && (
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={openHub}
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#512943]">
                Create a plan
              </h1>
              <p className="mt-1 text-sm text-[#957F94]">
                A short check-in to personalise your schedule
              </p>
            </div>
          </div>
        )}

        {view === "loading" && (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          </div>
        )}

        {view === "detail" && selectedCatalog && (
          <WellnessPlanDetails
            catalog={selectedCatalog}
            enrollment={detailEnrollment}
            starting={generating}
            onBack={openHub}
            onStart={handleStartFromCatalog}
            onContinue={handleContinueFromDetail}
          />
        )}

        {view === "assessment" && (
          <AssessmentFlow
            onComplete={handleAssessmentComplete}
            onCancel={openHub}
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
