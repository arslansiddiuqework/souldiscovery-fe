import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/getBackendUrl";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { planId: string } }
) {
  const token = req.headers.get("Authorization");
  if (!token) {
    return NextResponse.json({ message: "No token provided" }, { status: 401 });
  }

  try {
    const response = await fetch(
      getBackendApiUrl(`/api/wellness-plan/${encodeURIComponent(params.planId)}`),
      {
        method: "DELETE",
        headers: { Authorization: token },
      }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to delete wellness plan" },
        { status: response.status }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error deleting wellness plan:", error);
    return NextResponse.json(
      { error: "Failed to delete wellness plan. Backend API is unavailable." },
      { status: 500 }
    );
  }
}
