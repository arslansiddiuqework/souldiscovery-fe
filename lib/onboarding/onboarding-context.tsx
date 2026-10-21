"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/contexts/session-context";
import { markWebsiteTourCompleted } from "@/lib/api/user";
import {
  TOUR_SPOTLIGHT_STEPS,
  TOUR_TOTAL_STEPS,
  type TourSpotlightStep,
} from "@/lib/onboarding/tour-steps";

export type OnboardingPhase = "idle" | "welcome" | "spotlight" | "complete";

type OnboardingContextValue = {
  phase: OnboardingPhase;
  spotlightIndex: number;
  currentStep: TourSpotlightStep | null;
  stepLabel: string;
  isActive: boolean;
  startTour: () => void;
  beginSpotlight: () => void;
  next: () => void;
  back: () => void;
  skip: () => void;
  finish: (options?: { navigateToDashboard?: boolean }) => void;
};

const OnboardingContext = createContext<OnboardingContextValue | undefined>(
  undefined
);

function hasBlockingDialog(): boolean {
  if (typeof document === "undefined") return false;
  const dialogs = document.querySelectorAll(
    '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]'
  );
  return dialogs.length > 0;
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, patchUser } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [phase, setPhase] = useState<OnboardingPhase>("idle");
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const autoStartedRef = useRef(false);
  const savingRef = useRef(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const persistCompletion = useCallback(async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    patchUser({ websiteTourCompleted: true });
    try {
      await markWebsiteTourCompleted();
    } catch (err) {
      console.error("Failed to persist website tour completion:", err);
    } finally {
      savingRef.current = false;
    }
  }, [patchUser]);

  const restoreFocus = useCallback(() => {
    const el = returnFocusRef.current;
    returnFocusRef.current = null;
    if (el && typeof el.focus === "function") {
      requestAnimationFrame(() => el.focus());
    }
  }, []);

  const closeToIdle = useCallback(async () => {
    setPhase("idle");
    setSpotlightIndex(0);
    await persistCompletion();
    restoreFocus();
  }, [persistCompletion, restoreFocus]);

  const startTour = useCallback(() => {
    if (typeof document !== "undefined") {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
    }
    setSpotlightIndex(0);
    setPhase("welcome");
  }, []);

  const beginSpotlight = useCallback(() => {
    setSpotlightIndex(0);
    setPhase("spotlight");
    const first = TOUR_SPOTLIGHT_STEPS[0];
    if (first && pathname !== first.href.split("?")[0]) {
      router.push(first.href);
    }
  }, [pathname, router]);

  const next = useCallback(() => {
    if (phase === "welcome") {
      beginSpotlight();
      return;
    }
    if (phase !== "spotlight") return;
    if (spotlightIndex >= TOUR_SPOTLIGHT_STEPS.length - 1) {
      setPhase("complete");
      return;
    }
    const nextIndex = spotlightIndex + 1;
    setSpotlightIndex(nextIndex);
    const step = TOUR_SPOTLIGHT_STEPS[nextIndex];
    if (step) {
      const targetPath = step.href.split("?")[0];
      if (!pathname?.startsWith(targetPath) || step.href.includes("?")) {
        router.push(step.href);
      }
    }
  }, [beginSpotlight, phase, pathname, router, spotlightIndex]);

  const back = useCallback(() => {
    if (phase === "complete") {
      setPhase("spotlight");
      setSpotlightIndex(TOUR_SPOTLIGHT_STEPS.length - 1);
      return;
    }
    if (phase !== "spotlight") return;
    if (spotlightIndex <= 0) {
      setPhase("welcome");
      return;
    }
    const prevIndex = spotlightIndex - 1;
    setSpotlightIndex(prevIndex);
    const step = TOUR_SPOTLIGHT_STEPS[prevIndex];
    if (step) {
      router.push(step.href);
    }
  }, [phase, router, spotlightIndex]);

  const skip = useCallback(() => {
    void closeToIdle();
  }, [closeToIdle]);

  const finish = useCallback(
    (options?: { navigateToDashboard?: boolean }) => {
      void (async () => {
        await persistCompletion();
        setPhase("idle");
        setSpotlightIndex(0);
        if (options?.navigateToDashboard) {
          router.push("/dashboard");
        }
        restoreFocus();
      })();
    },
    [persistCompletion, restoreFocus, router]
  );

  // Auto-offer welcome after first successful login lands on dashboard
  useEffect(() => {
    if (loading || !isAuthenticated || !user) return;
    if (user.websiteTourCompleted) return;
    if (autoStartedRef.current) return;
    if (pathname !== "/dashboard") return;
    if (hasBlockingDialog()) return;

    autoStartedRef.current = true;
    const timer = window.setTimeout(() => {
      if (hasBlockingDialog()) {
        autoStartedRef.current = false;
        return;
      }
      if (typeof document !== "undefined") {
        returnFocusRef.current = document.activeElement as HTMLElement | null;
      }
      setPhase("welcome");
    }, 700);

    return () => window.clearTimeout(timer);
  }, [isAuthenticated, loading, pathname, user]);

  // Reset auto-start gate on logout so a new account can see the tour
  useEffect(() => {
    if (!isAuthenticated) {
      autoStartedRef.current = false;
      setPhase("idle");
      setSpotlightIndex(0);
    }
  }, [isAuthenticated]);

  const currentStep =
    phase === "spotlight" ? TOUR_SPOTLIGHT_STEPS[spotlightIndex] ?? null : null;

  const stepLabel = useMemo(() => {
    if (phase === "welcome") return `1 of ${TOUR_TOTAL_STEPS}`;
    if (phase === "spotlight") {
      return `${spotlightIndex + 2} of ${TOUR_TOTAL_STEPS}`;
    }
    return "";
  }, [phase, spotlightIndex]);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      phase,
      spotlightIndex,
      currentStep,
      stepLabel,
      isActive: phase !== "idle",
      startTour,
      beginSpotlight,
      next,
      back,
      skip,
      finish,
    }),
    [
      phase,
      spotlightIndex,
      currentStep,
      stepLabel,
      startTour,
      beginSpotlight,
      next,
      back,
      skip,
      finish,
    ]
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return ctx;
}
