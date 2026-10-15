"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackMood } from "@/lib/api/mood";
import { useSession } from "@/lib/contexts/session-context";
import { suggestPlansForMood } from "@/lib/wellness-plan/catalog";

export type HubMood = "anxious" | "overwhelmed" | "low" | "restless" | "okay";

const MOODS: {
  id: HubMood;
  label: string;
  emoji: string;
  score: number;
}[] = [
  { id: "anxious", label: "Anxious", emoji: "😟", score: 30 },
  { id: "overwhelmed", label: "Overwhelmed", emoji: "😣", score: 25 },
  { id: "low", label: "Low", emoji: "😔", score: 35 },
  { id: "restless", label: "Restless", emoji: "😤", score: 45 },
  { id: "okay", label: "Okay", emoji: "🙂", score: 65 },
];

interface DailyMoodCheckInProps {
  onSuggestPlans?: (slugs: string[]) => void;
  compact?: boolean;
}

export function DailyMoodCheckIn({
  onSuggestPlans,
  compact = false,
}: DailyMoodCheckInProps) {
  const { isAuthenticated } = useSession();
  const [selected, setSelected] = useState<HubMood | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (moodId: HubMood) => {
    setSelected(moodId);
    setSaved(false);
    setError(null);
    onSuggestPlans?.(suggestPlansForMood(moodId));

    if (!isAuthenticated) return;

    const mood = MOODS.find((m) => m.id === moodId);
    if (!mood || saving) return;

    setSaving(true);
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

  return (
    <div className={cn("min-w-0", compact && "w-full")}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#927C8B]">
          How are you feeling?
        </p>
        {saving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#B74783]" />
        ) : saved ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#3D9B84]">
            <Check className="h-3 w-3" />
            Saved
          </span>
        ) : null}
      </div>
      <div
        role="radiogroup"
        aria-label="Daily mood"
        className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[12px] font-semibold transition",
                isOn
                  ? "border-transparent bg-[#B74783] text-white shadow-[0_6px_16px_rgba(183,71,131,0.28)]"
                  : "border-[#EADCE5] bg-white/90 text-[#716B7D] hover:border-[#DFC7D6] hover:bg-white"
              )}
            >
              <span aria-hidden className="text-sm leading-none">
                {mood.emoji}
              </span>
              {mood.label}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="mt-1 text-[10px] font-medium text-[#B74783]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
