import type { AssessmentCard } from "@/lib/api/assessments";

/**
 * Feeling-based discovery maps user-facing intentions onto real catalog
 * slugs / keywords. No invented instruments — only matches that exist
 * (published or coming_soon) in the Assessment Center catalog.
 */

export type FeelingId =
  | "anxiety"
  | "low_mood"
  | "stress"
  | "anger"
  | "sleep"
  | "social"
  | "general";

export type DurationBand = "few" | "medium" | "longer";

export type FeelingCategory = {
  id: FeelingId;
  title: string;
  description: string;
  icon: string;
  /** Explicit slug matches from the real catalog */
  slugs: string[];
  /** Extra title/description keywords (lowercase) */
  keywords: string[];
};

export const FEELING_CATEGORIES: FeelingCategory[] = [
  {
    id: "anxiety",
    title: "Anxiety",
    description: "Explore feelings of worry or nervousness.",
    icon: "waves",
    slugs: ["anxiety-symptoms-screening", "starting-point-finder"],
    keywords: ["anxiety", "anxious", "worry", "worried", "nervous"],
  },
  {
    id: "low_mood",
    title: "Low Mood",
    description: "Reflect on your mood and emotional well-being.",
    icon: "cloud-rain",
    slugs: [
      "depression-symptoms-screening",
      "mood-patterns-education",
      "daily-wellbeing-reflection",
      "starting-point-finder",
    ],
    keywords: ["mood", "depression", "low mood", "emotional"],
  },
  {
    id: "stress",
    title: "Stress",
    description: "Understand how stress may be affecting you.",
    icon: "wind",
    slugs: ["stress-check-in", "starting-point-finder"],
    keywords: ["stress", "stressed", "overwhelm", "overwhelmed"],
  },
  {
    id: "anger",
    title: "Anger & Frustration",
    description: "Reflect on triggers, reactions, and healthier responses.",
    icon: "flame",
    slugs: ["anger-management", "starting-point-finder"],
    keywords: ["anger", "angry", "frustration", "frustrated", "irritation", "temper"],
  },
  {
    id: "sleep",
    title: "Sleep",
    description: "Explore your sleep habits and rest.",
    icon: "moon",
    slugs: ["sleep-rest-check-in", "starting-point-finder"],
    keywords: ["sleep", "rest", "energy"],
  },
  {
    id: "social",
    title: "Social Confidence",
    description: "Explore comfort and confidence in social situations.",
    icon: "users",
    slugs: ["social-anxiety-screening", "starting-point-finder"],
    keywords: ["social", "social situations"],
  },
  {
    id: "general",
    title: "General Well-being",
    description: "Check in with how you've been feeling overall.",
    icon: "sparkles",
    slugs: [
      "daily-wellbeing-reflection",
      "general-mental-wellbeing-check-in",
      "starting-point-finder",
    ],
    keywords: ["well-being", "wellbeing", "overall", "general"],
  },
];

export function matchesFeeling(
  assessment: AssessmentCard,
  feelingId: FeelingId
): boolean {
  const feeling = FEELING_CATEGORIES.find((f) => f.id === feelingId);
  if (!feeling) return false;
  if (feeling.slugs.includes(assessment.slug)) return true;
  const haystack =
    `${assessment.title} ${assessment.shortDescription} ${assessment.category}`.toLowerCase();
  return feeling.keywords.some((kw) => haystack.includes(kw));
}

export function countForFeeling(
  assessments: AssessmentCard[],
  feelingId: FeelingId
): number {
  return assessments.filter((a) => matchesFeeling(a, feelingId)).length;
}

/** Only show feeling cards that have at least one real catalog match. */
export function availableFeelings(
  assessments: AssessmentCard[]
): FeelingCategory[] {
  return FEELING_CATEGORIES.filter(
    (f) => countForFeeling(assessments, f.id) > 0
  );
}

export function matchesDuration(
  assessment: AssessmentCard,
  band: DurationBand
): boolean {
  const m = assessment.estimatedMinutes;
  if (typeof m !== "number" || Number.isNaN(m)) return true;
  if (band === "few") return m <= 3;
  if (band === "medium") return m >= 4 && m <= 10;
  return m > 10;
}

export function matchesSearch(
  assessment: AssessmentCard,
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    assessment.title,
    assessment.shortDescription,
    assessment.category,
    assessment.typeBadge,
    assessment.audience,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export type AssessmentRecommendation = {
  assessment: AssessmentCard;
  reason: string;
};

/**
 * Recommend up to 3 published assessments from real catalog metadata.
 * Falls back to starting-point / daily wellbeing when a feeling only has
 * coming-soon clinical screens.
 */
export function recommendAssessments(options: {
  assessments: AssessmentCard[];
  featured?: AssessmentCard | null;
  feelingId: FeelingId | "not_sure" | null;
  durationBand: DurationBand | null;
}): AssessmentRecommendation[] {
  const { assessments, featured, feelingId, durationBand } = options;
  const pool = new Map<string, AssessmentCard>();
  for (const a of assessments) {
    if (a.status === "published" && a.questionCount > 0) {
      pool.set(a.slug, a);
    }
  }
  if (featured && featured.status === "published") {
    pool.set(featured.slug, featured);
  }

  const published = Array.from(pool.values());

  let candidates = published;
  if (feelingId && feelingId !== "not_sure") {
    candidates = published.filter((a) => matchesFeeling(a, feelingId));
  }

  if (durationBand) {
    const timed = candidates.filter((a) => matchesDuration(a, durationBand));
    if (timed.length > 0) candidates = timed;
  }

  if (candidates.length === 0) {
    const fallbackSlugs = [
      "starting-point-finder",
      "daily-wellbeing-reflection",
      "stress-check-in",
      "sleep-rest-check-in",
    ];
    candidates = fallbackSlugs
      .map((slug) => pool.get(slug))
      .filter((a): a is AssessmentCard => !!a);
  }

  return candidates.slice(0, 3).map((assessment) => ({
    assessment,
    reason: reasonFor(assessment, feelingId),
  }));
}

function reasonFor(
  assessment: AssessmentCard,
  feelingId: FeelingId | "not_sure" | null
): string {
  if (assessment.slug === "starting-point-finder") {
    return "A short guide that suggests relevant reflections based on what you want to explore.";
  }
  if (feelingId && feelingId !== "not_sure") {
    const feeling = FEELING_CATEGORIES.find((f) => f.id === feelingId);
    if (feeling && feeling.slugs.includes(assessment.slug)) {
      return `Recommended because it focuses on ${feeling.title.toLowerCase()} — aligned with what you selected.`;
    }
  }
  if (assessment.shortDescription) {
    return assessment.shortDescription;
  }
  return "Available now as a free Soul Discovery reflection.";
}
