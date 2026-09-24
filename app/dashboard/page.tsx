"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Calendar,
  Activity,
  Sun,
  Moon,
  Heart,
  Trophy,
  Bell,
  AlertCircle,
  PhoneCall,
  Sparkles,
  MessageSquare,
  BrainCircuit,
  ArrowRight,
  X,
  Loader2,
  Trash2,
  Clock,
  Dumbbell,
  Mic,
  LineChart,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

import { MoodForm } from "@/components/mood/mood-form";
import { AnxietyGames } from "@/components/games/anxiety-games";
import { BreathingGame } from "@/components/games/breathing-game";
import { ZenGarden } from "@/components/games/zen-garden";
import { ForestGame } from "@/components/games/forest-game";
import { OceanWaves } from "@/components/games/ocean-waves";
import { DashboardMusic } from "@/components/music/dashboard-music";

import {
  getActivityHistory,
  getTodayActivities,
  logActivity,
  deleteActivity,
} from "@/lib/api/activity";
import { trackMood, getMoodHistory } from "@/lib/api/mood";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  addDays,
  format,
  subDays,
  startOfDay,
  isWithinInterval,
  formatDistanceToNow,
} from "date-fns";

import { ActivityLogger } from "@/components/activities/activity-logger";
import { useSession } from "@/lib/contexts/session-context";
import { getAllChatSessions, createChatSession } from "@/lib/api/chat";
import { VoiceModal } from "@/components/voice/VoiceModal";
import { UpcomingConsultationCard } from "@/components/consultation/upcoming-consultation";
import { MySessions } from "@/components/consultation/my-sessions";
import { BookingFlow } from "@/components/consultation/booking-flow";

// type definition
type ActivityLevel = "none" | "low" | "medium" | "high";

interface DayActivity {
  date: Date;
  level: ActivityLevel;
  activities: {
    type: string;
    name: string;
    completed: boolean;
    time?: string;
  }[];
}

