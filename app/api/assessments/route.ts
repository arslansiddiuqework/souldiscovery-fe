import { NextRequest } from "next/server";
import { proxyAssessmentRequest } from "@/lib/api/assessment-proxy";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const qs = req.nextUrl.searchParams.toString();
  return proxyAssessmentRequest(req, `/api/assessments${qs ? `?${qs}` : ""}`);
}
