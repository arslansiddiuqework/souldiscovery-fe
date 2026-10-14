"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Heart,
  Shield,
  Sparkles,
  Waves,
  Check,
  ArrowRight,
  HeartPulse,
  Lightbulb,
  Lock,
  MessageSquareHeart,
  Loader2,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";
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
import { useSession } from "@/lib/contexts/session-context";
import { getMoodHistory, trackMood } from "@/lib/api/mood";
import { useToast } from "@/components/ui/use-toast";
import { VoiceModal } from "@/components/voice/VoiceModal";
import { createChatSession } from "@/lib/api/chat";
import { BreathingGame } from "@/components/games/breathing-game";
import { ZenGarden } from "@/components/games/zen-garden";
import { ForestGame } from "@/components/games/forest-game";
import { OceanWaves } from "@/components/games/ocean-waves";
import { X } from "lucide-react";
import { FaceEmotionLauncher } from "@/components/face-emotion/FaceEmotionLauncher";
import { ReviewsSection } from "@/components/reviews-section";

export default function Home() {
  const router = useRouter();
  const emotions = [
    {
      value: 0,
      label: "Down",
      emoji: "😔",
      ring: "bg-[#EDF2FF] ring-[#B8C9F0]",
    },
    {
      value: 25,
      label: "Content",
      emoji: "😊",
      ring: "bg-[#EAF6F2] ring-[#A8D9C8]",
    },
    {
      value: 50,
      label: "Peaceful",
      emoji: "😌",
      ring: "bg-[#FFF1E9] ring-[#F0C9AE]",
    },
    {
      value: 75,
      label: "Happy",
      emoji: "🤗",
      ring: "bg-[#FFF0F6] ring-[#F0B8D4]",
    },
    {
      value: 100,
      label: "Excited",
      emoji: "✨",
      ring: "bg-[#F2ECFF] ring-[#D0C0F0]",
    },
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

  const features = [
    {
      icon: HeartPulse,
      title: "24/7 Support",
      description: "Always here to listen and support you, any time of day.",
      iconClass: "bg-[#FFF0F6] text-[#B74783]",
      delay: 0.15,
    },
    {
      icon: Lightbulb,
      title: "Smart Insights",
      description: "Personalized guidance powered by emotional intelligence.",
      iconClass: "bg-[#EAF6F2] text-[#3D9B84]",
      delay: 0.25,
    },
    {
      icon: Lock,
      title: "Private & Secure",
      description: "Your conversations are always confidential and encrypted.",
      iconClass: "bg-[#EDF2FF] text-[#5B7CDA]",
      delay: 0.35,
    },
    {
      icon: FileText,
      title: "Evidence-Based",
      description: "Therapeutic techniques backed by clinical research.",
      iconClass: "bg-[#F2ECFF] text-[#8B6BC7]",
      delay: 0.45,
    },
  ];

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Hero — top: clarity ‖ mood · bottom: support full-width horizontal */}
      <section className="relative px-4 pb-12 pt-24 md:pb-16 md:pt-28">
        <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-10 md:gap-12">
          {/* Top row: Discover clarity ‖ Mood */}
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 xl:gap-14">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 18 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="relative text-center lg:text-left"
              data-particles-mask
            >
              <h1
                className="font-bold tracking-[-0.03em]"
                style={{
                  fontSize: "clamp(1.85rem, 3.4vw, 2.75rem)",
                  lineHeight: 1.12,
                }}
              >
                <span className="text-[#49263D]">Discover clarity.</span>{" "}
                <span className="text-[#9A6F8E]">
                  Find balance. Grow with confidence.
                </span>
              </h1>
              <p className="mx-auto mt-4 max-w-[36ch] text-[15px] leading-relaxed text-[#795A70] lg:mx-0 md:text-[16px]">
                Thoughtful tools for reflection, conversation, and calm —
                designed to feel quiet, not clinical.
              </p>
              <div className="relative mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Button
                  size="lg"
                  onClick={() => setShowDialog(true)}
                  className="h-12 min-w-[200px] rounded-full bg-[#B74783] px-6 text-white shadow-[0_10px_28px_rgba(183,71,131,0.28)] hover:bg-[#A63F79]"
                >
                  Begin Your Journey
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 min-w-[180px] rounded-full border-[#D9B0C8] bg-white/80 text-[#7B3962] hover:bg-[#FFF0F6]"
                >
                  <Link href="/features">
                    Explore Features
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 22 }}
              transition={{ delay: 0.12, duration: 0.65 }}
              className="relative z-10 w-full"
              data-particles-mask
            >
              <div className="flex w-full flex-col justify-center rounded-[28px] border border-[#EADCE5] bg-white px-5 py-7 shadow-[0_16px_48px_rgba(123,57,98,0.1)] sm:px-7 sm:py-8">
                <p className="mb-6 text-center text-[15px] font-bold tracking-[-0.01em] text-[#49263D]">
                  How are you feeling right now?
                </p>
                <div
                  role="radiogroup"
                  aria-label="Current mood"
                  className="mb-4 flex items-end justify-between gap-1 px-0.5"
                >
                  {emotions.map((em) => {
                    const active = Math.abs(emotion - em.value) < 15;
                    return (
                      <button
                        key={em.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        aria-label={em.label}
                        onClick={() => {
                          setEmotion(em.value);
                          setMoodSource("slider");
                          setCategoricalMood(em.label);
                        }}
                        className="flex flex-1 flex-col items-center gap-1.5 transition"
                      >
                        <span
                          className={`flex items-center justify-center rounded-full transition-all duration-300 ${
                            active
                              ? `h-14 w-14 scale-105 ring-2 ${em.ring} shadow-[0_8px_20px_rgba(183,71,131,0.18)]`
                              : "h-11 w-11 bg-[#FCF8FC] opacity-55 hover:opacity-80"
                          }`}
                        >
                          <span className={active ? "text-2xl" : "text-xl"}>
                            {em.emoji}
                          </span>
                        </span>
                        <span
                          className={`text-[11px] font-semibold ${
                            active ? "text-[#49263D]" : "text-[#957F94]"
                          }`}
                        >
                          {em.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <Slider
                  value={[emotion]}
                  onValueChange={(value) => {
                    setEmotion(value[0]);
                    setMoodSource("slider");
                    const nearest =
                      emotions.find(
                        (em) => Math.abs(value[0] - em.value) < 15
                      ) || emotions[2];
                    setCategoricalMood(nearest.label);
                  }}
                  min={0}
                  max={100}
                  step={1}
                  className="px-1 py-3"
                />
                <div className="mt-5 flex flex-col items-stretch justify-center gap-2.5 sm:flex-row sm:items-center sm:justify-center">
                  <FaceEmotionLauncher
                    variant="outline"
                    className="h-10 rounded-full border-[#EADCE5] bg-white text-[#49263D] hover:bg-[#FFF0F6]"
                    onMoodConfirmed={(score, mood) => {
                      setEmotion(score);
                      setMoodSource("camera");
                      setCategoricalMood(mood);
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveMood}
                    disabled={isSavingMood}
                    className="h-10 rounded-full border-[#EADCE5] bg-white text-[#49263D] hover:bg-[#FFF0F6]"
                  >
                    {isSavingMood ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving…
                      </>
                    ) : moodSaved ? (
                      <>
                        <Check className="mr-2 h-4 w-4 text-[#3D9B84]" />
                        Mood Saved
                      </>
                    ) : (
                      <>
                        <Heart className="mr-2 h-4 w-4 text-[#B74783]" />
                        Save Mood
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom: Support full width, features in a horizontal row */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 18 }}
            transition={{ delay: 0.18, duration: 0.65 }}
            className="relative border-t border-[#EADCE5] pt-10"
            data-particles-mask
            id="features"
          >
            <div className="mb-6 text-center lg:text-left">
              <h2
                className="font-bold tracking-[-0.03em] text-[#49263D]"
                style={{
                  fontSize: "clamp(1.35rem, 2.2vw, 1.7rem)",
                  lineHeight: 1.2,
                }}
              >
                Support that stays with you
              </h2>
              <p className="mx-auto mt-2 max-w-[48ch] text-sm leading-relaxed text-[#795A70] lg:mx-0">
                Powerful tools for reflection, conversation, and calm — designed
                to feel quiet, not clinical.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{
                    opacity: mounted ? 1 : 0,
                    y: mounted ? 0 : 12,
                  }}
                  transition={{ delay: feature.delay, duration: 0.45 }}
                  className="rounded-[18px] border border-[#EEDCE9] bg-white p-4 shadow-[0_6px_20px_rgba(123,57,98,0.05)]"
                >
                  <span
                    className={`mb-2.5 flex h-9 w-9 items-center justify-center rounded-full ${feature.iconClass}`}
                  >
                    <feature.icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <h3 className="text-[14px] font-bold tracking-[-0.01em] text-[#49263D]">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-[#957F94]">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FFF6FA]/75 p-4 backdrop-blur-md">
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-y-auto rounded-[22px] border border-[#EADCE5] bg-[rgba(15,12,28,0.95)] shadow-[0_30px_100px_rgba(0,0,0,0.55)] backdrop-blur-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#EADCE5] bg-[rgba(15,12,28,0.95)] p-5 backdrop-blur">
              <div>
                <h3 className="font-display text-lg font-semibold text-[#49263D]">{stressPrompt.activity.title}</h3>
                <p className="text-sm text-[#49263D]/50">{stressPrompt.activity.description}</p>
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
