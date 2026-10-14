import { NextRequest } from "next/server";
import { proxyAssessmentRequest } from "@/lib/api/assessment-proxy";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string; sessionId: string } }
) {
  return proxyAssessmentRequest(
    req,
    `/api/assessments/${encodeURIComponent(params.slug)}/sessions/${encodeURIComponent(params.sessionId)}`,
    { method: "PUT" }
  );
}
