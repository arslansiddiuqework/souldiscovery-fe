"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/** Crisp SVG balloon cluster — resolution-independent, no raster blur. */
export function CelebrationBalloonCluster({
  className,
  decorative,
}: {
  className?: string;
  decorative?: boolean;
}) {
  const uid = useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 220 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("overflow-visible", className)}
      aria-hidden={decorative ? true : undefined}
      role={decorative ? "presentation" : undefined}
    >
      <defs>
        <linearGradient
          id={`${uid}-pink`}
          x1="40"
          y1="20"
          x2="95"
          y2="150"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#F9A8D4" />
          <stop offset="45%" stopColor="#E879C0" />
          <stop offset="100%" stopColor="#C45A92" />
        </linearGradient>
        <linearGradient
          id={`${uid}-gold`}
          x1="95"
          y1="8"
          x2="155"
          y2="155"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFE08A" />
          <stop offset="40%" stopColor="#F5C542" />
          <stop offset="100%" stopColor="#E8A020" />
        </linearGradient>
        <linearGradient
          id={`${uid}-sky`}
          x1="145"
          y1="28"
          x2="200"
          y2="155"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#A8E6FA" />
          <stop offset="45%" stopColor="#5BC4E8" />
          <stop offset="100%" stopColor="#2BA8D4" />
        </linearGradient>
        <radialGradient id={`${uid}-shine`} cx="35%" cy="28%" r="45%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <filter
          id={`${uid}-soft`}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feDropShadow
            dx="0"
            dy="6"
            stdDeviation="5"
            floodColor="#49263D"
            floodOpacity="0.18"
          />
        </filter>
      </defs>

      <path
        d="M78 148 C76 170 70 190 74 218"
        stroke="#C9B8C4"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M118 152 C120 174 116 196 120 222"
        stroke="#C9B8C4"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M158 146 C162 168 168 192 164 216"
        stroke="#C9B8C4"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      <g filter={`url(#${uid}-soft)`}>
        <ellipse cx="78" cy="88" rx="36" ry="48" fill={`url(#${uid}-pink)`} />
        <ellipse cx="78" cy="88" rx="36" ry="48" fill={`url(#${uid}-shine)`} />
        <path d="M78 136 L72 148 L84 148 Z" fill="#B74783" />
      </g>

      <g filter={`url(#${uid}-soft)`}>
        <ellipse cx="158" cy="90" rx="34" ry="46" fill={`url(#${uid}-sky)`} />
        <ellipse cx="158" cy="90" rx="34" ry="46" fill={`url(#${uid}-shine)`} />
        <path d="M158 136 L152 147 L164 147 Z" fill="#2BA8D4" />
      </g>

      <g filter={`url(#${uid}-soft)`}>
        <ellipse cx="118" cy="78" rx="40" ry="54" fill={`url(#${uid}-gold)`} />
        <ellipse cx="118" cy="78" rx="40" ry="54" fill={`url(#${uid}-shine)`} />
        <path d="M118 132 L111 146 L125 146 Z" fill="#D4921A" />
      </g>
    </svg>
  );
}

/** Single balloon for side floaters */
export function CelebrationBalloon({
  tone = "pink",
  className,
}: {
  tone?: "pink" | "gold" | "sky";
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const fillId = `${uid}-${tone}`;
  const knot =
    tone === "gold" ? "#D4921A" : tone === "sky" ? "#2BA8D4" : "#B74783";

  return (
    <svg
      viewBox="0 0 80 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("overflow-visible", className)}
      aria-hidden
      role="presentation"
    >
      <defs>
        <linearGradient
          id={`${uid}-pink`}
          x1="20"
          y1="8"
          x2="60"
          y2="78"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#F9A8D4" />
          <stop offset="50%" stopColor="#E879C0" />
          <stop offset="100%" stopColor="#C45A92" />
        </linearGradient>
        <linearGradient
          id={`${uid}-gold`}
          x1="20"
          y1="8"
          x2="60"
          y2="78"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFE08A" />
          <stop offset="50%" stopColor="#F5C542" />
          <stop offset="100%" stopColor="#E8A020" />
        </linearGradient>
        <linearGradient
          id={`${uid}-sky`}
          x1="20"
          y1="8"
          x2="60"
          y2="78"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#A8E6FA" />
          <stop offset="50%" stopColor="#5BC4E8" />
          <stop offset="100%" stopColor="#2BA8D4" />
        </linearGradient>
        <radialGradient id={`${uid}-shine`} cx="34%" cy="28%" r="48%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
          <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d="M40 78 C38 92 34 104 38 116"
        stroke="#C9B8C4"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <ellipse cx="40" cy="42" rx="28" ry="38" fill={`url(#${fillId})`} />
      <ellipse cx="40" cy="42" rx="28" ry="38" fill={`url(#${uid}-shine)`} />
      <path d="M40 80 L34 90 L46 90 Z" fill={knot} />
    </svg>
  );
}
