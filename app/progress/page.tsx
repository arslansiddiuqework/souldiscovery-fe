"use client";

import { WeeklySummary } from "@/components/progress/weekly-summary";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ProgressPage() {
  const router = useRouter();

  return (
    <div className="page-shell pb-16 text-[#f3eefa]">
      <main className="container-app max-w-5xl">
        <div className="mb-10 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => router.push("/dashboard")}
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#f3eefa] md:text-4xl">
              Your Progress
            </h1>
            <p className="mt-1 text-[rgba(231,218,237,0.55)]">
              Track your mood, activities, and therapy sessions over time.
            </p>
          </div>
        </div>

        <WeeklySummary />
      </main>
    </div>
  );
}