// interface Activity
interface Activity {
  id: string;
  userId: string | null;
  type: string;
  name: string;
  description: string | null;
  timestamp: Date;
  duration: number | null;
  completed: boolean;
  moodScore: number | null;
  moodNote: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// interface for stats
interface DailyStats {
  moodScore: number | null;
  completionRate: number;
  mindfulnessCount: number;
  totalActivities: number;
  lastUpdated: Date;
}

//generate Insights function
const generateInsights = (activities: Activity[]) => {
  const insights: {
    title: string;
    description: string;
    icon: any;
    priority: "low" | "medium" | "high";
  }[] = [];

  // Get activities from last 7 days
  const lastWeek = subDays(new Date(), 7);
  const recentActivities = activities.filter(
    (a) => new Date(a.timestamp) >= lastWeek
  );

  // Analyze mood patterns
  const moodEntries = recentActivities.filter(
    (a) => a.type === "mood" && a.moodScore !== null
  );
  if (moodEntries.length >= 2) {
    const averageMood =
      moodEntries.reduce((acc, curr) => acc + (curr.moodScore || 0), 0) /
      moodEntries.length;
    const latestMood = moodEntries[moodEntries.length - 1].moodScore || 0;

    if (latestMood > averageMood) {
      insights.push({
        title: "Mood Improvement",
        description:
          "Your recent mood scores are above your weekly average. Keep up the good work!",
        icon: Brain,
        priority: "high",
      });
    } else if (latestMood < averageMood - 20) {
      insights.push({
        title: "Mood Change Detected",
        description:
          "I've noticed a dip in your mood. Would you like to try some mood-lifting activities?",
        icon: Heart,
        priority: "high",
      });
    }
  }

  // Analyze activity patterns
  const mindfulnessActivities = recentActivities.filter((a) =>
    ["game", "meditation", "breathing"].includes(a.type)
  );
  if (mindfulnessActivities.length > 0) {
    const dailyAverage = mindfulnessActivities.length / 7;
    if (dailyAverage >= 1) {
      insights.push({
        title: "Consistent Practice",
        description: `You've been regularly engaging in mindfulness activities. This can help reduce stress and improve focus.`,
        icon: Trophy,
        priority: "medium",
      });
    } else {
      insights.push({
        title: "Mindfulness Opportunity",
        description:
          "Try incorporating more mindfulness activities into your daily routine.",
        icon: Sparkles,
        priority: "low",
      });
    }
  }

  // Check activity completion rate based on a weekly goal
  const DAILY_ACTIVITY_GOAL = 3;
  const WEEKLY_GOAL = DAILY_ACTIVITY_GOAL * 7;
  const completedActivities = recentActivities.filter((a) => a.completed);
  const completionRate = Math.min((completedActivities.length / WEEKLY_GOAL) * 100, 100);

  if (completionRate >= 80) {
    insights.push({
      title: "High Achievement",
      description: `You've completed ${Math.round(
        completionRate
      )}% of your activities this week. Excellent commitment!`,
      icon: Trophy,
      priority: "high",
    });
  } else if (completionRate < 50) {
    insights.push({
      title: "Activity Reminder",
      description:
        "You might benefit from setting smaller, more achievable daily goals.",
      icon: Calendar,
      priority: "medium",
    });
  }

  // Time pattern analysis
  const morningActivities = recentActivities.filter(
    (a) => new Date(a.timestamp).getHours() < 12
  );
  const eveningActivities = recentActivities.filter(
    (a) => new Date(a.timestamp).getHours() >= 18
  );

  if (morningActivities.length > eveningActivities.length) {
    insights.push({
      title: "Morning Person",
      description:
        "You're most active in the mornings. Consider scheduling important tasks during your peak hours.",
      icon: Sun,
      priority: "medium",
    });
  } else if (eveningActivities.length > morningActivities.length) {
    insights.push({
      title: "Evening Routine",
      description:
        "You tend to be more active in the evenings. Make sure to wind down before bedtime.",
      icon: Moon,
      priority: "medium",
    });
  }

  // Sort insights by priority and return top 3
  return insights
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 3);
};

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();
  const { user } = useSession();
  const searchParams = useSearchParams();

  // Rename the state variable
  const [insights, setInsights] = useState<
    {
      title: string;
      description: string;
      icon: any;
      priority: "low" | "medium" | "high";
    }[]
  >([]);

  // New states for activities and wearables
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showCheckInChat, setShowCheckInChat] = useState(false);
  const [activityHistory, setActivityHistory] = useState<DayActivity[]>([]);
  const [showActivityLogger, setShowActivityLogger] = useState(false);
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
  const [isSavingActivity, setIsSavingActivity] = useState(false);
  const [isSavingMood, setIsSavingMood] = useState(false);
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    moodScore: null,
    completionRate: 100,
    mindfulnessCount: 0,
    totalActivities: 0,
    lastUpdated: new Date(),
  });
  const [lastMoodScore, setLastMoodScore] = useState<number>(50);
  const [todayActivities, setTodayActivities] = useState<Activity[]>([]);
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [sessionsRefreshKey, setSessionsRefreshKey] = useState(0);

  // Helper function to check if mood modal should be shown (once per 24 hours)
  const shouldShowMoodModal = (): boolean => {
    if (typeof window === "undefined") return false;
    
    const lastMoodModalTime = localStorage.getItem("lastMoodModalOpenTime");
    if (!lastMoodModalTime) return true; // First time, show it
    
    const lastOpenTime = parseInt(lastMoodModalTime, 10);
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    
    return now - lastOpenTime >= TWENTY_FOUR_HOURS;
  };

  // Helper function to record when mood modal was shown
  const recordMoodModalOpen = (): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lastMoodModalOpenTime", Date.now().toString());
    }
  };

  // Add this function to transform activities into day activity format
  const transformActivitiesToDayActivity = (
    activities: Activity[]
  ): DayActivity[] => {
    const days: DayActivity[] = [];
    const today = new Date();

    // Create array for last 28 days
    for (let i = 27; i >= 0; i--) {
      const date = startOfDay(subDays(today, i));
      const dayActivities = activities.filter((activity) =>
        isWithinInterval(new Date(activity.timestamp), {
          start: date,
          end: addDays(date, 1),
        })
      );

      // Determine activity level based on number of activities
      let level: ActivityLevel = "none";
      if (dayActivities.length > 0) {
        if (dayActivities.length <= 2) level = "low";
        else if (dayActivities.length <= 4) level = "medium";
        else level = "high";
      }

      days.push({
        date,
        level,
        activities: dayActivities.map((activity) => ({
          type: activity.type,
          name: activity.name,
          completed: activity.completed,
          time: format(new Date(activity.timestamp), "h:mm a"),
        })),
      });
    }

    return days;
  };

  // Modify the loadActivities function to use a default user ID
  const loadActivities = useCallback(async () => {
    try {
      const [response, moodResponse] = await Promise.all([
        getActivityHistory(),
        getMoodHistory({ limit: 1 }),
      ]);

      const userActivities = response.data || [];
      setActivities(userActivities);
      setActivityHistory(transformActivitiesToDayActivity(userActivities));

      // Get the most recent mood from the Mood collection (same source as landing page)
      const latestMoods = moodResponse.data || [];
      if (latestMoods.length > 0 && typeof latestMoods[0].score === "number") {
        setLastMoodScore(latestMoods[0].score);
      }
    } catch (error) {
      console.error("Error loading activities:", error);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle action parameter from notifications to trigger modals dynamically
  useEffect(() => {
    if (!mounted) return;
    const action = searchParams?.get("action");
    if (action) {
      if (action === "mood") {
        setShowMoodModal(true);
      } else if (action === "activity") {
        setShowActivityLogger(true);
      } else if (action === "breathing") {
        handleActivityTrigger("breathing", "notification");
      } else if (action === "ocean") {
        handleActivityTrigger("ocean", "notification");
      } else if (action === "forest") {
        handleActivityTrigger("forest", "notification");
      } else if (action === "zen") {
        handleActivityTrigger("zen", "notification");
      }
      // Clean up search parameters from the URL to preserve clean state and support relaunching
      router.replace("/dashboard", { scroll: false });
    }
  }, [searchParams, mounted, router]);

  // Update the effect
  useEffect(() => {
    if (activities.length > 0) {
      setInsights(generateInsights(activities));
    }
  }, [activities]);

  // Add function to fetch daily stats
  const fetchDailyStats = useCallback(async () => {
    try {
      const today = startOfDay(new Date());

      // Fetch all required data in parallel
      const [sessions, activitiesResponse, todayMoodResponse, latestMoodResponse] = await Promise.all([
        getAllChatSessions(),
        getTodayActivities(),
        getMoodHistory({
          startDate: today.toISOString(),
          endDate: addDays(today, 1).toISOString(),
        }),
        // Also fetch the single most recent mood entry as a fallback
        getMoodHistory({ limit: 1 }),
      ]);

      const allTodayActivities = activitiesResponse.data || [];
      const todayMoods = todayMoodResponse.data || [];
      const latestMoodArr = latestMoodResponse.data || [];

      // Store today's activities for the check-ins card
      setTodayActivities(allTodayActivities);

      // Use today's average mood if available, otherwise fall back to most recent entry ever
      let moodScore: number | null = null;
      if (todayMoods.length > 0) {
        moodScore = Math.round(
          todayMoods.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0) / todayMoods.length
        );
      } else if (latestMoodArr.length > 0) {
        moodScore = latestMoodArr[0].score ?? null;
      }

      // Auto-open mood modal if no mood logged today and 24 hours have passed since last modal open
      if (todayMoods.length === 0 && shouldShowMoodModal()) {
        setShowMoodModal(true);
        recordMoodModalOpen();
      }

      // Split activities: in-app (game, therapy) vs check-ins (everything else)
      const appActivityTypes = ["game"];
      const appActivities = allTodayActivities.filter((a: any) => appActivityTypes.includes(a.type));
      const checkInActivities = allTodayActivities.filter((a: any) => !appActivityTypes.includes(a.type));

      // Completion rate based on check-in activities against a daily goal
      const DAILY_ACTIVITY_GOAL = 3;
      const completedCount = checkInActivities.filter((a: any) => a.completed).length;
      const completionRate = Math.min(
        Math.round((completedCount / DAILY_ACTIVITY_GOAL) * 100),
        100
      );

      setDailyStats({
        moodScore,
        completionRate,
        mindfulnessCount: sessions.length,
        totalActivities: appActivities.length,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error("Error fetching daily stats:", error);
    }
  }, []);

  // Fetch stats on mount and every 5 minutes
  useEffect(() => {
    fetchDailyStats();
    const interval = setInterval(fetchDailyStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDailyStats]);

  // Update wellness stats to reflect actual data
  const wellnessStats = [
    {
      title: "Mood Score",
      value: dailyStats.moodScore !== null ? `${dailyStats.moodScore}%` : "No data",
      icon: Brain,
      color: "text-[#b384c9]",
      bgColor: "bg-[rgba(179,132,201,0.12)]",
      description: dailyStats.moodScore !== null ? "Your latest mood" : "Track your mood to see data",
    },
    {
      title: "Completion Rate",
      value: todayActivities.filter((a: any) => !["game"].includes(a.type)).length > 0 ? `${dailyStats.completionRate}%` : "N/A",
      icon: Trophy,
      color: "text-success",
      bgColor: "bg-success/10",
      description: todayActivities.filter((a: any) => !["game"].includes(a.type)).length > 0
        ? `${dailyStats.completionRate >= 80 ? "Great progress!" : "Keep going!"}`
        : "Log check-ins to track",
    },
    {
      title: "Therapy Sessions",
      value: `${dailyStats.mindfulnessCount}`,
      icon: Heart,
      color: "text-[#E0567B]",
      bgColor: "bg-[#E0567B]/10",
      description: "Total sessions",
    },
    {
      title: "Games Played",
      value: dailyStats.totalActivities.toString(),
      icon: Dumbbell,
      color: "text-info",
      bgColor: "bg-info/10",
      description: "Anxiety relief today",
    },
  ];

  // Load activities on mount
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Add these action handlers
  const handleStartTherapy = () => {
    router.push("/therapy/new");
  };

  const handleMoodSubmit = async (data: { moodScore: number }) => {
    setIsSavingMood(true);
    try {
      await trackMood({
        score: data.moodScore,
        note: "",
      });
      recordMoodModalOpen(); // Record that mood was submitted
      setShowMoodModal(false);
    } catch (error) {
      console.error("Error saving mood:", error);
    } finally {
      setIsSavingMood(false);
    }
  };

  const handleAICheckIn = () => {
    setShowActivityLogger(true);
  };

  const handleStartVoiceTherapy = async () => {
    try {
      const sessionId = await createChatSession();
      setVoiceSessionId(sessionId);
      setShowVoiceModal(true);
    } catch (error) {
      console.error("Error creating voice session:", error);
    }
  };

  const handleActivityTrigger = (
    activityType: string,
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
      default:
        // Fallback to breathing
        type = "breathing";
        title = "Breathing Patterns";
        description = "Follow calming breathing exercises with visual guidance";
        break;
    }

    setStressPrompt({
      trigger: triggerReason,
      activity: { type, title, description },
    });
  };

  // Add handler for game activities
  const handleGamePlayed = useCallback(
    async (gameName: string, description: string) => {
      try {
        await logActivity({
          type: "game",
          name: gameName,
          description: description,
          duration: 0,
        });

        // Refresh activities after logging
        loadActivities();
        fetchDailyStats();
      } catch (error) {
        console.error("Error logging game activity:", error);
      }
    },
    [loadActivities]
  );

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await deleteActivity(activityId);
      // Update local state instantly
      setTodayActivities(prev => prev.filter(a => a.id !== activityId));
      // Refresh stats
      loadActivities();
      fetchDailyStats();
    } catch (error) {
      console.error("Error deleting activity:", error);
    }
  };

  // Simple loading state
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <p className="text-sm text-[rgba(231,218,237,0.55)]">
            Preparing your dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell pb-16 text-white md:pb-24">
      <Container className="space-y-10 md:space-y-14">
        {/* Header Section */}
        <div className="border-b border-[rgba(216,191,227,0.18)] pb-8 md:pb-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-4"
          >
            <span className="badge-soft">
              <Calendar className="h-3.5 w-3.5" />
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </span>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-[40px]">
              Welcome back,{" "}
              <span className="text-gradient-brand">
                {user?.name || "there"}
              </span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-[rgba(231,218,237,0.55)] md:text-lg">
              A calm snapshot of your wellbeing — your mood, check-ins and
              supportive activities, all in one place.
            </p>
          </motion.div>
        </div>

        {/* Main Grid Layout */}
        <div className="space-y-10 md:space-y-14">
          {/* Today's Overview */}
          <section className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-1.5">
                <h2 className="font-display text-xl font-semibold tracking-tight text-white md:text-2xl">
                  Today&apos;s Overview
                </h2>
                <p className="text-sm text-[rgba(231,218,237,0.55)]">
                  Your wellness metrics for {format(new Date(), "MMMM d, yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-xs text-[rgba(231,218,237,0.55)]">
                  Last updated: {format(dailyStats.lastUpdated, "h:mm a")}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={fetchDailyStats}
                  className="group h-9 w-9 rounded-xl border border-[rgba(216,191,227,0.18)] bg-white/[0.035] text-[#d8bfe3] shadow-card hover:bg-white/[0.06]"
                  title="Refresh metrics"
                >
                  <Loader2 className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
              {wellnessStats.map((stat) => (
                <Card key={stat.title} interactive className="glass-panel border-[rgba(216,191,227,0.18)] p-6 md:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[rgba(231,218,237,0.45)]">
                      {stat.title}
                    </p>
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                        stat.bgColor
                      )}
                    >
                      <stat.icon className={cn("h-5 w-5", stat.color)} />
                    </div>
                  </div>
                  <p className="mt-6 font-display text-3xl font-bold tracking-tight text-white">
                    {stat.value}
                  </p>
                  <p className="mt-1.5 text-sm text-[rgba(231,218,237,0.55)]">
                    {stat.description}
                  </p>
                </Card>
              ))}
            </div>
          </section>

          {/* Actions + Insights Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 md:gap-8">
            {/* Quick Actions Card */}
            <Card className="relative overflow-hidden lg:col-span-2">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/[0.07] to-transparent" />
              <CardHeader className="relative pb-0">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[rgba(216,191,227,0.22)] bg-[rgba(179,132,201,0.12)] shadow-soft">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-lg md:text-xl">
                      Quick Actions
                    </CardTitle>
                    <CardDescription>
                      Start your wellness journey
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-4 pt-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    variant="secondary"
                    className="group/button h-auto w-full items-center justify-start border-[rgba(216,191,227,0.18)] bg-[rgba(179,132,201,0.08)] p-4 hover:bg-[rgba(179,132,201,0.12)]"
                    onClick={handleStartTherapy}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[rgba(179,132,201,0.12)]">
                        <MessageSquare className="h-4 w-4 text-[#b384c9]" />
                      </div>
                      <div className="text-left">
                        <div className="font-display text-base font-semibold text-[#f3eefa]">
                          Open Up
                        </div>
                        <div className="text-[11px] font-normal text-[rgba(231,218,237,0.55)]">
                          Share what&apos;s on your mind.
                        </div>
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="secondary"
                    className="group/voice h-auto w-full items-center justify-start border-[rgba(216,191,227,0.18)] bg-[rgba(179,132,201,0.08)] p-4 hover:bg-[rgba(179,132,201,0.12)]"
                    onClick={handleStartVoiceTherapy}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[rgba(179,132,201,0.12)]">
                        <Mic className="h-4 w-4 text-[#b384c9]" />
                      </div>
                      <div className="text-left">
                        <div className="font-display text-base font-semibold text-[#f3eefa]">
                          Speak Freely
                        </div>
                        <div className="text-[11px] font-normal text-[rgba(231,218,237,0.55)]">
                          Share your thoughts out loud and be heard.
                        </div>
                      </div>
                    </div>
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="group/mood h-[124px] flex-col items-center justify-center border-[rgba(216,191,227,0.18)] px-4 py-3 text-center hover:border-primary/40"
                    onClick={() => setShowMoodModal(true)}
                  >
                    <div className="mb-2.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(179,132,201,0.12)]">
                      <Heart className="h-5 w-5 text-[#b384c9]" />
                    </div>
                    <div>
                      <div className="font-display text-sm font-semibold text-[#f3eefa]">
                        Track Mood
                      </div>
                      <div className="mt-0.5 text-xs font-normal text-[rgba(231,218,237,0.55)]">
                        How are you feeling?
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="group/ai h-[124px] flex-col items-center justify-center border-[rgba(216,191,227,0.18)] px-4 py-3 text-center hover:border-primary/40"
                    onClick={handleAICheckIn}
                  >
                    <div className="mb-2.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(179,132,201,0.12)]">
                      <BrainCircuit className="h-5 w-5 text-[#b384c9]" />
                    </div>
                    <div>
                      <div className="font-display text-sm font-semibold text-[#f3eefa]">
                        Check-in
                      </div>
                      <div className="mt-0.5 text-xs font-normal text-[rgba(231,218,237,0.55)]">
                        Quick wellness check
                      </div>
                    </div>
                  </Button>
                </div>

                <Button
                  asChild
                  variant="secondary"
                  className="group/wellness h-auto w-full items-center justify-between border-[rgba(216,191,227,0.22)] bg-[rgba(179,132,201,0.1)] p-4 hover:bg-[rgba(179,132,201,0.14)]"
                >
                  <Link href="/wellness-plan">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[rgba(179,132,201,0.16)]">
                        <Sparkles className="h-4 w-4 text-[#b384c9]" />
                      </div>
                      <div className="text-left">
                        <div className="font-display text-base font-semibold text-[#f3eefa]">
                          Create Your Wellness Plan
                        </div>
                        <div className="text-[11px] font-normal text-[rgba(231,218,237,0.55)]">
                          Personalized daily missions & AI coaching
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[rgba(231,218,237,0.55)] transition-transform group-hover/wellness:translate-x-1 group-hover/wellness:text-[#b384c9]" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="secondary"
                  className="group/progress h-auto w-full items-center justify-between border-[rgba(216,191,227,0.18)] p-4"
                >
                  <Link href="/progress">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[rgba(179,132,201,0.12)]">
                        <LineChart className="h-4 w-4 text-[#b384c9]" />
                      </div>
                      <div className="text-left">
                        <div className="font-display text-base font-semibold text-[#f3eefa]">
                          Weekly Progress
                        </div>
                        <div className="text-[11px] font-normal text-[rgba(231,218,237,0.55)]">
                          View your insights & trends
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[rgba(231,218,237,0.55)] transition-transform group-hover/progress:translate-x-1 group-hover/progress:text-[#b384c9]" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="group/pricing h-auto w-full items-center justify-between border-[rgba(216,191,227,0.18)] p-4"
                >
                  <Link href="/pricing">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[rgba(179,132,201,0.12)]">
                        <Heart className="h-4 w-4 text-[#b384c9]" />
                      </div>
                      <div className="text-left">
                        <div className="font-display text-base font-semibold text-[#f3eefa]">
                          Pricing & Sessions
                        </div>
                        <div className="text-[11px] font-normal text-[rgba(231,218,237,0.55)]">
                          Free AI · $10 psychologist sessions
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[rgba(231,218,237,0.55)] transition-transform group-hover/pricing:translate-x-1 group-hover/pricing:text-[#b384c9]" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Insights Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[rgba(179,132,201,0.12)]">
                    <BrainCircuit className="h-5 w-5 text-[#b384c9]" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-lg md:text-xl">Insights</CardTitle>
                    <CardDescription>
                      Personalized recommendations based on your activity patterns
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.length > 0 ? (
                    insights.map((insight, index) => (
                      <div
                        key={index}
                        className={cn(
                          "space-y-2 rounded-[16px] border border-[rgba(216,191,227,0.18)] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-card",
                          insight.priority === "high"
                            ? "bg-[rgba(179,132,201,0.08)]"
                            : insight.priority === "medium"
                              ? "bg-[rgba(179,132,201,0.06)]"
                              : "bg-white/[0.035]"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <insight.icon className="h-4 w-4 text-[#b384c9]" />
                          <p className="font-display text-sm font-semibold text-white">
                            {insight.title}
                          </p>
                        </div>
                        <p className="text-sm leading-relaxed text-[rgba(231,218,237,0.55)]">
                          {insight.description}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center text-[rgba(231,218,237,0.55)]">
                      <Activity className="mx-auto mb-3 h-8 w-8 opacity-40" />
                      <p className="text-sm leading-relaxed">
                        Complete more activities to receive personalized
                        insights
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Professional Consultation */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 md:gap-8">
            <UpcomingConsultationCard
              refreshKey={sessionsRefreshKey}
              onBook={() => setShowBookingFlow(true)}
            />
            <Card className="flex flex-col justify-center p-6 md:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[rgba(231,218,237,0.45)]">
                Human support
              </p>
              <h3 className="mt-2 font-display text-xl font-bold text-[#f3eefa]">
                AI stays free. Professionals when you need them.
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[rgba(231,218,237,0.55)]">
                Book a private 90-minute online session with a licensed
                psychologist for ${10}.
              </p>
              <Button
                asChild
                variant="outline"
                className="mt-5 w-fit rounded-xl"
              >
                <Link href="/pricing">Explore pricing</Link>
              </Button>
            </Card>
          </div>

          {/* Your Check-ins Card */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[rgba(179,132,201,0.12)]">
                    <Calendar className="h-5 w-5 text-[#b384c9]" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-lg md:text-xl">
                      Your Check-ins
                    </CardTitle>
                    <CardDescription>
                      Activities you&apos;ve logged today
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowActivityLogger(true)}
                  className="border-[rgba(216,191,227,0.18)]"
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Log Activity
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                const checkIns = todayActivities.filter(
                  (a: any) => !["game"].includes(a.type)
                );
                if (checkIns.length === 0) {
                  return (
                    <div className="rounded-[16px] border border-dashed border-[rgba(216,191,227,0.18)] bg-white/[0.03] py-12 text-center text-[rgba(231,218,237,0.55)]">
                      <Calendar className="mx-auto mb-3 h-8 w-8 opacity-40" />
                      <p className="font-display text-sm font-medium text-white">
                        No check-ins today.
                      </p>
                      <p className="mx-auto mt-1.5 max-w-sm text-sm">
                        Click &quot;Log Activity&quot; to record meditation,
                        exercise, or other wellness activities.
                      </p>
                    </div>
                  );
                }
                return (
                  <div className="space-y-3">
                    {checkIns.map((activity: any) => (
                      <div
                        key={activity._id || activity.id}
                        className="group flex items-center justify-between rounded-[16px] border border-[rgba(216,191,227,0.18)] bg-white/[0.03] p-4 transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.05] hover:shadow-card"
                      >
                        <div className="flex min-w-0 items-center gap-3.5">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[rgba(179,132,201,0.12)]">
                            <Activity className="h-4 w-4 text-[#b384c9]" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate font-display text-sm font-semibold text-white">
                                {activity.name}
                              </p>
                              <span className="badge-soft shrink-0 capitalize">
                                {activity.type}
                              </span>
                            </div>
                            {activity.description && (
                              <p className="mt-0.5 truncate text-xs text-[rgba(231,218,237,0.55)]">
                                {activity.description}
                              </p>
                            )}
                            <div className="mt-1.5 flex items-center gap-2">
                              <Clock className="h-3 w-3 text-[rgba(231,218,237,0.55)]" />
                              <span className="text-xs text-[rgba(231,218,237,0.55)]">
                                {formatDistanceToNow(
                                  new Date(activity.timestamp),
                                  { addSuffix: true }
                                )}
                              </span>
                              {activity.duration > 0 && (
                                <span className="text-xs text-[rgba(231,218,237,0.55)]">
                                  • {activity.duration} min
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 shrink-0 text-[rgba(231,218,237,0.55)] opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                          onClick={() =>
                            handleDeleteActivity(activity._id || activity.id)
                          }
                          title="Delete activity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Content Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 md:gap-8">
            <div className="space-y-6 lg:col-span-2">
              <AnxietyGames onGamePlayed={handleGamePlayed} />
            </div>
            <div className="space-y-6 lg:col-span-1">
              <DashboardMusic />
            </div>
          </div>

          <MySessions
            refreshKey={sessionsRefreshKey}
            onBook={() => setShowBookingFlow(true)}
          />
        </div>
      </Container>

      {/* Mood tracking modal */}
      <Dialog
        open={showMoodModal}
        onOpenChange={(open) => {
          setShowMoodModal(open);
          // Record the time when modal closes (whether by submit or dismiss)
          if (!open) {
            recordMoodModalOpen();
          }
        }}
      >
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>How are you feeling?</DialogTitle>
            <DialogDescription>
              Move the slider to track your current mood
            </DialogDescription>
          </DialogHeader>
          <MoodForm
            key={showMoodModal ? "open" : "closed"}
            initialMoodScore={lastMoodScore}
            onSuccess={() => {
              setShowMoodModal(false);
              loadActivities();
              fetchDailyStats();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* AI check-in chat */}
      {showCheckInChat && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm">
          <div className="fixed inset-y-0 right-0 w-full max-w-sm border-l border-[rgba(216,191,227,0.18)] bg-[#100b20]/95 shadow-premium backdrop-blur-xl">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-[rgba(216,191,227,0.18)] px-5 py-4">
                <h3 className="font-display text-base font-semibold text-white">
                  AI Check-in
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCheckInChat(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-5"></div>
            </div>
          </div>
        </div>
      )}

      <ActivityLogger
        open={showActivityLogger}
        onOpenChange={setShowActivityLogger}
        onActivityLogged={() => {
          loadActivities();
          fetchDailyStats();
        }}
      />

      <VoiceModal
        open={showVoiceModal}
        onOpenChange={setShowVoiceModal}
        sessionId={voiceSessionId}
        onMessageSent={() => {
          loadActivities();
          fetchDailyStats();
        }}
        onActivityTrigger={(type, reason) =>
          handleActivityTrigger(type as any, reason)
        }
        activityActive={!!stressPrompt}
        onSessionChange={(newId) => setVoiceSessionId(newId)}
      />

      {/* Activity Modal Overlay (shared with voice mode) */}
      {stressPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-0 backdrop-blur-sm sm:p-4">
          <div className="relative flex h-full w-full flex-col overflow-y-auto rounded-none border border-[rgba(216,191,227,0.18)] bg-[#100b20]/95 shadow-premium backdrop-blur-xl sm:h-auto sm:max-h-[90vh] sm:max-w-4xl sm:rounded-[20px]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[rgba(216,191,227,0.18)] bg-[#0c0819]/90 p-5 backdrop-blur">
              <div className="space-y-1 pr-4">
                <h3 className="font-display text-lg font-semibold text-white">
                  {stressPrompt.activity.title}
                </h3>
                <p className="text-sm text-[rgba(231,218,237,0.55)]">
                  {stressPrompt.activity.description}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 rounded-full"
                onClick={() => setStressPrompt(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 p-5 md:p-6">
              {stressPrompt.activity.type === "breathing" && <BreathingGame />}
              {stressPrompt.activity.type === "waves" && <OceanWaves />}
              {stressPrompt.activity.type === "forest" && <ForestGame />}
              {stressPrompt.activity.type === "garden" && <ZenGarden />}
            </div>
          </div>
        </div>
      )}

      <BookingFlow
        open={showBookingFlow}
        onClose={() => setShowBookingFlow(false)}
        onBooked={() => setSessionsRefreshKey((k) => k + 1)}
        defaultName={user?.name || ""}
        defaultEmail={user?.email || ""}
      />
    </div>
  );
}
