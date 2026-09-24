"use client";

import { ShieldAlert, X } from "lucide-react";

interface Props {
  onAccept: () => void;
  onClose: () => void;
}

export function ConsentModal({ onAccept, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl p-6 shadow-[var(--shadow-card-hover)] animate-in fade-in zoom-in-95 duration-200 bg-[#100b20]/95 text-white border border-[rgba(216,191,227,0.18)] backdrop-blur-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/[0.06] transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-[rgba(231,218,237,0.55)]" />
        </button>

        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="w-8 h-8" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-center mb-2 tracking-tight">Emergency Escalation Consent</h2>

        <div className="space-y-4 my-6 text-sm text-[rgba(231,218,237,0.55)] leading-relaxed text-justify">
          <p>
            Soul Discovery is an AI wellness assistant, not a medical device or professional crisis service.
          </p>
          <p>
            By enabling emergency escalation, you consent to allow Soul Discovery to <strong className="text-white">automatically place phone calls</strong> to your listed emergency contacts if the system detects signs of severe emotional distress or potential self-harm.
          </p>
          <p>
            During an emergency call, Soul Discovery will verbally disclose to your contacts that you may be in distress, based on its analysis of your session.
          </p>
          <p className="font-semibold text-destructive">
            Do not rely solely on this system for emergency response. In a life-threatening crisis, please dial your local emergency number immediately.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-medium border border-[rgba(216,191,227,0.18)] hover:bg-white/[0.06] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onAccept}
            className="flex-1 py-2.5 rounded-xl font-medium bg-white text-[#1c1033] shadow-[rgba(255,255,255,0.7)_0px_1px_0px_0px_inset,rgba(179,132,201,0.35)_0px_10px_30px_0px] hover:brightness-105 transition-all"
          >
            I Understand & Accept
          </button>
        </div>
      </div>
    </div>
  );
}
