import { cn } from "@/lib/utils";
import { BRAND_PASTEL_BACKGROUND_SRC } from "@/lib/branding";

interface PastelLandscapeBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Single shared pastel landscape layer (actual PNG asset).
 * Sized to the viewport only — never stretched across the full scroll height —
 * so Full HD / 4K assets stay sharp with cover + center top.
 */
export function PastelLandscapeBackground({
  className,
  children,
}: PastelLandscapeBackgroundProps) {
  const layer = (
    <div
      aria-hidden
      className={cn("pastel-landscape-bg", !children && className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- public PNG; avoid optimizer re-encode */}
      <img
        src={BRAND_PASTEL_BACKGROUND_SRC}
        alt=""
        width={3840}
        height={2160}
        decoding="async"
        fetchPriority="low"
        draggable={false}
      />
    </div>
  );

  if (!children) {
    return layer;
  }

  return (
    <div className={cn("relative", className)}>
      {layer}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
