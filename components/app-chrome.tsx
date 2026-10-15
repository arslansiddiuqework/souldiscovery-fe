"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

/**
 * Routes that use a focused full-screen chrome (no global nav/footer).
 * Assessment take flow and therapy sessions manage their own headers.
 */
function hideGlobalChrome(pathname: string | null) {
  if (!pathname) return false;
  if (/^\/assessments\/[^/]+\/take\/?$/.test(pathname)) return true;
  if (/^\/therapy(\/|$)/.test(pathname)) return true;
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
    <>
      {!focused && <Navbar />}
      <main className="min-h-screen">{children}</main>
      {footerVisible && <Footer />}
    </>
  );
}
