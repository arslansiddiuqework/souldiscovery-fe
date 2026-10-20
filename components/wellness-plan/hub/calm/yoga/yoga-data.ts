export type YogaCategory =
  | "mind"
  | "stretch"
  | "balance"
  | "breath";

export type YogaBenefit =
  | "calm"
  | "rest"
  | "ease"
  | "soften"
  | "mobility"
  | "release"
  | "lengthen"
  | "ground"
  | "balance"
  | "breathe";

export type YogaPoseId =
  | "easy-seated"
  | "childs-pose"
  | "legs-up-wall"
  | "reclined-bound-angle"
  | "corpse-pose"
  | "cat-cow"
  | "neck-shoulder"
  | "seated-twist"
  | "seated-forward-fold"
  | "side-stretch"
  | "mountain"
  | "tree"
  | "standing-forward-fold"
  | "standing-side-stretch"
  | "seated-breathing"
  | "shoulder-rolls"
  | "wrist-hand"
  | "seated-relaxation";

export interface YogaExercise {
  id: YogaPoseId;
  name: string;
  category: YogaCategory;
  benefit: YogaBenefit;
  /** Duration in seconds */
  durationSec: number;
  /** Short safety note when relevant */
  safetyNote?: string;
  /** Supported / seated alternative hint */
  alternative?: string;
}

export const YOGA_CATEGORIES: Array<{
  id: YogaCategory | "all";
  label: string;
}> = [
  { id: "all", label: "All" },
  { id: "mind", label: "Mind" },
  { id: "stretch", label: "Stretch" },
  { id: "balance", label: "Balance" },
  { id: "breath", label: "Breath" },
];

export const BENEFIT_LABELS: Record<YogaBenefit, string> = {
  calm: "Calm",
  rest: "Rest",
  ease: "Ease",
  soften: "Soften",
  mobility: "Mobility",
  release: "Release",
  lengthen: "Lengthen",
  ground: "Ground",
  balance: "Balance",
  breathe: "Breathe",
};

export const YOGA_EXERCISES: YogaExercise[] = [
  {
    id: "easy-seated",
    name: "Easy Seated Pose",
    category: "mind",
    benefit: "calm",
    durationSec: 180,
  },
  {
    id: "childs-pose",
    name: "Child's Pose",
    category: "mind",
    benefit: "rest",
    durationSec: 180,
    alternative: "Rest forehead on stacked fists if knees feel tight.",
  },
  {
    id: "legs-up-wall",
    name: "Legs-Up-the-Wall",
    category: "mind",
    benefit: "ease",
    durationSec: 300,
    safetyNote: "Skip if you have glaucoma, eye pressure concerns, or recent injury.",
    alternative: "Lie down with calves resting on a chair.",
  },
  {
    id: "reclined-bound-angle",
    name: "Supported Bound Angle",
    category: "mind",
    benefit: "soften",
    durationSec: 300,
    alternative: "Keep knees supported with pillows.",
  },
  {
    id: "corpse-pose",
    name: "Corpse Pose",
    category: "mind",
    benefit: "rest",
    durationSec: 300,
  },
  {
    id: "cat-cow",
    name: "Cat–Cow Stretch",
    category: "stretch",
    benefit: "mobility",
    durationSec: 180,
    safetyNote: "Move slowly. Stop if you feel pain.",
  },
  {
    id: "neck-shoulder",
    name: "Neck & Shoulder Ease",
    category: "stretch",
    benefit: "release",
    durationSec: 120,
    safetyNote: "Keep movement small. Avoid extreme neck turns.",
  },
  {
    id: "seated-twist",
    name: "Seated Spinal Twist",
    category: "stretch",
    benefit: "ease",
    durationSec: 180,
    safetyNote: "Twist gently from the torso. No forcing.",
  },
  {
    id: "seated-forward-fold",
    name: "Seated Forward Fold",
    category: "stretch",
    benefit: "soften",
    durationSec: 180,
    alternative: "Bend knees as much as you need.",
  },
  {
    id: "side-stretch",
    name: "Gentle Side Stretch",
    category: "stretch",
    benefit: "lengthen",
    durationSec: 120,
  },
  {
    id: "mountain",
    name: "Mountain Pose",
    category: "balance",
    benefit: "ground",
    durationSec: 120,
  },
  {
    id: "tree",
    name: "Tree Pose",
    category: "balance",
    benefit: "balance",
    durationSec: 180,
    alternative: "Keep toes on the floor or hold a wall.",
    safetyNote: "Use wall support anytime you feel unsteady.",
  },
  {
    id: "standing-forward-fold",
    name: "Standing Forward Fold",
    category: "balance",
    benefit: "soften",
    durationSec: 180,
    alternative: "Bend knees generously; hands may rest on thighs.",
  },
  {
    id: "standing-side-stretch",
    name: "Standing Side Stretch",
    category: "balance",
    benefit: "lengthen",
    durationSec: 120,
  },
  {
    id: "seated-breathing",
    name: "Seated Breathing",
    category: "breath",
    benefit: "breathe",
    durationSec: 180,
    safetyNote: "Breathe naturally. Never hold your breath.",
  },
  {
    id: "shoulder-rolls",
    name: "Slow Shoulder Rolls",
    category: "breath",
    benefit: "release",
    durationSec: 120,
  },
  {
    id: "wrist-hand",
    name: "Wrist & Hand Stretch",
    category: "breath",
    benefit: "soften",
    durationSec: 120,
  },
  {
    id: "seated-relaxation",
    name: "Seated Body Relaxation",
    category: "breath",
    benefit: "rest",
    durationSec: 300,
  },
];

export function formatDuration(sec: number): string {
  const m = Math.round(sec / 60);
  return `${m} min`;
}

export function formatClock(sec: number): string {
  const s = Math.max(0, Math.ceil(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
