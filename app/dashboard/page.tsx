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
  Sparkles,
  MessageSquare,
  BrainCircuit,
  ArrowRight,
  X,
  Loader2,
  Trash2,
  Dumbbell,
  Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PastelLandscapeBackground } from "@/components/ui/pastel-landscape-background";
import { cn } from "@/lib/utils";

import { MoodForm } from "@/components/mood/mood-form";
import { BreathingGame } from "@/components/games/breathing-game";
import { ZenGarden } from "@/components/games/zen-garden";
import { ForestGame } from "@/components/games/forest-game";
import { OceanWaves } from "@/components/games/ocean-waves";

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
import { SESSION_PRICE_USD } from "@/lib/consultation/types";
import { DashboardPlanner } from "@/components/todo/dashboard-planner";
import {
  DashboardTabs,
  type DashTabId,
} from "@/components/dashboard/dashboard-tabs";
import { YourDayPanel } from "@/components/dashboard/your-day-panel";

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
  const [dashTab, setDashTab] = useState<DashTabId>("insights");

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
      color: "text-[#B74783]",
      bgColor: "bg-[#FFE5F0]",
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
          <p className="text-sm text-[#927C8B]">
            Preparing your dashboard
          </p>
        </div>
      </div>
    );
  }

  const checkIns = todayActivities.filter(
    (a: any) => !["game"].includes(a.type)
  );
  const firstName = (user?.name || "friend").split(" ")[0];
  const hour = currentTime.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="dashboard-shell relative text-[#49263D]">
      <PastelLandscapeBackground />
      <div className="dashboard-canvas relative z-10 flex h-full min-h-0 flex-col gap-3 overflow-hidden sm:gap-3.5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-[#EADCE5]/90 bg-white/78 shadow-[0_18px_50px_rgba(123,57,98,0.1)] backdrop-blur-xl"
        >
          {/* Slim top bar — greeting + metrics + actions */}
          <header
            data-particles-mask
            className="shrink-0 border-b border-[#EADCE5]/80 bg-gradient-to-r from-[#FFF8FB] via-white/95 to-[#F8F0FF]/60 px-3 py-2.5 sm:px-4"
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-lg font-bold tracking-tight text-[#49263D] sm:text-xl">
                    {greeting},{" "}
                    <span className="text-gradient-brand">{firstName}</span>
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#B74783] ring-1 ring-[#EADCE5]">
                    <Calendar className="h-2.5 w-2.5" />
                    {currentTime.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {wellnessStats.map((stat) => (
                  <div
                    key={stat.title}
                    title={stat.description}
                    className="flex items-center gap-1.5 rounded-full bg-white/90 py-1 pl-1 pr-2.5 ring-1 ring-[#EADCE5]/90 sm:pr-3"
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full",
                        stat.bgColor
                      )}
                    >
                      <stat.icon className={cn("h-3 w-3", stat.color)} />
                    </span>
                    <span className="font-display text-[12px] font-bold tabular-nums text-[#49263D]">
                      {stat.value}
                    </span>
                    <span className="hidden text-[9px] font-semibold uppercase tracking-[0.06em] text-[#A8939E] md:inline">
                      {stat.title.split(" ")[0]}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  variant="outline"
                  onClick={() => setShowActivityLogger(true)}
                  className="h-8 rounded-full border-[#EADCE5] bg-white px-3 text-[11px] shadow-soft"
                >
                  <Activity className="mr-1.5 h-3.5 w-3.5 text-[#B74783]" />
                  Log
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={fetchDailyStats}
                  className="group h-8 w-8 rounded-full border border-[#EADCE5] bg-white text-[#B74783] shadow-soft"
                  title="Refresh"
                >
                  <Loader2 className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-180" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main workspace */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <DashboardTabs value={dashTab} onChange={setDashTab} />
            {dashTab === "todo" ? (
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-gradient-to-b from-[#F4E8FF]/35 via-[#FBF9FF] to-[#FFF0F6]/40 p-3 sm:p-4">
                <div className="mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#B74783]">
                    Daily planner
                  </p>
                  <h2 className="mt-1 font-display text-lg font-bold tracking-tight text-[#49263D] sm:text-xl">
                    Calendar & tasks
                  </h2>
                  <p className="mt-1 text-xs text-[#927C8B] sm:text-sm">
                    Pick a date, then keep a simple list just for that day.
                  </p>
                </div>
                <DashboardPlanner />
              </div>
            ) : (
          <div
            className={cn(
              "grid min-h-0 flex-1 overflow-hidden",
              dashTab === "insights"
                ? "lg:grid-cols-2"
                : "grid-cols-1"
            )}
          >
            {/* Support stage — Insights only */}
            {dashTab === "insights" && (
            <section className="relative flex min-h-0 flex-col overflow-y-auto overscroll-contain border-b border-[#EADCE5]/80 p-3 sm:p-4 lg:border-b-0 lg:border-r">
              <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(183,71,131,0.14),transparent_70%)]" />
              <div className="relative flex min-h-0 flex-1 flex-col">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#B74783]">
                  Need support
                </p>
                <h2 className="mt-1 font-display text-lg font-bold tracking-tight sm:text-xl">
                  Talk it through, your way
                </h2>
                <p className="mt-1 max-w-md text-xs leading-relaxed text-[#927C8B] sm:text-sm">
                  Chat or speak — both are free, private, and ready when you
                  are.
                </p>

                <div className="mt-3 grid w-full flex-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
                  {/* Open Up — chat */}
                  <button
                    type="button"
                    onClick={handleStartTherapy}
                    className="group relative flex min-h-[168px] flex-col overflow-hidden rounded-[22px] bg-gradient-to-b from-[#D45390] via-[#C13D86] to-[#8E4A9C] p-3.5 text-left text-white shadow-[0_14px_36px_rgba(183,71,131,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(183,71,131,0.34)] sm:min-h-0 sm:p-4"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl"
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -bottom-10 left-4 h-28 w-28 rounded-full bg-[#6B3478]/40 blur-2xl"
                    />

                    <div className="relative flex items-start justify-between gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/35">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-base ring-1 ring-white/20 transition group-hover:-translate-y-0.5">
                          💬
                        </span>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-base ring-1 ring-white/20 transition delay-75 group-hover:-translate-y-1">
                          ✨
                        </span>
                        <span className="hidden h-8 w-8 items-center justify-center rounded-full bg-white/15 text-base ring-1 ring-white/20 transition delay-100 group-hover:-translate-y-0.5 sm:flex">
                          🤍
                        </span>
                      </div>
                    </div>

                    <div aria-hidden className="relative mt-4 space-y-2">
                      <p className="max-w-[16rem] text-[11px] font-medium leading-snug text-white/80">
                        How are you feeling tonight?
                      </p>
                      <div className="ml-auto w-fit max-w-[85%] rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold leading-snug text-[#9F376F] shadow-sm">
                        A little heavy… but okay 💜
                      </div>
                      <div className="flex items-center gap-1.5 pl-1 pt-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-white/55" />
                        <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                        <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
                      </div>
                    </div>

                    <div className="relative mt-auto pt-3">
                      <p className="font-display text-lg font-bold">Open Up</p>
                      <p className="mt-0.5 text-xs text-white/75">
                        Share what&apos;s on your mind in chat
                      </p>
                      <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold ring-1 ring-white/25">
                        Begin session
                        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </button>

                  {/* Speak Freely — voice */}
                  <button
                    type="button"
                    onClick={handleStartVoiceTherapy}
                    className="group relative flex min-h-[168px] flex-col overflow-hidden rounded-[22px] border border-[#F3D5E6] bg-gradient-to-b from-white via-[#FFF8FB] to-[#F8E9F4] p-3.5 text-left shadow-[0_10px_28px_rgba(123,57,98,0.08)] transition hover:-translate-y-0.5 hover:border-[#E8A0C4] hover:shadow-card sm:min-h-0 sm:p-4"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-8 top-0 h-28 w-28 rounded-full bg-[#FFE5F0]/90 blur-2xl"
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -bottom-8 left-8 h-24 w-24 rounded-full bg-[#F3D5EE]/70 blur-2xl"
                    />

                    <div className="relative flex items-start justify-between gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFE4F0] text-[#C44B86]">
                        <Mic className="h-5 w-5" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-base shadow-sm ring-1 ring-[#F0D9E6] transition group-hover:-translate-y-0.5">
                          🎙️
                        </span>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-base shadow-sm ring-1 ring-[#F0D9E6] transition delay-75 group-hover:-translate-y-1">
                          🎧
                        </span>
                        <span className="hidden h-8 w-8 items-center justify-center rounded-full bg-white text-base shadow-sm ring-1 ring-[#F0D9E6] transition delay-100 group-hover:-translate-y-0.5 sm:flex">
                          🌙
                        </span>
                      </div>
                    </div>

                    {/* Voice waveform visual */}
                    <div
                      aria-hidden
                      className="relative mt-4 flex flex-1 items-end justify-center gap-1 px-2"
                    >
                      {[10, 18, 28, 16, 34, 22, 40, 18, 30, 14, 24, 12].map(
                        (h, i) => (
                          <span
                            key={i}
                            className="w-1.5 rounded-full bg-gradient-to-t from-[#C44B86] to-[#E7B4D4] opacity-90 transition group-hover:opacity-100"
                            style={{
                              height: `${h}px`,
                              animation: `pulse 1.4s ease-in-out ${i * 0.08}s infinite alternate`,
                            }}
                          />
                        )
                      )}
                    </div>

                    <div className="relative mt-auto pt-2">
                      <p className="font-display text-lg font-bold text-[#49263D]">
                        Speak Freely
                      </p>
                      <p className="mt-0.5 text-xs text-[#927C8B]">
                        Voice support that listens with care
                      </p>
                      <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-[#FFF0F6] px-3 py-1.5 text-[11px] font-semibold text-[#C44B86] ring-1 ring-[#F0CADA]">
                        Start speaking
                        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </button>

                  {/* Spacer — keeps room for a future third item */}
                  <div aria-hidden className="hidden sm:block" />
                </div>

                <div className="mt-3 grid w-full grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMoodModal(true)}
                    className="rounded-xl border border-[#EADCE5] bg-[#FFF8FB] px-2.5 py-2.5 text-left transition hover:border-[#B74783]/25 hover:bg-white"
                  >
                    <Heart className="h-3.5 w-3.5 text-[#B74783]" />
                    <p className="mt-1.5 text-[11px] font-bold">Track mood</p>
                  </button>
                  <button
                    type="button"
                    onClick={handleAICheckIn}
                    className="rounded-xl border border-[#EADCE5] bg-[#FFF8FB] px-2.5 py-2.5 text-left transition hover:border-[#B74783]/25 hover:bg-white"
                  >
                    <Activity className="h-3.5 w-3.5 text-[#B74783]" />
                    <p className="mt-1.5 text-[11px] font-bold">Quick check-in</p>
                  </button>
                </div>
              </div>
            </section>
            )}

            {/* Tabbed side panel */}
            <aside className="flex min-h-0 flex-col overflow-hidden bg-gradient-to-b from-[#FFF8FB]/80 to-white">
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
                {dashTab === "insights" && (
                  <div className="space-y-4">
                    <YourDayPanel />

                    <div className="space-y-2.5">
                      <div className="mb-1 flex items-center gap-2">
                        <BrainCircuit className="h-4 w-4 text-[#B74783]" />
                        <p className="text-sm font-bold text-[#49263D]">
                          Just for you today
                        </p>
                      </div>
                      {insights.length > 0 ? (
                        insights.slice(0, 4).map((insight, index) => (
                          <div
                            key={index}
                            className={cn(
                              "rounded-2xl border border-[#EADCE5] p-3.5",
                              insight.priority === "high"
                                ? "bg-[rgba(183,71,131,0.08)]"
                                : "bg-white/90"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <insight.icon className="h-3.5 w-3.5 text-[#B74783]" />
                              <p className="text-sm font-semibold">
                                {insight.title}
                              </p>
                            </div>
                            <p className="mt-1 text-xs leading-relaxed text-[#927C8B]">
                              {insight.description}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#EADCE5] bg-white/60 px-4 py-8 text-center">
                          <Activity className="mb-2 h-7 w-7 text-[#927C8B]/40" />
                          <p className="text-sm font-medium text-[#49263D]">
                            Insights will appear here
                          </p>
                          <p className="mt-1 max-w-[26ch] text-xs text-[#927C8B]">
                            Complete a few activities and we&apos;ll surface
                            gentle patterns.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {dashTab === "checkins" && (
                  <div className="space-y-2.5">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#B74783]" />
                        <p className="text-sm font-bold text-[#49263D]">
                          Today&apos;s check-ins
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowActivityLogger(true)}
                        className="text-[11px] font-bold text-[#B74783] hover:underline"
                      >
                        + Log
                      </button>
                    </div>
                    {checkIns.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[#EADCE5] bg-white/60 px-4 py-10 text-center">
                        <Calendar className="mx-auto mb-2 h-7 w-7 text-[#927C8B]/40" />
                        <p className="text-sm font-medium text-[#49263D]">
                          No check-ins yet
                        </p>
                        <p className="mx-auto mt-1 max-w-[28ch] text-xs text-[#927C8B]">
                          Log meditation, movement, or anything that supported
                          you today.
                        </p>
                      </div>
                    ) : (
                      checkIns.slice(0, 6).map((activity: any) => (
                        <div
                          key={activity._id || activity.id}
                          className="group flex items-center justify-between gap-2 rounded-2xl border border-[#EADCE5] bg-white px-3 py-2.5"
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FFE5F0]">
                              <Activity className="h-3.5 w-3.5 text-[#B74783]" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-[#49263D]">
                                {activity.name}
                              </p>
                              <p className="text-[10px] text-[#927C8B]">
                                {formatDistanceToNow(
                                  new Date(activity.timestamp),
                                  { addSuffix: true }
                                )}
                                {activity.duration > 0
                                  ? ` · ${activity.duration} min`
                                  : ""}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 text-[#927C8B] opacity-0 transition group-hover:opacity-100 hover:text-destructive"
                            onClick={() =>
                              handleDeleteActivity(activity._id || activity.id)
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {dashTab === "care" && (
                  <div className="w-full">
                    <div className="mb-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#B74783]">
                        Human support
                      </p>
                      <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-[#49263D]">
                        Care when you need it deeper
                      </h2>
                      <p className="mt-1 max-w-lg text-xs leading-relaxed text-[#927C8B] sm:text-sm">
                        AI stays free. Optional ${SESSION_PRICE_USD} · 90-min
                        psychologist sessions — private and on your schedule.
                      </p>
                    </div>
                    <div className="grid items-stretch gap-3.5 lg:grid-cols-[minmax(260px,340px)_minmax(0,1fr)]">
                      <UpcomingConsultationCard
                        compact
                        refreshKey={sessionsRefreshKey}
                        onBook={() => setShowBookingFlow(true)}
                      />
                      <MySessions
                        compact
                        refreshKey={sessionsRefreshKey}
                        onBook={() => setShowBookingFlow(true)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
            )}
          </div>
        </motion.div>
      </div>

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
          <div className="fixed inset-y-0 right-0 w-full max-w-sm border-l border-[#EADCE5] bg-[#FFF0F6]/95 shadow-premium backdrop-blur-xl">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-[#EADCE5] px-5 py-4">
                <h3 className="font-display text-base font-semibold text-[#49263D]">
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
          <div className="relative flex h-full w-full flex-col overflow-y-auto rounded-none border border-[#EADCE5] bg-[#FFF0F6]/95 shadow-premium backdrop-blur-xl sm:h-auto sm:max-h-[90vh] sm:max-w-4xl sm:rounded-[20px]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#EADCE5] bg-[#FFF6FA]/90 p-5 backdrop-blur">
              <div className="space-y-1 pr-4">
                <h3 className="font-display text-lg font-semibold text-[#49263D]">
                  {stressPrompt.activity.title}
                </h3>
                <p className="text-sm text-[#927C8B]">
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
