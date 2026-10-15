"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Brain,
  Shield,
  Activity,
  Bot,
  LineChart,
  Camera,
  MessageCircle,
  Mic,
  Sparkles,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Feature = {
  id: string;
  icon: LucideIcon;
  title: string;
  tagline: string;
  description: string;
  highlight: string;
  tone: "rose" | "violet" | "mist";
};

const features: Feature[] = [
  {
    id: "ai-therapy",
    icon: Bot,
    title: "AI Therapy Assistant",
    tagline: "Always-on companion",
    description:
      "A conversational AI that offers personalized emotional support and grows with your needs over time.",
    highlight: "Natural dialogue",
    tone: "rose",
  },
  {
    id: "multimodal",
    icon: Brain,
    title: "Emotion Understanding",
    tagline: "Multimodal insight",
    description:
      "Blends conversation, mood patterns, and emotional signals into a clearer picture of how you feel.",
    highlight: "Deeper context",
    tone: "violet",
  },
  {
    id: "facial",
    icon: Camera,
    title: "Facial Mood Detection",
    tagline: "Optional & private",
    description:
      "Camera-based mood cues process on-device so you can track shifts without sending face data away.",
    highlight: "On-device privacy",
    tone: "mist",
  },
  {
    id: "conversations",
    icon: MessageCircle,
    title: "Personalized Conversations",
    tagline: "Adapts to you",
    description:
      "Responses evolve from your history, emotional patterns, and ongoing wellness journey.",
    highlight: "Memory & care",
    tone: "rose",
  },
  {
    id: "crisis",
    icon: Activity,
    title: "Crisis Awareness",
    tagline: "Support when it matters",
    description:
      "Watches for distress signals and surfaces calm, appropriate pathways in critical moments.",
    highlight: "Safety first",
    tone: "violet",
  },
  {
    id: "insights",
    icon: LineChart,
    title: "Mood Tracking & Insights",
    tagline: "See your patterns",
    description:
      "Visual trends help you notice what shifts your mood and what helps you feel steadier.",
    highlight: "Clear trends",
    tone: "mist",
  },
  {
    id: "voice",
    icon: Mic,
    title: "Voice Interaction",
    tagline: "Talk, don’t just type",
    description:
      "Speak naturally with the AI for a more accessible, human-feeling experience.",
    highlight: "Hands-free",
    tone: "rose",
  },
  {
    id: "privacy",
    icon: Shield,
    title: "Privacy-Focused Design",
    tagline: "Protected by default",
    description:
      "Sensitive emotional data stays guarded while still enabling meaningful personalization.",
    highlight: "You stay in control",
    tone: "violet",
  },
  {
    id: "personalization",
    icon: Sparkles,
    title: "Continuous Personalization",
    tagline: "Gets smarter with you",
    description:
      "Learns from interactions and patterns to keep support relevant and genuinely helpful.",
    highlight: "Living profile",
    tone: "mist",
  },
];

const toneStyles = {
  rose: {
    stage:
      "from-[#FFF0F6] via-[#FFEAF2]/80 to-[#F7F0FF]/90",
    orb: "bg-[rgba(183,71,131,0.22)]",
    icon: "from-[#B74783] to-[#D98CB4]",
    chip: "bg-[#FFE5F0] text-[#9F376F] border-[#F0CADA]",
    accent: "text-[#B74783]",
    ring: "ring-[#B74783]/35",
    bar: "from-[#B74783] to-[#D98CB4]",
  },
  violet: {
    stage:
      "from-[#F4E8FF] via-[#FBF7FF] to-[#FFF0F7]/80",
    orb: "bg-[rgba(150,88,183,0.22)]",
    icon: "from-[#9658B7] to-[#D9B8F5]",
    chip: "bg-[#F4E8FF] text-[#6B3D8A] border-[#E0CBF0]",
    accent: "text-[#9658B7]",
    ring: "ring-[#9658B7]/35",
    bar: "from-[#9658B7] to-[#B74783]",
  },
  mist: {
    stage:
      "from-[#F8F4FF] via-white to-[#FFF5FA]",
    orb: "bg-[rgba(120,99,198,0.18)]",
    icon: "from-[#7863C6] to-[#B8A6F0]",
    chip: "bg-[#F0EAFE] text-[#5A4B9A] border-[#DCD2F5]",
    accent: "text-[#7863C6]",
    ring: "ring-[#7863C6]/35",
    bar: "from-[#7863C6] to-[#B74783]",
  },
};

