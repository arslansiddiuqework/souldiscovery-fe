import { NextRequest } from "next/server";
import { proxyEmergencyRequest } from "@/lib/api/emergency-proxy";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return proxyEmergencyRequest(req, "/api/emergency/contacts", {
    method: "GET",
  });
}

export async function POST(req: NextRequest) {
  return proxyEmergencyRequest(req, "/api/emergency/contacts", {
    method: "POST",
  });
}
