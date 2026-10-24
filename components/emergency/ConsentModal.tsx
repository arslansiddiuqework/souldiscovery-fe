"use client";

import { useState } from "react";
import { Loader2, ShieldAlert, X } from "lucide-react";

interface Props {
  onAccept: () => void | Promise<void>;
  onClose: () => void;
}

export function ConsentModal({ onAccept, onClose }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onAccept();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save consent. Please try again."
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-title"
        className="relative w-full max-w-md animate-in fade-in zoom-in-95 rounded-2xl border border-[#EADCE5] bg-[#FFF0F6]/95 p-6 text-[#49263D] shadow-[var(--shadow-card-hover)] duration-200 backdrop-blur-xl"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute right-4 top-4 rounded-full p-2 transition-colors hover:bg-[#FFF0F6] disabled:opacity-50"
          aria-label="Close"
        >
          <X className="h-4 w-4 text-[#927C8B]" />
        </button>

        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-destructive/10 p-3 text-destructive">
            <ShieldAlert className="h-8 w-8" />
          </div>
        </div>

        <h2
          id="consent-title"
          className="mb-2 text-center text-xl font-bold tracking-tight"
        >
          Emergency Escalation Consent
        </h2>

        <div className="my-6 space-y-4 text-justify text-sm leading-relaxed text-[#927C8B]">
          <p>
            Soul Discovery is an AI wellness assistant, not a medical device or
            professional crisis service.
          </p>
          <p>
            By enabling emergency escalation, you consent to allow Soul Discovery
            to{" "}
            <strong className="text-[#49263D]">
              automatically place phone calls
            </strong>{" "}
            to your listed emergency contacts if the system detects signs of
            severe emotional distress or potential self-harm.
          </p>
          <p>
            During an emergency call, Soul Discovery will verbally disclose to
            your contacts that you may be in distress, based on its analysis of
            your session.
          </p>
          <p className="font-semibold text-destructive">
            Do not rely solely on this system for emergency response. In a
            life-threatening crisis, please dial your local emergency number
            immediately.
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-xl border border-[#EADCE5] py-2.5 font-medium transition-colors hover:bg-[#FFF0F6] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAccept}
            disabled={submitting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-2.5 font-medium text-[#49263D] shadow-[rgba(255,255,255,0.7)_0px_1px_0px_0px_inset,rgba(183,71,131,0.35)_0px_10px_30px_0px] transition-all hover:brightness-105 disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              "I Understand & Accept"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
