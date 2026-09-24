"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Brain,
  Heart,
  Shield,
  MessageCircle,
  Sparkles,
  LineChart,
  Waves,
  Check,
  ArrowRight,
  HeartPulse,
  Lightbulb,
  Lock,
  MessageSquareHeart,
  Loader2,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import React from "react";
import { Ripple } from "@/components/ui/ripple";
import { useSession } from "@/lib/contexts/session-context";
import { getMoodHistory, trackMood } from "@/lib/api/mood";
import { useToast } from "@/components/ui/use-toast";
import { VoiceModal } from "@/components/voice/VoiceModal";
import { createChatSession } from "@/lib/api/chat";
import { BreathingGame } from "@/components/games/breathing-game";
import { BRAND_CAPTION, BRAND_NAME } from "@/lib/branding";
import { ZenGarden } from "@/components/games/zen-garden";
import { ForestGame } from "@/components/games/forest-game";
import { OceanWaves } from "@/components/games/ocean-waves";
import { X } from "lucide-react";
import { FaceEmotionLauncher } from "@/components/face-emotion/FaceEmotionLauncher";
import { ReviewsSection } from "@/components/reviews-section";

export default function Home() {
  const router = useRouter();
  const emotions = [
    { value: 0, label: "😔 Down", color: "from-blue-500/50" },
    { value: 25, label: "😊 Content", color: "from-green-500/50" },
    { value: 50, label: "😌 Peaceful", color: "from-[rgba(179,132,201,0.5)]" },
    { value: 75, label: "🤗 Happy", color: "from-yellow-500/50" },
    { value: 100, label: "✨ Excited", color: "from-pink-500/50" },
  ];

  const [emotion, setEmotion] = useState(50);
  const [moodSource, setMoodSource] = useState<"slider" | "camera">("slider");
  const [categoricalMood, setCategoricalMood] = useState<string | undefined>();
  const [mounted, setMounted] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSavingMood, setIsSavingMood] = useState(false);
  const [moodSaved, setMoodSaved] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceSessionId, setVoiceSessionId] = useState<string>("");
  const [stressPrompt, setStressPrompt] = useState<{
    trigger: string;
    activity: {
      type: "breathing" | "garden" | "forest" | "waves";
      title: string;
      description: string;
    };
  } | null>(null);
  const { isAuthenticated } = useSession();
  const { toast } = useToast();

  const welcomeSteps = [
    {
      title: "Hi, I'm Soul Discovery 👋",
      description:
        "Your companion for mental wellness and self-discovery. A calm, judgment-free space to find clarity and grow with confidence.",
      icon: Waves,
    },
    {
      title: "Personalized Support 🌱",
      description:
        "I adapt to your needs and emotional state, offering evidence-based techniques and gentle guidance when you need it most.",
      icon: Brain,
    },
    {
      title: "Your Privacy Matters 🛡️",
      description:
        "Our conversations are completely private and secure. I follow strict ethical guidelines and respect your boundaries.",
      icon: Shield,
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch the user's last mood when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    const loadLastMood = async () => {
      try {
        const response = await getMoodHistory({ limit: 1 });
        const moods = response.data || [];
        if (moods.length > 0 && typeof moods[0].score === "number") {
          setEmotion(moods[0].score);
        }
      } catch (error) {
        // Silently ignore — user may not have any mood history yet
      }
    };
    loadLastMood();
  }, [isAuthenticated]);

  const handleSaveMood = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save your mood",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsSavingMood(true);
      await trackMood({ score: emotion, note: "", source: moodSource, mood: categoricalMood });
      setMoodSaved(true);
      toast({
        title: "Mood saved! ✨",
        description: "Your mood has been recorded successfully.",
      });
      // Reset "saved" indicator after 3 seconds
      setTimeout(() => setMoodSaved(false), 3000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save your mood. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingMood(false);
    }
  };

  const handleStartTextTherapy = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    router.push("/therapy/new");
    setShowDialog(false);
    setCurrentStep(0);
  };

  const handleStartVoiceTherapy = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    try {
      const sessionId = await createChatSession();
      setVoiceSessionId(sessionId);
      setShowVoiceModal(true);
      setShowDialog(false);
      setCurrentStep(0);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start voice session",
        variant: "destructive",
      });
    }
  };

  const handleActivityTrigger = (
    activityType: "breathing" | "ocean" | "forest" | "zen",
    triggerReason: string = "support"
  ) => {
    let type: "breathing" | "garden" | "forest" | "waves" = "breathing";
    let title = "Calming Activity";
    let description = "Take a moment to center yourself";

    switch (activityType) {
      case "breathing":
        type = "breathing";
        title = "Breathing Patterns";
        description = "Follow calming breathing exercises with visual guidance";
        break;
      case "ocean":
        type = "waves";
        title = "Ocean Waves";
        description = "Match your breath with gentle ocean waves";
        break;
      case "forest":
        type = "forest";
        title = "Mindful Forest";
        description = "Take a peaceful walk through a virtual forest";
        break;
      case "zen":
        type = "garden";
        title = "Zen Garden";
        description = "Create and maintain your digital peaceful space";
        break;
    }

    setStressPrompt({
      trigger: triggerReason,
      activity: { type, title, description },
    });
  };

  const currentEmotion =
    emotions.find((em) => Math.abs(emotion - em.value) < 15) || emotions[2];

  const features = [
    {
      icon: HeartPulse,
      title: "24/7 Support",
      description: "Always here to listen and support you, any time of day",
      color: "from-rose-500/20",
      delay: 0.2,
    },
    {
      icon: Lightbulb,
      title: "Smart Insights",
      description: "Personalized guidance powered by emotional intelligence",
      color: "from-amber-500/20",
      delay: 0.4,
    },
    {
      icon: Lock,
      title: "Private & Secure",
      description: "Your conversations are always confidential and encrypted",
      color: "from-emerald-500/20",
      delay: 0.6,
    },
    {
      icon: MessageSquareHeart,
      title: "Evidence-Based",
      description: "Therapeutic techniques backed by clinical research",
      color: "from-blue-500/20",
      delay: 0.8,
    },
  ];

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Spatium-composition hero */}
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center px-4 pb-20 pt-28 md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 18 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-[820px] text-center"
        >
          <h1
            className="mx-auto max-w-[18ch] font-bold text-[#f3eefa]"
            style={{
              fontSize: "clamp(2.6rem, 7vw, 4.75rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {BRAND_NAME}
          </h1>

          <p className="mx-auto mt-6 max-w-[36ch] text-[17px] font-medium leading-[1.7] text-[rgba(231,218,237,0.7)] md:text-[18px]">
            {BRAND_CAPTION}
          </p>

          <div className="relative mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(179,132,201,0.35)] blur-[48px]"
            />
            <Button size="lg" onClick={() => setShowDialog(true)} className="btn-spatium-lg relative z-10 min-w-[220px]">
              Begin Your Journey
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button asChild size="lg" variant="glass" className="relative z-10 min-w-[180px]">
              <Link href="/features">Explore Features</Link>
            </Button>
          </div>
        </motion.div>

        {/* Mood glass panel — Soul Discovery content, Spatium surface language */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 24 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="glass-panel relative z-10 mt-16 w-full max-w-[640px] rounded-[28px] px-5 py-8 sm:px-8"
        >
          <p className="mb-5 text-center text-sm font-semibold text-[rgba(231,218,237,0.65)]">
            How are you feeling right now?
          </p>
          <div className="mb-5 flex items-center justify-between px-1">
            {emotions.map((em) => (
              <button
                key={em.value}
                type="button"
                className={`transition-all duration-400 ${
                  Math.abs(emotion - em.value) < 15
                    ? "scale-110 opacity-100"
                    : "scale-100 opacity-40"
                }`}
                onClick={() => setEmotion(em.value)}
              >
                <div className="text-2xl">{em.label.split(" ")[0]}</div>
                <div className="mt-1 text-[11px] font-semibold text-[rgba(231,218,237,0.55)]">
                  {em.label.split(" ")[1]}
                </div>
              </button>
            ))}
          </div>
          <Slider
            value={[emotion]}
            onValueChange={(value) => {
              setEmotion(value[0]);
              setMoodSource("slider");
            }}
            min={0}
            max={100}
            step={1}
            className="px-1 py-3"
          />
          {isAuthenticated && (
            <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <FaceEmotionLauncher
                onMoodConfirmed={(score, mood) => {
                  setEmotion(score);
                  setMoodSource("camera");
                  setCategoricalMood(mood);
                }}
              />
              <Button variant="glass" size="sm" onClick={handleSaveMood} disabled={isSavingMood}>
                {isSavingMood ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : moodSaved ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-[#4ADE80]" />
                    Mood Saved
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-4 w-4" />
                    Save Mood
                  </>
                )}
              </Button>
            </div>
          )}
        </motion.div>
      </section>

      {/* Features — Spatium-like section rhythm */}
      <section id="features" className="relative section-padding px-4">
        <div className="container-app">
          <div className="mx-auto mb-14 max-w-[620px] text-center md:mb-16">
            <h2
              className="font-bold text-[#f3eefa]"
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
              }}
            >
              Support that stays with you
            </h2>
            <p className="mx-auto mt-4 max-w-[46ch] text-[17px] leading-[1.7] text-[rgba(231,218,237,0.62)]">
              Thoughtful tools for reflection, conversation, and calm — designed to feel
              quiet, not clinical.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-5">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: feature.delay * 0.4, duration: 0.45 }}
                viewport={{ once: true }}
              >
                <Card interactive className="h-full min-h-[190px]">
                  <CardHeader className="pb-3">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(216,191,227,0.18)] bg-white/[0.04]">
                      <feature.icon className="h-5 w-5 text-[#d8bfe3]" />
                    </div>
                    <h3 className="text-[17px] font-bold tracking-[-0.02em] text-[#f3eefa]">
                      {feature.title}
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-[rgba(231,218,237,0.55)]">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ReviewsSection />

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-card sm:max-w-[440px]">
          <DialogHeader>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                {welcomeSteps[currentStep] && (
                  <div>
                    {React.createElement(welcomeSteps[currentStep].icon, {
                      className: "w-8 h-8 text-primary",
                    })}
                  </div>
                )}
              </div>
              <DialogTitle className="text-2xl text-center">
                {welcomeSteps[currentStep]?.title}
              </DialogTitle>
              <DialogDescription className="text-center text-base leading-relaxed">
                {welcomeSteps[currentStep]?.description}
              </DialogDescription>
            </motion.div>
          </DialogHeader>
          <div className="flex justify-between items-center mt-8">
            <div className="flex gap-2">
              {welcomeSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentStep ? "bg-primary w-4" : "bg-primary/20"
                    }`}
                />
              ))}
            </div>
            {currentStep === welcomeSteps.length - 1 ? (
              <div className="flex gap-2">
                <Button
                  onClick={handleStartTextTherapy}
                  variant="outline"
                >
                  <MessageSquareHeart className="w-4 h-4 mr-2" />
                  Text Chat
                </Button>
                <Button
                  onClick={handleStartVoiceTherapy}
                  className="relative group"
                >
                  <span className="flex items-center gap-2">
                    Voice
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => {
                  if (currentStep < welcomeSteps.length - 1) {
                    setCurrentStep((c) => c + 1);
                  }
                }}
                className="relative group px-6"
              >
                <span className="flex items-center gap-2">
                  Next
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <VoiceModal
        open={showVoiceModal}
        onOpenChange={setShowVoiceModal}
        sessionId={voiceSessionId}
        onActivityTrigger={(type, reason) => handleActivityTrigger(type as any, reason)}
        activityActive={!!stressPrompt}
        onSessionChange={(newId) => setVoiceSessionId(newId)}
      />

      {/* Activity Modal Overlay (shared with voice mode) */}
      {stressPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0c0819]/75 p-4 backdrop-blur-md">
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-y-auto rounded-[22px] border border-white/10 bg-[rgba(15,12,28,0.95)] shadow-[0_30px_100px_rgba(0,0,0,0.55)] backdrop-blur-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/8 bg-[rgba(15,12,28,0.95)] p-5 backdrop-blur">
              <div>
                <h3 className="font-display text-lg font-semibold text-white">{stressPrompt.activity.title}</h3>
                <p className="text-sm text-white/50">{stressPrompt.activity.description}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full shrink-0"
                onClick={() => setStressPrompt(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4 flex-1">
              {stressPrompt.activity.type === "breathing" && <BreathingGame />}
              {stressPrompt.activity.type === "waves" && <OceanWaves />}
              {stressPrompt.activity.type === "forest" && <ForestGame />}
              {stressPrompt.activity.type === "garden" && <ZenGarden />}
            </div>
          </div>
        </div>
      )}

      {/* Add custom animations to globals.css */}
    </div>
  );
}
