import { fetchAssessmentHistory } from "@/lib/api/assessments";
import {
  parseActivityPayload,
  parseAssessmentPayload,
  parseMoodPayload,
  parsePlanPayload,
  type ActivityRecord,
  type AssessmentRecord,
  type MoodRecord,
  type PlanTaskRecord,
} from "./compute";

export type SourceKey = "moods" | "activities" | "plans" | "assessments";

export type ProgressLoadResult = {
  authRequired: boolean;
  moods: MoodRecord[];
  activities: ActivityRecord[];
  planTasks: PlanTaskRecord[];
  assessments: AssessmentRecord[];
  errors: Partial<Record<SourceKey, string>>;
};

const UNAVAILABLE = "We couldn't load this just now.";

async function readJson(url: string): Promise<unknown> {
  const token = localStorage.getItem("token");
  if (!token) {
    const error = new Error("Sign in to see your progress.");
    error.name = "AuthError";
    throw error;
  }
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (response.status === 401) {
    const error = new Error("Sign in to see your progress.");
    error.name = "AuthError";
    throw error;
  }
  if (!response.ok) throw new Error(UNAVAILABLE);
  return response.json();
}

export async function loadProgressSources(): Promise<ProgressLoadResult> {
  const empty: ProgressLoadResult = {
    authRequired: false,
    moods: [],
    activities: [],
    planTasks: [],
    assessments: [],
    errors: {},
  };
  if (typeof window === "undefined" || !localStorage.getItem("token")) {
    return { ...empty, authRequired: true };
  }

  const [moods, activities, plans, assessments] = await Promise.allSettled([
    readJson("/api/mood/history"),
    readJson("/api/activity"),
    readJson("/api/wellness-plan"),
    fetchAssessmentHistory(),
  ]);

  const errors: ProgressLoadResult["errors"] = {};

  const isAuthFailure = (reason: unknown) => {
    if (!(reason instanceof Error)) return false;
    if (reason.name === "AuthError") return true;
    const message = reason.message.toLowerCase();
    return (
      message.includes("not authenticated") ||
      message.includes("authentication") ||
      message.includes("no token") ||
      message.includes("sign in")
    );
  };

  const settled = [moods, activities, plans, assessments];
  if (settled.every((result) => result.status === "rejected" && isAuthFailure(result.reason))) {
    return { ...empty, authRequired: true };
  }

  const take = <T,>(
    key: SourceKey,
    result: PromiseSettledResult<T>,
    map: (value: T) => void
  ) => {
    if (result.status === "fulfilled") {
      map(result.value);
      return;
    }
    errors[key] = UNAVAILABLE;
  };

  take("moods", moods, (value) => {
    const body = value as { data?: unknown };
    empty.moods = parseMoodPayload(body?.data ?? value);
  });
  take("activities", activities, (value) => {
    const body = value as { data?: unknown };
    empty.activities = parseActivityPayload(body?.data ?? value);
  });
  take("plans", plans, (value) => {
    empty.planTasks = parsePlanPayload(value);
  });
  take("assessments", assessments, (value) => {
    empty.assessments = parseAssessmentPayload(value);
  });

  return { ...empty, errors };
}
