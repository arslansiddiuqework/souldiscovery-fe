"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/contexts/session-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Container } from "@/components/ui/container";
import {
  Camera,
  Loader2,
  User as UserIcon,
  LogOut,
  ArrowLeft,
  Key,
  Trash2,
  ShieldAlert,
  ChevronRight,
  Bot,
  Sparkles,
  Heart,
  Zap,
  Coffee,
  Play,
  Check,
  Volume2,
} from "lucide-react";
import {
  updateProfile,
  uploadAvatar,
  uploadAiAvatar,
  deleteAvatar,
  deleteAiAvatar,
} from "@/lib/api/user";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { AvatarImage } from "@/components/ui/avatar-image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  applyVoiceToUtterance,
  findSpeechVoice,
  getEnglishVoices,
  getVoiceId,
  logSpeechDiagnostic,
  warmUpSpeechSynthesis,
} from "@/lib/speechSynthesisUtils";
import { cn } from "@/lib/utils";

type ProfileTab = "profile" | "ai" | "safety";

const TABS: Array<{
  id: ProfileTab;
  label: string;
  description: string;
  icon: typeof UserIcon;
}> = [
  {
    id: "profile",
    label: "Profile",
    description: "Photo, name & email",
    icon: UserIcon,
  },
  {
    id: "ai",
    label: "AI Companion",
    description: "Name, voice & style",
    icon: Bot,
  },
  {
    id: "safety",
    label: "Safety",
    description: "Emergency contacts",
    icon: ShieldAlert,
  },
];

