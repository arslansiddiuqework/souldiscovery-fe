import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  HeartPulse,
  LayoutDashboard,
  MessageCircleQuestion,
  Shield,
  Sparkles,
} from "lucide-react";
import { InfoPageShell } from "@/components/marketing/info-page-shell";
import { StartWebsiteTourButton } from "@/components/onboarding/start-website-tour-button";

const HELP_LINKS = [
  {
    href: "/faq",
    title: "Frequently asked questions",
    description: "Billing, privacy of sessions, and free AI features.",
    icon: MessageCircleQuestion,
  },
  {
    href: "/features",
    title: "Platform features",
    description: "Explore AI chat, mood tools, and wellness support.",
    icon: Sparkles,
  },
  {
    href: "/wellness-plan",
    title: "Wellness Plan",
    description: "Personalized daily missions and guided progress.",
    icon: BookOpen,
  },
  {
    href: "/dashboard",
    title: "Dashboard",
    description: "Your mood overview, activities, and quick actions.",
    icon: LayoutDashboard,
  },
  {
    href: "/pricing",
    title: "Psychologist consultations",
    description: "Optional paid sessions when you want human support.",
    icon: HeartPulse,
  },
  {
    href: "/settings/emergency",
    title: "Emergency settings",
    description: "Manage crisis contacts and emergency preferences.",
    icon: Shield,
  },
];

export default function HelpPage() {
  return (
    <InfoPageShell
      badge="Help Center"
      title={
        <>
          Find what you need,{" "}
          <span className="text-gradient-brand">faster</span>
        </>
      }
      description="Practical links for getting started, managing your wellness journey, and finding extra support."
    >
      <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StartWebsiteTourButton />
        {HELP_LINKS.map(({ href, title, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex h-full flex-col rounded-[20px] border border-[#EADCE5] bg-white p-6 shadow-[0_8px_28px_rgba(123,57,98,0.06)] transition-all hover:-translate-y-0.5 hover:border-[#DFC7D6] hover:shadow-[0_12px_32px_rgba(123,57,98,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
          >
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFE5F0] text-[#B74783]">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold text-[#49263D] group-hover:text-[#B74783]">
              {title}
            </span>
            <span className="mt-2 flex-1 text-sm leading-relaxed text-[#795A70]">
              {description}
            </span>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#B74783]">
              Open
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>

      <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-[#927C8B]">
        Can&apos;t find an answer?{" "}
        <Link href="/contact" className="font-semibold text-[#B74783] hover:underline">
          Contact Us
        </Link>
        .
      </p>
    </InfoPageShell>
  );
}
