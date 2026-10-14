import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  BRAND_CAPTION,
  BRAND_ICON_SRC,
  BRAND_LOGO_SRC,
  BRAND_NAME,
} from "@/lib/branding";

type BrandLogoVariant = "icon" | "mark" | "full" | "stacked";

type BrandLogoProps = {
  variant?: BrandLogoVariant;
  /** Icon pixel size for icon/mark/stacked variants */
  size?: number;
  className?: string;
  /** Show caption under the name (mark/stacked) */
  showCaption?: boolean;
  /** Invert text colors for dark surfaces */
  tone?: "light" | "dark";
  priority?: boolean;
};

/**
 * Official Soul Discovery logo.
 * - icon: icon mark only
 * - mark: icon + app name (headers / compact nav)
 * - stacked: icon + name + caption (auth / footer)
 * - full: official full logo artwork (icon + name + caption in one image)
 */
export function BrandLogo({
  variant = "mark",
  size = 32,
  className,
  showCaption = false,
  tone = "dark",
  priority = false,
}: BrandLogoProps) {
  const nameClass =
    tone === "light"
      ? "text-white"
      : "text-[#49263D]";
  const captionClass =
    tone === "light"
      ? "text-white/70"
      : "text-[#795A70]";

  if (variant === "full") {
    return (
      <Image
        src={BRAND_LOGO_SRC}
        alt={`${BRAND_NAME} — ${BRAND_CAPTION}`}
        width={1024}
        height={1024}
        priority={priority}
        className={cn("h-auto w-full object-contain", className)}
      />
    );
  }

  if (variant === "icon") {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center overflow-hidden rounded-full bg-[#FFF6FA] ring-1 ring-[#EADCE5]/70",
          className
        )}
        style={{ width: size, height: size }}
      >
        <Image
          src={BRAND_ICON_SRC}
          alt={BRAND_NAME}
          width={size}
          height={size}
          priority={priority}
          className="object-cover"
          style={{ width: size, height: size }}
        />
      </span>
    );
  }

  const captionVisible = variant === "stacked" || showCaption;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5",
        variant === "stacked" && "flex-col gap-2 text-center",
        className
      )}
    >
      <span
        className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FFF6FA] ring-1 ring-[#EADCE5]/70"
        style={{ width: size, height: size }}
        aria-hidden
      >
        <Image
          src={BRAND_ICON_SRC}
          alt=""
          width={size}
          height={size}
          priority={priority}
          className="object-cover"
          style={{ width: size, height: size }}
        />
      </span>
      <span
        className={cn(
          "flex min-w-0 flex-col",
          variant === "stacked" ? "items-center" : "items-start leading-tight"
        )}
      >
        <span
          className={cn(
            "font-bold tracking-[-0.02em]",
            nameClass,
            variant === "stacked" ? "text-[1.45rem]" : "text-[18px]"
          )}
        >
          {BRAND_NAME}
        </span>
        {captionVisible && (
          <span
            className={cn(
              "mt-0.5 max-w-[22ch] text-[11px] font-medium leading-snug tracking-[0.01em]",
              captionClass,
              variant === "stacked" && "mt-1 max-w-[28ch] text-[12px]"
            )}
          >
            {BRAND_CAPTION}
          </span>
        )}
      </span>
    </span>
  );
}