export default function ProfilePage() {
  const { user, checkSession, logout } = useSession();
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [aiName, setAiName] = useState("Maya");
  const [aiBehavior, setAiBehavior] = useState("supportive");
  const [aiAvatar, setAiAvatar] = useState("");
  const [aiVoice, setAiVoice] = useState("");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAiUploading, setIsAiUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAiDeleting, setIsAiDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setProfileImage(user.profileImage || "");
      setAiName(user.aiName || "Maya");
      setAiBehavior(user.aiBehavior || "supportive");
      setAiAvatar(user.aiAvatar || "");
      setAiVoice(user.aiVoice || "");
    }
  }, [user]);

  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const allVoices = getEnglishVoices();
        const seen = new Set<string>();
        const uniqueVoices = allVoices.filter((v) => {
          const id = getVoiceId(v);
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        logSpeechDiagnostic("profile-voices-loaded", {
          availableVoiceCount: uniqueVoices.length,
          selectedVoice: aiVoice || "default",
        });
        setAvailableVoices(uniqueVoices);
      }
    };

    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      warmUpSpeechSynthesis();
    }
  }, [aiVoice]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const data = await uploadAvatar(file);
      if (data.imageUrl) {
        setProfileImage(data.imageUrl);
        toast({
          title: "Success",
          description: "Avatar uploaded successfully. Don't forget to save changes.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to upload avatar. Please try again.",
      });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleAiImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAiUploading(true);
    try {
      const data = await uploadAiAvatar(file);
      if (data.imageUrl) {
        setAiAvatar(data.imageUrl);
        toast({
          title: "Success",
          description: "AI Avatar uploaded. Click 'Save Changes' to apply.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to upload AI avatar.",
      });
    } finally {
      setIsAiUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteImage = async () => {
    setIsDeleting(true);
    try {
      await deleteAvatar();
      setProfileImage("");
      await checkSession();
      toast({
        title: "Avatar Deleted",
        description: "Your profile photo has been removed.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Failed to delete avatar. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAiImage = async () => {
    setIsAiDeleting(true);
    try {
      await deleteAiAvatar();
      setAiAvatar("");
      await checkSession();
      toast({
        title: "AI Avatar Deleted",
        description: "The AI avatar has been reset to the default.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Failed to delete AI avatar. Please try again.",
      });
    } finally {
      setIsAiDeleting(false);
    }
  };

  const handleTestVoice = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      toast({
        variant: "destructive",
        title: "Not Supported",
        description: "Text-to-speech is not supported in this browser.",
      });
      return;
    }

    window.speechSynthesis.cancel();
    try {
      window.speechSynthesis.resume();
    } catch {
      /* ignore */
    }

    const text = `Hello ${name || "friend"}, my name is ${aiName}. I'm your personal mental health support companion.`;
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = findSpeechVoice(availableVoices, aiVoice);
    applyVoiceToUtterance(utterance, selectedVoice);
    logSpeechDiagnostic("profile-test-voice", {
      requestedVoice: aiVoice || "default",
      selectedName: selectedVoice?.name || null,
      selectedUri: selectedVoice ? getVoiceId(selectedVoice) : null,
      selectedLang: selectedVoice?.lang || utterance.lang,
    });

    utterance.rate = 0.88;
    utterance.pitch = 0.95;
    utterance.volume = 1;
    setIsTesting(true);

    const onTestComplete = () => {
      setIsTesting(false);
      clearInterval(iosKeepAlive);
    };

    utterance.onstart = () => {
      logSpeechDiagnostic("profile-test-start", {
        actualVoice: utterance.voice ? getVoiceId(utterance.voice) : null,
        lang: utterance.lang,
      });
    };
    utterance.onend = onTestComplete;
    utterance.onerror = (e) => {
      if (e.error !== "interrupted" && e.error !== "canceled") {
        logSpeechDiagnostic("profile-test-error", { error: e.error });
      }
      onTestComplete();
    };

    window.speechSynthesis.speak(utterance);
    const iosKeepAlive = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        try {
          window.speechSynthesis.resume();
        } catch {
          /* ignore */
        }
      } else {
        clearInterval(iosKeepAlive);
      }
    }, 5000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name,
        email,
        profileImage,
        aiName,
        aiBehavior,
        aiAvatar,
        aiVoice,
      });
      await checkSession();
      toast({
        title: "Profile Updated",
        description: "Your settings have been saved successfully.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save profile changes.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const busy =
    isSaving || isUploading || isAiUploading || isDeleting || isAiDeleting;

  return (
    <div className="page-shell relative overflow-hidden pb-10 text-[#49263D]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(183,71,131,0.16),transparent_65%)]"
      />
      <Container className="relative max-w-5xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#927C8B] transition-colors hover:text-[#49263D]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7863C6]">
            Account
          </p>
        </div>

        <form
          onSubmit={handleSave}
          className="overflow-hidden rounded-[28px] border border-[#EADCE5] bg-white/90 shadow-[0_16px_48px_rgba(123,57,98,0.08)] backdrop-blur"
        >
          <div className="border-b border-[#EADCE5] bg-gradient-to-r from-[#FFF0F7] via-white to-[#F0EAFE] px-5 py-5 sm:px-7 sm:py-6">
            <h1 className="text-2xl font-bold tracking-tight text-[#302B3D] sm:text-3xl">
              Profile Settings
            </h1>
            <p className="mt-1 text-sm text-[#716B7D]">
              Switch sections beside each other — no long scroll required.
            </p>
          </div>

          {/* Mobile horizontal tabs */}
          <div className="flex gap-2 overflow-x-auto border-b border-[#EADCE5] px-4 py-3 lg:hidden">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                    active
                      ? "bg-[#B74783] text-white shadow-[0_8px_20px_rgba(183,71,131,0.25)]"
                      : "border border-[#EADCE5] bg-white text-[#795A70] hover:bg-[#FFF0F6]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-[240px_minmax(0,1fr)]">
            {/* Desktop side nav */}
            <aside className="hidden border-r border-[#EADCE5] bg-[#FBF9FF]/80 p-4 lg:block">
              <nav className="flex flex-col gap-1.5" aria-label="Profile sections">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-2xl px-3.5 py-3 text-left transition",
                        active
                          ? "bg-white text-[#B74783] shadow-[0_8px_24px_rgba(123,57,98,0.08)] ring-1 ring-[#EADCE5]"
                          : "text-[#716B7D] hover:bg-white/80 hover:text-[#49263D]"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                          active ? "bg-[#FFF0F7] text-[#B74783]" : "bg-white text-[#927C8B]"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold">{tab.label}</span>
                        <span className="mt-0.5 block text-xs text-[#927C8B]">
                          {tab.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Content panel */}
            <div className="flex min-h-[420px] flex-col">
              <div className="flex-1 p-5 sm:p-7">
                {activeTab === "profile" && (
                  <div className="grid gap-6 md:grid-cols-[160px_minmax(0,1fr)] md:items-start md:gap-8">
                    <div className="flex flex-col items-center gap-3 md:pt-1">
                      <div className="relative">
                        <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-[#EADCE5] bg-[#FFF0F6] shadow-inner">
                          {profileImage ? (
                            <AvatarImage
                              src={profileImage}
                              alt="Profile"
                              width={112}
                              height={112}
                              className="h-full w-full object-cover"
                              onError={() => setProfileImage("")}
                            />
                          ) : (
                            <UserIcon className="h-12 w-12 text-[#927C8B]" />
                          )}
                          {(isUploading || isDeleting) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <Loader2 className="h-6 w-6 animate-spin text-[#B74783]" />
                            </div>
                          )}
                        </div>
                        <label
                          htmlFor="avatar-upload"
                          className={cn(
                            "absolute bottom-0 right-0 cursor-pointer rounded-full bg-white p-2 text-[#49263D] shadow-lg transition hover:brightness-105",
                            (isUploading || isDeleting) && "pointer-events-none opacity-60"
                          )}
                        >
                          {isUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Camera className="h-4 w-4" />
                          )}
                        </label>
                        {profileImage && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute bottom-0 left-0 h-8 w-8 rounded-full shadow-lg"
                            onClick={handleDeleteImage}
                            disabled={busy}
                            aria-label="Delete profile photo"
                          >
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <input
                          id="avatar-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isUploading || isDeleting}
                        />
                      </div>
                      <p className="text-center text-xs text-[#927C8B]">
                        Upload a photo
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h2 className="text-lg font-bold text-[#302B3D]">Personal details</h2>
                        <p className="mt-0.5 text-sm text-[#716B7D]">
                          How you appear across Soul Discovery
                        </p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="name">Display Name</Label>
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "ai" && (
                  <div className="grid gap-6 md:grid-cols-[150px_minmax(0,1fr)] md:items-start md:gap-8">
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative">
                        <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-[#EADCE5] bg-[#F0EAFE] shadow-inner">
                          {aiAvatar ? (
                            <AvatarImage
                              src={aiAvatar}
                              alt="AI Profile"
                              width={96}
                              height={96}
                              className="h-full w-full object-cover"
                              onError={() => setAiAvatar("")}
                            />
                          ) : (
                            <Bot className="h-10 w-10 text-[#7863C6]" />
                          )}
                          {(isAiUploading || isAiDeleting) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <Loader2 className="h-5 w-5 animate-spin text-[#B74783]" />
                            </div>
                          )}
                        </div>
                        <label
                          htmlFor="ai-avatar-upload"
                          className={cn(
                            "absolute bottom-0 right-0 cursor-pointer rounded-full bg-white p-1.5 text-[#49263D] shadow-md transition hover:brightness-105",
                            (isAiUploading || isAiDeleting) &&
                              "pointer-events-none opacity-60"
                          )}
                        >
                          {isAiUploading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Camera className="h-3 w-3" />
                          )}
                        </label>
                        {aiAvatar && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute bottom-0 left-0 h-7 w-7 rounded-full shadow-md"
                            onClick={handleDeleteAiImage}
                            disabled={busy}
                            aria-label="Delete AI avatar"
                          >
                            {isAiDeleting ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                        <input
                          id="ai-avatar-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleAiImageUpload}
                          disabled={isAiUploading || isAiDeleting}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-[#49263D]">AI Avatar</p>
                        <p className="text-xs text-[#927C8B]">Custom companion look</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h2 className="text-lg font-bold text-[#302B3D]">AI Companion</h2>
                        <p className="mt-0.5 text-sm text-[#716B7D]">
                          Customize how your companion looks, sounds, and responds
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="aiName">Companion Name</Label>
                          <Input
                            id="aiName"
                            value={aiName}
                            onChange={(e) => setAiName(e.target.value)}
                            placeholder="e.g. Maya"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Behavior</Label>
                          <Select value={aiBehavior} onValueChange={setAiBehavior}>
                            <SelectTrigger className="border-[#EADCE5] bg-white">
                              <SelectValue placeholder="Select behavior" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="supportive">
                                <div className="flex items-center gap-2">
                                  <Heart className="h-4 w-4 text-red-400" />
                                  <span>Supportive</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="friendly">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="h-4 w-4 text-yellow-400" />
                                  <span>Friendly</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="motivational">
                                <div className="flex items-center gap-2">
                                  <Zap className="h-4 w-4 text-blue-400" />
                                  <span>Motivational</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="calm">
                                <div className="flex items-center gap-2">
                                  <Coffee className="h-4 w-4 text-emerald-400" />
                                  <span>Calm</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Voice</Label>
                          {aiVoice && (
                            <p className="flex items-center gap-1.5 text-xs text-[#927C8B]">
                              <Check className="h-3.5 w-3.5 text-green-500" />
                              Selected:{" "}
                              <strong>
                                {findSpeechVoice(availableVoices, aiVoice)?.name || aiVoice}
                              </strong>
                            </p>
                          )}
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Select value={aiVoice} onValueChange={setAiVoice}>
                              <SelectTrigger className="flex-1 border-[#EADCE5] bg-white">
                                <SelectValue placeholder="Select a voice" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableVoices.length > 0 ? (
                                  availableVoices.map((voice) => (
                                    <SelectItem
                                      key={getVoiceId(voice)}
                                      value={getVoiceId(voice)}
                                    >
                                      <div className="flex items-center gap-2">
                                        {(aiVoice === getVoiceId(voice) ||
                                          aiVoice === voice.name ||
                                          aiVoice === voice.voiceURI) && (
                                          <Check className="h-3.5 w-3.5 shrink-0 text-[#287D58]" />
                                        )}
                                        <span className="text-[#49263D]">{voice.name}</span>
                                        <span className="text-xs text-[#795A70]">
                                          ({voice.lang})
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="default" disabled>
                                    Loading voices...
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleTestVoice}
                              disabled={isTesting}
                              className="shrink-0"
                            >
                              {isTesting ? (
                                <>
                                  <Volume2 className="mr-2 h-4 w-4 animate-pulse" />
                                  Playing...
                                </>
                              ) : (
                                <>
                                  <Play className="mr-2 h-4 w-4" />
                                  Test Voice
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "safety" && (
                  <div className="mx-auto max-w-xl space-y-5">
                    <div>
                      <h2 className="text-lg font-bold text-[#302B3D]">Safety & Emergency</h2>
                      <p className="mt-0.5 text-sm text-[#716B7D]">
                        Manage contacts, consent, and escalation preferences in one place.
                      </p>
                    </div>
                    <Link
                      href="/settings/emergency"
                      className="group flex items-center justify-between gap-4 rounded-2xl border border-[#EADCE5] bg-gradient-to-br from-[#FFF0F7] to-white p-5 transition hover:border-[#E9B7D5] hover:shadow-[0_12px_32px_rgba(183,71,131,0.1)]"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#EADCE5] bg-white text-[#B74783]">
                          <ShieldAlert className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#49263D]">Emergency settings</p>
                          <p className="mt-0.5 text-sm text-[#716B7D]">
                            Contacts, consent, and escalation preferences
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-[#927C8B] transition group-hover:translate-x-0.5 group-hover:text-[#B74783]" />
                    </Link>
                    <p className="text-xs leading-relaxed text-[#927C8B]">
                      These settings stay free and available anytime. They are separate from
                      optional psychologist consultations.
                    </p>
                  </div>
                )}
              </div>

              {/* Sticky action bar */}
              <div className="mt-auto flex flex-col gap-3 border-t border-[#EADCE5] bg-[#FBF9FF]/90 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link href="/forgot-password">
                      <Key className="mr-1.5 h-4 w-4" />
                      Reset Password
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full text-destructive hover:bg-destructive/5"
                    onClick={() => setLogoutConfirmOpen(true)}
                  >
                    <LogOut className="mr-1.5 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
                <Button
                  type="submit"
                  disabled={busy}
                  className="h-11 rounded-full bg-[#B74783] px-6 font-bold text-white shadow-[0_8px_24px_rgba(183,71,131,0.28)] hover:bg-[#9F376F]"
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save All Changes
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Container>

      <Dialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <DialogContent className="max-w-[400px] sm:rounded-[22px]">
          <DialogHeader>
            <DialogTitle>Sign out?</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out of your Soul Discovery account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLogoutConfirmOpen(false)}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isLoggingOut}
              className="bg-[#B74783] text-white hover:bg-[#9E3A70]"
              onClick={async () => {
                setIsLoggingOut(true);
                try {
                  await logout();
                  setLogoutConfirmOpen(false);
                } finally {
                  setIsLoggingOut(false);
                }
              }}
            >
              {isLoggingOut ? "Signing out…" : "Yes, sign out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
