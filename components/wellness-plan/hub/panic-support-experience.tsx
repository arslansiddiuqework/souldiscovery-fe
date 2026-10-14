"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalmBreathingExperience } from "./calm-breathing-experience";
import { GroundingExperience } from "./grounding-experience";

interface Props {
  onClose: () => void;
}

type Step = "welcome" | "choose" | "breathing" | "grounding" | "reflect";

export function PanicSupportExperience({ onClose }: Props) {
  const [step, setStep] = useState<Step>("welcome");

  if (step === "breathing") {
    return (
      <CalmBreathingExperience
        onClose={() => setStep("reflect")}
      />
    );
  }

  if (step === "grounding") {
    return <GroundingExperience onClose={() => setStep("reflect")} />;
  }

  if (step === "reflect") {
    return (
      <div className="space-y-4 pt-2">
        <h3 className="text-xl font-bold text-[#512943]">You made it through this moment</h3>
        <p className="text-sm leading-relaxed text-[#957F94]">
          Optional: notice one thing that helped, even slightly. You do not need
          to share anything.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            className="rounded-full bg-[#BE4A8B] text-white hover:bg-[#A63F79]"
          >
            <Link href="/settings/emergency">Emergency settings</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full"
          >
            <Link href="/wellness-plan?plan=panic-support">
              Optional follow-up plan
            </Link>
          </Button>
          <Button variant="ghost" onClick={onClose} className="rounded-full">
            Close
          </Button>
        </div>
      </div>
    );
  }

  if (step === "choose") {
    return (
      <div className="space-y-4 pt-2">
        <h3 className="text-xl font-bold text-[#512943]">Choose one support</h3>
        <p className="text-sm text-[#957F94]">
          Pick whatever feels easiest right now. You can leave at any time.
        </p>
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => setStep("grounding")}
            className="rounded-full bg-[#BE4A8B] text-white hover:bg-[#A63F79]"
          >
            Grounding
          </Button>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => setStep("breathing")}
          >
            Gentle breathing
          </Button>
          <Button variant="ghost" className="rounded-full" onClick={onClose}>
            Just sit quietly — I&apos;m okay for now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <h3 className="text-xl font-bold text-[#512943]">You are not alone</h3>
      <p className="text-sm leading-relaxed text-[#957F94]">
        Intense fear or body sensations can feel overwhelming. This space offers
        calm next steps — it does not diagnose a panic attack, and it is not a
        substitute for emergency care.
      </p>
      <div className="rounded-[16px] border border-[#EEDCE9] bg-[#FFF0F6] p-4 text-sm leading-relaxed text-[#512943]">
        <strong className="font-semibold">Safety note:</strong> New, severe,
        unusual, or concerning physical symptoms (such as chest pain, fainting,
        or sudden severe breathing difficulty) may require urgent medical
        assessment. Contact local emergency services if you may be in immediate
        danger.
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setStep("choose")}
          className="rounded-full bg-[#BE4A8B] text-white hover:bg-[#A63F79]"
        >
          Continue to support options
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/settings/emergency">Emergency contacts</Link>
        </Button>
        <Button variant="ghost" onClick={onClose} className="rounded-full">
          Exit
        </Button>
      </div>
    </div>
  );
}
