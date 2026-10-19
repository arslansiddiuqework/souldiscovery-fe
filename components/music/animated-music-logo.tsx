"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Music2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AnimatedMusicLogo({
  playing,
  className,
}: {
  playing: boolean;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const bars = [0.45, 0.8, 0.55, 0.95, 0.65];

  return (
    <div
      className={cn(
        "relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C45A92] to-[#B74783] text-white shadow-[0_8px_18px_rgba(183,71,131,0.28)]",
        className
      )}
      aria-hidden
    >
      {playing && !reduceMotion ? (
        <div className="flex h-5 items-end gap-[3px]">
          {bars.map((peak, i) => (
            <motion.span
              key={i}
              className="w-[3px] rounded-full bg-white"
              animate={{ height: ["22%", `${peak * 100}%`, "30%"] }}
              transition={{
                duration: 0.55 + i * 0.08,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.05,
              }}
            />
          ))}
        </div>
      ) : (
        <Music2 className="h-5 w-5" strokeWidth={1.75} />
      )}
    </div>
  );
}
