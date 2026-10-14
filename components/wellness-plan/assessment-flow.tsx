"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  ACTIVITY_LABELS,
  DailyTime,
  GOAL_LABELS,
  PreferredActivity,
  PreferredTime,
  PrimaryGoal,
  SLEEP_LABELS,
  SleepQuality,
  TIME_LABELS,
  WellnessAssessment,
} from "@/lib/wellness-plan/types";

interface AssessmentFlowProps {
  onComplete: (assessment: WellnessAssessment) => void;
  onCancel: () => void;
  isGenerating?: boolean;
}

const GOALS = Object.entries(GOAL_LABELS) as [PrimaryGoal, string][];
const SLEEP = Object.entries(SLEEP_LABELS) as [SleepQuality, string][];
const TIMES = Object.entries(TIME_LABELS) as [DailyTime, string][];
const ACTIVITIES = Object.entries(ACTIVITY_LABELS) as [
  PreferredActivity,
  string,
][];
const PREFERRED: { value: PreferredTime; label: string }[] = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "flexible", label: "Flexible" },
];

const TOTAL_STEPS = 6;

export function AssessmentFlow({
  onComplete,
  onCancel,
  isGenerating,
}: AssessmentFlowProps) {
  const [step, setStep] = useState(0);
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal | null>(null);
  const [customGoal, setCustomGoal] = useState("");
  const [stressLevel, setStressLevel] = useState(5);
  const [sleepQuality, setSleepQuality] = useState<SleepQuality | null>(null);
  const [dailyTime, setDailyTime] = useState<DailyTime | null>(null);
  const [activities, setActivities] = useState<PreferredActivity[]>([]);
  const [preferredTime, setPreferredTime] = useState<PreferredTime | null>(
    null
  );

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  const canContinue = useMemo(() => {
    switch (step) {
      case 0:
        return (
          primaryGoal !== null &&
          (primaryGoal !== "custom" || customGoal.trim().length > 1)
        );
      case 1:
        return stressLevel >= 1;
      case 2:
        return sleepQuality !== null;
      case 3:
        return dailyTime !== null;
      case 4:
        return activities.length > 0;
      case 5:
        return preferredTime !== null;
      default:
        return false;
    }
  }, [
    step,
    primaryGoal,
    customGoal,
    stressLevel,
    sleepQuality,
    dailyTime,
    activities,
    preferredTime,
  ]);

  const toggleActivity = (a: PreferredActivity) => {
    setActivities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  const finish = () => {
    if (
      !primaryGoal ||
      !sleepQuality ||
      !dailyTime ||
      !preferredTime ||
      !activities.length
    )
      return;
    onComplete({
      primaryGoal,
      customGoal: primaryGoal === "custom" ? customGoal.trim() : undefined,
      stressLevel,
      sleepQuality,
      dailyTime,
      activities,
      preferredTime,
      completedAt: new Date().toISOString(),
    });
  };

  const next = () => {
    if (step === TOTAL_STEPS - 1) {
      finish();
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  const back = () => {
    if (step === 0) {
      onCancel();
      return;
    }
    setStep((s) => s - 1);
  };

  if (isGenerating) {
    return (
      <Card className="relative overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center gap-5 py-24 text-center">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-full bg-[#B74783]/20 blur-xl" />
            <Loader2 className="relative h-10 w-10 animate-spin text-[#B74783]" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-xl font-semibold text-[#49263D]">
              Crafting your wellness plan
            </h3>
            <p className="max-w-sm text-sm text-[#927C8B]">
              Soul Discovery is shaping daily missions around your goals, time, and
              preferred practices…
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/[0.08] to-transparent" />
      <CardContent className="relative space-y-5 p-5 md:p-7">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#927C8B]">
              <Sparkles className="h-3.5 w-3.5 text-[#B74783]" />
              Assessment · Step {step + 1} of {TOTAL_STEPS}
            </span>
            <span className="text-xs font-semibold text-[#B74783]">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="min-h-[280px] space-y-6"
          >
            {step === 0 && (
              <>
                <QuestionTitle>
                  What is your primary goal?
                </QuestionTitle>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {GOALS.map(([value, label]) => (
                    <OptionCard
                      key={value}
                      selected={primaryGoal === value}
                      onClick={() => setPrimaryGoal(value)}
                      label={label}
                    />
                  ))}
                </div>
                {primaryGoal === "custom" && (
                  <Input
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    placeholder="Describe your custom goal…"
                    className="h-12 rounded-2xl border-[#EADCE5] bg-white"
                  />
                )}
              </>
            )}

            {step === 1 && (
              <>
                <QuestionTitle>
                  How would you rate your current stress level?
                </QuestionTitle>
                <div className="space-y-5 px-2 pt-4">
                  <div className="flex items-end justify-between">
                    <span className="text-sm text-[#927C8B]">
                      Calm
                    </span>
                    <span className="font-display text-5xl font-bold text-[#49263D]">
                      {stressLevel}
                    </span>
                    <span className="text-sm text-[#927C8B]">
                      Intense
                    </span>
                  </div>
                  <Slider
                    value={[stressLevel]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(v) => setStressLevel(v[0] ?? 5)}
                  />
                  <div className="flex justify-between text-xs text-[#927C8B]">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <QuestionTitle>
                  How would you describe your sleep quality?
                </QuestionTitle>
                <div className="grid gap-3 sm:grid-cols-2">
                  {SLEEP.map(([value, label]) => (
                    <OptionCard
                      key={value}
                      selected={sleepQuality === value}
                      onClick={() => setSleepQuality(value)}
                      label={label}
                    />
                  ))}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <QuestionTitle>
                  How much time can you dedicate daily?
                </QuestionTitle>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {TIMES.map(([value, label]) => (
                    <OptionCard
                      key={value}
                      selected={dailyTime === value}
                      onClick={() => setDailyTime(value)}
                      label={label}
                    />
                  ))}
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <QuestionTitle>
                  Which activities do you enjoy?
                </QuestionTitle>
                <p className="text-sm text-[#927C8B]">
                  Select all that resonate — we&apos;ll weave them into your days.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {ACTIVITIES.map(([value, label]) => (
                    <OptionCard
                      key={value}
                      selected={activities.includes(value)}
                      onClick={() => toggleActivity(value)}
                      label={label}
                      multi
                    />
                  ))}
                </div>
              </>
            )}

            {step === 5 && (
              <>
                <QuestionTitle>
                  What time do you usually prefer wellness activities?
                </QuestionTitle>
                <div className="grid gap-3 sm:grid-cols-2">
                  {PREFERRED.map((item) => (
                    <OptionCard
                      key={item.value}
                      selected={preferredTime === item.value}
                      onClick={() => setPreferredTime(item.value)}
                      label={item.label}
                    />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between gap-3 border-t border-[#EADCE5] pt-6">
          <Button
            variant="ghost"
            onClick={back}
            className="gap-2 text-[#795A70]"
          >
            <ArrowLeft className="h-4 w-4" />
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          <Button
            onClick={next}
            disabled={!canContinue}
            className="btn-spatium gap-2"
          >
            {step === TOTAL_STEPS - 1 ? "Generate Plan" : "Continue"}
            {step === TOTAL_STEPS - 1 ? (
              <Sparkles className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function QuestionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-2xl font-bold tracking-tight text-[#49263D] md:text-3xl">
      {children}
    </h2>
  );
}

function OptionCard({
  selected,
  onClick,
  label,
  multi,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex items-center justify-between gap-3 rounded-2xl border px-4 py-4 text-left transition-all duration-300",
        selected
          ? "border-[#B74783]/45 bg-[rgba(183,71,131,0.14)] shadow-[0_0_0_1px_rgba(183,71,131,0.2)]"
          : "border-[#EADCE5] bg-white hover:border-[#EADCE5] hover:bg-[#FFF0F6]"
      )}
    >
      <span className="font-display text-sm font-semibold text-[#49263D] md:text-base">
        {label}
      </span>
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition",
          selected
            ? "border-[#B74783] bg-[#B74783] text-[#49263D]"
            : "border-[#EADCE5] text-transparent",
          multi && !selected && "rounded-md"
        )}
      >
        <Check className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}
