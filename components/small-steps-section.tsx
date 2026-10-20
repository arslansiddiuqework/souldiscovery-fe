"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Homepage close — a quiet statement after the feature strip.
 * Replaces the former placeholder review grid.
 */
export function SmallStepsSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="small-steps"
      aria-labelledby="small-steps-heading"
      className="relative px-4 pb-16 pt-4 md:pb-20 md:pt-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-6 bottom-6 bg-gradient-to-b from-transparent via-[#F7E8F3]/70 to-transparent"
      />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: reduceMotion ? 0 : 0.55, ease: "easeOut" }}
        className="relative mx-auto w-full max-w-[720px] text-center"
        data-particles-mask
      >
        <span
          aria-hidden
          className="mx-auto mb-6 block h-px w-12 bg-gradient-to-r from-transparent via-[#D98CB4] to-transparent"
        />
        <h2
          id="small-steps-heading"
          className="text-balance font-bold tracking-[-0.03em] text-[#49263D]"
          style={{
            fontSize: "clamp(1.85rem, 4vw, 2.75rem)",
            lineHeight: 1.12,
          }}
        >
          Small steps.{" "}
          <span className="text-gradient-brand">Meaningful progress.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-[46ch] text-[15px] leading-relaxed text-[#795A70] md:text-[16.5px] md:leading-[1.7]">
          A calmer way to care for your well-being. Discover simple tools and
          gentle routines that fit into your everyday life.
        </p>
        <div className="mt-8 flex justify-center">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 min-w-[180px] rounded-full border-[#D9B0C8] bg-white/85 px-6 text-[15px] text-[#7B3962] hover:bg-[#FFF0F6]"
          >
            <Link href="/features">
              Explore Features
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
