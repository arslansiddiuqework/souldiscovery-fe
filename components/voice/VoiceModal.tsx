"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useVoiceAgent } from "@/lib/hooks/useVoiceAgent";
import { useSession } from "@/lib/contexts/session-context";
import { cn } from "@/lib/utils";
import { sendChatMessageStream, createChatSession } from "@/lib/api/chat";
import { warmUpSpeechSynthesis } from "@/lib/speechSynthesisUtils";
import {
  AlertCircle,
  Send,
  Zap,
  MessageSquarePlus,
  Loader2,
  X,
  History,
  Volume2,
  Mic,
  Settings2,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { BRAND_NAME } from "@/lib/branding";

// --- Visual Components ---

const VoiceAura = ({ state, activityActive }: { state: string; activityActive: boolean }) => {
  const isListening = state === "listening";
  const isSpeaking = state === "speaking";
  const isProcessing = state === "processing";

  return (
    <div className="relative flex h-32 w-32 items-center justify-center md:h-48 md:w-48">
      <AnimatePresence>
        {(isListening || isSpeaking || isProcessing) && (
          <>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.25, 0.8], opacity: [0, 0.45, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-[#b384c9]/25"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: [0.9, 1.55, 0.9], opacity: [0, 0.25, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute inset-0 rounded-full bg-[#b384c9]/15"
            />
          </>
        )}
      </AnimatePresence>

      <motion.div
        animate={{
          scale: isListening ? [1, 1.05, 1] : 1,
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className={cn(
          "relative z-10 flex h-24 w-24 items-center justify-center rounded-full border-4 shadow-premium transition-all duration-500 md:h-32 md:w-32",
          activityActive
            ? "border-[rgba(216,191,227,0.18)] bg-white/[0.035]"
            : isListening
              ? "bg-white border-[rgba(216,191,227,0.35)] text-[#1c1033] shadow-[rgba(179,132,201,0.35)_0px_10px_30px_0px]"
              : isSpeaking
                ? "border-[#b384c9]/20 bg-[#b384c9]/15"
                : isProcessing
                  ? "animate-pulse border-[#b384c9]/25 bg-[#b384c9]/80"
                  : "border-[rgba(216,191,227,0.18)] bg-white/[0.06]"
        )}
      >
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <Loader2 key="proc" className="h-8 w-8 animate-spin text-white md:h-10 md:w-10" />
          ) : isSpeaking ? (
            <Volume2 key="speak" className="h-8 w-8 text-[#b384c9] md:h-10 md:w-10" />
          ) : (
            <Mic
              key="mic"
              className={cn(
                "h-8 w-8 md:h-10 md:w-10",
                isListening ? "text-white" : "text-[rgba(231,218,237,0.45)]"
              )}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

interface VoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  onMessageSent?: () => void;
  onActivityTrigger?: (activityType: string, triggerReason: string) => void;
  activityActive?: boolean;
  onSessionChange?: (newSessionId: string) => void;
}

const MIN_TRANSCRIPT_LENGTH = 2;
const AUTO_RESUME_DELAY_MS = 500;

export function VoiceModal({
  open,
  onOpenChange,
  sessionId,
  onMessageSent,
  onActivityTrigger,
  activityActive = false,
  onSessionChange,
}: VoiceModalProps) {
  const { user } = useSession();
  const voice = useVoiceAgent(user?.aiVoice);
  const conversationModeRef = useRef(false);
  const autoResumeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTranscriptRef = useRef("");
  const [aiResponse, setAiResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState("");
  const [messageHistory, setMessageHistory] = useState<{ role: string; text: string }[]>([]);
  const [isConversationMode, setIsConversationMode] = useState(false);
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Store activity metadata until TTS completes
  const pendingActivityRef = useRef<{ type: string; reason: string } | null>(null);

  // Track the active session internally so New Chat can switch without closing modal
  const [currentSessionId, setCurrentSessionId] = useState(sessionId);

  // Sync from parent prop when modal opens with a new session
  useEffect(() => {
    if (open && sessionId) {
      setCurrentSessionId(sessionId);
    }

    // iOS Safari needs a user-gesture-triggered utterance before later TTS is audible.
    if (open && typeof window !== "undefined" && window.speechSynthesis) {
      try {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
          const onVoicesReady = () => {
            window.speechSynthesis.removeEventListener("voiceschanged", onVoicesReady);
            warmUpSpeechSynthesis();
          };
          window.speechSynthesis.addEventListener("voiceschanged", onVoicesReady);

          setTimeout(() => {
            window.speechSynthesis.removeEventListener("voiceschanged", onVoicesReady);
            warmUpSpeechSynthesis();
          }, 1000);
        } else {
          warmUpSpeechSynthesis();
        }
      } catch (e) {
        // ignore
      }
    }
  }, [open, sessionId]);

  // ─── Activity Pause Synchronization ───────────────────────────────────
  // When activityActive becomes true, pause voice loop.
  // When it becomes false, resume if conversation mode was active.
  const wasConversationModeBeforeActivity = useRef(false);

  useEffect(() => {
    if (!open) return;

    if (activityActive) {
      // Activity modal opened — pause everything
      wasConversationModeBeforeActivity.current = conversationModeRef.current;
      voice.stopListening();
      voice.stopSpeaking();
      if (autoResumeTimerRef.current) {
        clearTimeout(autoResumeTimerRef.current);
        autoResumeTimerRef.current = null;
      }
    } else {
      // Activity modal closed — resume if conversation mode was active before
      if (wasConversationModeBeforeActivity.current && conversationModeRef.current) {
        autoResumeTimerRef.current = setTimeout(() => {
          // Resume Guard Protection
          if (
            open &&
            conversationModeRef.current &&
            !activityActive &&
            !isStreaming &&
            voice.state !== "error"
          ) {
            voice.startListening();
          }
        }, 500); // 500ms delay for DOM stabilization and focus restoration
      }
    }
  }, [activityActive, open, isStreaming, voice.state]);

  // ─── Send Message ─────────────────────────────────────────────────────
  const sendMessage = async (userMessage: string) => {
    const messageText = userMessage.trim();
    if (!messageText || isStreaming) return;

    // Add to history
    setMessageHistory((prev) => [...prev, { role: "user", text: messageText }]);

    // Clear for next input
    voice.cancel();
    setAiResponse("");
    setStreamError("");
    lastTranscriptRef.current = "";

    // Send to chat API
    setIsStreaming(true);

    try {
      const response = await sendChatMessageStream(currentSessionId, messageText);
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines[lines.length - 1];

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i];
          if (!line.trim()) continue;

          try {
            const data = JSON.parse(line);

            if (data.t === "chunk") {
              fullText += data.d;
              setAiResponse(fullText);
            } else if (data.t === "done") {
              // ── Activity trigger detection (same as text chat) ──
              if (
                data.metadata?.emotionMeta?.suggestedActivity &&
                onActivityTrigger
              ) {
                // Store pending activity until TTS finishes
                pendingActivityRef.current = {
                  type: data.metadata.emotionMeta.suggestedActivity,
                  reason: data.metadata.emotionMeta.emotion
                };
              }
            }
          } catch (e) {
            console.error("Error parsing response:", e);
          }
        }
      }

      // Add to history and play TTS
      setMessageHistory((prev) => [...prev, { role: "assistant", text: fullText }]);

      if (fullText.trim() && !activityActive) {
        // Stop listening before TTS to prevent AI voice capture
        voice.stopListening();

        voice.speak(fullText, () => {
          // Reset state after speaking
          setAiResponse("");

          // Trigger activity if pending
          if (pendingActivityRef.current && onActivityTrigger) {
            const { type, reason } = pendingActivityRef.current;

            // Stop voice before opening activity
            voice.stopListening();
            voice.stopSpeaking();
            if (autoResumeTimerRef.current) {
              clearTimeout(autoResumeTimerRef.current);
              autoResumeTimerRef.current = null;
            }

            onActivityTrigger(type, reason);
            pendingActivityRef.current = null;
          } else {
            // Resume listening after TTS finishes (if conversation still active, modal open, no activity)
            if (conversationModeRef.current && open && !activityActive) {
              if (autoResumeTimerRef.current) clearTimeout(autoResumeTimerRef.current);
              autoResumeTimerRef.current = setTimeout(() => {
                if (conversationModeRef.current && open && !isStreaming && !activityActive && voice.state !== "error") {
                  voice.startListening();
                }
              }, AUTO_RESUME_DELAY_MS);
            }
          }
        });
      } else {
        // Fallback: trigger immediately if no text generated or TTS disabled
        if (pendingActivityRef.current && onActivityTrigger) {
          const { type, reason } = pendingActivityRef.current;

          voice.stopListening();
          voice.stopSpeaking();
          if (autoResumeTimerRef.current) {
            clearTimeout(autoResumeTimerRef.current);
            autoResumeTimerRef.current = null;
          }

          onActivityTrigger(type, reason);
          pendingActivityRef.current = null;
        }
      }

      onMessageSent?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send message";
      setStreamError(errorMessage);
      console.error("Error sending voice message:", err);

      // Resume listening on error if in conversation mode
      if (conversationModeRef.current && open && !activityActive) {
        if (autoResumeTimerRef.current) clearTimeout(autoResumeTimerRef.current);
        autoResumeTimerRef.current = setTimeout(() => {
          if (conversationModeRef.current && open && voice.state === "idle") {
            voice.startListening();
          }
        }, AUTO_RESUME_DELAY_MS);
      }
    } finally {
      setIsStreaming(false);
    }
  };

  // ─── Handlers ─────────────────────────────────────────────────────────
  const handleMicClick = () => {
    warmUpSpeechSynthesis(true);

    if (voice.state === "listening") {
      voice.stopListening();
    } else if (voice.state === "idle" && !isStreaming && !activityActive) {
      voice.startListening();
    }
  };

  const handleToggleConversationMode = () => {
    warmUpSpeechSynthesis(true);

    const newMode = !isConversationMode;
    conversationModeRef.current = newMode;
    setIsConversationMode(newMode);

    if (newMode && voice.state === "idle" && !isStreaming && !activityActive) {
      voice.startListening();
    } else if (!newMode) {
      voice.stopListening();
      if (autoResumeTimerRef.current) clearTimeout(autoResumeTimerRef.current);
    }
  };

  const handleManualSend = async () => {
    warmUpSpeechSynthesis(true);

    const transcript = voice.getTranscript();
    if (transcript.trim()) {
      await sendMessage(transcript);
    }
  };

  const clearAllLocalState = () => {
    conversationModeRef.current = false;
    wasConversationModeBeforeActivity.current = false;
    if (autoResumeTimerRef.current) {
      clearTimeout(autoResumeTimerRef.current);
      autoResumeTimerRef.current = null;
    }
    lastTranscriptRef.current = "";
    pendingActivityRef.current = null;
    setAiResponse("");
    setIsStreaming(false);
    setStreamError("");
    setMessageHistory([]);
    setIsConversationMode(false);
    setIsCreatingNewChat(false);
  };

  const handleClose = () => {
    clearAllLocalState();
    voice.resetVoiceSession();
    onOpenChange(false);
  };

  // ─── New Chat ─────────────────────────────────────────────────────────
  const handleNewChat = async () => {
    if (isCreatingNewChat) return;

    warmUpSpeechSynthesis(true);
    setIsCreatingNewChat(true);

    try {
      // 1. Stop all voice activity
      voice.stopListening();
      voice.stopSpeaking();
      if (autoResumeTimerRef.current) {
        clearTimeout(autoResumeTimerRef.current);
        autoResumeTimerRef.current = null;
      }

      // 2. Clear conversation state
      lastTranscriptRef.current = "";
      setAiResponse("");
      setStreamError("");
      setMessageHistory([]);
      voice.cancel();

      // 3. Create new session via existing API
      const newSessionId = await createChatSession();
      setCurrentSessionId(newSessionId);

      // 4. Notify parent
      onSessionChange?.(newSessionId);

      // 5. Resume hands-free if conversation mode was active
      if (conversationModeRef.current) {
        autoResumeTimerRef.current = setTimeout(() => {
          if (conversationModeRef.current && open) {
            voice.startListening();
          }
        }, AUTO_RESUME_DELAY_MS);
      }
    } catch (err) {
      console.error("Error creating new chat:", err);
      setStreamError("Failed to create new chat. Please try again.");
    } finally {
      setIsCreatingNewChat(false);
    }
  };

  // ─── Auto-send Effect ─────────────────────────────────────────────────
  useEffect(() => {
    if (!open || !conversationModeRef.current || isStreaming || activityActive) return;

    const currentTranscript = voice.getTranscript();

    if (
      voice.isFinal &&
      currentTranscript.trim().length >= MIN_TRANSCRIPT_LENGTH &&
      currentTranscript !== lastTranscriptRef.current
    ) {
      lastTranscriptRef.current = currentTranscript;
      sendMessage(currentTranscript);
    }
  }, [voice.transcript, voice.isFinal, isStreaming, open, activityActive]);

  // ─── Cleanup on unmount ───────────────────────────────────────────────
  useEffect(() => {
    return () => {
      conversationModeRef.current = false;
      if (autoResumeTimerRef.current) clearTimeout(autoResumeTimerRef.current);
      voice.resetVoiceSession();
    };
  }, []);

  // ─── Unsupported Browser ─────────────────────────────────────────────
  if (!voice.isSupported()) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="rounded-card sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-display text-white">Voice Not Supported</DialogTitle>
            <DialogDescription>
              Your browser doesn&apos;t support voice conversations
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Voice works best on Chrome, Edge, or Chromium-based browsers. Please use the text chat instead.
            </AlertDescription>
          </Alert>
          <Button onClick={() => onOpenChange(false)} className="w-full rounded-xl">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <Dialog
      open={open}
      modal={!activityActive}
      onOpenChange={(isOpen) => {
        if (activityActive) return;
        handleClose();
      }}
    >
      <DialogContent
        className={cn(
          "flex h-[95vh] w-full flex-col overflow-hidden rounded-none border-[rgba(216,191,227,0.18)] bg-[#100b20]/95 p-0 shadow-premium transition-all duration-300 sm:max-w-[850px] sm:w-[95vw] sm:rounded-card md:h-[600px]",
          activityActive ? "pointer-events-none scale-[0.98] opacity-50" : ""
        )}
        overlayClassName={cn(activityActive && "pointer-events-none")}
        onInteractOutside={(e) => { if (activityActive) e.preventDefault(); }}
        onEscapeKeyDown={(e) => { if (activityActive) e.preventDefault(); }}
      >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-[rgba(216,191,227,0.18)] bg-[#0c0819]/70 p-4 backdrop-blur-xl md:p-5">
            <div className="flex items-center gap-3">
              <BrandLogo variant="icon" size={44} />
              <div className="flex flex-col gap-0.5">
                <span className="font-display text-lg font-semibold leading-none text-white">
                  {BRAND_NAME}
                </span>
                <span className="text-[11px] text-[rgba(231,218,237,0.55)]">
                  Voice companion
                </span>
              </div>
            </div>
            <span className="badge-soft hidden sm:inline-flex">
              <Zap className="h-3 w-3" />
              Live voice
            </span>
          </div>

          <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
            {/* Main Interaction Side */}
            <div className="flex h-[45%] flex-[1.1] shrink-0 flex-col items-center justify-between overflow-hidden border-b border-[rgba(216,191,227,0.18)] p-4 md:h-full md:shrink md:border-b-0 md:border-r md:p-8">
              <div className="flex flex-1 items-center justify-center">
                <button
                  onPointerDown={() => warmUpSpeechSynthesis(true)}
                  onClick={handleMicClick}
                  disabled={isStreaming || isConversationMode || activityActive}
                  className="cursor-pointer outline-none transition-transform active:scale-95 focus:ring-0"
                >
                  <VoiceAura state={voice.state} activityActive={activityActive} />
                </button>
              </div>

              <div className="flex h-24 w-full max-w-sm shrink-0 flex-col items-center justify-start overflow-y-auto px-2 text-center scrollbar-sleek md:h-48 md:shrink">
                <AnimatePresence mode="wait">
                  {isStreaming || aiResponse ? (
                    <motion.div
                      key="ai"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-1.5 py-2"
                    >
                      <p className="sticky top-0 bg-[#0c0819]/80 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#b384c9] backdrop-blur-sm">
                        Soul Discovery speaking
                      </p>
                      <p className="text-base font-medium leading-snug text-white md:text-lg">
                        {aiResponse || "Processing…"}
                      </p>
                    </motion.div>
                  ) : voice.transcript ? (
                    <motion.div
                      key="user"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-1.5 py-2"
                    >
                      <p className="sticky top-0 bg-[#0c0819]/80 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[rgba(231,218,237,0.55)] backdrop-blur-sm">
                        You said
                      </p>
                      <p className="text-base font-medium italic leading-snug text-white md:text-lg">
                        &ldquo;{voice.transcript}&rdquo;
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div key="idle" className="py-8 text-[rgba(231,218,237,0.55)]">
                      {activityActive ? (
                        <p className="text-base font-medium opacity-60">Activity in progress…</p>
                      ) : isConversationMode ? (
                        <p className="flex items-center justify-center gap-2 text-base font-medium text-[#b384c9]">
                          <Zap className="h-4 w-4 fill-current" />
                          Hands-free active
                        </p>
                      ) : (
                        <p className="text-base font-medium">Tap the mic to begin</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* History Side */}
            <div className="flex h-[55%] flex-1 flex-col overflow-hidden bg-white/[0.02] md:h-full">
              <div className="flex shrink-0 items-center gap-2 border-b border-[rgba(216,191,227,0.18)] bg-white/[0.035] p-4">
                <History className="h-4 w-4 text-[#b384c9]" />
                <h3 className="font-display text-[12px] font-bold tracking-[0.12em] text-white">
                  Conversation
                </h3>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-sleek">
                {messageHistory.length > 0 ? (
                  messageHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex flex-col gap-1",
                        msg.role === "user" ? "items-end" : "items-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed shadow-card",
                          msg.role === "user"
                            ? "rounded-[16px] rounded-tr-md border border-[#b384c9]/25 bg-[rgba(179,132,201,0.15)] text-white"
                            : "rounded-[16px] rounded-tl-md border border-[rgba(216,191,227,0.18)] bg-[rgba(255,255,255,0.04)] text-white"
                        )}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-full flex-col items-center justify-center space-y-3 p-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#b384c9]/10 text-[#b384c9]">
                      <MessageSquarePlus className="h-5 w-5" />
                    </div>
                    <p className="font-display text-sm font-semibold text-white">
                      No history yet
                    </p>
                    <p className="text-xs text-[rgba(231,218,237,0.55)]">
                      Your voice exchange will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Control Bar */}
          <div className="shrink-0 border-t border-[rgba(216,191,227,0.18)] bg-[#0c0819]/70 p-4 backdrop-blur-xl md:p-5">
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
              <Button
                variant={isConversationMode ? "default" : "outline"}
                size="sm"
                className={cn(
                  "rounded-full px-4 text-xs transition-all md:h-11 md:px-8 md:text-sm",
                  isConversationMode
                    ? "shadow-soft"
                    : "border-[rgba(216,191,227,0.18)] hover:border-[#b384c9]/30 hover:bg-[#b384c9]/10 hover:text-[#d8bfe3]"
                )}
                onClick={handleToggleConversationMode}
                onPointerDown={() => warmUpSpeechSynthesis(true)}
                disabled={activityActive}
              >
                <Zap className={cn("mr-1.5 h-3 w-3 md:mr-2 md:h-4 md:w-4", isConversationMode && "fill-current")} />
                {isConversationMode ? "Hands-Free On" : "Hands-Free Mode"}
              </Button>

              {!isConversationMode && voice.transcript && (
                <Button
                  onClick={handleManualSend}
                  onPointerDown={() => warmUpSpeechSynthesis(true)}
                  disabled={isStreaming || activityActive}
                  size="sm"
                  className="rounded-full px-4 text-xs shadow-soft md:h-11 md:px-8 md:text-sm"
                >
                  <Send className="mr-1.5 h-3 w-3 md:mr-2 md:h-4 md:w-4" />
                  Send
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleNewChat}
                onPointerDown={() => warmUpSpeechSynthesis(true)}
                disabled={isCreatingNewChat || activityActive}
                className="rounded-full border-[rgba(216,191,227,0.18)] px-4 text-xs hover:border-[#b384c9]/30 hover:bg-[#b384c9]/10 hover:text-[#d8bfe3] md:h-11 md:px-8 md:text-sm"
              >
                {isCreatingNewChat ? (
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin md:mr-2 md:h-4 md:w-4" />
                ) : (
                  <MessageSquarePlus className="mr-1.5 h-3 w-3 md:mr-2 md:h-4 md:w-4" />
                )}
                New Chat
              </Button>
            </div>
          </div>

        {/* Error Display Overlay */}
        {(voice.error || streamError) && (
          <div className="absolute left-1/2 top-20 z-50 w-[90%] max-w-md -translate-x-1/2">
            <Alert variant="destructive" className="rounded-card border-2 shadow-premium">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{voice.error || streamError}</AlertDescription>
            </Alert>
          </div>
        )}
      </DialogContent>
      <style jsx global>{`
        .scrollbar-sleek::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-sleek::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-sleek::-webkit-scrollbar-thumb {
          background: rgba(103, 61, 230, 0.15);
          border-radius: 10px;
        }
        .scrollbar-sleek::-webkit-scrollbar-thumb:hover {
          background: rgba(103, 61, 230, 0.3);
        }
      `}</style>
    </Dialog>
  );
}
