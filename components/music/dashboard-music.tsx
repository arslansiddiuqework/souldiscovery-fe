"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2, RefreshCw, WifiOff } from "lucide-react";
import {
  getRelaxationLibrary,
  type RelaxationCategoryId,
  type RelaxationTrack,
} from "@/lib/api/music";
import { useSession } from "@/lib/contexts/session-context";
import { cn } from "@/lib/utils";
import { AnimatedMusicLogo } from "./animated-music-logo";
import { RelaxationPlayer } from "./relaxation-player";

const FALLBACK_CATEGORIES: Array<{ id: RelaxationCategoryId; label: string }> = [
  { id: "rain-nature", label: "Rain & Nature" },
  { id: "calm-piano", label: "Calm Piano" },
  { id: "meditation", label: "Meditation" },
  { id: "sleep-unwind", label: "Sleep & Unwind" },
  { id: "ambient", label: "Ambient Sounds" },
];

export function DashboardMusic({ compact = false }: { compact?: boolean }) {
  const { isAuthenticated } = useSession();
  const reduceMotion = useReducedMotion();
  const [category, setCategory] =
    useState<RelaxationCategoryId>("rain-nature");
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [tracks, setTracks] = useState<RelaxationTrack[]>([]);
  const [active, setActive] = useState<RelaxationTrack | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  const load = useCallback(async (cat: RelaxationCategoryId) => {
    setLoading(true);
    setError(null);
    setOffline(typeof navigator !== "undefined" && !navigator.onLine);
    try {
      const data = await getRelaxationLibrary({
        category: cat,
        page: 1,
        pageSize: 12,
      });
      if (data.categories?.length) setCategories(data.categories);
      setTracks(data.tracks || []);
      setNotice(data.attributionNotice || null);
      if (!data.success && data.error) {
        setError(data.error);
      } else if (!data.tracks?.length) {
        setError("No licensed tracks in this category yet.");
      }
      setActive((prev) => {
        if (!data.tracks?.length) return null;
        if (prev && data.tracks.some((t) => t.id === prev.id)) return prev;
        return data.tracks[0];
      });
    } catch {
      setError("Couldn’t load music.");
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    void load(category);
  }, [category, isAuthenticated, load]);

  useEffect(() => {
    const onOffline = () => setOffline(true);
    const onOnline = () => {
      setOffline(false);
      void load(category);
    };
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, [category, load]);

  if (!isAuthenticated) {
    return (
      <div
        className={cn(
          "flex h-full min-h-0 flex-col items-center justify-center overflow-hidden rounded-[28px] bg-white/85 p-5 text-center ring-1 ring-white/80 backdrop-blur-md"
        )}
      >
        <AnimatedMusicLogo playing={false} />
        <p className="mt-3 text-[13px] font-bold text-[#49263D]">
          Sign in for music
        </p>
        <p className="mt-1 text-[12px] text-[#927C8B]">
          Relaxation library is available to signed-in members.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden",
        compact
          ? "rounded-[22px] bg-white/80 p-3 ring-1 ring-white/70 backdrop-blur-md"
          : "rounded-[28px] bg-white/85 p-4 ring-1 ring-white/80 backdrop-blur-md sm:p-5"
      )}
    >
      <div className="mb-2.5 flex shrink-0 items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#B74783]">
            Sound
          </p>
          <h3 className="mt-0.5 truncate font-display text-[15px] font-bold tracking-tight text-[#49263D] sm:text-base">
            Music for you
          </h3>
        </div>
        <button
          type="button"
          onClick={() => void load(category)}
          disabled={loading}
          aria-label="Refresh music"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4EEF3] text-[#795A70] transition hover:bg-[#FFE5F0] hover:text-[#B74783] disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <div className="mb-2.5 flex shrink-0 gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((c) => {
          const activeCat = c.id === category;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                activeCat
                  ? "bg-[#B74783] text-white"
                  : "bg-[#F4EEF3] text-[#795A70] hover:bg-[#FFE5F0]"
              )}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      <div className="mb-2.5 shrink-0">
        <RelaxationPlayer
          track={active}
          queue={tracks}
          onSelect={setActive}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5">
        {offline && (
          <div className="mb-2 flex items-center gap-2 rounded-2xl bg-[#FFF5F9] px-3 py-2 text-[11px] font-medium text-[#795A70]">
            <WifiOff className="h-3.5 w-3.5" />
            You’re offline — retry when connected.
          </div>
        )}

        {loading && tracks.length === 0 ? (
          <div className="flex h-full min-h-[100px] flex-col items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-[#B74783]" />
            <p className="text-[11px] text-[#927C8B]">Loading library…</p>
          </div>
        ) : error && tracks.length === 0 ? (
          <div className="flex h-full min-h-[100px] flex-col items-center justify-center gap-2 px-2 text-center">
            <AnimatedMusicLogo playing={false} />
            <p className="text-[12px] font-semibold text-[#49263D]">{error}</p>
            <button
              type="button"
              onClick={() => void load(category)}
              className="rounded-full bg-[#B74783] px-3 py-1.5 text-[11px] font-bold text-white"
            >
              Try again
            </button>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {tracks.map((track, i) => {
              const selected = active?.id === track.id;
              return (
                <motion.li
                  key={track.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.24) }}
                >
                  <button
                    type="button"
                    onClick={() => setActive(track)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-[16px] px-2.5 py-2 text-left transition",
                      selected
                        ? "bg-[#FFF0F6] ring-1 ring-[#F0D0E2]"
                        : "hover:bg-[#FBF7FA]"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl",
                        selected
                          ? "bg-gradient-to-br from-[#C45A92] to-[#B74783] text-white"
                          : "bg-[#F4EEF3] text-[#B74783]"
                      )}
                    >
                      {track.artworkUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={track.artworkUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <AnimatedMusicLogo
                          playing={selected}
                          className="!h-9 !w-9 !rounded-xl !shadow-none"
                        />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-bold text-[#49263D]">
                        {track.title}
                      </span>
                      <span className="block truncate text-[10px] text-[#927C8B]">
                        {track.creator}
                        {" · "}
                        {Math.round(track.duration)}s
                        {" · "}
                        {track.licence === "Creative Commons 0"
                          ? "CC0"
                          : track.licence === "Attribution"
                            ? "CC BY"
                            : track.licence}
                      </span>
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>

      {notice && (
        <p className="mt-2 shrink-0 text-[9px] leading-snug text-[#A08B9A]">
          {notice}
        </p>
      )}
    </div>
  );
}
