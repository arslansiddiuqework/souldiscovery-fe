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
import { SmallStepsSection } from "@/components/small-steps-section";

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
        "Chat, mood check-ins, and short wellness activities are here when you want them. This is not clinical care.",
      icon: Brain,
    },
    {
      title: "Your Privacy Matters 🛡️",
      description:
        "Conversations stay in your account. Soul Discovery is not an emergency service, and it does not replace a licensed professional.",
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
      accent: "Always on",
      glow: "rgba(183, 71, 131, 0.22)",
      iconWell: "from-[#FFE4F0] to-[#F9D0E4]",
      iconColor: "text-[#B74783]",
      ring: "group-hover:ring-[#F0CADA]",
      delay: 0.12,
    },
    {
      icon: Lightbulb,
      title: "Reflections",
      description: "Short notes based on what you actually record, when there is something to show.",
      accent: "Optional",
      glow: "rgba(61, 155, 132, 0.2)",
      iconWell: "from-[#E3F7F1] to-[#CDEADF]",
      iconColor: "text-[#2F8F78]",
      ring: "group-hover:ring-[#C5E8DB]",
      delay: 0.2,
    },
    {
      icon: Lock,
      title: "Private to your account",
      description: "Conversations are stored with your account and are not shown on public pages.",
      accent: "Private",
      glow: "rgba(91, 124, 218, 0.2)",
      iconWell: "from-[#E8EEFF] to-[#D5DFFA]",
      iconColor: "text-[#4F6ECF]",
      ring: "group-hover:ring-[#CDD8F5]",
      delay: 0.28,
    },
    {
      icon: FileText,
      title: "Gentle practices",
      description: "Breathing, reflection, and mood check-ins you can leave at any time.",
      accent: "Optional",
      glow: "rgba(139, 107, 199, 0.2)",
      iconWell: "from-[#F0E9FF] to-[#E0D4FA]",
      iconColor: "text-[#7A5BB8]",
      ring: "group-hover:ring-[#DDD0F3]",
      delay: 0.36,
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

          {/* Bottom: Support — atmospheric feature strip */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 22 }}
            transition={{ delay: 0.18, duration: 0.7, ease: "easeOut" }}
            className="relative overflow-hidden rounded-[28px] border border-[#F0D9E6]/90 bg-gradient-to-br from-white via-[#FFF8FB] to-[#F7EEFF]/70 p-5 shadow-[0_20px_50px_rgba(123,57,98,0.08)] sm:p-7 md:p-8"
            data-particles-mask
            id="features"
          >
            {/* Soft atmosphere */}
            <div
              aria-hidden
              className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-[#F9DCEB]/55 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -right-10 h-64 w-64 rounded-full bg-[#E9D5FF]/45 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#E8A8C8]/70 to-transparent"
            />

            <div className="relative mb-7 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-[34rem] text-center lg:text-left">
                <span className="badge-soft mx-auto mb-3 lg:mx-0">
                  <Sparkles className="h-3.5 w-3.5 text-[#B74783]" />
                  Built for calm, not clutter
                </span>
                <h2
                  className="font-bold tracking-[-0.03em] text-[#49263D]"
                  style={{
                    fontSize: "clamp(1.55rem, 2.8vw, 2.05rem)",
                    lineHeight: 1.15,
                  }}
                >
                  Support that{" "}
                  <span className="text-gradient-brand">stays with you</span>
                </h2>
                <p className="mx-auto mt-2.5 max-w-[44ch] text-[14px] leading-relaxed text-[#795A70] lg:mx-0 sm:text-[15px]">
                  Powerful tools for reflection, conversation, and calm —
                  designed to feel quiet, not clinical.
                </p>
              </div>
              <Link
                href="/features"
                className="group mx-auto inline-flex items-center gap-1.5 rounded-full border border-[#EADCE5] bg-white/80 px-4 py-2 text-[13px] font-semibold text-[#7B3962] shadow-sm transition hover:-translate-y-0.5 hover:border-[#D9B0C8] hover:bg-[#FFF0F6] lg:mx-0"
              >
                See all features
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="relative grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
              {features.map((feature, index) => (
                <motion.article
                  key={feature.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{
                    opacity: mounted ? 1 : 0,
                    y: mounted ? 0 : 16,
                  }}
                  transition={{ delay: feature.delay, duration: 0.5, ease: "easeOut" }}
                  whileHover={{ y: -6 }}
                  className={`group relative overflow-hidden rounded-[22px] border border-white/80 bg-white/85 p-5 shadow-[0_10px_28px_rgba(123,57,98,0.06)] ring-1 ring-transparent backdrop-blur-sm transition duration-300 hover:shadow-[0_18px_40px_rgba(123,57,98,0.12)] ${feature.ring}`}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full opacity-0 blur-2xl transition duration-500 group-hover:opacity-100"
                    style={{ background: feature.glow }}
                  />
                  <div className="relative flex items-start justify-between gap-3">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] ${feature.iconWell} ${feature.iconColor}`}
                    >
                      <feature.icon className="h-[18px] w-[18px]" strokeWidth={2.15} />
                    </span>
                    <span className="rounded-full bg-[#FBF5F9] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#9A6F8E]">
                      {feature.accent}
                    </span>
                  </div>
                  <h3 className="relative mt-4 text-[15px] font-bold tracking-[-0.02em] text-[#49263D] sm:text-[16px]">
                    {feature.title}
                  </h3>
                  <p className="relative mt-1.5 text-[13px] leading-relaxed text-[#927C8B]">
                    {feature.description}
                  </p>
                  <div className="relative mt-4 flex items-center gap-2 text-[12px] font-semibold text-[#B74783] opacity-0 transition duration-300 group-hover:opacity-100">
                    <span className="h-px w-4 bg-[#B74783]/50 transition-all group-hover:w-6" />
                    0{index + 1}
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <SmallStepsSection />

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
