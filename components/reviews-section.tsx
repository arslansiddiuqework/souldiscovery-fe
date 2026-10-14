"use client";

import { motion } from "framer-motion";
import { Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { homepageReviews, type Review } from "@/lib/data/reviews";

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const dim = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            dim,
            i < rating
              ? "fill-[#B74783] text-[#B74783]"
              : "fill-transparent text-[#DFC7D6]"
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
        "flex h-full flex-col rounded-[20px] border border-[#EADCE5]",
        "bg-white p-5 shadow-[0_8px_28px_rgba(123,57,98,0.07)]",
        "transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(123,57,98,0.11)]"
      )}
    >
      <StarRating rating={review.rating} />
      <blockquote className="mt-3 flex-1 text-[13px] font-medium leading-[1.65] text-[#49263D] sm:text-[14px]">
        “{review.text}”
      </blockquote>
      <footer className="mt-4 flex items-center gap-3 border-t border-[#EFE3EA] pt-4">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-[#B74783]"
          style={{ background: review.accent }}
          aria-hidden
        >
          {review.initial}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-bold tracking-[-0.01em] text-[#49263D]">
            {review.name}
          </p>
          {review.role && (
            <p className="truncate text-[12px] font-medium text-[#927C8B]">
              {review.role}
            </p>
          )}
        </div>
      </footer>
    </article>
  );
}

/**
 * Homepage testimonials — horizontal split: copy left, reviews right.
 */
export function ReviewsSection({
  reviews = homepageReviews,
}: {
  reviews?: Review[];
}) {
  return (
    <section
      id="reviews"
      className="relative section-padding px-4"
      aria-labelledby="reviews-heading"
    >
      <div className="container-app">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.4fr)] lg:gap-12 xl:gap-16">
          {/* Left: headline + trust */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="text-center lg:sticky lg:top-28 lg:text-left"
            data-particles-mask
          >
            <span className="badge-glass mx-auto mb-4 lg:mx-0">
              <Sparkles className="h-3.5 w-3.5 text-[#B74783]" />
              Loved by people finding their balance
            </span>

            <h2
              id="reviews-heading"
              className="font-bold text-[#49263D]"
              style={{
                fontSize: "clamp(1.75rem, 3.4vw, 2.65rem)",
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
              }}
            >
              Real experiences.{" "}
              <span className="text-gradient-brand">Real change.</span>
            </h2>

            <p className="mx-auto mt-4 max-w-[40ch] text-[15px] leading-[1.7] text-[#795A70] lg:mx-0 md:text-[16px]">
              Discover clarity. Find balance. Grow with confidence. From mindfulness
              and stress relief to quiet self-reflection — Soul Discovery helps people
              build calmer daily habits with gentle, guided support.
            </p>

            <div className="mx-auto mt-7 inline-flex items-center gap-3 rounded-full border border-[#EADCE5] bg-white px-4 py-2.5 lg:mx-0 md:gap-4 md:px-5 md:py-3">
              <StarRating rating={5} size="md" />
              <div className="h-5 w-px bg-[#EADCE5]" aria-hidden />
              <p className="text-[12px] font-semibold tracking-[-0.01em] text-[#49263D] md:text-[13px]">
                Trusted by Soul Discovery users
              </p>
            </div>
          </motion.div>

          {/* Right: review cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.45,
                  delay: Math.min(index * 0.05, 0.25),
                  ease: "easeOut",
                }}
                className="h-full"
                data-particles-mask
              >
                <ReviewCard review={review} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
