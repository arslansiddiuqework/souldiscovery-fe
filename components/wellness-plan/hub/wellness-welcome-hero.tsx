import { Heart } from "lucide-react";

export function WellnessWelcomeHero() {
  return (
    <section
      data-particles-mask
      className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-8"
    >
      <div className="max-w-xl space-y-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EEDCE9] bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#BE4A8B] shadow-[0_4px_16px_rgba(190,74,139,0.06)]">
          <span aria-hidden>✨</span> Your Wellness Journey
        </span>
        <h1
          className="font-bold tracking-[-0.03em] text-[#512943]"
          style={{ fontSize: "clamp(1.85rem, 4.2vw, 2.65rem)", lineHeight: 1.12 }}
        >
          Find Your Path to Wellness
        </h1>
        <p className="max-w-[42ch] text-[15px] leading-relaxed text-[#957F94] md:text-[16px]">
          A little support for whatever you&apos;re feeling today.
        </p>
      </div>
      <aside className="hidden max-w-[200px] shrink-0 text-right md:block">
        <p className="text-[13px] font-medium italic leading-relaxed text-[#957F94]">
          &ldquo;Small steps create big changes.&rdquo;
        </p>
        <Heart
          className="ml-auto mt-2 h-3.5 w-3.5 text-[#BE4A8B]/70"
          aria-hidden
        />
      </aside>
    </section>
  );
}
