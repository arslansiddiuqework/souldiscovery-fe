"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    title: "Look around",
    prompt: "Name 5 things you can see right now.",
    hint: "Colors, shapes, light — anything nearby.",
  },
  {
    title: "Listen",
    prompt: "Name 4 things you can hear.",
    hint: "Near or far sounds both count.",
  },
  {
    title: "Touch",
    prompt: "Name 3 things you can feel.",
    hint: "Texture of clothes, chair, temperature.",
  },
  {
    title: "Smell",
    prompt: "Name 2 things you can smell — or notice the air.",
    hint: "If nothing stands out, that is okay.",
  },
  {
    title: "Taste",
    prompt: "Name 1 thing you can taste, or take a slow sip of water.",
    hint: "Even noticing your mouth counts.",
  },
];

const ALT_STEPS = [
  {
    title: "Feet on the floor",
    prompt: "Press your feet gently into the ground and notice the pressure.",
    hint: "No need to name senses out loud.",
  },
  {
    title: "Hands",
    prompt: "Rub your fingertips together and notice the sensation.",
    hint: "Stay with this for a few breaths.",
  },
  {
    title: "Name the room",
    prompt: "Silently name the room or place you are in.",
    hint: "You are here, in this moment.",
  },
];

interface Props {
  onClose: () => void;
}

export function GroundingExperience({ onClose }: Props) {
  const [mode, setMode] = useState<"intro" | "sensory" | "alt" | "done">(
    "intro"
  );
  const [step, setStep] = useState(0);
  const steps = mode === "alt" ? ALT_STEPS : STEPS;

  if (mode === "intro") {
    return (
      <div className="space-y-4 pt-2">
        <h3 className="text-xl font-bold text-[#512943]">Grounding Exercise</h3>
        <p className="text-sm leading-relaxed text-[#957F94]">
          A short sensory practice to reconnect with the present. Move at your
          own pace — nothing is recorded.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={() => {
              setMode("sensory");
              setStep(0);
            }}
            className="rounded-full bg-[#BE4A8B] text-white hover:bg-[#A63F79]"
          >
            Start 5–4–3–2–1
          </Button>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => {
              setMode("alt");
              setStep(0);
            }}
          >
            Prefer a quieter option
          </Button>
        </div>
        <Button variant="ghost" onClick={onClose} className="rounded-full">
          Close
        </Button>
      </div>
    );
  }

  if (mode === "done") {
    return (
      <div className="space-y-4 pt-2 text-center">
        <h3 className="text-xl font-bold text-[#512943]">Well done</h3>
        <p className="text-sm text-[#957F94]">
          You gave yourself a few moments of presence. That counts.
        </p>
        <Button
          onClick={onClose}
          className="rounded-full bg-[#BE4A8B] text-white hover:bg-[#A63F79]"
        >
          Close
        </Button>
      </div>
    );
  }

  const current = steps[step];
  const isLast = step >= steps.length - 1;

  return (
    <div className="space-y-5 pt-2">
      <div className="flex items-center justify-between text-xs font-semibold text-[#957F94]">
        <span>
          Step {step + 1} of {steps.length}
        </span>
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 w-4 rounded-full",
                i <= step ? "bg-[#BE4A8B]" : "bg-[#EEDCE9]"
              )}
            />
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold text-[#512943]">{current.title}</h3>
        <p className="mt-2 text-base font-medium text-[#512943]">
          {current.prompt}
        </p>
        <p className="mt-2 text-sm text-[#957F94]">{current.hint}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            if (isLast) setMode("done");
            else setStep((s) => s + 1);
          }}
          className="rounded-full bg-[#BE4A8B] text-white hover:bg-[#A63F79]"
        >
          {isLast ? "Finish" : "Next"}
        </Button>
        <Button variant="outline" onClick={onClose} className="rounded-full">
          Exit
        </Button>
      </div>
    </div>
  );
}
