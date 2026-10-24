"use client";

import { GoogleButton } from "@/components/auth/google-button";

interface GoogleAuthSectionProps {
  onSuccess: (token: string) => void | Promise<void>;
  onError: (message: string) => void;
  text?: string;
  disabled?: boolean;
}

/** Divider + Google button — matches Soul Discovery login/signup cards. */
export function GoogleAuthSection({
  onSuccess,
  onError,
  text = "Continue with Google",
  disabled = false,
}: GoogleAuthSectionProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  if (!clientId || !clientId.includes(".apps.googleusercontent.com")) {
    return null;
  }

  return (
    <div className="mt-6 flex w-full flex-col items-center justify-center gap-4">
      <div className="relative w-full">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[#EADCE5]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wide">
          <span className="bg-white px-3 text-[#927C8B]">Or continue with</span>
        </div>
      </div>
      <div className="w-full pt-1">
        <GoogleButton
          onSuccess={onSuccess}
          onError={() =>
            onError("Google sign-in was cancelled or failed. Please try again.")
          }
          text={text}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
