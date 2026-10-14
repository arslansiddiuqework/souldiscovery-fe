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
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Assessment proxy error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      { message: "Assessment service unavailable" },
      { status: 500 }
    );
  }
}
