"use client";

import { useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  CloudRain,
  Flame,
  Flower2,
  Paintbrush,
  Palette,
  PersonStanding,
  Sparkles,
  Star,
  TreePine,
  Volume2,
  Waves,
  Wind,
} from "lucide-react";
import { CampfireGame } from "@/components/games/campfire-game";
import { ForestGame } from "@/components/games/forest-game";
import { OceanWaves } from "@/components/games/ocean-waves";
import { RainGame } from "@/components/games/rain-game";
import { ZenGarden } from "@/components/games/zen-garden";
import { cn } from "@/lib/utils";
import { BreatheOrb } from "./calm/breathe-orb";
import { ColorSketch } from "./calm/color-sketch";
import { FidgetPlayground } from "./calm/fidget-playground";
import { SoundStudio } from "./calm/sound-studio";
import { StarSky } from "./calm/star-sky";
import { ZenCanvas } from "./calm/zen-canvas";
import { YogaExperience } from "./calm/yoga/yoga-experience";

type ExperienceId =
  | "breathe"
  | "play"
  | "listen"
  | "create"
  | "garden"
  | "stars"
  | "color"
  | "yoga"
  | "forest"
  | "ocean"
  | "rain"
  | "fire";

const TILES: Array<{
  id: ExperienceId;
  title: string;
  hint: string;
  icon: typeof Wind;
  tone: string;
  featured?: boolean;
}> = [
  {
    id: "breathe",
    title: "Breathe",
    hint: "Living orb",
    icon: Wind,
    tone: "from-[#FFF0F6] via-[#FCE4EF] to-[#F3D0E4]",
    featured: true,
  },
  {
    id: "play",
    title: "Play",
    hint: "Bubbles",
    icon: Sparkles,
    tone: "from-[#FFF8FB] via-[#F8E8F2] to-[#EFD9EA]",
  },
  {
    id: "listen",
    title: "Listen",
    hint: "Mix sounds",
    icon: Volume2,
    tone: "from-[#FBF5FF] via-[#F3E8FA] to-[#E8D5F2]",
  },
  {
    id: "create",
    title: "Create",
    hint: "Soft lines",
    icon: Palette,
    tone: "from-[#FFF5FA] via-[#F6E6F0] to-[#EBD4E6]",
  },
  {
    id: "garden",
    title: "Garden",
    hint: "Arrange",
    icon: Flower2,
    tone: "from-[#FFF8FB] via-[#F7EAF2] to-[#EDD8E8]",
  },
  {
    id: "stars",
    title: "Stars",
    hint: "Build a sky",
    icon: Star,
    tone: "from-[#FBF7FF] via-[#F0E6F8] to-[#E4D4F0]",
  },
  {
    id: "color",
    title: "Color",
    hint: "Fill the sketch",
    icon: Paintbrush,
    tone: "from-[#FFF5FA] via-[#F8E4EF] to-[#ECCFDF]",
  },
  {
    id: "yoga",
    title: "Yoga",
    hint: "Gentle movement",
    icon: PersonStanding,
    tone: "from-[#FFF0F6] via-[#F6DCE8] to-[#E7B4D4]/55",
  },
];

const SCENES: Array<{
  id: ExperienceId;
  title: string;
  icon: typeof Wind;
  wash: string;
}> = [
  { id: "forest", title: "Forest", icon: TreePine, wash: "from-[#F3EAF6] to-[#E8D5F0]" },
  { id: "ocean", title: "Ocean", icon: Waves, wash: "from-[#F0E8F6] to-[#D9C8EA]" },
  { id: "rain", title: "Rain", icon: CloudRain, wash: "from-[#F6EAF2] to-[#E4D0E4]" },
  { id: "fire", title: "Fire", icon: Flame, wash: "from-[#FCE8F0] to-[#F0C8DC]" },
];

