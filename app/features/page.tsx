"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

type Feature = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  accent: "blush" | "lavender" | "orchid";
  layout: string;
};

const features: Feature[] = [
  {
    icon: Bot,
    title: "AI Therapy Assistant",
    description:
      "A conversational AI companion that provides personalized emotional support through natural conversations and understands your unique needs over time.",
    accent: "orchid",
    layout: "lg:col-span-2 lg:row-span-1",
  },
  {
    icon: Brain,
    title: "Multimodal Emotion Understanding",
    description:
      "Combines conversational context, mood patterns, and emotional signals to create a deeper understanding of your current emotional state.",
    accent: "lavender",
    layout: "lg:col-span-1",
  },
  {
    icon: Camera,
    title: "Facial Mood Detection",
    description:
      "Optional camera-based emotion analysis helps track mood changes while processing facial data locally to prioritize user privacy.",
    accent: "blush",
    layout: "lg:col-span-1",
  },
  {
    icon: MessageCircle,
    title: "Personalized Conversations",
    description:
      "The AI adapts conversations based on your previous interactions, emotional patterns, and ongoing mental wellness journey.",
    accent: "orchid",
    layout: "lg:col-span-1",
  },
  {
    icon: Activity,
    title: "Crisis Awareness & Support",
    description:
      "Monitors conversations for signs of emotional distress and provides appropriate support pathways during critical situations.",
    accent: "blush",
    layout: "lg:col-span-1",
  },
  {
    icon: LineChart,
    title: "Mood Tracking & Insights",
    description:
      "Track emotional patterns over time with visual insights that help you understand changes in your mood and wellbeing.",
    accent: "lavender",
    layout: "lg:col-span-2",
  },
  {
    icon: Mic,
    title: "Voice Interaction",
    description:
      "Interact naturally with the AI through voice-based communication for a more accessible and human-like experience.",
    accent: "orchid",
    layout: "lg:col-span-1",
  },
  {
    icon: Shield,
    title: "Privacy Focused Design",
    description:
      "Your emotional data is handled with privacy in mind, keeping sensitive information protected while enabling personalized support.",
    accent: "blush",
    layout: "lg:col-span-1",
  },
  {
    icon: Sparkles,
    title: "Continuous Personalization",
    description:
      "The system learns from your interactions and emotional patterns to provide more relevant and meaningful support.",
    accent: "lavender",
    layout: "lg:col-span-1",
  },
];

const accentStyles = {
  blush: {
    panel: "from-[#FFEAF2]/90 via-white to-white",
    icon: "bg-[#FFE5F0] text-[#B74783]",
    glow: "bg-[rgba(183,71,131,0.14)]",
    bar: "from-[#B74783] to-[#D98CB4]",
  },
  lavender: {
    panel: "from-[#F4E8FF]/90 via-white to-white",
    icon: "bg-[#F4E8FF] text-[#9F376F]",
    glow: "bg-[rgba(217,184,245,0.35)]",
    bar: "from-[#D9B8F5] to-[#B74783]",
  },
  orchid: {
    panel: "from-[#FFF0F6] via-white to-[#F7F0FF]/70",
    icon: "bg-gradient-to-br from-[#FFE5F0] to-[#F4E8FF] text-[#872B5D]",
    glow: "bg-[rgba(183,71,131,0.12)]",
    bar: "from-[#9F376F] to-[#D9B8F5]",
  },
};

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

