"use client";

import { Suspense } from "react";
import { ThemeProvider } from "next-themes";
import { SessionProvider as CustomSessionProvider } from "@/lib/contexts/session-context";
import { AuthGuard } from "@/components/auth/auth-guard";
import { OnboardingProvider } from "@/lib/onboarding/onboarding-context";
import { WebsiteTour } from "@/components/onboarding/website-tour";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CustomSessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        forcedTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <AuthGuard>
          <OnboardingProvider>
            {children}
            <Suspense fallback={null}>
              <WebsiteTour />
            </Suspense>
          </OnboardingProvider>
        </AuthGuard>
      </ThemeProvider>
    </CustomSessionProvider>
  );
}
