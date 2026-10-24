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

  const goToStepRoute = useCallback(
    (step: TourSpotlightStep | undefined) => {
      if (!step || !pathname) return;
      const [targetPath, query = ""] = step.href.split("?");
      const onPath =
        pathname === targetPath || pathname.startsWith(`${targetPath}/`);
      const currentQuery =
        typeof window !== "undefined"
          ? window.location.search.replace(/^\?/, "")
          : "";

      if (!onPath) {
        router.push(step.href);
        return;
      }

      // Query steps (e.g. calm tools) must land on the exact search string.
      if (query) {
        if (currentQuery !== query) {
          router.push(step.href);
        }
        return;
      }

      // Leaving calm view: clear `?view=` so the plans desk is visible again.
      if (
        targetPath === "/wellness-plan" &&
        currentQuery.includes("view=")
      ) {
        router.push("/wellness-plan");
      }
    },
    [pathname, router]
  );

  const beginSpotlight = useCallback(() => {
    setSpotlightIndex(0);
    setPhase("spotlight");
    goToStepRoute(TOUR_SPOTLIGHT_STEPS[0]);
  }, [goToStepRoute]);

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
    goToStepRoute(TOUR_SPOTLIGHT_STEPS[nextIndex]);
  }, [beginSpotlight, goToStepRoute, phase, spotlightIndex]);

  const back = useCallback(() => {
    if (phase === "complete") {
      setPhase("spotlight");
      const last = TOUR_SPOTLIGHT_STEPS.length - 1;
      setSpotlightIndex(last);
      goToStepRoute(TOUR_SPOTLIGHT_STEPS[last]);
      return;
    }
    if (phase !== "spotlight") return;
    if (spotlightIndex <= 0) {
      setPhase("welcome");
      return;
    }
    const prevIndex = spotlightIndex - 1;
    setSpotlightIndex(prevIndex);
    goToStepRoute(TOUR_SPOTLIGHT_STEPS[prevIndex]);
  }, [goToStepRoute, phase, spotlightIndex]);

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

  // Auto-offer welcome after first successful login lands on dashboard.
  // Wait out blocking dialogs (e.g. mood check-in) instead of giving up once.
  useEffect(() => {
    if (loading || !isAuthenticated || !user) return;
    if (user.websiteTourCompleted) return;
    if (autoStartedRef.current) return;
    if (pathname !== "/dashboard") return;

    autoStartedRef.current = true;
    let attempts = 0;
    const maxAttempts = 24; // ~12s
    let pollId: number | null = null;

    const openWelcome = () => {
      if (typeof document !== "undefined") {
        returnFocusRef.current = document.activeElement as HTMLElement | null;
      }
      setPhase("welcome");
    };

    const tryOpen = () => {
      attempts += 1;
      if (hasBlockingDialog()) {
        if (attempts >= maxAttempts) {
          // Don't block the account forever — user can still start from Help / profile.
          autoStartedRef.current = false;
          return true;
        }
        return false;
      }
      openWelcome();
      return true;
    };

    const startTimer = window.setTimeout(() => {
      if (tryOpen()) return;
      pollId = window.setInterval(() => {
        if (tryOpen() && pollId != null) {
          window.clearInterval(pollId);
          pollId = null;
        }
      }, 500);
    }, 600);

    return () => {
      window.clearTimeout(startTimer);
      if (pollId != null) window.clearInterval(pollId);
    };
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
