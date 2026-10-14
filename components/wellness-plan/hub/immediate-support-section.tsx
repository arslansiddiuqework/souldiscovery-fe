"use client";

import { useState } from "react";
import {
  ChevronRight,
  Flower2,
  Heart,
  Leaf,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CalmBreathingExperience } from "./calm-breathing-experience";
import { GroundingExperience } from "./grounding-experience";
import { PanicSupportExperience } from "./panic-support-experience";

type SupportKind = "breathing" | "grounding" | "panic" | null;

const ACTIONS = [
  {
    id: "breathing" as const,
    title: "Calm Breathing",
    meta: "2–5 min",
    description: "Follow a gentle guided breathing exercise.",
    icon: Flower2,
    tint: "bg-[#FFF0F6] text-[#BE4A8B]",
  },
  {
    id: "grounding" as const,
    title: "Grounding Exercise",
    meta: "3–5 min",
    description: "Reconnect with the present moment.",
    icon: Leaf,
    tint: "bg-[#EAF6F2] text-[#3D9B84]",
  },
  {
    id: "panic" as const,
    title: "Panic Support",
    meta: "Immediate help",
    description: "Find a calm, guided next step when you're feeling overwhelmed.",
    icon: Heart,
    tint: "bg-[#F2ECFF] text-[#8B6BC7]",
  },
];

export function ImmediateSupportSection() {
  const [open, setOpen] = useState<SupportKind>(null);

  return (
    <section className="rounded-[22px] border border-[#EEDCE9] bg-white p-5 shadow-[0_8px_28px_rgba(123,57,98,0.06)] md:p-6">
      <div className="flex gap-3.5 sm:gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFF0F6]">
          <Zap className="h-5 w-5 text-[#BE4A8B]" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-[#512943] md:text-lg">
            Need help right now?
          </h2>
          <p className="mt-1 max-w-[52ch] text-sm leading-relaxed text-[#957F94]">
            Get immediate support with breathing exercises, grounding techniques
            and calming tools.
          </p>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-3 sm:gap-3">
            {ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => setOpen(action.id)}
                className={cn(
                  "group flex items-center gap-3 rounded-[16px] border border-[#EEDCE9] bg-[#FCF8FC] p-3 text-left transition sm:p-3.5",
                  "hover:border-[#DFC7D6] hover:bg-white hover:shadow-[0_8px_24px_rgba(123,57,98,0.08)]"
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    action.tint
                  )}
                >
                  <action.icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-[#512943]">
                    {action.title}
                  </span>
                  <span className="mt-0.5 block text-[11px] font-medium text-[#957F94]">
                    {action.meta}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#BE4A8B] opacity-60 transition group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-[#EEDCE9] bg-white sm:max-w-lg sm:rounded-[22px]">
          <DialogHeader className="sr-only">
            <DialogTitle>
              {open === "breathing"
                ? "Calm Breathing"
                : open === "grounding"
                  ? "Grounding Exercise"
                  : "Panic Support"}
            </DialogTitle>
            <DialogDescription>Immediate support experience</DialogDescription>
          </DialogHeader>
          {open === "breathing" && (
            <CalmBreathingExperience onClose={() => setOpen(null)} />
          )}
          {open === "grounding" && (
            <GroundingExperience onClose={() => setOpen(null)} />
          )}
          {open === "panic" && (
            <PanicSupportExperience onClose={() => setOpen(null)} />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
