"use client";

type AvatarImageProps = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  onError?: () => void;
};

/**
 * Avatar media for user-uploaded / remote URLs.
 * Native img is intentional: sources vary (Cloudinary, data URLs, signed CDN).
 */
export function AvatarImage({
  src,
  alt,
  className,
  width,
  height,
  onError,
}: AvatarImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- dynamic remote avatar URLs
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={onError}
    />
  );
}
