"use client";

import { useState } from "react";
import { HeartHandshake, X } from "lucide-react";
import type { CrisisPayload } from "@/lib/api/assessments";
import { cn } from "@/lib/utils";

export function NeedSupportNow({
  crisis,
  className,
  compact = false,
}: {
  crisis?: CrisisPayload | null;
  className?: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const data = crisis || {
    title: "Need support now?",
    message:
      "If you are in crisis or feel unsafe, contact local emergency services or a trusted healthcare professional. Online assessments are not a crisis service.",
    resources: [],
  };

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-[#EADCE5] bg-white/90 px-3 py-1.5 text-sm font-semibold text-[#795A70] transition hover:bg-[#FFF0F6] hover:text-[#49263D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(217,140,180,0.55)]",
          compact && "text-xs px-2.5 py-1"
        )}
      >
        <HeartHandshake className="h-4 w-4 text-[#B74783]" aria-hidden />
        Need support now?
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={data.title}
          className="absolute right-0 z-40 mt-2 w-[min(100vw-2rem,22rem)] rounded-2xl border border-[#EADCE5] bg-white p-4 shadow-[0_16px_40px_rgba(123,57,98,0.12)]"
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <p className="text-sm font-bold text-[#49263D]">{data.title}</p>
            <button
              type="button"
              aria-label="Close support resources"
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-[#795A70] hover:bg-[#FFF0F6]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mb-3 text-sm leading-relaxed text-[#795A70]">{data.message}</p>
          <ul className="space-y-2">
            {data.resources.map((r) => (
              <li
                key={r.id}
                className="rounded-xl border border-[#E9E2F2] bg-[#FBF9FF] p-3"
              >
                <p className="text-sm font-semibold text-[#49263D]">{r.name}</p>
                <p className="mt-0.5 text-xs text-[#716B7D]">{r.description}</p>
                <p className="mt-1 text-xs font-medium text-[#B74783]">{r.contact}</p>
                <p className="mt-1 text-[11px] text-[#927C8B]">{r.coverageNote}</p>
                {r.href && (
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs font-semibold text-[#9F376F] underline-offset-2 hover:underline"
                  >
                    Open resource
                  </a>
                )}
              </li>
            ))}
            {data.resources.length === 0 && (
              <li className="text-sm text-[#795A70]">
                Contact local emergency services or a trusted healthcare professional.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
