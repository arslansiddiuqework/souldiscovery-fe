"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

/**
 * Routes that use a focused full-screen chrome (no global nav/footer).
 * Assessment take flow manages its own header. Therapy keeps the main
 * Navbar so users stay oriented in Dashboard / site navigation.
 */
function hideGlobalChrome(pathname: string | null) {
  if (!pathname) return false;
  if (/^\/assessments\/[^/]+\/take\/?$/.test(pathname)) return true;
  return false;
}

/** Footer is home-only; all other routes stay chrome-light for viewport layouts. */
function showFooter(pathname: string | null) {
  return pathname === "/" || pathname === "";
}

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const focused = hideGlobalChrome(pathname);
  const footerVisible = !focused && showFooter(pathname);

  return (
    <div className="relative w-full max-w-[100vw] overflow-x-hidden">
      {!focused && <Navbar />}
      <main className="min-h-screen w-full overflow-x-hidden">{children}</main>
      {footerVisible && <Footer />}
    </div>
  );
}
