"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Bird, CloudRain, Flame, Leaf, Waves, Wind } from "lucide-react";
import { cn } from "@/lib/utils";

const SOUNDS = [
  { id: "rain", title: "Rain", src: "/sounds/rain%20sound.mp3", art: "/calm/rain-blossom.jpg", icon: CloudRain },
  { id: "waves", title: "Ocean", src: "/sounds/waves.mp3", art: "/calm/calm-ocean.jpg", icon: Waves },
  { id: "birds", title: "Birds", src: "/sounds/birds.mp3", art: "/calm/calm-birds.jpg", icon: Bird },
  { id: "wind", title: "Wind", src: "/sounds/wind.mp3", art: "/calm/wind-grass.jpg", icon: Wind },
  { id: "leaves", title: "Leaves", src: "/sounds/leaves.mp3", art: "/calm/calm-leaves.jpg", icon: Leaf },
  { id: "fire", title: "Fire", src: "/sounds/campfire.mp3", art: "/calm/calm-fire.jpg", icon: Flame },
] as const;

type SoundId = (typeof SOUNDS)[number]["id"];

function SceneBackdrop({
  sound,
  live,
  still,
}: {
  sound: (typeof SOUNDS)[number];
  live: boolean;
  still: boolean;
}) {
  return (
    <span aria-hidden className="absolute inset-0 overflow-hidden">
      <img
        src={sound.art}
        alt=""
        draggable={false}
        className={cn(
          "h-full w-full object-cover",
          !still && sound.id === "wind" && "calm-wind-sway",
          !still && sound.id !== "wind" && (live ? "calm-scene-live" : "calm-scene")
        )}
      />
      {!still && sound.id === "wind" && <span className="calm-breeze" />}
      {!still && sound.id === "waves" && (
        <svg className="calm-waves" viewBox="0 0 120 28" preserveAspectRatio="none">
          <path
            d="M0 16 Q15 8 30 16 T60 16 T90 16 T120 16 V28 H0 Z"
            fill="rgba(255,248,251,0.38)"
          />
        </svg>
      )}
      {!still && sound.id === "leaves" && (
        <span className="calm-leaves">
          <i />
          <i />
          <i />
        </span>
      )}
      {!still && sound.id === "birds" && <span className="calm-birds" />}
      {!still && sound.id === "fire" && (
        <span className={cn("calm-glow", live && "is-live")} />
      )}
      <span className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#2A1422]/75 via-[#2A1422]/30 to-transparent" />
    </span>
  );
}

function ramp(
  audio: HTMLAudioElement,
  to: number,
  isCurrent: () => boolean,
  onDone?: () => void
) {
  const from = audio.volume;
  const start = performance.now();
  const step = (now: number) => {
    if (!isCurrent()) return;
    const t = Math.min(1, (now - start) / 280);
    audio.volume = from + (to - from) * t;
    if (t < 1) requestAnimationFrame(step);
    else onDone?.();
  };
  requestAnimationFrame(step);
}

