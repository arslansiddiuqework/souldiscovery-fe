"use client";

import { Suspense } from "react";
import { WellnessPlanApp } from "@/components/wellness-plan/wellness-plan-app";

export default function WellnessPlanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        </div>
      }
    >
      <WellnessPlanApp />
    </Suspense>
  );
}
