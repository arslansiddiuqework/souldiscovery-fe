"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Send,
  Bot,
  User as UserIcon,
  Loader2,
  Sparkles,
  X,
  Trophy,
  Star,
  Clock,
  Smile,
  PlusCircle,
  MessageSquare,
  Trash2,
  Menu,
  Lock,
  Brain,
  Wind,
  Moon,
  Scale,
  ArrowUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AvatarImage } from "@/components/ui/avatar-image";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BreathingGame } from "@/components/games/breathing-game";
import { ZenGarden } from "@/components/games/zen-garden";
import { ForestGame } from "@/components/games/forest-game";
import { OceanWaves } from "@/components/games/ocean-waves";
import { RainGame } from "@/components/games/rain-game";
import { CampfireGame } from "@/components/games/campfire-game";
import { SpotifyCard } from "@/components/music/spotify-card";
import { Badge } from "@/components/ui/badge";
import {
  createChatSession,
  sendChatMessage,
  sendChatMessageStream,
  getChatHistory,
  ChatMessage,
  getAllChatSessions,
  ChatSession,
  deleteChatSession,
} from "@/lib/api/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { useSession } from "@/lib/contexts/session-context";

import { AutoMoodDetector } from "@/components/face-emotion/AutoMoodDetector";
import { trackMood } from "@/lib/api/mood";
import { Video, VideoOff } from "lucide-react";
import Link from "next/link";
import { applyChatWellnessHint } from "@/lib/api/wellness-plan";
import { suggestionFromEmotion } from "@/lib/wellness-plan/adaptive";
import { loadWellnessPlan } from "@/lib/wellness-plan/storage";

interface SuggestedQuestion {
  id: string;
  text: string;
}

interface StressPrompt {
  trigger: string;
  activity: {
    type: "breathing" | "garden" | "forest" | "waves" | "rain" | "campfire";
    title: string;
    description: string;
  };
}

interface ApiResponse {
  message: string;
  metadata: {
    technique: string;
    goal: string;
    progress: any[];
  };
}

const SUGGESTED_QUESTIONS = [
  { text: "How can I manage my anxiety better?", label: "Anxiety", icon: Brain },
  { text: "I've been feeling overwhelmed lately", label: "Overwhelm", icon: Wind },
  { text: "Can we talk about improving sleep?", label: "Sleep", icon: Moon },
  { text: "I need help with work-life balance", label: "Balance", icon: Scale },
];

// Markdown typography (the typography plugin is not enabled, so bubbles style
// their own rendered markdown).
const MARKDOWN_BASE =
  "min-w-0 break-words text-[15px] leading-[1.7] [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 " +
  "[&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 " +
  "[&_li]:my-1 [&_li]:leading-[1.7] [&_strong]:font-semibold [&_em]:italic " +
  "[&_h1]:mb-2 [&_h1]:mt-4 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold " +
  "[&_h3]:mb-1.5 [&_h3]:mt-3 [&_h3]:text-[15px] [&_h3]:font-semibold " +
  "[&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2 " +
  "[&_code]:rounded-md [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[13px] " +
  "[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:p-3 [&_pre]:text-[13px] [&_pre_code]:bg-transparent [&_pre_code]:p-0 " +
  "[&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:italic [&_hr]:my-4";

const MARKDOWN_ASSISTANT =
  "text-[#49263D] [&_a]:text-[#D9B8F5] [&_code]:bg-[#B74783]/15 [&_code]:text-[#D9B8F5] " +
  "[&_pre]:bg-white [&_blockquote]:border-[#B74783]/30 [&_blockquote]:text-[#927C8B] " +
  "[&_hr]:border-[#EADCE5]";

const MARKDOWN_USER =
  "text-[#49263D] [&_a]:text-[#49263D] [&_code]:bg-white/20 [&_code]:text-[#49263D] " +
  "[&_pre]:bg-black/20 [&_blockquote]:border-[#EADCE5] [&_blockquote]:text-[#49263D]/85 [&_hr]:border-[#EADCE5]";