function TileArt({ id, reduceMotion }: { id: ExperienceId; reduceMotion: boolean | null }) {
  if (id === "breathe") {
    return (
      <span className="relative flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
        <span
          className={cn(
            "absolute inset-0 rounded-full bg-[#F8D5E8]/80 blur-[2px]",
            !reduceMotion && "motion-safe:animate-pulse"
          )}
        />
        <span className="absolute h-[72%] w-[72%] rounded-full bg-gradient-to-br from-[#FFF8FB] via-[#E7B4D4] to-[#B74783] shadow-[0_16px_40px_rgba(183,71,131,0.32)]" />
        <span className="absolute h-[38%] w-[38%] rounded-full bg-white/70" />
      </span>
    );
  }
  if (id === "play") {
    return (
      <span className="relative h-16 w-28 sm:h-20 sm:w-32">
        <span className="absolute left-1 top-3 h-11 w-11 rounded-full bg-white/95 shadow-[inset_-6px_-8px_16px_rgba(196,90,146,0.28)] ring-1 ring-[#E7B4D4]/80" />
        <span className="absolute left-10 top-0 h-8 w-8 rounded-full bg-gradient-to-br from-[#F8D5E8] to-[#E7B4D4] ring-1 ring-white/90" />
        <span className="absolute bottom-1 right-2 h-7 w-7 rounded-full bg-[#C45A92]/75 ring-1 ring-white/80" />
      </span>
    );
  }
  if (id === "listen") {
    return (
      <span className="flex h-14 items-end gap-1.5 sm:h-16">
        {[14, 26, 38, 22, 32, 18].map((height, index) => (
          <span
            key={height + index}
            className={cn(
              "w-2 rounded-full bg-gradient-to-t from-[#B74783] to-[#F8D5E8]",
              !reduceMotion && "origin-bottom motion-safe:animate-pulse"
            )}
            style={{
              height,
              animationDelay: reduceMotion ? undefined : `${index * 120}ms`,
            }}
          />
        ))}
      </span>
    );
  }
  if (id === "create") {
    return (
      <svg viewBox="0 0 120 56" className="h-12 w-28 sm:h-14 sm:w-32" aria-hidden>
        <path
          d="M6 38C22 8 38 48 58 22C74 2 90 34 114 16"
          fill="none"
          stroke="#C45A92"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M10 46C30 28 48 50 72 30C88 16 100 28 114 24"
          fill="none"
          stroke="#8B6BC7"
          strokeWidth="4.5"
          strokeLinecap="round"
          opacity="0.85"
        />
      </svg>
    );
  }
  if (id === "garden") {
    return (
      <span className="relative h-16 w-20">
        <span className="absolute bottom-1 left-2 h-3 w-14 rounded-full bg-[#E7B4D4]/80" />
        <span className="absolute bottom-3 left-5 h-11 w-5 rounded-full bg-gradient-to-t from-[#C45A92] to-[#F8D5E8]" />
        <span className="absolute bottom-4 right-3 h-8 w-4 rounded-full bg-[#B74783]/80" />
        <span className="absolute right-2 top-1 h-4 w-4 rounded-full bg-[#FFF0F6] ring-2 ring-[#E7B4D4]" />
      </span>
    );
  }
  if (id === "stars") {
    return (
      <span className="relative h-14 w-20">
        <span className="absolute left-3 top-2 h-2.5 w-2.5 rotate-12 rounded-[3px] bg-[#C45A92]" />
        <span className="absolute right-4 top-5 h-2 w-2 rounded-full bg-[#8B6BC7]" />
        <span className="absolute bottom-3 left-8 h-3.5 w-3.5 rounded-full bg-[#E7B4D4]" />
        <span className="absolute right-7 bottom-2 h-1.5 w-1.5 rounded-full bg-[#B74783]" />
      </span>
    );
  }
  if (id === "color") {
    return (
      <span className="relative h-14 w-20">
        <span className="absolute left-2 top-3 h-7 w-7 rounded-full bg-[#C45A92] shadow-md" />
        <span className="absolute left-8 top-1 h-7 w-7 rounded-full bg-[#8B6BC7] shadow-md" />
        <span className="absolute bottom-1 left-5 h-7 w-7 rounded-full bg-[#E7B4D4] shadow-md" />
      </span>
    );
  }
  if (id === "yoga") {
    return (
      <svg viewBox="0 0 80 72" className="h-16 w-20 sm:h-[4.5rem] sm:w-[5.25rem]" aria-hidden>
        <defs>
          <linearGradient id="yogaTileGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E7B4D4" />
            <stop offset="100%" stopColor="#B74783" />
          </linearGradient>
        </defs>
        {/* Soft mat */}
        <ellipse cx="40" cy="64" rx="26" ry="5" fill="#F8D5E8" opacity="0.8" />
        {/* Crossed legs — lotus / easy seated */}
        <path
          d="M28 48 Q18 56 14 60 Q22 62 34 54"
          fill="url(#yogaTileGrad)"
        />
        <path
          d="M52 48 Q62 56 66 60 Q58 62 46 54"
          fill="url(#yogaTileGrad)"
        />
        <ellipse cx="16" cy="60" rx="5" ry="3.2" fill="#E7B4D4" transform="rotate(-18 16 60)" />
        <ellipse cx="64" cy="60" rx="5" ry="3.2" fill="#E7B4D4" transform="rotate(18 64 60)" />
        {/* Torso */}
        <path
          d="M30 34 Q30 22 40 20 Q50 22 50 34 Q50 46 40 48 Q30 46 30 34Z"
          fill="url(#yogaTileGrad)"
        />
        {/* Arms resting on knees */}
        <path
          d="M32 32 Q20 38 16 48"
          fill="none"
          stroke="#C45A92"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M48 32 Q60 38 64 48"
          fill="none"
          stroke="#C45A92"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="16" cy="48" r="3.5" fill="#E7B4D4" />
        <circle cx="64" cy="48" r="3.5" fill="#E7B4D4" />
        {/* Head + bun */}
        <ellipse cx="40" cy="12" rx="6.5" ry="5" fill="#6B4A5A" />
        <circle cx="40" cy="7" r="3.5" fill="#5C3D4A" />
        <circle cx="40" cy="16" r="7" fill="#F0B8A8" />
        {!reduceMotion && (
          <circle
            cx="40"
            cy="34"
            r="22"
            fill="none"
            stroke="#E7B4D4"
            strokeWidth="1.5"
            opacity="0.5"
            className="motion-safe:animate-pulse"
          />
        )}
      </svg>
    );
  }
  return null;
}

