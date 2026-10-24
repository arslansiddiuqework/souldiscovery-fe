import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/getBackendUrl";

/**
 * Same-origin BFF proxy for /api/emergency/* → Express.
 * Avoids browser→backend CORS / missing NEXT_PUBLIC_API_URL failures on the consent screen.
 */
export async function proxyEmergencyRequest(
  req: NextRequest,
  backendPath: string,
  options?: { method?: string; body?: unknown }
) {
  const method = options?.method || req.method;
  const token = req.headers.get("Authorization");

  if (!token) {
    return NextResponse.json({ message: "No token provided" }, { status: 401 });
  }

  try {
    const headers: HeadersInit = {
      Authorization: token,
    };

    let body: string | undefined;
    if (method !== "GET" && method !== "HEAD") {
      headers["Content-Type"] = "application/json";
      if (options?.body !== undefined) {
        body = JSON.stringify(options.body);
      } else {
        try {
          const json = await req.json();
          body = JSON.stringify(json);
        } catch {
          body = undefined;
        }
      }
    }

    const response = await fetch(getBackendApiUrl(backendPath), {
      method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
    });

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.error(
        "Emergency proxy: backend did not return JSON",
        response.status,
        contentType
      );
      return NextResponse.json(
        {
          message:
            "Emergency service unavailable. Please try again in a moment.",
        },
        { status: 502 }
      );
    }

    const data = await response.json().catch(() => null);
    if (data === null || typeof data !== "object") {
      return NextResponse.json(
        { message: "Emergency service returned an invalid response" },
        { status: 502 }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(
      "Emergency proxy error:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { message: "Emergency service unavailable" },
      { status: 500 }
    );
  }
}
