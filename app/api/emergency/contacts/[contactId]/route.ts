import { NextRequest } from "next/server";
import { proxyEmergencyRequest } from "@/lib/api/emergency-proxy";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: { contactId: string } }
) {
  return proxyEmergencyRequest(
    req,
    `/api/emergency/contacts/${encodeURIComponent(params.contactId)}`,
    { method: "PUT" }
  );
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { contactId: string } }
) {
  return proxyEmergencyRequest(
    req,
    `/api/emergency/contacts/${encodeURIComponent(params.contactId)}`,
    { method: "DELETE", body: {} }
  );
}
