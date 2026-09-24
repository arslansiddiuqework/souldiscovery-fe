"use client";

import { cn } from "@/lib/utils";
import { ConnectedParticlesBackground } from "@/components/ui/connected-particles-background";

type AtmosphereVariant = "default" | "hero" | "subtle" | "auth";

interface AtmosphereBackgroundProps {
  className?: string;
  variant?: AtmosphereVariant;
  stars?: boolean;
  particles?: boolean;
  children?: React.ReactNode;
}

/**
 * Local atmosphere shell. Global gradients + connected particles live in root layout.
 * Use this when a page needs an isolated atmospheric frame (e.g. auth overlays).
 */
export function AtmosphereBackground({
  className,
  particles = false,
  children,
}: AtmosphereBackgroundProps) {
  return (
    <div className={cn("relative", className)}>
      {particles && (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
          <ConnectedParticlesBackground />
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export { ConnectedParticlesBackground };
