"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import type { YogaPoseId } from "./yoga-data";

const Lottie = dynamic(() => import("lottie-react").then((m) => m.Lottie), {
  ssr: false,
  loading: () => null,
});

type PoseProps = {
  poseId: YogaPoseId;
  size?: "card" | "hero";
  still?: boolean;
  className?: string;
};

/**
 * Professional human-figure illustrations from the Yoga API
 * (bundled locally — see /public/yoga/CREDITS.md).
 */
const POSE_ART: Record<
  YogaPoseId,
  { src: string; alt: string; motion: "breathe" | "sway" | "fold" | "catcow" }
> = {
  "easy-seated": {
    src: "/yoga/lotus.svg",
    alt: "Person in an easy seated yoga pose",
    motion: "breathe",
  },
  "childs-pose": {
    src: "/yoga/childs-pose.svg",
    alt: "Person in child's pose",
    motion: "fold",
  },
  "legs-up-wall": {
    src: "/yoga/shoulder-stand.svg",
    alt: "Person with legs elevated in a restorative inversion",
    motion: "breathe",
  },
  "reclined-bound-angle": {
    src: "/yoga/butterfly.svg",
    alt: "Person in bound angle / butterfly pose",
    motion: "breathe",
  },
  "corpse-pose": {
    src: "/yoga/corpse.svg",
    alt: "Person resting in corpse pose",
    motion: "breathe",
  },
  "cat-cow": {
    src: "/yoga/cow.svg",
    alt: "Person moving between cat and cow stretch",
    motion: "catcow",
  },
  "neck-shoulder": {
    src: "/yoga/lotus.svg",
    alt: "Person seated for gentle neck and shoulder ease",
    motion: "sway",
  },
  "seated-twist": {
    src: "/yoga/twist.svg",
    alt: "Person in a gentle seated spinal twist",
    motion: "sway",
  },
  "seated-forward-fold": {
    src: "/yoga/seated-forward.svg",
    alt: "Person in seated forward fold",
    motion: "fold",
  },
  "side-stretch": {
    src: "/yoga/crescent-moon.svg",
    alt: "Person in a gentle side stretch",
    motion: "sway",
  },
  mountain: {
    src: "/yoga/warrior-two.svg",
    alt: "Person standing tall in a grounded yoga stance",
    motion: "breathe",
  },
  tree: {
    src: "/yoga/tree.svg",
    alt: "Person balancing in tree pose",
    motion: "sway",
  },
  "standing-forward-fold": {
    src: "/yoga/standing-forward.svg",
    alt: "Person in standing forward fold",
    motion: "fold",
  },
  "standing-side-stretch": {
    src: "/yoga/triangle.svg",
    alt: "Person in a standing side stretch",
    motion: "sway",
  },
  "seated-breathing": {
    src: "/yoga/lotus.svg",
    alt: "Person seated for gentle breathing",
    motion: "breathe",
  },
  "shoulder-rolls": {
    src: "/yoga/lotus.svg",
    alt: "Person seated for slow shoulder rolls",
    motion: "sway",
  },
  "wrist-hand": {
    src: "/yoga/sphinx.svg",
    alt: "Person in a gentle supported stretch for wrists and hands",
    motion: "breathe",
  },
  "seated-relaxation": {
    src: "/yoga/corpse.svg",
    alt: "Person resting in a full-body relaxation pose",
    motion: "breathe",
  },
};

/** Inject once near the Yoga section root */
export function YogaPoseStyles() {
  return <style dangerouslySetInnerHTML={{ __html: YOGA_CSS }} />;
}

