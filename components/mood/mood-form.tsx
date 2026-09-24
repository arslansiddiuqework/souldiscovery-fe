"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "@/lib/contexts/session-context";
import { useRouter } from "next/navigation";
import { FaceEmotionLauncher } from "@/components/face-emotion/FaceEmotionLauncher";

interface MoodFormProps {
  onSuccess?: () => void;
  initialMoodScore?: number;
}

export function MoodForm({ onSuccess, initialMoodScore = 50 }: MoodFormProps) {
  const [moodScore, setMoodScore] = useState(initialMoodScore);
  const [moodSource, setMoodSource] = useState<"slider" | "camera">("slider");
  const [categoricalMood, setCategoricalMood] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  // Sync moodScore with initialMoodScore prop whenever it changes
  useEffect(() => {
    setMoodScore(initialMoodScore);
  }, [initialMoodScore]);
  const { toast } = useToast();
  const { user, isAuthenticated, loading } = useSession();
  const router = useRouter();

  const emotions = [
    { value: 0, label: "😔", description: "Very Low" },
    { value: 25, label: "😕", description: "Low" },
    { value: 50, label: "😊", description: "Neutral" },
    { value: 75, label: "😃", description: "Good" },
    { value: 100, label: "🤗", description: "Great" },
  ];

  const currentEmotion =
    emotions.find((em) => Math.abs(moodScore - em.value) < 15) || emotions[2];

  const handleSubmit = async () => {

    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to track your mood",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch("/api/mood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ score: moodScore, source: moodSource, mood: categoricalMood }),
      });


      if (!response.ok) {
        const error = await response.json();
        console.error("MoodForm: Error response:", error);
        throw new Error(error.error || "Failed to track mood");
      }

      const data = await response.json();

      toast({
        title: "Mood tracked successfully!",
        description: "Your mood has been recorded.",
      });

      // Call onSuccess to close the modal
      onSuccess?.();
    } catch (error) {
      console.error("MoodForm: Error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to track mood",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-7 py-2">
      {/* Emotion display */}
      <div className="space-y-3 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[20px] bg-[rgba(179,132,201,0.12)] shadow-card">
          <div className="text-4xl leading-none">{currentEmotion.label}</div>
        </div>
        <div className="space-y-1">
          <p className="font-display text-lg font-semibold text-white">
            {currentEmotion.description}
          </p>
          <p className="text-sm text-[rgba(231,218,237,0.55)]">
            Score: {moodScore}%
          </p>
        </div>
      </div>

      {/* Emotion slider */}
      <div className="space-y-5 rounded-[16px] border border-[rgba(216,191,227,0.18)] bg-white/[0.035] p-5">
        <div className="flex justify-between px-1">
          {emotions.map((em) => (
            <div
              key={em.value}
              className={`cursor-pointer transition-all duration-300 ${
                Math.abs(moodScore - em.value) < 15
                  ? "scale-110 opacity-100"
                  : "opacity-40 hover:opacity-70"
              }`}
              onClick={() => setMoodScore(em.value)}
            >
              <div className="text-2xl">{em.label}</div>
            </div>
          ))}
        </div>

        <Slider
          value={[moodScore]}
          onValueChange={(value) => {
            setMoodScore(value[0]);
            setMoodSource("slider");
          }}
          min={0}
          max={100}
          step={1}
          className="py-2"
        />
      </div>

      {/* Buttons */}
      <div className="space-y-3">
        <FaceEmotionLauncher 
          className="w-full"
          onMoodConfirmed={(score, mood) => {
            setMoodScore(score);
            setMoodSource("camera");
            setCategoricalMood(mood);
          }} 
        />
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={isLoading || loading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : loading ? (
            "Loading..."
          ) : (
            "Save Mood"
          )}
        </Button>
      </div>
    </div>
  );
}
