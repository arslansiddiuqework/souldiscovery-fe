import { NextRequest } from "next/server";
import { proxyEmergencyRequest } from "@/lib/api/emergency-proxy";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  return proxyEmergencyRequest(req, "/api/emergency/settings", {
    method: "PUT",
  });
}
