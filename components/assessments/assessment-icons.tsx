"use client";

import {
  Baby,
  BookOpen,
  CircleDot,
  CloudRain,
  Compass,
  Flame,
  Heart,
  Leaf,
  Moon,
  Repeat,
  Shield,
  Sparkles,
  Sun,
  Target,
  Users,
  Waves,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  wind: Wind,
  moon: Moon,
  compass: Compass,
  "cloud-rain": CloudRain,
  waves: Waves,
  users: Users,
  "book-open": BookOpen,
  target: Target,
  repeat: Repeat,
  heart: Heart,
  shield: Shield,
  leaf: Leaf,
  baby: Baby,
  sun: Sun,
  "circle-dot": CircleDot,
  flame: Flame,
};

export function AssessmentIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICON_MAP[name] || Sparkles;
  return <Icon className={cn("h-6 w-6", className)} aria-hidden />;
}

export function typeBadgeLabel(typeBadge: string) {
  switch (typeBadge) {
    case "clinical_screening":
      return "Clinical screening";
    case "self_reflection":
      return "Self-reflection";
    case "educational":
      return "Educational";
    case "check_in":
      return "Check-in";
    case "finder":
      return "Starting point";
    default:
      return typeBadge;
  }
}

export function categoryLabel(category: string) {
  switch (category) {
    case "emotional_wellbeing":
      return "Emotional well-being";
    case "focus_functioning":
      return "Focus & functioning";
    case "thoughts_behaviors":
      return "Thoughts & behaviors";
    case "trauma_specialist":
      return "Trauma & specialist";
    case "general":
      return "General";
    case "starting_point":
      return "Starting point";
    default:
      return category;
  }
}
