"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Flower2,
  Wind,
  TreePine,
  Waves,
  CloudRain,
  Flame,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BreathingGame } from "./breathing-game";
import { ZenGarden } from "./zen-garden";
import { ForestGame } from "./forest-game";
import { OceanWaves } from "./ocean-waves";
import { RainGame } from "./rain-game";
import { CampfireGame } from "./campfire-game";
import { cn } from "@/lib/utils";

const games = [
  {
    id: "breathing",
    title: "Breathing",
    fullTitle: "Breathing Patterns",
    description: "Follow calming breathing exercises with visual guidance",
    icon: Wind,
    accent: "from-[#7DD3FC] to-[#38BDF8]",
    soft: "bg-[#E0F2FE]",
    ink: "text-[#0369A1]",
    duration: "5 mins",
  },
  {
    id: "garden",
    title: "Zen Garden",
    fullTitle: "Zen Garden",
    description: "Create and maintain your digital peaceful space",
    icon: Flower2,
    accent: "from-[#F9A8D4] to-[#E879C0]",
    soft: "bg-[#FCE7F3]",
    ink: "text-[#B74783]",
    duration: "10 mins",
  },
  {
    id: "forest",
    title: "Forest",
    fullTitle: "Mindful Forest",
    description: "Take a peaceful walk through a virtual forest",
    icon: TreePine,
    accent: "from-[#86EFAC] to-[#34D399]",
    soft: "bg-[#DCFCE7]",
    ink: "text-[#15803D]",
    duration: "15 mins",
  },
  {
    id: "waves",
    title: "Ocean",
    fullTitle: "Ocean Waves",
    description: "Match your breath with gentle ocean waves",
    icon: Waves,
    accent: "from-[#67E8F9] to-[#22D3EE]",
    soft: "bg-[#CFFAFE]",
    ink: "text-[#0E7490]",
    duration: "8 mins",
  },
  {
    id: "rain",
    title: "Rain",
    fullTitle: "Gentle Rain",
    description: "Drift into calm with the soothing sound of rainfall",
    icon: CloudRain,
    accent: "from-[#C4B5FD] to-[#A78BFA]",
    soft: "bg-[#EDE9FE]",
    ink: "text-[#6D28D9]",
    duration: "5 mins",
  },
  {
    id: "campfire",
    title: "Campfire",
    fullTitle: "Campfire Night",
    description: "Unwind by a crackling fire under a starry sky",
    icon: Flame,
    accent: "from-[#FDBA74] to-[#FB923C]",
    soft: "bg-[#FFEDD5]",
    ink: "text-[#C2410C]",
    duration: "5 mins",
  },
];

function parseDurationMinutes(label: string): number {
  const match = label.match(/(\d+)/);
  return match ? Number(match[1]) : 5;
}

interface AnxietyGamesProps {
  onGamePlayed?: (
    gameName: string,
    description: string,
    durationMinutes?: number
  ) => Promise<void>;
  /** Dense icon grid for single-screen dashboard */
  compact?: boolean;
}

export const AnxietyGames = ({
  onGamePlayed,
  compact = false,
}: AnxietyGamesProps) => {
  const reduceMotion = useReducedMotion();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [showGame, setShowGame] = useState(false);

  const handleGameStart = async (gameId: string) => {
    setSelectedGame(gameId);
    setShowGame(true);

    if (onGamePlayed) {
      try {
        const game = games.find((g) => g.id === gameId);
        await onGamePlayed(
          gameId,
          game?.description || "",
          game ? parseDurationMinutes(game.duration) : 5
        );
      } catch (error) {
        console.error("Error logging game activity:", error);
      }
    }
  };

  const renderGame = () => {
    switch (selectedGame) {
      case "breathing":
        return <BreathingGame />;
      case "garden":
        return <ZenGarden />;
      case "forest":
        return <ForestGame />;
      case "waves":
        return <OceanWaves />;
      case "rain":
        return <RainGame />;
      case "campfire":
        return <CampfireGame />;
      default:
        return null;
    }
  };

  const dialog = (
    <Dialog open={showGame} onOpenChange={setShowGame}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {games.find((g) => g.id === selectedGame)?.fullTitle}
          </DialogTitle>
        </DialogHeader>
        {renderGame()}
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <div
        className={cn(
          "flex h-full min-h-0 flex-col overflow-hidden",
          compact
            ? "rounded-[22px] bg-white/80 p-3 ring-1 ring-white/70 backdrop-blur-md"
            : "rounded-[28px] bg-white/85 p-4 ring-1 ring-white/80 backdrop-blur-md sm:p-5"
        )}
      >
        <div className="mb-3 flex shrink-0 items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#B74783]">
              Relief
            </p>
            <h3 className="mt-0.5 font-display text-[15px] font-bold tracking-tight text-[#49263D] sm:text-base">
              Tap to calm
            </h3>
          </div>
          <p className="text-[11px] font-medium text-[#A08B9A]">
            {games.length} tools
          </p>
        </div>

        <div
          className={cn(
            "grid min-h-0 flex-1 gap-2.5",
            compact
              ? "grid-cols-2 content-stretch sm:grid-cols-3"
              : "grid-cols-2 content-stretch sm:grid-cols-3"
          )}
        >
          {games.map((game, i) => (
            <motion.button
              key={game.id}
              type="button"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.35 }}
              whileHover={reduceMotion ? undefined : { y: -3 }}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              onClick={() => handleGameStart(game.id)}
              className="group relative flex min-h-0 flex-col items-center justify-center gap-2 overflow-hidden rounded-[22px] bg-[#FBF7FA] px-2 py-3 text-center transition hover:bg-white"
            >
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-3 top-0 h-px bg-gradient-to-r opacity-0 transition group-hover:opacity-100",
                  game.accent
                )}
              />
              <span
                className={cn(
                  "relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm sm:h-12 sm:w-12",
                  game.accent
                )}
              >
                <game.icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span className="relative text-[12px] font-bold leading-tight text-[#49263D]">
                {game.title}
              </span>
              <span className="relative text-[10px] font-semibold text-[#A08B9A]">
                {game.duration}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
      {dialog}
    </>
  );
};
