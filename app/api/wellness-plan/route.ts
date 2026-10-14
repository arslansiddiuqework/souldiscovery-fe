import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/getBackendUrl";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.headers.get("Authorization");
  if (!token) {
    return NextResponse.json({ message: "No token provided" }, { status: 401 });
  }

  try {
    const response = await fetch(getBackendApiUrl("/api/wellness-plan"), {
      headers: { Authorization: token },
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to fetch wellness plans" },
        { status: response.status }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching wellness plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch wellness plans. Backend API is unavailable." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const token = req.headers.get("Authorization");
  if (!token) {
    return NextResponse.json({ message: "No token provided" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const response = await fetch(getBackendApiUrl("/api/wellness-plan"), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to sync wellness plan" },
        { status: response.status }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error syncing wellness plan:", error);
    return NextResponse.json(
      { error: "Failed to sync wellness plan. Backend API is unavailable." },
      { status: 500 }
    );
  }
}