const glowAnimation = {
  initial: { opacity: 0.5, scale: 1 },
  animate: {
    opacity: [0.5, 1, 0.5],
    scale: [1, 1.05, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const COMPLETION_THRESHOLD = 5;

export default function TherapyPage() {
  const { user } = useSession();
  const params = useParams();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesRef = useRef<ChatMessage[]>([]);
  const messagesSessionIdRef = useRef<string | null>(null);
  const activeSessionIdRef = useRef<string>("new");
  const optimisticSessionIdRef = useRef<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stressPrompt, setStressPrompt] = useState<StressPrompt | null>(null);
  const [showActivity, setShowActivity] = useState(false);
  const [isChatPaused, setIsChatPaused] = useState(false);
  const [showNFTCelebration, setShowNFTCelebration] = useState(false);
  const [isCompletingSession, setIsCompletingSession] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isAutoMoodEnabled, setIsAutoMoodEnabled] = useState(false);

  // SINGLE SOURCE OF TRUTH: activeSessionId state (replaces stale params.sessionId)
  const [activeSessionId, setActiveSessionId] = useState<string>("new");
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  // 1. Initial mounting check
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2a. Sync URL params to activeSessionId state (single source of truth)
  // This ensures activeSessionId stays in sync with actual URL
  useEffect(() => {
    const pathSessionId = window.location.pathname
      .replace(/^\/therapy\/?/, "")
      .split("/")[0];
    const newSessionId = pathSessionId || (params.sessionId as string);

    if (newSessionId && newSessionId !== activeSessionId) {
      setActiveSessionId(newSessionId);
    }
  }, [params.sessionId, activeSessionId]);

  // 2b. Load all chat sessions (sidebar) - Only once on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const allSessions = await getAllChatSessions();
        setSessions(allSessions);
      } catch (error) {
        console.error("Failed to load sessions:", error);
      }
    };

    if (mounted) {
      loadSessions();
    }
  }, [mounted]);

  // 3. Load chat history whenever activeSessionId changes
  // Uses activeSessionId (state) instead of sessionId (stale params)
  useEffect(() => {
    const loadHistory = async () => {
      const requestedSessionId = activeSessionId;

      if (!activeSessionId || activeSessionId === "new") {
        // If we're on "new" session, check for prefill in URL
        const searchParams = new URLSearchParams(window.location.search);
        const prefill = searchParams.get("prefill");
        if (prefill) {
          setMessage(prefill);
          // Clear query param
          window.history.replaceState(null, "", window.location.pathname);
        }

        // Clear messages when navigating back to /therapy/new from an existing chat.
        if (messagesSessionIdRef.current !== "new") {
          messagesSessionIdRef.current = "new";
          setMessages([]);
        }
        setIsLoading(false);
        return;
      }

      // Skip history load only when the current messages belong to this session.
      if (
        optimisticSessionIdRef.current === requestedSessionId ||
        messagesSessionIdRef.current === requestedSessionId &&
        messagesRef.current.length > 0
      ) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        if (messagesSessionIdRef.current !== requestedSessionId) {
          setMessages([]);
        }
        const history = await getChatHistory(requestedSessionId);

        // Do not let a stale history request overwrite a newer navigation or
        // the optimistic first exchange after /therapy/new creates a session.
        if (activeSessionIdRef.current !== requestedSessionId) {
          return;
        }

        if (
          optimisticSessionIdRef.current === requestedSessionId ||
          messagesSessionIdRef.current === requestedSessionId &&
          messagesRef.current.length > 0
        ) {
          return;
        }

        if (Array.isArray(history)) {
          const formattedHistory = history.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
          messagesSessionIdRef.current = requestedSessionId;
          setMessages(formattedHistory);
        } else {
          messagesSessionIdRef.current = requestedSessionId;
          setMessages([]);
        }
      } catch (error: any) {
        if (activeSessionIdRef.current !== requestedSessionId) {
          return;
        }

        console.error("Failed to load chat history:", error);
        const errMsg = error?.message || "";
        const content = (errMsg.includes("not found") || errMsg.includes("archived") || errMsg.includes("404"))
          ? "This chat session has been archived by the administrator and is no longer accessible."
          : "I apologize, but I'm having trouble loading the chat session.";
        messagesSessionIdRef.current = requestedSessionId;
        setMessages([
          {
            role: "assistant",
            content,
            timestamp: new Date(),
          },
        ]);
      } finally {
        if (activeSessionIdRef.current === requestedSessionId) {
          setIsLoading(false);
        }
      }
    };
    if (mounted) {
      loadHistory();
    }
  }, [activeSessionId, mounted]);

  const handleNewSession = () => {
    router.push("/therapy/new");
  };

  const handleDeleteSession = async (e: React.MouseEvent, idToDelete: string) => {
    e.stopPropagation();
    try {
      await deleteChatSession(idToDelete);

      // Update local state to remove the session instantly
      setSessions((prev) => prev.filter((s) => s.sessionId !== idToDelete));

      // If we just deleted the currently active session, navigate away
      if (activeSessionId === idToDelete) {
        router.push("/therapy/new");
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  useEffect(() => {
    if (!isTyping) {
      scrollToBottom();
    }
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentMessage = message.trim();

    // Prevent submission if conditions not met or session creation in progress
    if (!currentMessage || isTyping || isChatPaused || isSessionLocked || isCreatingSession) {
      return;
    }

    const isNewSession = activeSessionId === "new";
    let targetSessionId = activeSessionId;

    setMessage("");
    setIsThinking(true);

    try {
      const userMessage: ChatMessage = {
        role: "user",
        content: currentMessage,
        timestamp: new Date(),
      };
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      const optimisticSessionId = isNewSession ? `pending-${Date.now()}` : targetSessionId;
      const shouldAppendToCurrentMessages =
        messagesSessionIdRef.current === optimisticSessionId;
      optimisticSessionIdRef.current = optimisticSessionId;
      messagesSessionIdRef.current = optimisticSessionId;
      setMessages((prev) => {
        const nextMessages = shouldAppendToCurrentMessages ? prev : [];
        return [...nextMessages, userMessage, assistantMessage];
      });

      // Create session only if we're on "new" and not already creating
      if (isNewSession) {
        setIsCreatingSession(true);
        try {
          // 1. Create session in backend
          const newId = await createChatSession();
          targetSessionId = newId;
          messagesSessionIdRef.current = newId;
          optimisticSessionIdRef.current = newId;
          activeSessionIdRef.current = newId;

          // 2. Keep local state and the URL in sync without remounting the page.
          setActiveSessionId(newId);
          window.history.replaceState(null, "", `/therapy/${newId}`);

          // 3. Refresh sidebar in background
          getAllChatSessions().then(setSessions).catch(console.error);
        } catch (error) {
          console.error("Failed to initialize session:", error);
          setIsThinking(false);
          setIsCreatingSession(false);
          return;
        } finally {
          setIsCreatingSession(false);
        }
      }

      optimisticSessionIdRef.current = targetSessionId;
      messagesSessionIdRef.current = targetSessionId;

      // Stream the message to the correct session
      const response = await sendChatMessageStream(targetSessionId, currentMessage);
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const handleStreamLine = (line: string) => {
        if (!line.trim()) return;

        try {
          const data = JSON.parse(line);

          if (data.t === "chunk") {
            // Hide thinking, start typing
            setIsThinking(false);
            setIsTyping(true);

            // Append text chunk to the last message
            setMessages((prev) => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage?.role === "assistant") {
                newMessages[newMessages.length - 1] = {
                  ...lastMessage,
                  content: lastMessage.content + data.d,
                };
              }
              return newMessages;
            });
            scrollToBottom();
          } else if (data.t === "done") {
            // Finalize message with metadata (including Spotify recommendations)
            setMessages((prev) => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage?.role === "assistant") {
                newMessages[newMessages.length - 1] = {
                  ...lastMessage,
                  metadata: {
                    analysis: data.analysis,
                    technique: data.metadata?.technique || "supportive",
                    goal: data.metadata?.currentGoal || "Provide support",
                    progress: data.metadata?.progress,
                    emotionMeta: data.metadata?.emotionMeta,
                    spotifyRecommendations: data.metadata?.spotifyRecommendations || undefined,
                  },
                };
              }
              return newMessages;
            });

            // Auto-trigger activity modal if backend says so
            if (
              data.metadata?.emotionMeta?.suggestedActivity
            ) {
              handleActivityTrigger(
                data.metadata.emotionMeta.suggestedActivity,
                data.metadata.emotionMeta.emotion
              );
            }

            // Wellness plan adaptation hint from emotion signals
            const emotionMeta = data.metadata?.emotionMeta;
            if (emotionMeta?.emotion) {
              try {
                applyChatWellnessHint(
                  emotionMeta.emotion,
                  emotionMeta.intensity ?? 0.5
                );
              } catch {
                /* non-blocking */
              }
            }
          }
        } catch (e) {
          console.error("Error parsing NDJSON chunk:", e);
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          handleStreamLine(line);
        }
      }
      handleStreamLine(buffer);

      setIsThinking(false);
      setIsTyping(false);
      optimisticSessionIdRef.current = null;
      getAllChatSessions().then(setSessions).catch(console.error);
      scrollToBottom();
    } catch (error) {
      console.error("Error in chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
      setIsThinking(false);
      setIsTyping(false);
      optimisticSessionIdRef.current = null;
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_rgba(183,71,131,0.12),_transparent_55%)] px-6">
        <div className="flex flex-col items-center gap-6">
          <div className="relative flex h-[72px] w-[72px] items-center justify-center">
            <motion.span
              className="absolute inset-0 rounded-full bg-[#B74783]/20 blur-2xl"
              initial="initial"
              animate="animate"
              variants={glowAnimation}
            />
            <span className="absolute inset-0 rounded-full border border-[#B74783]/15" />
            <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#B74783]" />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[#EADCE5] bg-[#FFE5F0] shadow-soft">
              <Sparkles className="h-5 w-5 text-[#49263D]" />
            </div>
          </div>
          <div className="space-y-2 text-center">
            <p className="font-display text-lg font-semibold tracking-tight text-[#49263D]">
              Preparing your session
            </p>
            <p className="text-sm text-[#927C8B]">
              Setting up a calm, private space…
            </p>
            <div className="mx-auto mt-3 flex items-center justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-[#B74783]"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1, 0.85] }}
                  transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleActivityTrigger = (
    activityType: "breathing" | "ocean" | "forest" | "zen" | "rain" | "campfire",
    triggerReason: string = "support"
  ) => {
    let type: "breathing" | "garden" | "forest" | "waves" | "rain" | "campfire" = "breathing";
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
      case "rain":
        type = "rain";
        title = "Gentle Rain";
        description = "Drift into calm with the soothing sound of rainfall";
        break;
      case "campfire":
        type = "campfire";
        title = "Campfire Night";
        description = "Unwind by a crackling fire under a starry sky";
        break;
    }

    setStressPrompt({
      trigger: triggerReason,
      activity: { type, title, description },
    });
  };
  const handleSuggestedQuestion = (text: string) => {
    if (activeSessionId === "new") {
      setMessage(text);
    } else {
      router.push(`/therapy/new?prefill=${encodeURIComponent(text)}`);
    }
  };

  const handleCompleteSession = async () => {
    if (isCompletingSession) return;
    setIsCompletingSession(true);
    try {
      setShowNFTCelebration(true);
    } catch (error) {
      console.error("Error completing session:", error);
    } finally {
      setIsCompletingSession(false);
    }
  };

  const handleSessionSelect = async (selectedSessionId: string) => {
    if (selectedSessionId === activeSessionId) {
      setIsSidebarOpen(false);
      return;
    }
    setIsSidebarOpen(false);
    router.push(`/therapy/${selectedSessionId}`);
  };

  const handleAutoMoodShift = async (score: number, mood: string) => {
    try {
      // Save it silently
      await trackMood({ score, source: "camera", mood });
      
      // Inject system message to prompt AI, only if we are in an active chat
      if (activeSessionId && activeSessionId !== "new" && !isTyping && !isThinking) {
        const systemPrompt = `[SYSTEM_NOTE: The camera has auto-detected a mood shift to ${mood}. Please gently ask the user how they are feeling right now.]`;
        
        setIsThinking(true);
        
        // Optimistically add system message
        const userMessage: ChatMessage = {
          role: "user",
          content: systemPrompt,
          timestamp: new Date(),
        };
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: "",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage, assistantMessage]);
        
        // Stream the message
        const response = await sendChatMessageStream(activeSessionId, systemPrompt);
        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        const handleStreamLine = (line: string) => {
          if (!line.trim()) return;
          try {
            const data = JSON.parse(line);
            if (data.t === "chunk") {
              setIsThinking(false);
              setIsTyping(true);
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage?.role === "assistant") {
                  newMessages[newMessages.length - 1] = {
                    ...lastMessage,
                    content: lastMessage.content + data.d,
                  };
                }
                return newMessages;
              });
              scrollToBottom();
            } else if (data.t === "done") {
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage?.role === "assistant") {
                  newMessages[newMessages.length - 1] = {
                    ...lastMessage,
                    metadata: {
                      analysis: data.analysis,
                      technique: data.metadata?.technique || "supportive",
                      goal: data.metadata?.currentGoal || "Provide support",
                      progress: data.metadata?.progress,
                      emotionMeta: data.metadata?.emotionMeta,
                    },
                  };
                }
                return newMessages;
              });
            }
          } catch (e) {
            console.error(e);
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            handleStreamLine(line);
          }
        }
        handleStreamLine(buffer);
        setIsThinking(false);
        setIsTyping(false);
        scrollToBottom();
      }
    } catch (e) {
      console.error("Auto mood shift handle error:", e);
      setIsThinking(false);
      setIsTyping(false);
    }
  };

  const currentSession = sessions.find((s) => s.sessionId === activeSessionId);
  const currentTitle = currentSession?.title || "New Chat";
  const isSessionLocked = currentSession?.status === "completed" || currentSession?.status === "archived";

  return (
    <div className="relative mx-auto w-full max-w-[1440px] lg:px-6">
      <div className="mt-[72px] flex h-[calc(100dvh-72px)] lg:gap-5 lg:py-4">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar with chat history */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex w-[86%] max-w-[340px] flex-col border-r border-[#EADCE5] bg-[#080812]/95 pt-[72px] backdrop-blur-xl transition-transform duration-300 ease-out",
            "lg:relative lg:z-auto lg:w-[300px] lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:rounded-card lg:border lg:border-[#EADCE5] lg:bg-white lg:pt-0 lg:shadow-premium",
            isSidebarOpen ? "translate-x-0 shadow-premium" : "-translate-x-full"
          )}
        >
          <div className="shrink-0 border-b border-[#EADCE5] p-4">
            <div className="mb-4 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="font-display text-[15px] font-bold tracking-tight text-[#49263D]">
                  Conversations
                </h2>
                <p className="mt-0.5 text-xs text-[#927C8B]">
                  {sessions.length}{" "}
                  {sessions.length === 1 ? "session" : "sessions"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNewSession}
                  className="h-9 w-9 rounded-xl text-[#B74783] hover:bg-[#B74783]/10 hover:text-[#B74783]"
                  disabled={isLoading}
                  title="New session"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <PlusCircle className="h-5 w-5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(false)}
                  className="h-9 w-9 rounded-xl text-[#49263D]/70 lg:hidden"
                  title="Close sidebar"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <Button
              size="sm"
              className="h-11 w-full justify-start gap-2 rounded-xl px-4 shadow-soft"
              onClick={handleNewSession}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
              New chat
            </Button>
          </div>

          <div className="min-h-0 flex-1 px-2.5 py-3">
            <div className="h-full space-y-1 overflow-y-auto pr-1">
              {sessions.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#B74783]/10 text-[#B74783]">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <p className="font-display text-sm font-semibold text-[#49263D]">
                    No conversations yet
                  </p>
                  <p className="text-xs leading-relaxed text-[#927C8B]">
                    Start a new chat and it will appear here.
                  </p>
                </div>
              )}
              {sessions.map((session) => (
                <div
                  key={session.sessionId}
                  className={cn(
                    "group relative cursor-pointer overflow-hidden rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                    session.sessionId === activeSessionId
                      ? "bg-[#B74783]/15 shadow-sm ring-1 ring-[#B74783]/25"
                      : "hover:bg-white"
                  )}
                  onClick={() => handleSessionSelect(session.sessionId)}
                >
                  <div className="mb-0.5 flex min-w-0 items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                      <MessageSquare
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          session.sessionId === activeSessionId
                            ? "text-[#B74783]"
                            : "text-[#795A70]"
                        )}
                      />
                      <span
                        className={cn(
                          "truncate text-[13px] font-semibold",
                          session.sessionId === activeSessionId
                            ? "text-[#B74783]"
                            : "text-[#49263D]"
                        )}
                      >
                        {session.title || (session.messages && session.messages[0] ? session.messages[0].content.slice(0, 30) : "New Chat")}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 rounded-lg text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100 lg:opacity-0"
                      onClick={(e) => handleDeleteSession(e, session.sessionId)}
                      title="Delete session"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p className="line-clamp-1 break-words pl-[22px] text-[11px] leading-relaxed text-[#927C8B]">
                    {session.messages[session.messages.length - 1]?.content ||
                      "No messages yet"}
                  </p>
                  <div className="mt-1.5 flex min-w-0 items-center justify-between gap-2 pl-[22px]">
                    <span className="badge-soft !px-2 !py-0.5 !text-[10px]">
                      {session.messageCount || 0} msgs
                    </span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(session.updatedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main chat area */}
        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden border-y border-[#EADCE5] bg-white lg:rounded-card lg:border lg:border-[#EADCE5] lg:shadow-premium">
          {/* Soft ambient wash behind the thread */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(183,71,131,0.08),_transparent_50%)]"
          />

          {/* Chat header */}
          <div className="relative z-10 flex shrink-0 items-center justify-between gap-3 border-b border-[#EADCE5] bg-[#FFF6FA]/60 px-3 py-3.5 backdrop-blur-xl sm:px-5">
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-xl text-[#49263D] lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
                title="Open chat sessions"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="relative shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#EADCE5] bg-[#FFE5F0] shadow-soft">
                  <Bot className="h-5 w-5 text-[#49263D]" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#080812] bg-success" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-display text-[15px] font-bold tracking-tight text-[#49263D] sm:text-base">
                  {currentTitle}
                </h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#927C8B]">
                  <span className="font-medium text-[#B74783]">Online</span>
                  <span className="text-border">·</span>
                  <span>{messages.length} messages</span>
                </p>
              </div>
            </div>

            {/* Auto Mood Toggle & Detector */}
            <div className="flex shrink-0 items-center gap-2">
              {isSessionLocked && (
                <Badge
                  variant="warning"
                  className="hidden items-center gap-1 rounded-full px-2.5 py-1 text-[10px] sm:inline-flex"
                >
                  <Lock className="h-3 w-3" />
                  Locked
                </Badge>
              )}
              <Button
                variant={isAutoMoodEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setIsAutoMoodEnabled(!isAutoMoodEnabled)}
                className={cn(
                  "h-9 gap-1.5 rounded-full px-3 text-xs",
                  !isAutoMoodEnabled && "border-[#EADCE5] bg-white hover:bg-[#B74783]/10 hover:text-[#D9B8F5]"
                )}
                title="Automatically detect mood in background"
              >
                {isAutoMoodEnabled ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Auto Mood</span>
              </Button>
              <AutoMoodDetector 
                isActive={isAutoMoodEnabled && activeSessionId !== "new"} 
                intervalMinutes={1} 
                onMoodShiftDetected={handleAutoMoodShift} 
              />
            </div>
          </div>

          {messages.length === 0 ? (
            // Welcome screen with suggested questions
            <div className="relative z-[1] flex-1 overflow-y-auto">
              <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col items-center justify-center gap-10 px-4 py-10 sm:px-6 sm:py-14">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-7 flex h-[88px] w-[88px] items-center justify-center">
                    <motion.div
                      className="absolute inset-0 rounded-full bg-[#B74783]/20 blur-2xl"
                      initial="initial"
                      animate="animate"
                      variants={glowAnimation}
                    />
                    <div className="relative flex h-[68px] w-[68px] items-center justify-center rounded-[22px] border border-[#EADCE5] bg-[#FFE5F0] shadow-premium">
                      <Sparkles className="h-7 w-7 text-[#49263D]" />
                    </div>
                  </div>
                  <span className="badge-soft mb-4">
                    <Sparkles className="h-3 w-3" />
                    AI Therapist
                  </span>
                  <h1 className="font-display text-[28px] font-bold tracking-tight text-[#49263D] sm:text-[34px]">
                    How can I{" "}
                    <span className="text-gradient-brand">help</span> today?
                  </h1>
                  <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[#927C8B]">
                    Share what&apos;s on your mind, or pick a prompt to begin.
                  </p>
                </div>

                <div className="relative grid w-full gap-3 sm:grid-cols-2">
                  {SUGGESTED_QUESTIONS.map((q, index) => (
                    <motion.div
                      key={q.text}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 + 0.25 }}
                      className="relative"
                    >
                      <button
                        type="button"
                        className="group flex h-auto w-full items-start justify-start gap-3 rounded-2xl border border-[#EADCE5] bg-white p-4 text-left shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-[#B74783]/30 hover:bg-[#FFF0F6] hover:shadow-premium"
                        onClick={() => handleSuggestedQuestion(q.text)}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#B74783]/10 text-[#B74783] transition-all duration-300 group-hover:bg-white group-hover:text-[#49263D] group-hover:shadow-soft">
                          <q.icon className="h-4 w-4" />
                        </span>
                        <span className="flex min-w-0 flex-col gap-1 pt-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#B74783]">
                            {q.label}
                          </span>
                          <span className="whitespace-normal text-[14px] font-medium leading-snug text-[#49263D]">
                            {q.text}
                          </span>
                        </span>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Chat messages
            <div className="relative z-[1] flex-1 overflow-y-auto scroll-smooth">
              <div className="mx-auto max-w-3xl px-3 py-6 sm:px-6 sm:py-8">
                <AnimatePresence initial={false}>
                  {messages
                    .filter(msg => !(msg.role === "user" && msg.content.startsWith("[SYSTEM_NOTE:")))
                    .map((msg, index) => {
                    const isAssistant = msg.role === "assistant";
                    const avatarSrc = isAssistant 
                      ? user?.aiAvatar
                      : user?.profileImage;
                    const displayName = isAssistant ? (user?.aiName || "Maya") : (user?.name || "User");

                    return (
                      <motion.div
                        key={`${msg.timestamp.toISOString()}-${msg.role}-${index}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.28 }}
                        className={cn(
                          "mb-7 flex w-full",
                          isAssistant ? "justify-start" : "justify-end"
                        )}
                      >
                        <div className={cn(
                          "flex min-w-0 max-w-[92%] gap-3 sm:max-w-[78%]",
                          isAssistant ? "flex-row" : "flex-row-reverse"
                        )}>
                          {/* Avatar */}
                          <div className="mt-0.5 h-9 w-9 shrink-0">
                            {isAssistant ? (
                              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#B74783]/10 ring-2 ring-[#B74783]/15 shadow-soft">
                                {avatarSrc ? (
                                  <AvatarImage src={avatarSrc} alt={displayName} width={36} height={36} className="h-full w-full object-cover" />
                                ) : (
                                  <Bot className="h-4 w-4 text-[#B74783]" />
                                )}
                              </div>
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white text-[#49263D] shadow-soft ring-2 ring-[rgba(183,71,131,0.25)]">
                                {avatarSrc ? (
                                  <AvatarImage src={avatarSrc} alt={displayName} width={36} height={36} className="h-full w-full object-cover" />
                                ) : (
                                  <UserIcon className="h-4 w-4" />
                                )}
                              </div>
                            )}
                          </div>

                          {/* Message Bubble */}
                          <div className="flex min-w-0 w-full flex-col space-y-1.5">
                            <div
                              className={cn(
                                "min-w-0 break-words px-4 py-3.5",
                                isAssistant
                                  ? "rounded-[20px] rounded-tl-md border border-[#EADCE5] bg-[rgba(255,255,255,0.04)] text-[#49263D] shadow-card"
                                  : "rounded-[20px] rounded-tr-md border border-[#B74783]/25 bg-[rgba(183,71,131,0.15)] text-[#49263D] shadow-premium"
                              )}
                            >
                              <div
                                className={cn(
                                  MARKDOWN_BASE,
                                  isAssistant ? MARKDOWN_ASSISTANT : MARKDOWN_USER
                                )}
                              >
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                              </div>

                              {/* Emotion Suggestion UI */}
                              {isAssistant && msg.metadata?.emotionMeta?.suggestedActivity && (
                                <div className="mt-4 rounded-xl border border-[#B74783]/25 bg-[#B74783]/10 p-3.5">
                                   <p className="mb-2.5 flex items-center gap-2 text-xs font-semibold text-[#B74783]">
                                      <Sparkles className="h-3.5 w-3.5" />
                                      Try a calming exercise?
                                   </p>
                                   <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="h-9 w-full rounded-xl border-[#B74783]/30 bg-white text-xs font-semibold text-[#D9B8F5] hover:bg-[#B74783]/15 hover:text-[#D9B8F5]"
                                      onClick={() => handleActivityTrigger(msg.metadata?.emotionMeta?.suggestedActivity as any, msg.metadata?.emotionMeta?.emotion)}
                                   >
                                      Start {
                                        (msg.metadata.emotionMeta.suggestedActivity as string) === 'zen' ? 'Zen Garden' :
                                        (msg.metadata.emotionMeta.suggestedActivity as string) === 'forest' ? 'Forest Walk' :
                                        (msg.metadata.emotionMeta.suggestedActivity as string) === 'ocean' ? 'Ocean Waves' :
                                        (msg.metadata.emotionMeta.suggestedActivity as string) === 'rain' ? 'Gentle Rain' :
                                        (msg.metadata.emotionMeta.suggestedActivity as string) === 'campfire' ? 'Campfire Night' :
                                        'Breathing'
                                      }
                                   </Button>
                                </div>
                              )}

                              {/* Wellness Plan suggestion from emotion signals */}
                              {isAssistant &&
                                msg.metadata?.emotionMeta &&
                                (() => {
                                  const hasPlan = !!loadWellnessPlan()?.weeks?.length;
                                  const hint = suggestionFromEmotion(
                                    msg.metadata.emotionMeta.emotion,
                                    msg.metadata.emotionMeta.intensity ?? 0.5,
                                    hasPlan
                                  );
                                  if (!hint) return null;
                                  return (
                                    <div className="mt-3 rounded-xl border border-[#B74783]/25 bg-[#B74783]/10 p-3.5">
                                      <p className="mb-2.5 flex items-center gap-2 text-xs font-semibold text-[#B74783]">
                                        <Brain className="h-3.5 w-3.5" />
                                        Wellness Plan
                                      </p>
                                      <p className="mb-3 text-xs leading-relaxed text-[#795A70]">
                                        {hint.message}
                                      </p>
                                      <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        className="h-9 w-full rounded-xl border-[#B74783]/30 bg-white text-xs font-semibold text-[#D9B8F5] hover:bg-[#B74783]/15 hover:text-[#D9B8F5]"
                                      >
                                        <Link href="/wellness-plan">
                                          {hint.action === "create"
                                            ? "Create Wellness Plan"
                                            : "Update Wellness Plan"}
                                        </Link>
                                      </Button>
                                    </div>
                                  );
                                })()}

                              {/* Spotify Music Recommendations */}
                              {isAssistant && msg.metadata?.spotifyRecommendations && msg.metadata.spotifyRecommendations.length > 0 && (
                                <SpotifyCard 
                                  playlists={msg.metadata.spotifyRecommendations}
                                  reason={msg.metadata?.emotionMeta ? `Suggested for your ${msg.metadata.emotionMeta.emotion} mood` : undefined}
                                />
                              )}
                            </div>

                            {/* Metadata */}
                            <div className={cn(
                              "flex items-center gap-2 px-1",
                              isAssistant ? "justify-start" : "justify-end"
                            )}>
                              {isAssistant && msg.metadata?.technique && (
                                <span className="badge-soft !px-2 !py-0.5 !text-[10px]">
                                  {msg.metadata.technique}
                                </span>
                              )}
                              <span className="text-[10px] text-muted-foreground/80">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {(isThinking || isTyping) && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 flex items-start gap-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#B74783]/10 ring-2 ring-[#B74783]/15 shadow-soft">
                      {user?.aiAvatar ? (
                        <AvatarImage
                          src={user.aiAvatar}
                          alt="AI"
                          width={36}
                          height={36}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Bot className="h-4 w-4 text-[#B74783]" />
                      )}
                    </div>
                    <div className="rounded-[20px] rounded-tl-md border border-[#EADCE5] bg-[rgba(255,255,255,0.04)] px-4 py-3.5 shadow-card">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.span
                              key={i}
                              className="h-2 w-2 rounded-full bg-[#B74783]"
                              animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                              transition={{
                                duration: 0.9,
                                repeat: Infinity,
                                delay: i * 0.15,
                                ease: "easeInOut",
                              }}
                            />
                          ))}
                        </div>
                        <p className="text-xs font-medium text-[#927C8B]">
                          {user?.aiName || "Maya"} is{" "}
                          {isThinking ? "thinking" : "replying"}…
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Input area — ChatGPT/Claude-style composer */}
          <div className="relative z-10 shrink-0 border-t border-[#EADCE5] bg-gradient-to-t from-[#FFF6FA] via-[#FFF6FA]/90 to-transparent px-3 pb-4 pt-3 backdrop-blur-xl sm:px-5 sm:pb-5">
            <form
              onSubmit={handleSubmit}
              className="relative mx-auto max-w-3xl"
            >
              <div
                className={cn(
                  "group relative flex items-end gap-2 rounded-[22px] border border-[#EADCE5] bg-[#FFF0F6] p-2 pl-4 shadow-premium backdrop-blur-xl transition-all duration-200",
                  "focus-within:border-[#B74783]/50 focus-within:ring-4 focus-within:ring-[#B74783]/15",
                  (isTyping || isChatPaused || isSessionLocked) && "opacity-60"
                )}
              >
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    isSessionLocked
                      ? "This session has been completed and is locked."
                      : isChatPaused
                      ? "Complete the activity to continue..."
                      : "Message Soul Discovery…"
                  }
                  className={cn(
                    "max-h-[180px] min-h-[44px] flex-1 resize-none bg-transparent py-2.5 text-[15px] leading-relaxed text-[#49263D]",
                    "placeholder:text-[#927C8B] focus:outline-none",
                    (isTyping || isChatPaused || isSessionLocked) &&
                      "cursor-not-allowed"
                  )}
                  rows={1}
                  disabled={isTyping || isChatPaused || isSessionLocked}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="icon"
                  className={cn(
                    "mb-0.5 h-10 w-10 shrink-0 rounded-xl shadow-soft transition-all duration-200",
                    message.trim() && !isTyping && !isChatPaused && !isSessionLocked
                      ? "bg-white text-[#49263D] shadow-[rgba(255,255,255,0.7)_0px_1px_0px_0px_inset,rgba(183,71,131,0.35)_0px_10px_30px_0px] hover:brightness-105"
                      : "bg-[#B74783]/15 text-[#B74783]/50 hover:bg-[#B74783]/20",
                    (isTyping || isChatPaused || isSessionLocked || !message.trim()) &&
                      "cursor-not-allowed"
                  )}
                  disabled={isTyping || isChatPaused || isSessionLocked || !message.trim()}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                  }}
                >
                  {isTyping || isThinking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
                  )}
                </Button>
              </div>
            </form>
            <p className="mt-2.5 text-center text-[11px] text-[#927C8B]">
              <kbd className="rounded-md border border-[#EADCE5] bg-[#FFF0F6] px-1.5 py-0.5 font-sans text-[10px] text-[#49263D]/60">
                Enter
              </kbd>{" "}
              to send ·{" "}
              <kbd className="rounded-md border border-[#EADCE5] bg-[#FFF0F6] px-1.5 py-0.5 font-sans text-[10px] text-[#49263D]/60">
                Shift + Enter
              </kbd>{" "}
              for a new line
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Activity Modal Overlay */}
      {stressPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-y-auto rounded-card border border-[#EADCE5] bg-[#FFF0F6]/95 shadow-premium backdrop-blur-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#EADCE5] bg-[#FFF6FA]/80 p-4 backdrop-blur sm:p-5">
              <div>
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
                className="h-9 w-9 shrink-0 rounded-xl"
                onClick={() => setStressPrompt(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 p-4 sm:p-5">
              {stressPrompt.activity.type === "breathing" && <BreathingGame />}
              {stressPrompt.activity.type === "waves" && <OceanWaves />}
              {stressPrompt.activity.type === "forest" && <ForestGame />}
              {stressPrompt.activity.type === "garden" && <ZenGarden />}
              {stressPrompt.activity.type === "rain" && <RainGame />}
              {stressPrompt.activity.type === "campfire" && <CampfireGame />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
