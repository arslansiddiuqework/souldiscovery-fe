"use client";

import { useEffect, useId } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CelebrationBalloon,
  CelebrationBalloonCluster,
} from "./celebration-balloons";

interface DayCompleteCelebrationProps {
  open: boolean;
  dayNumber: number;
  onClose: () => void;
}

const CONFETTI = [
  { left: "6%", color: "#F5C542", rotate: -20, delay: 0.05, size: 12 },
  { left: "16%", color: "#5BC4E8", rotate: 35, delay: 0.12, size: 10 },
  { left: "26%", color: "#F08A4B", rotate: -12, delay: 0.18, size: 13 },
  { left: "38%", color: "#E879C0", rotate: 18, delay: 0.08, size: 11 },
  { left: "50%", color: "#F5C542", rotate: -28, delay: 0.15, size: 12 },
  { left: "62%", color: "#5BC4E8", rotate: 22, delay: 0.22, size: 10 },
  { left: "74%", color: "#F08A4B", rotate: -8, delay: 0.1, size: 14 },
  { left: "86%", color: "#E879C0", rotate: 40, delay: 0.28, size: 11 },
  { left: "12%", color: "#F5C542", rotate: -32, delay: 0.32, size: 9 },
  { left: "68%", color: "#5BC4E8", rotate: 12, delay: 0.36, size: 12 },
  { left: "44%", color: "#F08A4B", rotate: 25, delay: 0.4, size: 10 },
  { left: "80%", color: "#F5C542", rotate: -15, delay: 0.44, size: 11 },
];

/** Balanced left + right floaters around the popup */
const FLOAT_BALLOONS = [
  { side: "left" as const, left: "4%", delay: 0.05, size: 92, tone: "pink" as const },
  { side: "left" as const, left: "12%", delay: 0.28, size: 78, tone: "sky" as const },
  { side: "left" as const, left: "2%", delay: 0.48, size: 70, tone: "gold" as const },
  { side: "right" as const, left: "78%", delay: 0.1, size: 94, tone: "gold" as const },
  { side: "right" as const, left: "86%", delay: 0.32, size: 80, tone: "pink" as const },
  { side: "right" as const, left: "92%", delay: 0.5, size: 72, tone: "sky" as const },
];

export function DayCompleteCelebration({
  open,
  dayNumber,
  onClose,
}: DayCompleteCelebrationProps) {
  const reduceMotion = useReducedMotion();
  const uid = useId();

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(onClose, reduceMotion ? 2600 : 4800);
    return () => window.clearTimeout(timer);
  }, [open, onClose, reduceMotion]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button
            type="button"
            aria-label="Dismiss celebration"
            className="absolute inset-0 bg-[#2B1027]/40 backdrop-blur-[3px]"
            onClick={onClose}
          />

          {/* Rising balloons — equal presence on both sides of the popup */}
          {!reduceMotion &&
            FLOAT_BALLOONS.map((b, i) => (
              <motion.div
                key={`${uid}-float-${i}`}
                className="pointer-events-none absolute select-none"
                style={{
                  left: b.left,
                  width: b.size,
                  bottom: -48,
                }}
                initial={{ y: 0, opacity: 0, scale: 0.75 }}
                animate={{
                  y: ["0vh", "-82vh"],
                  opacity: [0, 0.95, 0.95, 0],
                  x: [
                    0,
                    b.side === "left" ? 22 : -22,
                    b.side === "left" ? 8 : -8,
                  ],
                  rotate: b.side === "left" ? [-5, 7, -3] : [5, -7, 3],
                }}
                transition={{
                  duration: 3.5 + (i % 3) * 0.3,
                  delay: b.delay,
                  ease: "easeOut",
                }}
              >
                <CelebrationBalloon tone={b.tone} className="h-auto w-full drop-shadow-md" />
              </motion.div>
            ))}

          <div aria-hidden className="pointer-events-none absolute inset-0">
            {CONFETTI.map((piece, i) => (
              <motion.span
                key={`${uid}-c-${i}`}
                className="absolute rounded-[2.5px]"
                style={{
                  left: piece.left,
                  top: "-4%",
                  width: piece.size * 0.45,
                  height: piece.size,
                  backgroundColor: piece.color,
                  rotate: piece.rotate,
                }}
                initial={reduceMotion ? { opacity: 0.5 } : { opacity: 0, y: 0 }}
                animate={
                  reduceMotion
                    ? { opacity: 0.6 }
                    : {
                        opacity: [0, 1, 1, 0],
                        y: ["0vh", "35vh", "70vh", "105vh"],
                        x: [0, i % 2 === 0 ? 14 : -12, i % 2 === 0 ? -8 : 10],
                        rotate: [
                          piece.rotate,
                          piece.rotate + 50,
                          piece.rotate + 110,
                        ],
                      }
                }
                transition={{
                  duration: 3.2,
                  delay: piece.delay,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>

          <motion.div
            role="dialog"
            aria-live="polite"
            aria-label={`Day ${dayNumber} complete`}
            className="relative z-[1] flex w-full max-w-[340px] flex-col items-center rounded-[28px] bg-white/95 px-6 pb-7 pt-8 text-center shadow-[0_24px_60px_rgba(73,38,61,0.28)] ring-1 ring-white/70"
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.86, y: 24 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 12 }
            }
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
          >
            <motion.div
              className="relative"
              initial={reduceMotion ? false : { y: 40, scale: 0.7, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 16,
                delay: 0.08,
              }}
            >
              <motion.div
                animate={
                  reduceMotion
                    ? undefined
                    : { y: [0, -8, 0], rotate: [-1.2, 1.2, -1.2] }
                }
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <CelebrationBalloonCluster
                  decorative
                  className="h-auto w-[200px] drop-shadow-sm sm:w-[228px]"
                />
              </motion.div>
            </motion.div>

            <motion.p
              className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#B74783]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Day {dayNumber} complete
            </motion.p>
            <motion.h2
              className="mt-1.5 font-display text-[1.35rem] font-bold tracking-tight text-[#49263D]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
            >
              Beautifully done!
            </motion.h2>
            <motion.p
              className="mt-1.5 max-w-[260px] text-[13px] leading-relaxed text-[#927C8B]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34 }}
            >
              You finished Day {dayNumber}. Come back tomorrow for the next
              unlock.
            </motion.p>

            <motion.button
              type="button"
              onClick={onClose}
              className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-[#C45A92] to-[#B74783] px-6 text-[13px] font-bold text-white shadow-[0_10px_22px_rgba(183,71,131,0.28)]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Keep going
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
