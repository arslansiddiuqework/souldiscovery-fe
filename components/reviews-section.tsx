"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { homepageReviews, type Review } from "@/lib/data/reviews";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < rating
              ? "fill-[#d8bfe3] text-[#d8bfe3]"
              : "fill-transparent text-[rgba(216,191,227,0.25)]"
          )}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col rounded-[22px] border border-[rgba(216,191,227,0.16)]",
        "bg-[rgba(16,11,32,0.55)] p-6 shadow-[0_20px_60px_rgba(6,3,16,0.35)] backdrop-blur-xl",
        "transition-all duration-300 hover:-translate-y-[3px] hover:border-[rgba(216,191,227,0.28)] hover:bg-[rgba(16,11,32,0.7)]",
        "md:p-7"
      )}
    >
      <StarRating rating={review.rating} />
      <blockquote className="mt-4 flex-1 text-[15px] font-medium leading-[1.7] text-[rgba(243,238,250,0.88)] md:text-[16px]">
        “{review.text}”
      </blockquote>
      <footer className="mt-6 flex items-center gap-3 border-t border-white/[0.06] pt-5">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-sm font-bold text-[#f3eefa]"
          style={{ background: review.accent }}
          aria-hidden
        >
          {review.initial}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-bold tracking-[-0.01em] text-[#f3eefa]">
            {review.name}
          </p>
          {review.role && (
            <p className="truncate text-[12px] font-medium text-[rgba(231,218,237,0.5)]">
              {review.role}
            </p>
          )}
        </div>
      </footer>
    </article>
  );
}

/**
 * Spatium-inspired testimonials — Soul Discovery original copy.
 * Uses the global connected-dots atmosphere (no local particle canvas).
 */
export function ReviewsSection({
  reviews = homepageReviews,
}: {
  reviews?: Review[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const syncActive = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || window.matchMedia("(min-width: 640px)").matches) return;
    const card = el.querySelector<HTMLElement>("[data-review-card]");
    if (!card) return;
    const gap = 16;
    const width = card.offsetWidth + gap;
    const index = Math.round(el.scrollLeft / Math.max(width, 1));
    setActive(Math.max(0, Math.min(reviews.length - 1, index)));
  }, [reviews.length]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", syncActive, { passive: true });
    window.addEventListener("resize", syncActive, { passive: true });
    return () => {
      el.removeEventListener("scroll", syncActive);
      window.removeEventListener("resize", syncActive);
    };
  }, [syncActive]);

  const scrollTo = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-review-card]");
    if (!card) return;
    const gap = 16;
    el.scrollTo({ left: index * (card.offsetWidth + gap), behavior: "smooth" });
  };

  return (
    <section id="reviews" className="relative section-padding px-4" aria-labelledby="reviews-heading">
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mx-auto mb-12 max-w-[640px] text-center md:mb-16"
        >
          <span className="badge-glass mx-auto mb-6">
            <Sparkles className="h-3.5 w-3.5 text-[#d8bfe3]" />
            Loved by people finding their balance
          </span>

          <h2
            id="reviews-heading"
            className="font-bold text-[#f3eefa]"
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
            }}
          >
            Real experiences.{" "}
            <span className="text-gradient-brand">Real change.</span>
          </h2>

          <p className="mx-auto mt-4 max-w-[48ch] text-[17px] leading-[1.7] text-[rgba(231,218,237,0.62)]">
            Discover clarity. Find balance. Grow with confidence. From mindfulness
            and stress relief to quiet self-reflection — Soul Discovery helps people
            build calmer daily habits with gentle, guided support.
          </p>

          {/* Neutral trust summary — no invented ratings or user counts */}
          <div className="mx-auto mt-9 inline-flex items-center gap-4 rounded-full border border-[rgba(216,191,227,0.18)] bg-[rgba(16,11,32,0.55)] px-5 py-3 backdrop-blur-xl md:px-6 md:py-3.5">
            <StarRating rating={5} />
            <div className="h-5 w-px bg-white/10" aria-hidden />
            <p className="text-[13px] font-semibold tracking-[-0.01em] text-[rgba(231,218,237,0.82)] md:text-[14px]">
              Trusted by Soul Discovery users
            </p>
          </div>
        </motion.div>

        <div
          ref={scrollerRef}
          className={cn(
            "-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1",
            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            "sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 sm:snap-none",
            "lg:grid-cols-3"
          )}
        >
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              data-review-card
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.3), ease: "easeOut" }}
              className={cn(
                "w-[min(100%,340px)] shrink-0 snap-center sm:w-auto sm:shrink",
                index >= 3 && "lg:translate-y-4"
              )}
            >
              <ReviewCard review={review} />
            </motion.div>
          ))}
        </div>

        <div
          className="mt-6 flex items-center justify-center gap-2 sm:hidden"
          role="tablist"
          aria-label="Review slides"
        >
          {reviews.map((review, index) => (
            <button
              key={review.id}
              type="button"
              role="tab"
              aria-selected={active === index}
              aria-label={`Show review ${index + 1}`}
              onClick={() => scrollTo(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                active === index
                  ? "w-6 bg-[#d8bfe3]"
                  : "w-1.5 bg-[rgba(216,191,227,0.28)] hover:bg-[rgba(216,191,227,0.45)]"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