export function YogaPoseDemo({ poseId, size = "card", still = false, className }: PoseProps) {
  const art = POSE_ART[poseId];
  const dim =
    size === "hero"
      ? "h-full min-h-0 w-full"
      : "aspect-[5/4] h-auto w-full sm:aspect-[4/3]";

  return (
    <div
      className={cn("yoga-stage relative flex items-center justify-center overflow-hidden", dim, className)}
      data-pose={poseId}
    >
      <div aria-hidden className="yoga-stage-glow" />

      {!still && (
        <div aria-hidden className="yoga-lottie-aura pointer-events-none absolute inset-0 flex items-center justify-center opacity-70">
          <Lottie
            src="/yoga/breath-aura.json"
            loop
            autoplay
            className={cn(
              "h-[88%] w-[88%]",
              size === "hero" ? "max-w-[320px]" : "max-w-[220px]"
            )}
          />
        </div>
      )}

      <div
        className={cn(
          "yoga-figure relative z-[1] flex h-full w-full items-center justify-center p-3 sm:p-4",
          !still && `yoga-motion-${art.motion}`,
          still && "yoga-still"
        )}
      >
        {art.motion === "catcow" && !still ? (
          <CatCowArt />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={art.src}
            alt=""
            draggable={false}
            className="yoga-pose-img max-h-full max-w-full object-contain drop-shadow-[0_12px_28px_rgba(123,57,98,0.12)]"
          />
        )}
      </div>

      <span className="sr-only">{art.alt}</span>
    </div>
  );
}

function CatCowArt() {
  return (
    <div className="relative h-full w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/yoga/cow.svg"
        alt=""
        draggable={false}
        className="yoga-catcow-a absolute inset-0 m-auto max-h-full max-w-full object-contain p-3"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/yoga/cat.svg"
        alt=""
        draggable={false}
        className="yoga-catcow-b absolute inset-0 m-auto max-h-full max-w-full object-contain p-3"
      />
    </div>
  );
}

const YOGA_CSS = `
.yoga-stage {
  background:
    radial-gradient(ellipse 75% 65% at 50% 40%, #FFFFFF 0%, #FFF7FB 42%, #F4E9F3 100%);
}
.yoga-stage-glow {
  position: absolute;
  inset: 10% 14% 18%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(248,213,232,0.35) 50%, transparent 72%);
  pointer-events: none;
}
.yoga-pose-img {
  filter: saturate(1.05) contrast(1.02);
}

@keyframes yoga-breathe {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-3px) scale(1.02); }
}
@keyframes yoga-sway {
  0%, 100% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
}
@keyframes yoga-fold {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(4px) rotate(1.5deg); }
}
@keyframes yoga-catcow-a {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0; transform: scale(0.98); }
}
@keyframes yoga-catcow-b {
  0%, 100% { opacity: 0; transform: scale(0.98); }
  50% { opacity: 1; transform: scale(1); }
}

.yoga-motion-breathe { animation: yoga-breathe 5.5s ease-in-out infinite; transform-origin: 50% 70%; }
.yoga-motion-sway { animation: yoga-sway 6s ease-in-out infinite; transform-origin: 50% 85%; }
.yoga-motion-fold { animation: yoga-fold 6s ease-in-out infinite; transform-origin: 50% 60%; }
.yoga-motion-catcow { transform-origin: 50% 60%; }
.yoga-catcow-a { animation: yoga-catcow-a 5s ease-in-out infinite; }
.yoga-catcow-b { animation: yoga-catcow-b 5s ease-in-out infinite; }

.yoga-still,
.yoga-still .yoga-catcow-a,
.yoga-still .yoga-catcow-b {
  animation: none !important;
}
.yoga-still .yoga-catcow-b { opacity: 0 !important; }
.yoga-still .yoga-catcow-a { opacity: 1 !important; }

@media (prefers-reduced-motion: reduce) {
  .yoga-motion-breathe,
  .yoga-motion-sway,
  .yoga-motion-fold,
  .yoga-catcow-a,
  .yoga-catcow-b,
  .yoga-lottie-aura {
    animation: none !important;
  }
  .yoga-lottie-aura { display: none; }
  .yoga-catcow-b { opacity: 0 !important; }
  .yoga-catcow-a { opacity: 1 !important; }
}
`;