export function CalmToolsPanel() {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState<ExperienceId | null>(null);
  const current = [...TILES, ...SCENES].find((tile) => tile.id === open);

  if (open === "yoga") {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[22px] bg-white/90 p-2 ring-1 ring-white/80 backdrop-blur-md sm:p-2.5">
        <YogaExperience mode="panel" onExitPanel={() => setOpen(null)} />
      </div>
    );
  }

  if (open && current) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[22px] bg-white/85 p-3 ring-1 ring-white/80 backdrop-blur-md sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-bold text-[#49263D]">{current.title}</h3>
          <button
            type="button"
            onClick={() => setOpen(null)}
            className="rounded-full border border-[#EADCE5] bg-white px-4 py-2 text-sm font-semibold text-[#795A70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
          >
            Exit
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {open === "breathe" && <BreatheOrb />}
          {open === "play" && <FidgetPlayground />}
          {open === "listen" && <SoundStudio />}
          {open === "create" && <ZenCanvas />}
          {open === "garden" && (
            <div className="origin-top scale-[0.92] sm:scale-100">
              <ZenGarden />
            </div>
          )}
          {open === "stars" && <StarSky />}
          {open === "color" && <ColorSketch />}
          {open === "forest" && <ForestGame />}
          {open === "ocean" && <OceanWaves />}
          {open === "rain" && <RainGame />}
          {open === "fire" && <CampfireGame />}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto pb-1">
      {/* Bento tile grid */}
      <div className="grid shrink-0 grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {TILES.map((tile) => {
          const Icon = tile.icon;
          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => setOpen(tile.id)}
              className={cn(
                "group relative flex min-h-[148px] flex-col overflow-hidden rounded-[26px] border border-white/70 p-3 text-left shadow-[0_12px_32px_rgba(123,57,98,0.08)] transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4] sm:min-h-[168px] sm:p-3.5",
                "bg-gradient-to-br",
                tile.tone,
                !reduceMotion && "hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(183,71,131,0.16)]",
                tile.featured && "sm:col-span-2 sm:row-span-1 sm:min-h-[180px]"
              )}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/35 blur-2xl transition group-hover:bg-white/50"
              />

              <span className="relative flex flex-1 items-center justify-center">
                <TileArt id={tile.id} reduceMotion={reduceMotion} />
              </span>

              <span className="relative mt-2 flex items-end justify-between gap-2">
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-[#B74783]" aria-hidden />
                    <span className="font-display text-[15px] font-bold tracking-tight text-[#49263D] sm:text-base">
                      {tile.title}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-[11px] font-semibold text-[#927C8B]">
                    {tile.hint}
                  </span>
                </span>
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/80 text-[#B74783] opacity-0 shadow-sm ring-1 ring-[#EADCE5]/80 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Soundscapes strip */}
      <div className="shrink-0">
        <div className="mb-2 flex items-baseline justify-between gap-2 px-0.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B74783]">
            Soundscapes
          </p>
          <p className="text-[10px] font-semibold text-[#A08A9A]">Immerse & unwind</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SCENES.map((scene) => {
            const Icon = scene.icon;
            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => setOpen(scene.id)}
                className={cn(
                  "group flex min-h-[52px] items-center gap-2.5 rounded-[18px] border border-white/80 bg-gradient-to-br px-3 py-2.5 text-left shadow-[0_8px_20px_rgba(123,57,98,0.06)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]",
                  scene.wash,
                  !reduceMotion && "hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(183,71,131,0.12)]"
                )}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/85 text-[#B74783] shadow-sm ring-1 ring-[#EADCE5]/70">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-sm font-bold text-[#49263D]">
                    {scene.title}
                  </span>
                  <span className="block text-[10px] font-semibold text-[#927C8B]">Open scene</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
