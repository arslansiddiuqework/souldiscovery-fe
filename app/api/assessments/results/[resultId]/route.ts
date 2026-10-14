import { NextRequest } from "next/server";
import { proxyAssessmentRequest } from "@/lib/api/assessment-proxy";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { resultId: string } }
) {
  return proxyAssessmentRequest(
    req,
    `/api/assessments/results/${encodeURIComponent(params.resultId)}`,
    { requireAuth: true }
  );
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { resultId: string } }
) {
  return proxyAssessmentRequest(
    req,
    `/api/assessments/results/${encodeURIComponent(params.resultId)}`,
    { method: "DELETE", requireAuth: true }
  );
}
