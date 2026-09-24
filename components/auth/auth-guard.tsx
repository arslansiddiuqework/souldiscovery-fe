"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/lib/contexts/session-context";
import { Loader2 } from "lucide-react";

const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/about",
  "/features",
  "/pricing",
];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated && !isPublicRoute) {
      router.replace("/login");
    } else if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
      router.replace("/dashboard");
    } else {
      setIsReady(true);
    }
  }, [isAuthenticated, loading, pathname, router, isPublicRoute]);

  // Public pages render immediately so a slow/hung /api/auth/me never blanks the site
  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (loading || !isReady) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#b384c9]" />
      </div>
    );
  }

  return <>{children}</>;
}
