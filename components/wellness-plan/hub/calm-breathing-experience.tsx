"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BreathingGame } from "@/components/games/breathing-game";

interface Props {
  onClose: () => void;
}

export function CalmBreathingExperience({ onClose }: Props) {
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <div className="space-y-4 pt-2">
        <h3 className="text-xl font-bold text-[#512943]">Calm Breathing</h3>
        <p className="text-sm leading-relaxed text-[#957F94]">
          A gentle guided breathing exercise lasting about 2–5 minutes. Follow
          the visual pace at a comfortable speed. You can stop anytime.
        </p>
        <p className="text-xs leading-relaxed text-[#957F94]">
          If breath-focused exercises feel uncomfortable, try grounding instead
          or simply rest. This practice does not claim to stop panic or treat
          medical conditions.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            onClick={() => setStarted(true)}
            className="rounded-full bg-[#BE4A8B] text-white hover:bg-[#A63F79]"
          >
            Begin
          </Button>
          <Button variant="outline" onClick={onClose} className="rounded-full">
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <h3 className="text-lg font-bold text-[#512943]">Follow the rhythm</h3>
      <div className="overflow-hidden rounded-[18px] border border-[#EEDCE9] bg-[#FCF8FC] p-2">
        <BreathingGame />
      </div>
      <Button variant="outline" onClick={onClose} className="rounded-full">
        Done
      </Button>
    </div>
  );
}
