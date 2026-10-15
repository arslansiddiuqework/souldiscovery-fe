"use client";

import { useState } from "react";
import { Flower2, Heart, Leaf } from "lucide-react";
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
    title: "Breathe",
    meta: "2–5 min",
    icon: Flower2,
    tint: "bg-[#FFF0F6] text-[#BE4A8B]",
  },
  {
    id: "grounding" as const,
    title: "Ground",
    meta: "3–5 min",
    icon: Leaf,
    tint: "bg-[#EAF6F2] text-[#3D9B84]",
  },
  {
    id: "panic" as const,
    title: "Panic help",
    meta: "Now",
    icon: Heart,
    tint: "bg-[#F2ECFF] text-[#8B6BC7]",
  },
];

interface ImmediateSupportSectionProps {
  compact?: boolean;
}

export function ImmediateSupportSection({
  compact = false,
}: ImmediateSupportSectionProps) {
  const [open, setOpen] = useState<SupportKind>(null);

  return (
    <>
      <div className={cn("min-w-0", compact && "w-full")}>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#927C8B]">
          Need help now?
        </p>
        <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible">
          {ACTIONS.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => setOpen(action.id)}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#EADCE5] bg-white/90 py-1.5 pl-1.5 pr-3 text-left transition hover:border-[#DFC7D6] hover:bg-white hover:shadow-[0_6px_16px_rgba(123,57,98,0.08)]"
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full",
                  action.tint
                )}
              >
                <action.icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
              </span>
              <span>
                <span className="block text-[12px] font-bold leading-none text-[#512943]">
                  {action.title}
                </span>
                <span className="mt-0.5 block text-[10px] font-medium text-[#927C8B]">
                  {action.meta}
                </span>
              </span>
            </button>
          ))}
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
    </>
  );
}
