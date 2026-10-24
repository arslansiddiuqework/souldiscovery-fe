"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoogleButtonProps {
  onSuccess: (token: string) => void | Promise<void>;
  onError: (error?: unknown) => void;
  text?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Renders nothing when Google OAuth is not configured.
 * Avoids calling useGoogleLogin with an empty client_id (runtime crash).
 */
export function GoogleButton(props: GoogleButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  if (!clientId || !clientId.includes(".apps.googleusercontent.com")) {
    return null;
  }
  return <GoogleButtonInner {...props} />;
}

function GoogleButtonInner({
  onSuccess,
  onError,
  text = "Continue with Google",
  className,
  disabled = false,
}: GoogleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const finish = () => setIsLoading(false);

  const login = useGoogleLogin({
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      try {
        if (!tokenResponse.access_token) {
          onError(new Error("Google did not return an access token."));
          return;
        }
        await onSuccess(tokenResponse.access_token);
      } catch (error) {
        onError(error);
      } finally {
        finish();
      }
    },
    onError: (error) => {
      finish();
      onError(error);
    },
    onNonOAuthError: () => {
      // Popup closed / blocked — not a hard failure toast needed for cancel.
      finish();
    },
  });

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className={cn(
        "w-full rounded-full border border-[#EADCE5] bg-white text-[#49263D] shadow-sm",
        "hover:border-[#D9B8F5] hover:bg-[#FFF8FB] hover:text-[#49263D]",
        "focus-visible:ring-[#D9B8F5]",
        className
      )}
      onClick={() => {
        if (isLoading || disabled) return;
        setIsLoading(true);
        login();
      }}
      disabled={isLoading || disabled}
      aria-label={text}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#B74783]" />
      ) : (
        <svg
          className="mr-3 h-5 w-5 shrink-0"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      <span className="font-semibold tracking-tight">{text}</span>
    </Button>
  );
}
