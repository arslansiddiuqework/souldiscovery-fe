import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/getBackendUrl";

export async function proxyAssessmentRequest(
  req: NextRequest,
  backendPath: string,
  options?: { method?: string; requireAuth?: boolean; body?: unknown }
) {
  const method = options?.method || req.method;
  const token = req.headers.get("Authorization");

  if (options?.requireAuth && !token) {
    return NextResponse.json({ message: "No token provided" }, { status: 401 });
  }

  try {
    const headers: HeadersInit = {};
    if (token) headers.Authorization = token;

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

    // Vercel Deployment Protection / auth walls redirect or return HTML
    const contentType = response.headers.get("content-type") || "";
    if (
      response.status === 301 ||
      response.status === 302 ||
      response.status === 303 ||
      response.status === 307 ||
      response.status === 308 ||
      !contentType.includes("application/json")
    ) {
      console.error(
        "Assessment proxy: backend did not return JSON",
        response.status,
        contentType
      );
      return NextResponse.json(
        {
          message:
            "Assessment service unavailable. Local backend may be down, or BACKEND_API_URL points to a protected deployment.",
        },
        { status: 502 }
      );
    }

    const data = await response.json().catch(() => null);
    if (data === null || typeof data !== "object") {
      return NextResponse.json(
        { message: "Assessment service returned an invalid response" },
        { status: 502 }
      );
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Assessment proxy error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      { message: "Assessment service unavailable" },
      { status: 500 }
    );
  }
}
