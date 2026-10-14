/**
 * Assessment Center API client — talks to Next.js BFF /api/assessments/*
 * Sensitive answers are only sent in POST bodies, never query strings.
 */

export type AssessmentCard = {
  id: string;
  slug: string;
  version: string;
  title: string;
  shortDescription: string;
  category: string;
  typeBadge: string;
  estimatedMinutes: number;
  audience: string;
  privacyNote?: string;
  status: "draft" | "published" | "coming_soon" | "archived";
  clinicallyValidated: boolean;
  free: boolean;
  icon: string;
  questionCount: number;
};

export type AssessmentOverview = AssessmentCard & {
  longDescription: string;
  referencePeriod?: string;
  whatItExplores: string[];
  whatHappensAfter: string[];
  requiresAcknowledgment: boolean;
  canStart: boolean;
  license: {
    source: string;
    clinicallyValidated: boolean;
    attribution?: string;
    notes?: string;
  };
  primaryNextStep: { label: string; href: string };
};

export type AssessmentQuestion = {
  id: string;
  text: string;
  helpText?: string;
  required: boolean;
  allowSkip: boolean;
  responseType: "single" | "multi";
  options: Array<{ id: string; label: string; value: number | string }>;
  showIf?: { questionId: string; values: Array<number | string> };
};

export type ScoringResult = {
  instrumentId: string;
  instrumentVersion: string;
  scoringMethod: string;
  clinicallyValidated: boolean;
  totalScore: number | null;
  maxScore: number | null;
  interpretationLabel: string | null;
  interpretationSummary: string;
  domains: Array<{
    domain: string;
    average: number | null;
    status: string;
    note: string;
  }>;
  goingWell: string[];
  needsAttention: string[];
  smallStep: string;
  suggestedPlanSlugs: string[];
  suggestedAssessmentSlugs?: string[];
  educationalTips?: string[];
  disclaimer: string;
  answeredCount: number;
  skippedCount: number;
};

export type CrisisPayload = {
  title: string;
  message: string;
  resources: Array<{
    id: string;
    name: string;
    description: string;
    contact: string;
    href?: string;
    region: string;
    coverageNote: string;
  }>;
};

export type SubmitResult = {
  resultId: string | null;
  saved: boolean;
  title: string;
  assessmentSlug: string;
  instrumentVersion: string;
  completedAt: string;
  scoring: ScoringResult;
  summary: string;
  recommendations: Array<{ planSlug: string; reason: string; href: string }>;
  primaryNextStep: { label: string; href: string };
  crisis: CrisisPayload;
  license: { source: string; clinicallyValidated: boolean; notes?: string };
  guestNote?: string;
  duplicate?: boolean;
};

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function parseJson(res: Response) {
  return res.json().catch(() => ({}));
}

export async function fetchAssessmentCatalog(params?: {
  search?: string;
  category?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.category && params.category !== "all") qs.set("category", params.category);
  const res = await fetch(`/api/assessments?${qs.toString()}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || data.error || "Failed to load assessments");
  return data as {
    featured: (AssessmentCard & { headline: string; cta: string }) | null;
    assessments: AssessmentCard[];
    categories: Array<{ id: string; label: string }>;
    trust: string[];
    crisis: CrisisPayload;
  };
}

export async function fetchAssessmentOverview(slug: string) {
  const res = await fetch(`/api/assessments/${encodeURIComponent(slug)}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || data.error || "Failed to load assessment");
  return data as { assessment: AssessmentOverview; crisis: CrisisPayload };
}

export async function fetchAssessmentTake(slug: string) {
  const res = await fetch(`/api/assessments/${encodeURIComponent(slug)}/take`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || data.error || "Failed to load questions");
  return data as {
    assessment: {
      id: string;
      slug: string;
      version: string;
      title: string;
      referencePeriod?: string;
      clinicallyValidated: boolean;
      requiresAcknowledgment: boolean;
      questions: AssessmentQuestion[];
    };
    crisis: CrisisPayload;
  };
}

export async function startAssessmentSession(
  slug: string,
  acknowledgedNotDiagnosis: boolean
) {
  const res = await fetch(`/api/assessments/${encodeURIComponent(slug)}/sessions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ acknowledgedNotDiagnosis }),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || data.error || "Failed to start session");
  return data as {
    sessionId: string;
    submissionToken: string;
    instrumentVersion: string;
    expiresAt: string;
  };
}

export async function saveAssessmentProgress(
  slug: string,
  sessionId: string,
  payload: {
    answers: Array<{ questionId: string; value: number | string | null; skipped?: boolean }>;
    currentQuestionId?: string;
  }
) {
  const res = await fetch(
    `/api/assessments/${encodeURIComponent(slug)}/sessions/${encodeURIComponent(sessionId)}`,
    {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }
  );
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || data.error || "Failed to save progress");
  return data;
}

export async function submitAssessment(
  slug: string,
  payload: {
    answers: Array<{ questionId: string; value: number | string | null; skipped?: boolean }>;
    acknowledgedNotDiagnosis: boolean;
    saveResults: boolean;
    sessionId?: string;
    submissionToken?: string;
  }
) {
  const res = await fetch(`/api/assessments/${encodeURIComponent(slug)}/submit`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || data.error || "Failed to submit assessment");
  return data as SubmitResult;
}

export async function fetchAssessmentHistory() {
  const res = await fetch("/api/assessments/history", {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || data.error || "Failed to load history");
  return data as {
    history: Array<{
      resultId: string;
      assessmentSlug: string;
      title: string;
      instrumentVersion: string;
      summary: string;
      interpretationLabel: string | null;
      clinicallyValidated: boolean;
      completedAt: string;
    }>;
  };
}

export async function fetchAssessmentResult(resultId: string) {
  const res = await fetch(
    `/api/assessments/results/${encodeURIComponent(resultId)}`,
    { headers: authHeaders(), cache: "no-store" }
  );
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || data.error || "Failed to load result");
  return data as SubmitResult & { saved: boolean };
}

export async function deleteAssessmentResult(resultId: string) {
  const res = await fetch(
    `/api/assessments/results/${encodeURIComponent(resultId)}`,
    { method: "DELETE", headers: authHeaders() }
  );
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || data.error || "Failed to delete result");
  return data;
}

const GUEST_RESULT_KEY = "soul_assessment_guest_result";

export function stashGuestResult(result: SubmitResult) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(GUEST_RESULT_KEY, JSON.stringify(result));
}

export function readGuestResult(resultId?: string | null): SubmitResult | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(GUEST_RESULT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SubmitResult;
    if (resultId && parsed.resultId && parsed.resultId !== resultId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearGuestResult() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(GUEST_RESULT_KEY);
}
