import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/getBackendUrl";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const credential =
      typeof body?.credential === "string"
        ? body.credential
        : typeof body?.access_token === "string"
          ? body.access_token
          : "";

    if (!credential) {
      return NextResponse.json(
        { message: "Google credential is required." },
        { status: 400 }
      );
    }

    const API_URL = getBackendUrl();
    const res = await fetch(`${API_URL}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ credential }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        {
          message:
            (data as { message?: string }).message || "Authentication failed",
        },
        { status: res.status }
      );
    }

    // Match email/password login: client stores JWT in localStorage.
    return NextResponse.json(data);
  } catch (error) {
    console.error("Google login error:", error);
    return NextResponse.json(
      { message: "An error occurred during authentication" },
      { status: 500 }
    );
  }
}
