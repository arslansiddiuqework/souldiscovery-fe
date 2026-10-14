import { NextRequest } from "next/server";
import { proxyAssessmentRequest } from "@/lib/api/assessment-proxy";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return proxyAssessmentRequest(req, "/api/assessments/history", { requireAuth: true });
}
