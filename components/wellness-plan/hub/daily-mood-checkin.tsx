"use client";

import { useState } from "react";
import { Heart, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trackMood } from "@/lib/api/mood";
import { useSession } from "@/lib/contexts/session-context";
import { suggestPlansForMood } from "@/lib/wellness-plan/catalog";
import { getPlanBySlug } from "@/lib/wellness-plan/catalog";

export type HubMood = "anxious" | "overwhelmed" | "low" | "restless" | "okay";

const MOODS: {
  id: HubMood;
  label: string;
  emoji: string;
  score: number;
  chip: string;
}[] = [
  {
    id: "anxious",
    label: "Anxious",
    emoji: "😟",
    score: 30,
    chip: "bg-[#FFF0F6] text-[#BE4A8B] border-[#F3D4E6]",
  },
  {
    id: "overwhelmed",
    label: "Overwhelmed",
    emoji: "😣",
    score: 25,
    chip: "bg-[#F2ECFF] text-[#7A5BB5] border-[#E0D4F5]",
  },
  {
    id: "low",
    label: "Low",
    emoji: "😔",
    score: 35,
    chip: "bg-[#EDF2FF] text-[#5B7CDA] border-[#D5E0FF]",
  },
  {
    id: "restless",
    label: "Restless",
    emoji: "😤",
    score: 45,
    chip: "bg-[#FFF1E9] text-[#D4845A] border-[#F5DCCB]",
  },
  {
    id: "okay",
    label: "Okay",
    emoji: "🙂",
    score: 65,
    chip: "bg-[#EAF6F2] text-[#3D9B84] border-[#C8E8DE]",
  },
];

interface DailyMoodCheckInProps {
  onSuggestPlans?: (slugs: string[]) => void;
}

export function DailyMoodCheckIn({ onSuggestPlans }: DailyMoodCheckInProps) {
  const { isAuthenticated } = useSession();
  const [selected, setSelected] = useState<HubMood | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (mood: HubMood) => {
    setSelected(mood);
    setSaved(false);
    setError(null);
    onSuggestPlans?.(suggestPlansForMood(mood));
  };

  const handleSave = async () => {
    if (!selected || saving) return;
    const mood = MOODS.find((m) => m.id === selected);
    if (!mood) return;

    if (!isAuthenticated) {
      setError("Sign in to save your check-in. You can still explore plans below.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await trackMood({
        score: mood.score,
        mood: mood.label,
        source: "slider",
        note: `Wellness hub check-in: ${mood.label}`,
      });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save check-in.");
    } finally {
      setSaving(false);
    }
  };

  const suggestions = selected
    ? suggestPlansForMood(selected)
        .map((s) => getPlanBySlug(s)?.title)
        .filter(Boolean)
    : [];

  return (
    <section className="rounded-[22px] border border-[#EEDCE9] bg-white p-5 shadow-[0_8px_28px_rgba(123,57,98,0.06)] md:p-6">
      <div className="flex gap-3.5 sm:gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFF0F6]">
          <Heart className="h-5 w-5 text-[#BE4A8B]" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-[#512943] md:text-lg">
            How are you feeling today?
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-[#957F94]">
            Select what feels most like you right now.
          </p>

          <div
            role="radiogroup"
            aria-label="Daily mood"
            className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden"
          >
            {MOODS.map((mood) => {
              const isOn = selected === mood.id;
              return (
                <button
                  key={mood.id}
                  type="button"
                  role="radio"
                  aria-checked={isOn}
                  onClick={() => handleSelect(mood.id)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition",
                    mood.chip,
                    isOn
                      ? "ring-2 ring-[#BE4A8B]/35 ring-offset-1 ring-offset-white"
                      : "hover:brightness-[0.98]"
                  )}
                >
                  <span aria-hidden>{mood.emoji}</span>
                  {mood.label}
                </button>
              );
            })}
          </div>

          {suggestions.length > 0 && (
            <p className="mt-3 text-xs leading-relaxed text-[#957F94]">
              You might like: {suggestions.join(" · ")}. All plans stay available
              below.
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              size="sm"
              disabled={!selected || saving}
              onClick={handleSave}
              className="rounded-full bg-[#BE4A8B] px-5 text-white hover:bg-[#A63F79]"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : saved ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Saved
                </>
              ) : (
                "Save check-in"
              )}
            </Button>
            {error && (
              <p className="text-xs font-medium text-[#B74783]" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
