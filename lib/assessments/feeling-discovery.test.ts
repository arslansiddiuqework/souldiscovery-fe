/**
 * Run: node --experimental-strip-types lib/assessments/feeling-discovery.test.ts
 */
import assert from "node:assert/strict";
import type { AssessmentCard } from "../api/assessments.ts";
import {
  availableFeelings,
  matchesFeeling,
  matchesSearch,
  recommendAssessments,
} from "./feeling-discovery.ts";

function card(partial: Partial<AssessmentCard> & Pick<AssessmentCard, "slug" | "title">): AssessmentCard {
  return {
    id: partial.id ?? partial.slug,
    slug: partial.slug,
    version: "1.0.0",
    title: partial.title,
    shortDescription: partial.shortDescription ?? "",
    category: partial.category ?? "general",
    typeBadge: partial.typeBadge ?? "check_in",
    estimatedMinutes: partial.estimatedMinutes ?? 5,
    audience: "Adults (18+)",
    status: partial.status ?? "published",
    clinicallyValidated: false,
    free: true,
    icon: partial.icon ?? "sparkles",
    questionCount: partial.questionCount ?? 5,
  };
}

const catalog: AssessmentCard[] = [
  card({
    slug: "stress-check-in",
    title: "Stress Check-In",
    shortDescription: "Understand stress",
    status: "published",
    estimatedMinutes: 4,
    questionCount: 5,
  }),
  card({
    slug: "sleep-rest-check-in",
    title: "Sleep and Rest Check-In",
    shortDescription: "Explore sleep",
    status: "published",
    estimatedMinutes: 4,
    questionCount: 5,
  }),
  card({
    slug: "daily-wellbeing-reflection",
    title: "Daily Well-being Reflection",
    shortDescription: "Overall check-in",
    status: "published",
    estimatedMinutes: 5,
    questionCount: 8,
  }),
  card({
    slug: "starting-point-finder",
    title: "Not sure where to start?",
    shortDescription: "Suggests relevant assessments",
    status: "published",
    estimatedMinutes: 2,
    questionCount: 2,
  }),
  card({
    slug: "anxiety-symptoms-screening",
    title: "Anxiety Symptoms Screening",
    shortDescription: "Worry and nervousness",
    status: "coming_soon",
    questionCount: 0,
  }),
];

assert.equal(matchesFeeling(catalog[0], "stress"), true);
assert.equal(matchesFeeling(catalog[1], "sleep"), true);
assert.equal(matchesSearch(catalog[0], "  STRESS  "), true);
assert.equal(matchesSearch(catalog[0], "xyzzy"), false);

const feelings = availableFeelings(catalog);
assert.ok(feelings.some((f) => f.id === "stress"));
assert.ok(feelings.some((f) => f.id === "anxiety"));

const recs = recommendAssessments({
  assessments: catalog,
  feelingId: "stress",
  durationBand: "medium",
});
assert.ok(recs.length >= 1 && recs.length <= 3);
assert.ok(recs.every((r) => r.assessment.status === "published"));
assert.ok(recs.some((r) => r.assessment.slug === "stress-check-in"));

const anxietyRecs = recommendAssessments({
  assessments: catalog,
  feelingId: "anxiety",
  durationBand: null,
});
assert.ok(anxietyRecs.every((r) => r.assessment.status === "published"));
assert.ok(
  anxietyRecs.some((r) => r.assessment.slug === "starting-point-finder"),
  "anxiety should fall back to published starting point"
);

console.log("feeling-discovery.test.ts: ok");
