"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Heart, Target, Sparkles } from "lucide-react";

const missions = [
  {
    icon: Heart,
    title: "Our Mission",
    description:
      "Soul Discovery is designed to make emotional support more accessible through AI-powered technology. Our mission is to provide users with a safe and personalized space where they can express their thoughts, reflect on their emotions, track mood patterns, and receive meaningful AI-based support whenever they need it.",
  },
  {
    icon: Target,
    title: "Our Vision",
    description:
      "Our vision is to create a future where emotional well-being tools are accessible, private, and personalized. Soul Discovery combines conversational AI, mood tracking, and intelligent emotional insights to help users understand their emotional patterns and build better self-awareness.",
  },
  {
    icon: Sparkles,
    title: "Our Values",
    description:
      "Soul Discovery is built around privacy, empathy, innovation, and trust. We focus on creating technology that respects user information while providing a supportive and engaging experience through responsible AI.",
  },
];

export default function AboutPage() {
  return (
    <div className="page-shell relative text-[#49263D]">
      <div className="container-app section-padding relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-8 max-w-3xl text-center md:mb-10"
        >
          <span className="badge-soft mb-4">About Soul Discovery</span>
          <h1 className="text-4xl font-bold tracking-tight text-[#49263D] md:text-5xl lg:text-[56px]">
            Building emotional wellness{" "}
            <span className="text-gradient-brand">for everyone</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg font-medium leading-relaxed text-[#795A70] md:text-xl">
            Discover clarity. Find balance. Grow with confidence.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-lg leading-relaxed text-[#927C8B] md:text-xl">
            Soul Discovery is an AI-powered emotional wellness platform that helps
            users understand and reflect on their emotional state through
            intelligent conversations, mood tracking, and personalized insights.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-[#927C8B]">
            Designed with privacy and accessibility in mind, Soul Discovery processes
            emotional interactions responsibly while providing a simple and
            engaging experience for everyday emotional support and self-reflection.
          </p>
        </motion.div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:mb-10 md:grid-cols-3 md:gap-5">
          {missions.map((mission, index) => (
            <motion.div
              key={mission.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card interactive className="glass-panel h-full rounded-[22px] border-[#EADCE5] p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFE5F0]">
                  <mission.icon className="h-7 w-7 text-[#B74783]" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[#49263D]">
                  {mission.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#927C8B] md:text-base">
                  {mission.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-panel mx-auto max-w-3xl rounded-[22px] border-[#EADCE5] p-6 text-center md:p-8"
        >
          <h2 className="mb-4 text-2xl font-bold text-[#49263D] md:text-3xl">
            Building a more connected emotional experience
          </h2>
          <p className="text-base leading-relaxed text-[#927C8B] md:text-lg">
            Soul Discovery focuses on combining artificial intelligence with emotional
            awareness to create a more interactive and personalized experience.
            The platform considers different aspects of user interaction to provide
            more meaningful responses and insights while keeping you in control.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
