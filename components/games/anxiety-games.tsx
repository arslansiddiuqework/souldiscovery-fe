"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Flower2, Wind, TreePine, Waves, Music2, CloudRain, Flame } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    title: "Breathing Patterns",
    description: "Follow calming breathing exercises with visual guidance",
    icon: Wind,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    duration: "5 mins",
  },
  {
    id: "garden",
    title: "Zen Garden",
    description: "Create and maintain your digital peaceful space",
    icon: Flower2,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    duration: "10 mins",
  },
  {
    id: "forest",
    title: "Mindful Forest",
    description: "Take a peaceful walk through a virtual forest",
    icon: TreePine,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    duration: "15 mins",
  },
  {
    id: "waves",
    title: "Ocean Waves",
    description: "Match your breath with gentle ocean waves",
    icon: Waves,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    duration: "8 mins",
  },
  {
    id: "rain",
    title: "Gentle Rain",
    description: "Drift into calm with the soothing sound of rainfall",
    icon: CloudRain,
    color: "text-[#b384c9]",
    bgColor: "bg-[rgba(179,132,201,0.12)]",
    duration: "5 mins",
  },
  {
    id: "campfire",
    title: "Campfire Night",
    description: "Unwind by a crackling fire under a starry sky",
    icon: Flame,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    duration: "5 mins",
  },
];

interface AnxietyGamesProps {
  onGamePlayed?: (gameName: string, description: string) => Promise<void>;
}

export const AnxietyGames = ({ onGamePlayed }: AnxietyGamesProps) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [showGame, setShowGame] = useState(false);

  const handleGameStart = async (gameId: string) => {
    setSelectedGame(gameId);
    setShowGame(true);

    // Log the activity
    if (onGamePlayed) {
      try {
        await onGamePlayed(
          gameId,
          games.find((g) => g.id === gameId)?.description || ""
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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[rgba(179,132,201,0.12)]">
              <Gamepad2 className="h-5 w-5 text-[#b384c9]" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg md:text-xl">
                Anxiety Relief Activities
              </CardTitle>
              <CardDescription>
                Interactive exercises to help reduce stress and anxiety
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {games.map((game) => (
              <motion.div
                key={game.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  type="button"
                  className={cn(
                    "w-full rounded-[16px] border border-[rgba(216,191,227,0.18)] bg-white/[0.035] p-4 text-left shadow-card transition-all duration-300 hover:border-[rgba(179,132,201,0.25)] hover:shadow-card-hover",
                    selectedGame === game.id && "border-[rgba(179,132,201,0.4)] ring-2 ring-[rgba(179,132,201,0.2)]"
                  )}
                  onClick={() => handleGameStart(game.id)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                        game.bgColor,
                        game.color
                      )}
                    >
                      <game.icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display text-sm font-semibold text-white md:text-base">
                        {game.title}
                      </h4>
                      <p className="mt-1 text-sm leading-relaxed text-[rgba(231,218,237,0.55)]">
                        {game.description}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <Music2 className="h-3.5 w-3.5 text-[rgba(231,218,237,0.45)]" />
                        <span className="text-xs text-[rgba(231,218,237,0.45)]">
                          {game.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>

          {selectedGame && (
            <div className="mt-6 text-center">
              <Button className="gap-2" onClick={() => setSelectedGame(null)}>
                <Gamepad2 className="h-4 w-4" />
                Start {games.find((g) => g.id === selectedGame)?.title}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showGame} onOpenChange={setShowGame}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {games.find((g) => g.id === selectedGame)?.title}
            </DialogTitle>
          </DialogHeader>
          {renderGame()}
        </DialogContent>
      </Dialog>
    </>
  );
};
