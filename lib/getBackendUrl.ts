/**
 * Get the backend API URL from environment variables
 * Prioritizes BACKEND_API_URL, then falls back to NEXT_PUBLIC_API_URL
 * @returns The backend API URL
 * @throws Error if neither environment variable is set
 */
export function getBackendUrl(): string {
  const backendUrl =
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    // Default local Express port. Keep this separate from the Next.js FE port.
    (process.env.NODE_ENV !== "production" ? "http://localhost:4001" : undefined);

  if (!backendUrl) {
    throw new Error(
      "Backend API URL not configured. Set BACKEND_API_URL or NEXT_PUBLIC_API_URL environment variable."
    );
  }

  // http→https upgrade for hosted backends. A 308 redirect drops the
  // Authorization header (fetch spec), which makes login work but every
  // authenticated API return 401 Authentication required.
  return normalizeBackendOrigin(backendUrl.replace(/\/+$/, ""));
}

function normalizeBackendOrigin(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const isLocal =
      host === "localhost" || host === "127.0.0.1" || host === "::1";
    if (!isLocal && parsed.protocol === "http:") {
      parsed.protocol = "https:";
    }
    return parsed.toString().replace(/\/+$/, "");
  } catch {
    return url;
  }
}

export function getBackendApiUrl(path: string): string {
  const backendUrl = getBackendUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (backendUrl.endsWith("/api") && normalizedPath.startsWith("/api/")) {
    return `${backendUrl}${normalizedPath.slice(4)}`;
  }

  return `${backendUrl}${normalizedPath}`;
}
