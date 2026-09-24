"use client";

import { Award, Globe, UserRound } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DEFAULT_PSYCHOLOGIST } from "@/lib/consultation/types";

export function PsychologistProfileCard() {
  const p = DEFAULT_PSYCHOLOGIST;

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/[0.1] to-transparent" />
      <CardHeader className="relative">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[22px] border border-[rgba(216,191,227,0.22)] bg-[rgba(179,132,201,0.12)]">
            <UserRound className="h-10 w-10 text-[#b384c9]" />
          </div>
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[rgba(231,218,237,0.45)]">
              Licensed Psychologist
            </p>
            <CardTitle className="text-2xl md:text-3xl">{p.name}</CardTitle>
            <CardDescription className="text-base">{p.title}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-6">
        <p className="text-sm leading-relaxed text-[rgba(231,218,237,0.65)] md:text-base">
          {p.about}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[rgba(216,191,227,0.14)] bg-white/[0.03] p-4">
            <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[rgba(231,218,237,0.45)]">
              <Award className="h-3.5 w-3.5 text-[#b384c9]" />
              Specializations
            </p>
            <ul className="space-y-1.5">
              {p.specializations.map((s) => (
                <li key={s} className="text-sm text-[rgba(231,218,237,0.8)]">
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-[rgba(216,191,227,0.14)] bg-white/[0.03] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[rgba(231,218,237,0.45)]">
                Experience
              </p>
              <p className="mt-1 font-display text-xl font-bold text-[#f3eefa]">
                {p.yearsExperience}+ years
              </p>
            </div>
            <div className="rounded-2xl border border-[rgba(216,191,227,0.14)] bg-white/[0.03] p-4">
              <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[rgba(231,218,237,0.45)]">
                <Globe className="h-3.5 w-3.5 text-[#b384c9]" />
                Languages
              </p>
              <p className="text-sm text-[rgba(231,218,237,0.8)]">
                {p.languages.join(" · ")}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