function FeatureCard({
  feature,
  index,
  reduceMotion,
}: {
  feature: Feature;
  index: number;
  reduceMotion: boolean | null;
}) {
  const styles = accentStyles[feature.accent];
  const Icon = feature.icon;
  const featured = feature.layout.includes("col-span-2");

  return (
    <motion.article
      variants={item}
      whileHover={
        reduceMotion
          ? undefined
          : { y: -6, transition: { duration: 0.25, ease: "easeOut" } }
      }
      className={cn(
        "group relative overflow-hidden rounded-[24px] border border-[#EADCE5] bg-white",
        "shadow-[0_8px_28px_rgba(123,57,98,0.07)]",
        "transition-[border-color,box-shadow] duration-300",
        "hover:border-[#DFC7D6] hover:shadow-[0_16px_40px_rgba(123,57,98,0.12)]",
        feature.layout
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-100",
          styles.panel
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full blur-3xl transition-opacity duration-500",
          styles.glow,
          "opacity-60 group-hover:opacity-100"
        )}
        aria-hidden
      />

      <div
        className={cn(
          "relative flex h-full flex-col p-6 md:p-7",
          featured && "md:flex-row md:items-center md:gap-8 md:p-8"
        )}
      >
        <div className={cn(featured && "md:w-[42%] md:shrink-0")}>
          <div className="mb-5 flex items-center gap-3">
            <motion.div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl",
                styles.icon,
                featured && "md:h-14 md:w-14"
              )}
              animate={
                reduceMotion
                  ? undefined
                  : {
                      y: [0, -4, 0],
                    }
              }
              transition={
                reduceMotion
                  ? undefined
                  : {
                      duration: 3.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.18,
                    }
              }
            >
              <Icon className={cn("h-6 w-6", featured && "md:h-7 md:w-7")} />
            </motion.div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#927C8B]">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <h3
            className={cn(
              "font-semibold tracking-tight text-[#49263D]",
              featured ? "text-2xl md:text-[28px]" : "text-xl"
            )}
          >
            {feature.title}
          </h3>
        </div>

        <div className={cn("mt-3", featured && "md:mt-0 md:flex-1")}>
          <p
            className={cn(
              "leading-relaxed text-[#795A70]",
              featured ? "text-base md:text-lg" : "text-sm md:text-[15px]"
            )}
          >
            {feature.description}
          </p>
          <div
            className={cn(
              "mt-5 h-1 w-12 rounded-full bg-gradient-to-r opacity-80 transition-all duration-300 group-hover:w-20 group-hover:opacity-100",
              styles.bar
            )}
            aria-hidden
          />
        </div>
      </div>
    </motion.article>
  );
}

export default function FeaturesPage() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="page-shell relative text-[#49263D]">
      <div className="container-app section-padding relative z-10">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-10 max-w-3xl text-center md:mb-12"
        >
          <motion.span
            className="badge-soft mb-4"
            animate={
              reduceMotion
                ? undefined
                : { boxShadow: ["0 0 0 0 rgba(183,71,131,0)", "0 0 0 8px rgba(183,71,131,0.06)", "0 0 0 0 rgba(183,71,131,0)"] }
            }
            transition={
              reduceMotion
                ? undefined
                : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
            }
          >
            Platform Features
          </motion.span>
          <h1 className="text-4xl font-bold tracking-tight text-[#49263D] md:text-5xl lg:text-[56px]">
            Everything you need for{" "}
            <span className="text-gradient-brand">emotional wellness</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-[#795A70] md:text-xl">
            Soul Discovery combines artificial intelligence, emotional understanding,
            and personalized interaction to provide accessible mental wellness
            support through a secure and intelligent platform.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.12 }}
          className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[minmax(220px,auto)]"
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              index={index}
              reduceMotion={reduceMotion}
            />
          ))}
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="final-cta-card mt-10 md:mt-14"
        >
          <div className="final-cta-card__glow" aria-hidden />
          <div className="final-cta-card__content">
            <span className="final-cta-eyebrow">✦ Begin from here</span>
            <h2 className="final-cta-heading">
              Ready to begin{" "}
              <span className="text-gradient-brand">your journey?</span>
            </h2>
            <p className="final-cta-copy">
              Experience personalized AI-powered emotional support designed around
              your mental wellness needs.
            </p>
            <div className="relative inline-flex">
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(183,71,131,0.28)] blur-[36px]"
              />
              <Link href="/dashboard" className="btn-spatium btn-spatium-lg relative z-10">
                Start Your Journey
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
