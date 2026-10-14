import {
  Activity,
  Brain,
  ClipboardCheck,
  Cloud,
  Flame,
  Flower2,
  Heart,
  HeartCrack,
  HeartHandshake,
  Leaf,
  MessageCircle,
  Moon,
  Sparkles,
  Sprout,
  Sun,
  Target,
  Users,
  Flower,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  flower2: Flower2,
  moon: Moon,
  heartHandshake: HeartHandshake,
  sun: Sun,
  brain: Brain,
  leaf: Leaf,
  sparkles: Sparkles,
  heart: Heart,
  users: Users,
  activity: Activity,
  cloud: Cloud,
  flower: Flower,
  clipboardCheck: ClipboardCheck,
  messageCircle: MessageCircle,
  flame: Flame,
  heartCrack: HeartCrack,
  target: Target,
  sprout: Sprout,
};

export function getCatalogIcon(name: string): LucideIcon {
  return ICONS[name] || Sparkles;
}