export function SoundStudio() {
  const reduceMotion = useReducedMotion();
  const audioRef = useRef<Partial<Record<SoundId, HTMLAudioElement>>>({});
  const rampId = useRef<Partial<Record<SoundId, number>>>({});
  const [active, setActive] = useState<Partial<Record<SoundId, number>>>({});
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<SoundId | null>(null);
  mutedRef.current = muted;

  const fade = (id: SoundId, audio: HTMLAudioElement, to: number, onDone?: () => void) => {
    const token = (rampId.current[id] ?? 0) + 1;
    rampId.current[id] = token;
    ramp(audio, to, () => rampId.current[id] === token, onDone);
  };

  useEffect(() => {
    return () => {
      Object.values(audioRef.current).forEach((audio) => {
        if (!audio) return;
        audio.pause();
        audio.src = "";
      });
      audioRef.current = {};
    };
  }, []);

  const ensure = (id: SoundId, src: string) => {
    let audio = audioRef.current[id];
    if (!audio) {
      audio = new Audio(src);
      audio.loop = true;
      audio.preload = "none";
      audio.volume = 0;
      audioRef.current[id] = audio;
    }
    return audio;
  };

  const toggle = async (id: SoundId, src: string) => {
    const audio = ensure(id, src);
    if (active[id] != null) {
      fade(id, audio, 0, () => audio.pause());
      setActive((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      return;
    }
    setError(null);
    setLoading(id);
    audio.volume = 0;
    try {
      await audio.play();
      const level = 0.6;
      fade(id, audio, mutedRef.current ? 0 : level);
      setActive((current) => ({ ...current, [id]: level }));
    } catch {
      setError(`${SOUNDS.find((sound) => sound.id === id)?.title ?? "This sound"} didn’t start. Try again.`);
    } finally {
      setLoading(null);
    }
  };

  const setLevel = (id: SoundId, level: number) => {
    const audio = audioRef.current[id];
    if (!audio || active[id] == null) return;
    audio.volume = mutedRef.current ? 0 : level;
    setActive((current) => ({ ...current, [id]: level }));
  };

  const stopAll = () => {
    (Object.keys(audioRef.current) as SoundId[]).forEach((id) => {
      const audio = audioRef.current[id];
      if (!audio) return;
      fade(id, audio, 0, () => audio.pause());
    });
    setActive({});
    setMuted(false);
  };

  const toggleMute = () => {
    const next = !mutedRef.current;
    setMuted(next);
    (Object.keys(active) as SoundId[]).forEach((id) => {
      const audio = audioRef.current[id];
      if (!audio) return;
      fade(id, audio, next ? 0 : active[id] ?? 0.6);
    });
  };

  return (
    <div className="flex h-full min-h-[280px] flex-col gap-3">
      <style>{SCENE_CSS}</style>
      <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
        {SOUNDS.map((sound) => {
          const on = active[sound.id] != null;
          const Icon = sound.icon;
          return (
            <button
              key={sound.id}
              type="button"
              aria-pressed={on}
              onClick={() => void toggle(sound.id, sound.src)}
              className={cn(
                "relative flex min-h-[156px] flex-col justify-end overflow-hidden rounded-[22px] border border-white/50 p-3 text-left shadow-[0_12px_28px_rgba(73,38,61,0.12)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4] focus-visible:ring-offset-2",
                on && "ring-2 ring-[#FFF0F6]"
              )}
            >
              <SceneBackdrop sound={sound} live={on} still={!!reduceMotion} />
              <span className="relative flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-sm">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-bold text-white">{sound.title}</span>
                  <span className="block text-[11px] font-semibold text-white/85">
                    {loading === sound.id ? "Starting…" : on ? "Playing" : "Off"}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {Object.keys(active).length > 0 && (
        <div className="space-y-2">
          {SOUNDS.filter((sound) => active[sound.id] != null).map((sound) => (
            <label key={sound.id} className="flex items-center gap-3 text-xs font-semibold text-[#795A70]">
              <span className="w-14">{sound.title}</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={active[sound.id] ?? 0}
                aria-label={`${sound.title} volume`}
                onChange={(event) => setLevel(sound.id, Number(event.target.value))}
                className="h-1.5 flex-1 accent-[#B74783]"
              />
            </label>
          ))}
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-[#9B3A55]">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          aria-pressed={muted}
          onClick={toggleMute}
          className="rounded-full border border-[#EADCE5] bg-white px-4 py-2 text-sm font-semibold text-[#795A70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
        >
          {muted ? "Unmute" : "Mute"}
        </button>
        <button
          type="button"
          onClick={stopAll}
          className="rounded-full border border-[#EADCE5] bg-white px-4 py-2 text-sm font-semibold text-[#795A70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
        >
          Stop all
        </button>
      </div>
    </div>
  );
}

const SCENE_CSS = `
.calm-scene { animation: calm-drift 22s ease-in-out infinite alternate; }
.calm-scene-live { animation: calm-drift 14s ease-in-out infinite alternate; }
@keyframes calm-drift {
  from { transform: scale(1.04); }
  to { transform: scale(1.12) translate3d(-2%, -1.5%, 0); }
}
.calm-wind-sway {
  transform-origin: 50% 80%;
  animation: calm-breeze 7.5s ease-in-out infinite alternate;
}
@keyframes calm-breeze {
  from { transform: scale(1.08) translate3d(1.4%, 0, 0); }
  to { transform: scale(1.13) translate3d(-2.4%, 0.3%, 0); }
}
.calm-breeze {
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 18%, rgba(255,248,251,0.2) 46%, transparent 70%);
  mix-blend-mode: soft-light;
  animation: calm-breeze-pass 8s ease-in-out infinite alternate;
}
@keyframes calm-breeze-pass {
  from { transform: translateX(-10%); }
  to { transform: translateX(12%); }
}
.calm-waves {
  position: absolute;
  left: -20%;
  bottom: 0;
  width: 150%;
  height: 36%;
  animation: calm-slide 7s ease-in-out infinite alternate;
}
@keyframes calm-slide { to { transform: translateX(-10%); } }
.calm-leaves i {
  position: absolute;
  top: -12%;
  width: 8px;
  height: 12px;
  border-radius: 0 80% 0 80%;
  background: #F8D5E8;
  animation: calm-leaf 10s linear infinite;
}
.calm-leaves i:nth-child(1) { left: 18%; }
.calm-leaves i:nth-child(2) { left: 48%; animation-duration: 12s; animation-delay: -4s; background: #C9D7C8; }
.calm-leaves i:nth-child(3) { left: 72%; animation-duration: 9s; animation-delay: -6s; }
@keyframes calm-leaf {
  to { transform: translateY(180px) rotate(28deg); }
}
.calm-birds {
  position: absolute;
  top: 22%;
  left: -8%;
  width: 16px;
  height: 7px;
  border-top: 2px solid rgba(73,38,61,.5);
  border-radius: 50%;
  animation: calm-fly 18s linear infinite;
}
@keyframes calm-fly { to { transform: translateX(260px); } }
.calm-glow {
  position: absolute;
  left: 18%;
  right: 18%;
  bottom: 10%;
  height: 42%;
  background: radial-gradient(circle, rgba(255,176,110,.5), transparent 68%);
  animation: calm-ember 3.4s ease-in-out infinite;
}
.calm-glow.is-live { animation-duration: 2.4s; }
@keyframes calm-ember {
  50% { opacity: .55; transform: scale(1.06); }
}
@media (prefers-reduced-motion: reduce) {
  .calm-scene, .calm-scene-live, .calm-wind-sway, .calm-breeze, .calm-waves, .calm-leaves i, .calm-birds, .calm-glow {
    animation: none;
  }
}
`;
