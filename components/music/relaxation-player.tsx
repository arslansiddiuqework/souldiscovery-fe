"use client";

import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
} from "lucide-react";
import type { RelaxationTrack } from "@/lib/api/music";
import { cn } from "@/lib/utils";
import { AnimatedMusicLogo } from "./animated-music-logo";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function RelaxationPlayer({
  track,
  queue,
  onSelect,
}: {
  track: RelaxationTrack | null;
  queue: RelaxationTrack[];
  onSelect: (track: RelaxationTrack) => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [muted, setMuted] = useState(false);
  const [repeat, setRepeat] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const onTime = () => setCurrent(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onWait = () => setLoading(true);
    const onCanPlay = () => setLoading(false);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      if (audio.loop) {
        void audio.play().catch(() => undefined);
        return;
      }
      const idx = queue.findIndex((t) => t.id === track?.id);
      if (idx >= 0 && idx < queue.length - 1) {
        onSelect(queue[idx + 1]);
      } else {
        setPlaying(false);
      }
    };
    const onErr = () => {
      setLoading(false);
      setPlaying(false);
      setError("Couldn’t play this track. Try another.");
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("waiting", onWait);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onErr);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("waiting", onWait);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onErr);
      audioRef.current = null;
    };
    // queue/track identity handled in separate effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    setError(null);
    setLoading(true);
    setCurrent(0);
    audio.src = track.previewUrl;
    audio.load();
    void audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => {
        setPlaying(false);
        setLoading(false);
      });
  }, [track?.id, track?.previewUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
  }, [volume, muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = repeat;
  }, [repeat]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (audio.paused) {
      void audio.play().catch(() => setError("Playback blocked — tap again."));
    } else {
      audio.pause();
    }
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrent(value);
  };

  const idx = track ? queue.findIndex((t) => t.id === track.id) : -1;
  const goPrev = () => {
    if (idx > 0) onSelect(queue[idx - 1]);
  };
  const goNext = () => {
    if (idx >= 0 && idx < queue.length - 1) onSelect(queue[idx + 1]);
  };

  if (!track) {
    return (
      <div className="flex items-center gap-3 rounded-[18px] bg-[#FBF7FA] px-3 py-2.5">
        <AnimatedMusicLogo playing={false} />
        <p className="text-[12px] font-medium text-[#927C8B]">
          Choose a track to begin
        </p>
      </div>
    );
  }

  const remaining = Math.max(0, (duration || track.duration) - current);

  return (
    <div className="rounded-[18px] bg-[#FBF7FA] px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <AnimatedMusicLogo playing={playing && !loading} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold text-[#49263D]">
            {track.title}
          </p>
          <p className="truncate text-[11px] text-[#927C8B]">
            {track.creator}
            {track.attributionRequired ? " · Attribution required" : ""}
          </p>
        </div>
        {loading && (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#B74783]" />
        )}
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        <span className="w-8 text-[10px] font-semibold tabular-nums text-[#A08B9A]">
          {formatTime(current)}
        </span>
        <input
          type="range"
          min={0}
          max={duration || track.duration || 0}
          step={0.1}
          value={Math.min(current, duration || track.duration || 0)}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Seek"
          className="h-1.5 flex-1 cursor-pointer accent-[#B74783]"
        />
        <span className="w-8 text-right text-[10px] font-semibold tabular-nums text-[#A08B9A]">
          -{formatTime(remaining)}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goPrev}
            disabled={idx <= 0}
            aria-label="Previous"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#795A70] transition hover:bg-white disabled:opacity-35"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Pause" : "Play"}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#B74783] text-white shadow-sm"
          >
            {playing ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 translate-x-[1px]" />
            )}
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={idx < 0 || idx >= queue.length - 1}
            aria-label="Next"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#795A70] transition hover:bg-white disabled:opacity-35"
          >
            <SkipForward className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setRepeat((r) => !r)}
            aria-label="Repeat"
            aria-pressed={repeat}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition",
              repeat
                ? "bg-[#FFE5F0] text-[#B74783]"
                : "text-[#795A70] hover:bg-white"
            )}
          >
            <Repeat className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute" : "Mute"}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#795A70] hover:bg-white"
          >
            {muted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onChange={(e) => {
              setMuted(false);
              setVolume(Number(e.target.value));
            }}
            aria-label="Volume"
            className="w-16 accent-[#B74783] sm:w-20"
          />
        </div>
      </div>

      {error && (
        <p className="mt-1.5 text-[11px] font-medium text-[#B4233D]" role="alert">
          {error}
        </p>
      )}
      {track.attributionRequired && (
        <p className="mt-1.5 text-[10px] leading-snug text-[#A08B9A]">
          {track.attributionText}
          {track.pageUrl ? (
            <>
              {" · "}
              <a
                href={track.pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#B74783] underline-offset-2 hover:underline"
              >
                Source
              </a>
            </>
          ) : null}
        </p>
      )}
    </div>
  );
}
