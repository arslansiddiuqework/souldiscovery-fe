"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { InfoPageShell } from "@/components/marketing/info-page-shell";
import { FAQ_ITEMS } from "@/lib/data/faq";
import { cn } from "@/lib/utils";

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <InfoPageShell
      badge="FAQ"
      title={
        <>
          Questions, answered{" "}
          <span className="text-gradient-brand">clearly</span>
        </>
      }
      description="Quick answers about Soul Discovery AI wellness features and optional psychologist sessions."
    >
      <div className="mx-auto max-w-3xl space-y-3">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = open === index;
          return (
            <div
              key={item.question}
              className="overflow-hidden rounded-[18px] border border-[#EADCE5] bg-white shadow-[0_8px_28px_rgba(123,57,98,0.06)]"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[#FFF0F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4] focus-visible:ring-inset"
              >
                <span className="text-[15px] font-semibold text-[#49263D] md:text-base">
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-[#B74783] transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
              {isOpen ? (
                <div className="border-t border-[#EFE3EA] px-5 py-4 text-[14px] leading-relaxed text-[#795A70] md:text-[15px]">
                  {item.answer}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-[#927C8B]">
        Still need help?{" "}
        <Link href="/help" className="font-semibold text-[#B74783] hover:underline">
          Visit the Help Center
        </Link>{" "}
        or{" "}
        <Link href="/contact" className="font-semibold text-[#B74783] hover:underline">
          Contact Us
        </Link>
        .
      </p>
    </InfoPageShell>
  );
}
