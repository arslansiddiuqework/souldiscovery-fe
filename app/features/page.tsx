"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
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

const features = [
  {
    icon: Bot,
    title: "AI Therapy Assistant",
    description:
      "A conversational AI companion that provides personalized emotional support through natural conversations and understands your unique needs over time.",
  },
  {
    icon: Brain,
    title: "Multimodal Emotion Understanding",
    description:
      "Combines conversational context, mood patterns, and emotional signals to create a deeper understanding of your current emotional state.",
  },
  {
    icon: Camera,
    title: "Facial Mood Detection",
    description:
      "Optional camera-based emotion analysis helps track mood changes while processing facial data locally to prioritize user privacy.",
  },
  {
    icon: MessageCircle,
    title: "Personalized Conversations",
    description:
      "The AI adapts conversations based on your previous interactions, emotional patterns, and ongoing mental wellness journey.",
  },
  {
    icon: Activity,
    title: "Crisis Awareness & Support",
    description:
      "Monitors conversations for signs of emotional distress and provides appropriate support pathways during critical situations.",
  },
  {
    icon: LineChart,
    title: "Mood Tracking & Insights",
    description:
      "Track emotional patterns over time with visual insights that help you understand changes in your mood and wellbeing.",
  },
  {
    icon: Mic,
    title: "Voice Interaction",
    description:
      "Interact naturally with the AI through voice-based communication for a more accessible and human-like experience.",
  },
  {
    icon: Shield,
    title: "Privacy Focused Design",
    description:
      "Your emotional data is handled with privacy in mind, keeping sensitive information protected while enabling personalized support.",
  },
  {
    icon: Sparkles,
    title: "Continuous Personalization",
    description:
      "The system learns from your interactions and emotional patterns to provide more relevant and meaningful support.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="page-shell relative text-[#f3eefa]">
      <div className="container-app section-padding relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <span className="badge-soft mb-6">Platform Features</span>
          <h1 className="text-4xl font-bold tracking-tight text-[#f3eefa] md:text-5xl lg:text-[56px]">
            Everything you need for{" "}
            <span className="text-gradient-brand">emotional wellness</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[rgba(231,218,237,0.55)] md:text-xl">
            Soul Discovery combines artificial intelligence, emotional understanding,
            and personalized interaction to provide accessible mental wellness
            support through a secure and intelligent platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <Card interactive className="glass-panel h-full rounded-[22px] border-[rgba(216,191,227,0.18)] p-7 md:p-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(179,132,201,0.12)]">
                  <feature.icon className="h-6 w-6 text-[#b384c9]" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[#f3eefa]">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-[rgba(231,218,237,0.55)] md:text-base">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="final-cta-card mt-16 md:mt-24"
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
                className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(179,132,201,0.28)] blur-[36px]"
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