export default function FeaturesPage() {
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(features[0].id);
  const active = features.find((f) => f.id === activeId) ?? features[0];
  const styles = toneStyles[active.tone];
  const ActiveIcon = active.icon;
  const activeIndex = features.findIndex((f) => f.id === activeId);

  return (
    <div className="relative h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#FBF9FF] text-[#302B3D]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#B74783]/10 blur-3xl" />
        <div className="absolute -right-16 top-40 h-80 w-80 rounded-full bg-[#9658B7]/12 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-56 w-56 rounded-full bg-[#7863C6]/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex h-full flex-col px-4 pb-4 pt-[5.5rem] sm:px-6 sm:pb-5 sm:pt-24 lg:px-8 lg:pt-28">
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col">
          {/* Compact header — not a long hero */}
          <motion.header
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EADCE5] bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#B74783] shadow-sm backdrop-blur">
                  <Sparkles className="h-3 w-3" aria-hidden />
                  Platform Features
                </span>
                <span className="hidden text-xs font-medium text-[#927C8B] sm:inline">
                  {activeIndex + 1} / {features.length}
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#302B3D] sm:text-3xl lg:text-[2.15rem] lg:leading-tight">
                Tools that feel{" "}
                <span className="text-gradient-brand">alive with you</span>
              </h1>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-[#716B7D] sm:text-[15px]">
                Explore what powers Soul Discovery — tap a capability below to
                see it in focus.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="btn-spatium inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start px-5 text-sm sm:self-auto"
            >
              Start Your Journey
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.header>

          {/* Showcase stage — distinct from Assessment’s sidebar + catalog */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-[#EADCE5]/90 bg-white/55 shadow-[0_20px_60px_rgba(123,57,98,0.1)] backdrop-blur-xl"
          >
            <div
              id="feature-stage"
              className={cn(
                "relative flex min-h-[200px] flex-1 flex-col justify-center overflow-hidden bg-gradient-to-br p-5 transition-[background] duration-500 sm:min-h-[240px] sm:p-8 lg:min-h-0 lg:p-10",
                styles.stage
              )}
            >
              <motion.div
                key={active.tone}
                aria-hidden
                className={cn(
                  "pointer-events-none absolute -right-8 -top-10 h-56 w-56 rounded-full blur-3xl sm:h-72 sm:w-72",
                  styles.orb
                )}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.55 }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/40 to-transparent"
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={
                    reduceMotion ? false : { opacity: 0, y: 18, filter: "blur(6px)" }
                  }
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={
                    reduceMotion
                      ? undefined
                      : { opacity: 0, y: -12, filter: "blur(4px)" }
                  }
                  transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  className="relative z-10 mx-auto grid w-full max-w-4xl gap-6 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-10"
                >
                  <div className="flex justify-center lg:justify-start">
                    <motion.div
                      className={cn(
                        "relative flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br text-white shadow-[0_18px_40px_rgba(123,57,98,0.28)] sm:h-28 sm:w-28 lg:h-32 lg:w-32",
                        styles.icon
                      )}
                      animate={
                        reduceMotion
                          ? undefined
                          : { y: [0, -6, 0], rotate: [0, 2, 0] }
                      }
                      transition={
                        reduceMotion
                          ? undefined
                          : {
                              duration: 4.2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }
                      }
                    >
                      <ActiveIcon className="h-11 w-11 sm:h-12 sm:w-12 lg:h-14 lg:w-14" />
                      <span
                        aria-hidden
                        className="absolute -inset-3 rounded-[34px] border border-white/40"
                      />
                    </motion.div>
                  </div>

                  <div className="text-center lg:text-left">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]",
                        styles.chip
                      )}
                    >
                      {active.highlight}
                    </span>
                    <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#302B3D] sm:text-3xl lg:text-[2.35rem] lg:leading-[1.15]">
                      {active.title}
                    </h2>
                    <p className={cn("mt-1 text-sm font-semibold", styles.accent)}>
                      {active.tagline}
                    </p>
                    <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-[#716B7D] sm:text-base lg:mx-0">
                      {active.description}
                    </p>
                    <div
                      className={cn(
                        "mx-auto mt-5 h-1 w-16 rounded-full bg-gradient-to-r lg:mx-0",
                        styles.bar
                      )}
                      aria-hidden
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Feature filmstrip — replaces scrolling card grid */}
            <div className="shrink-0 border-t border-[#EADCE5]/80 bg-white/90 px-3 py-2.5 sm:px-4 sm:py-3.5">
              <p className="mb-2 px-1 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-[#927C8B] sm:text-left">
                Choose a capability
              </p>
              <div
                role="tablist"
                aria-label="Platform features"
                className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] sm:grid sm:grid-cols-5 sm:overflow-visible lg:grid-cols-9 [&::-webkit-scrollbar]:hidden"
              >
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  const selected = feature.id === activeId;
                  return (
                    <motion.button
                      key={feature.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      aria-controls="feature-stage"
                      onClick={() => setActiveId(feature.id)}
                      whileHover={reduceMotion ? undefined : { y: -2 }}
                      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                      className={cn(
                        "group relative flex w-[4.6rem] shrink-0 flex-col items-center gap-1 rounded-2xl border px-1 py-2 text-center transition-all duration-250 sm:w-auto sm:gap-1.5 sm:px-1.5 sm:py-2.5",
                        selected
                          ? cn(
                              "border-transparent bg-[#FFF0F6] shadow-[0_8px_22px_rgba(183,71,131,0.14)] ring-2",
                              toneStyles[feature.tone].ring
                            )
                          : "border-[#EADCE5]/70 bg-[#FBF9FF]/80 hover:border-[#DFC7D6] hover:bg-white"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-xl transition-colors sm:h-10 sm:w-10",
                          selected
                            ? cn(
                                "bg-gradient-to-br text-white shadow-sm",
                                toneStyles[feature.tone].icon
                              )
                            : "bg-white text-[#927C8B] group-hover:text-[#B74783]"
                        )}
                      >
                        <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                      </span>
                      <span
                        className={cn(
                          "line-clamp-2 w-full text-[9px] font-semibold leading-tight sm:text-[11px]",
                          selected ? "text-[#49263D]" : "text-[#716B7D]"
                        )}
                      >
                        {feature.title.split(" ").slice(0, 2).join(" ")}
                      </span>
                      {selected && (
                        <motion.span
                          layoutId={reduceMotion ? undefined : "feature-dot"}
                          className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#B74783]"
                          aria-hidden
                        />
                      )}
                      <span className="sr-only">
                        Feature {index + 1}: {feature.title}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          <p className="mt-3 text-center text-[11px] leading-relaxed text-[#927C8B] sm:mt-4 sm:text-xs">
            Privacy-minded by design · Personalized support · Built for everyday
            emotional wellness
          </p>
        </div>
      </div>
    </div>
  );
}
