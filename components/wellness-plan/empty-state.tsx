"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreate: () => void;
  suggestionMessage?: string | null;
}

export function WellnessEmptyState({ onCreate, suggestionMessage }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgba(179,132,201,0.14)] via-transparent to-[rgba(179,132,201,0.04)]" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[rgba(179,132,201,0.12)] blur-3xl" />
        <CardContent className="relative space-y-8 p-8 md:p-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(216,191,227,0.22)] bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-[#d8bfe3]">
            <Sparkles className="h-3.5 w-3.5 text-[#b384c9]" />
            AI Wellness Coach
          </div>

          <div className="max-w-xl space-y-4">
            <h2 className="font-display text-3xl font-bold tracking-tight text-[#f3eefa] md:text-4xl">
              Create Your Personalized Wellness Plan
            </h2>
            <p className="text-base leading-relaxed text-[rgba(231,218,237,0.55)] md:text-lg">
              Answer a few questions and let Soul Discovery create a wellness journey
              tailored to your goals, energy, and preferred practices.
            </p>
            {suggestionMessage && (
              <p className="rounded-2xl border border-[#b384c9]/25 bg-[#b384c9]/10 px-4 py-3 text-sm leading-relaxed text-[#d8bfe3]">
                {suggestionMessage}
              </p>
            )}
          </div>

          <ul className="grid gap-3 sm:grid-cols-3">
            {[
              "Personalized daily missions",
              "Adaptive recommendations",
              "Weekly AI reviews",
            ].map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-[rgba(216,191,227,0.16)] bg-white/[0.03] px-4 py-3 text-sm text-[rgba(231,218,237,0.75)]"
              >
                {item}
              </li>
            ))}
          </ul>

          <Button onClick={onCreate} className="btn-spatium-lg h-12 gap-2 px-6">
            Create Plan
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
