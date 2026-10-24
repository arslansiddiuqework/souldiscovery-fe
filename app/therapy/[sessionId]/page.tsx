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
  ArrowLeft,
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
import { PastelLandscapeBackground } from "@/components/ui/pastel-landscape-background";

interface SuggestedQuestion {
  id: string;
  text: string;
}

const SUGGESTED_QUESTIONS = [
  { text: "How can I manage my anxiety better?", label: "Anxiety", icon: Brain },
  { text: "I've been feeling overwhelmed lately", label: "Overwhelm", icon: Wind },
  { text: "Can we talk about improving sleep?", label: "Sleep", icon: Moon },
  { text: "I need help with work-life balance", label: "Balance", icon: Scale },
];

/** Chat companion brand name shown in the therapy UI. */
const COMPANION_NAME = "Soul Discovery";

function appendAssistantChunk(
  prev: ChatMessage[],
  chunk: string
): ChatMessage[] {
  const next = [...prev];
  const last = next[next.length - 1];
  if (last?.role === "assistant") {
    next[next.length - 1] = {
      ...last,
      content: last.content + chunk,
    };
    return next;
  }
  next.push({
    role: "assistant",
    content: chunk,
    timestamp: new Date(),
  });
  return next;
}

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

      const optimisticSessionId = isNewSession ? `pending-${Date.now()}` : targetSessionId;
      const shouldAppendToCurrentMessages =
        messagesSessionIdRef.current === optimisticSessionId;
      optimisticSessionIdRef.current = optimisticSessionId;
      messagesSessionIdRef.current = optimisticSessionId;
      // Only show the user bubble up front — thinking row covers the wait.
      // Adding an empty assistant bubble here caused a blank second bot.
      setMessages((prev) => {
        const nextMessages = shouldAppendToCurrentMessages ? prev : [];
        return [...nextMessages, userMessage];
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
            setIsThinking(false);
            setIsTyping(true);
            setMessages((prev) => appendAssistantChunk(prev, data.d || ""));
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
                    spotifyRecommendations:
                      data.metadata?.spotifyRecommendations || undefined,
                  },
                };
              }
              return newMessages;
            });
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
      const friendly =
        error instanceof Error && error.message
          ? error.message
          : "I apologize, but I'm having trouble connecting right now. Please try again in a moment.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: friendly,
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
      <div className="dashboard-shell relative text-[#49263D]">
        <PastelLandscapeBackground />
        <div className="dashboard-canvas relative z-10 flex h-full min-h-0 items-center justify-center">
          <div className="flex flex-col items-center gap-6 rounded-[28px] border border-[#EADCE5]/90 bg-white/78 px-10 py-12 shadow-[0_18px_50px_rgba(123,57,98,0.1)] backdrop-blur-xl">
            <div className="relative flex h-[72px] w-[72px] items-center justify-center">
              <motion.span
                className="absolute inset-0 rounded-full bg-[#B74783]/20 blur-2xl"
                initial="initial"
                animate="animate"
                variants={glowAnimation}
              />
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
            </div>
          </div>
        </div>
      </div>
    );
  }

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

        setMessages((prev) => [...prev, userMessage]);
        
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
              setMessages((prev) => appendAssistantChunk(prev, data.d || ""));
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
    <div className="dashboard-shell relative text-[#49263D]">
      <PastelLandscapeBackground />
      <div className="dashboard-canvas relative z-10 flex h-full min-h-0 gap-3 overflow-hidden sm:gap-3.5">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-[#49263D]/25 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar with chat history */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex w-[86%] max-w-[320px] flex-col border-r border-[#EADCE5]/90 bg-white/95 pt-[5.5rem] backdrop-blur-2xl transition-transform duration-300 ease-out sm:pt-24",
            "lg:relative lg:z-auto lg:w-[272px] lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:rounded-[28px] lg:border lg:border-[#EADCE5]/90 lg:bg-white/78 lg:pt-0 lg:shadow-[0_18px_50px_rgba(123,57,98,0.1)]",
            isSidebarOpen ? "translate-x-0 shadow-[0_18px_50px_rgba(123,57,98,0.18)]" : "-translate-x-full"
          )}
        >
          <div className="shrink-0 border-b border-[#EADCE5]/80 px-4 pb-4 pt-4">
            <div className="mb-4 flex items-center justify-between gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-[#B74783] ring-1 ring-[#EADCE5] transition hover:bg-[#FFF0F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
              >
                <ArrowLeft className="h-3 w-3" aria-hidden />
                Dashboard
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(false)}
                className="h-8 w-8 rounded-xl text-[#49263D]/70 lg:hidden"
                title="Close sidebar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mb-3 flex items-end justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B74783]">
                  AI Companion
                </p>
                <h2 className="font-display text-[17px] font-bold tracking-tight text-[#49263D]">
                  Conversations
                </h2>
              </div>
              <span className="shrink-0 rounded-full bg-[#FFF0F6] px-2 py-0.5 text-[10px] font-semibold text-[#795A70] ring-1 ring-[#EADCE5]">
                {sessions.length}
              </span>
            </div>
            <Button
              size="sm"
              className="h-11 w-full justify-center gap-2 rounded-2xl px-4 text-[13px] font-semibold shadow-[0_10px_28px_rgba(183,71,131,0.28)]"
              onClick={handleNewSession}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="h-4 w-4" />
              )}
              New chat
            </Button>
          </div>

          <div className="min-h-0 flex-1 px-2.5 py-3">
            <div className="h-full space-y-1 overflow-y-auto pr-1">
              {sessions.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-5 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFE5F0] to-[#F4E8FF] text-[#B74783] ring-1 ring-[#EADCE5]">
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
                    "group relative cursor-pointer overflow-hidden rounded-2xl px-3 py-2.5 text-sm transition-all duration-200",
                    session.sessionId === activeSessionId
                      ? "bg-gradient-to-r from-[#FFF0F6] to-[#F8F0FF] shadow-sm ring-1 ring-[#B74783]/20"
                      : "hover:bg-white/70"
                  )}
                  onClick={() => handleSessionSelect(session.sessionId)}
                >
                  <div className="mb-0.5 flex min-w-0 items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-xl",
                          session.sessionId === activeSessionId
                            ? "bg-[#B74783]/15 text-[#B74783]"
                            : "bg-[#FFF0F6] text-[#795A70]"
                        )}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                      </span>
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
                  <p className="line-clamp-1 break-words pl-9 text-[11px] leading-relaxed text-[#927C8B]">
                    {session.messages[session.messages.length - 1]?.content ||
                      "No messages yet"}
                  </p>
                  <div className="mt-1.5 flex min-w-0 items-center justify-between gap-2 pl-9">
                    <span className="text-[10px] font-medium text-[#B74783]/70">
                      {session.messageCount || 0} msgs
                    </span>
                    <span className="shrink-0 text-[10px] text-[#927C8B]">
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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-[#EADCE5]/90 bg-white/78 shadow-[0_18px_50px_rgba(123,57,98,0.1)] backdrop-blur-xl"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(183,71,131,0.1),_transparent_52%),radial-gradient(ellipse_at_bottom_right,_rgba(217,184,245,0.12),_transparent_45%)]"
          />

          {/* Chat header */}
          <div className="relative z-10 flex shrink-0 items-center justify-between gap-3 border-b border-[#EADCE5]/80 bg-gradient-to-r from-[#FFF8FB]/90 via-white/70 to-[#F8F0FF]/50 px-3 py-3 backdrop-blur-xl sm:px-5 sm:py-3.5">
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <Link
                href="/dashboard"
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-[#EADCE5] bg-white/90 px-2.5 text-xs font-semibold text-[#795A70] shadow-sm transition hover:border-[#E7B4D4] hover:bg-[#FFF0F6] hover:text-[#B74783] focus-visible:outline-none focus-visible:!shadow-none focus-visible:ring-2 focus-visible:ring-[#D98CB4] sm:px-3"
                title="Back to Dashboard"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                <span className="hidden sm:inline">Back</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-xl bg-white/70 text-[#49263D] ring-1 ring-[#EADCE5] lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
                title="Open chat sessions"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="relative shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFE5F0] to-[#F4E8FF] shadow-soft ring-1 ring-[#EADCE5]">
                  <Bot className="h-5 w-5 text-[#49263D]" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-success" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-display text-[15px] font-bold tracking-tight text-[#49263D] sm:text-base">
                  {currentTitle}
                </h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#927C8B]">
                  <span className="inline-flex items-center gap-1 font-medium text-[#B74783]">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Online
                  </span>
                  <span className="text-[#EADCE5]">·</span>
                  <span>{messages.length} messages</span>
                </p>
              </div>
            </div>

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
                  "h-9 gap-1.5 rounded-full px-3 text-xs font-semibold",
                  !isAutoMoodEnabled && "border-[#EADCE5] bg-white/80 hover:bg-[#FFF0F6] hover:text-[#B74783]"
                )}
                title="Automatically detect mood in background"
              >
                {isAutoMoodEnabled ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
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
            <div className="relative z-[1] flex-1 overflow-y-auto">
              <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col items-center justify-center gap-9 px-4 py-10 sm:px-6 sm:py-12">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="relative mb-6 flex h-[84px] w-[84px] items-center justify-center">
                    <motion.div
                      className="absolute inset-0 rounded-full bg-[#B74783]/22 blur-2xl"
                      initial="initial"
                      animate="animate"
                      variants={glowAnimation}
                    />
                    <div className="relative flex h-[64px] w-[64px] items-center justify-center rounded-[22px] bg-gradient-to-br from-[#FFE5F0] via-white to-[#F4E8FF] shadow-[0_14px_40px_rgba(183,71,131,0.2)] ring-1 ring-[#EADCE5]">
                      <Sparkles className="h-7 w-7 text-[#B74783]" />
                    </div>
                  </div>
                  <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#B74783] ring-1 ring-[#EADCE5]">
                    <Sparkles className="h-3 w-3" />
                    AI Therapist
                  </span>
                  <h1 className="font-display text-[30px] font-bold tracking-tight text-[#49263D] sm:text-[36px]">
                    How can I{" "}
                    <span className="text-gradient-brand">help</span> today?
                  </h1>
                  <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[#927C8B]">
                    Share what&apos;s on your mind, or pick a prompt to begin.
                  </p>
                </motion.div>

                <div className="grid w-full gap-2.5 sm:grid-cols-2">
                  {SUGGESTED_QUESTIONS.map((q, index) => (
                    <motion.button
                      key={q.text}
                      type="button"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.07 + 0.2, duration: 0.35 }}
                      className="group flex w-full items-start gap-3 rounded-[22px] border border-[#EADCE5]/90 bg-white/70 p-4 text-left shadow-[0_8px_28px_rgba(123,57,98,0.06)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#B74783]/35 hover:bg-white hover:shadow-[0_16px_40px_rgba(183,71,131,0.12)]"
                      onClick={() => handleSuggestedQuestion(q.text)}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFE5F0] to-[#F4E8FF] text-[#B74783] transition-transform duration-300 group-hover:scale-105">
                        <q.icon className="h-4 w-4" />
                      </span>
                      <span className="flex min-w-0 flex-col gap-1 pt-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#B74783]">
                          {q.label}
                        </span>
                        <span className="text-[14px] font-medium leading-snug text-[#49263D]">
                          {q.text}
                        </span>
                      </span>
                    </motion.button>
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
                    const displayName = isAssistant
                      ? COMPANION_NAME
                      : user?.name || "User";

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
                                  ? "rounded-[22px] rounded-tl-md border border-[#EADCE5]/90 bg-white/90 text-[#49263D] shadow-[0_8px_24px_rgba(123,57,98,0.06)]"
                                  : "rounded-[22px] rounded-tr-md border border-[#B74783]/20 bg-gradient-to-br from-[#FFF0F6] to-[#F8F0FF] text-[#49263D] shadow-[0_10px_28px_rgba(183,71,131,0.12)]"
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

                            </div>

                            <div
                              className={cn(
                                "flex items-center gap-2 px-1",
                                isAssistant ? "justify-start" : "justify-end"
                              )}
                            >
                              <span className="text-[10px] text-muted-foreground/80">
                                {new Date(msg.timestamp).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Only while waiting for the first token — avoids a blank bot + thinking row */}
                {isThinking && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 flex items-start gap-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#B74783]/10 ring-2 ring-[#B74783]/15 shadow-soft">
                      {user?.aiAvatar ? (
                        <AvatarImage
                          src={user.aiAvatar}
                          alt={COMPANION_NAME}
                          width={36}
                          height={36}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Bot className="h-4 w-4 text-[#B74783]" />
                      )}
                    </div>
                    <div className="rounded-[22px] rounded-tl-md border border-[#EADCE5]/90 bg-white/90 px-4 py-3.5 shadow-[0_8px_24px_rgba(123,57,98,0.06)]">
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
                          {COMPANION_NAME} is thinking…
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Composer */}
          <div className="relative z-10 shrink-0 border-t border-[#EADCE5]/80 bg-gradient-to-t from-white/90 via-white/60 to-transparent px-3 pb-3.5 pt-3 sm:px-5 sm:pb-4">
            <form onSubmit={handleSubmit} className="relative mx-auto max-w-3xl">
              <div
                className={cn(
                  "group relative flex items-end gap-2 rounded-[24px] border border-[#EADCE5]/90 bg-white/85 p-2 pl-4 shadow-[0_10px_32px_rgba(123,57,98,0.08)] backdrop-blur-xl transition-shadow duration-200 focus-within:shadow-[0_14px_40px_rgba(183,71,131,0.12)]",
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
                    "max-h-[180px] min-h-[44px] flex-1 resize-none border-0 bg-transparent py-2.5 text-[15px] leading-relaxed text-[#49263D] shadow-none outline-none ring-0",
                    "placeholder:text-[#927C8B]",
                    "focus:border-0 focus:outline-none focus:ring-0 focus:!shadow-none",
                    "focus-visible:border-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:!shadow-none",
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
                    "mb-0.5 h-10 w-10 shrink-0 rounded-2xl transition-all duration-200",
                    message.trim() && !isTyping && !isChatPaused && !isSessionLocked
                      ? "bg-[#B74783] text-white shadow-[0_8px_20px_rgba(183,71,131,0.35)] hover:bg-[#9F376F]"
                      : "bg-[#FFF0F6] text-[#B74783]/45 hover:bg-[#FFE5F0]",
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
            <p className="mt-2 text-center text-[11px] text-[#927C8B]">
              Enter to send · Shift + Enter for a new line
            </p>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
