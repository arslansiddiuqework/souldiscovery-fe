import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/getBackendUrl";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const token = req.headers.get("Authorization");

  if (!token) {
    return NextResponse.json({ message: "No token provided" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { score, note, source, mood } = body;

    if (typeof score !== "number" || Number.isNaN(score) || score < 0 || score > 100) {
      return NextResponse.json(
        { error: "Invalid mood score" },
        { status: 400 }
      );
    }

    if (note != null && (typeof note !== "string" || note.length > 2000)) {
      return NextResponse.json(
        { error: "Invalid mood note" },
        { status: 400 }
      );
    }

    if (mood != null && (typeof mood !== "string" || mood.length > 100)) {
      return NextResponse.json(
        { error: "Invalid mood label" },
        { status: 400 }
      );
    }

    if (
      source != null &&
      (typeof source !== "string" || source.length > 64)
    ) {
      return NextResponse.json(
        { error: "Invalid mood source" },
        { status: 400 }
      );
    }

    const API_URL = getBackendUrl();
    const response = await fetch(`${API_URL}/mood`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        score,
        note: typeof note === "string" ? note.slice(0, 2000) : note,
        source: typeof source === "string" ? source.slice(0, 64) : source,
        mood: typeof mood === "string" ? mood.slice(0, 100) : mood,
      }),
    });

    if (!response.ok) {
      let message = "Failed to track mood";
      try {
        const error = await response.json();
        message = error.message || error.error || message;
      } catch {
        /* non-JSON error body */
      }
      return NextResponse.json(
        { error: message },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error tracking mood:", error);
    return NextResponse.json(
      { error: "Failed to track mood. Backend API is unavailable." },
      { status: 500 }
    );
  }
}
