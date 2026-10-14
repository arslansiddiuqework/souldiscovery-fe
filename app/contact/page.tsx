"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, LifeBuoy, MessageCircle, Stethoscope } from "lucide-react";
import { InfoPageShell } from "@/components/marketing/info-page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BRAND_NAME } from "@/lib/branding";

const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sentHint, setSentHint] = useState("");

  const mailtoHref = useMemo(() => {
    if (!SUPPORT_EMAIL) return "";
    const subject = encodeURIComponent(`${BRAND_NAME} contact form`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}`
    );
    return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  }, [name, email, message]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSentHint("");

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in your name, email, and message.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (SUPPORT_EMAIL && mailtoHref) {
      window.location.href = mailtoHref;
      setSentHint("Your email app should open with your message drafted.");
      return;
    }

    setSentHint(
      "Thanks for reaching out. For the fastest help, use the Help Center links below or book a psychologist session from Pricing."
    );
  };

  return (
    <InfoPageShell
      badge="Contact"
      title={
        <>
          We&apos;re here to{" "}
          <span className="text-gradient-brand">help</span>
        </>
      }
      description="Reach out with product questions, feedback, or support requests. For immediate danger, contact local emergency services."
    >
      <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <form
          onSubmit={onSubmit}
          className="rounded-[22px] border border-[#EADCE5] bg-white p-6 shadow-[0_8px_28px_rgba(123,57,98,0.07)] md:p-8"
        >
          <h2 className="text-xl font-semibold text-[#49263D]">Send a message</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#795A70]">
            {SUPPORT_EMAIL
              ? `Messages open in your email app to ${SUPPORT_EMAIL}.`
              : "Share your details below. You can also use the quick links for common support paths."}
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-[#49263D]">
                Name
              </label>
              <Input
                id="contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-[#49263D]">
                Email
              </label>
              <Input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-[#49263D]">
                Message
              </label>
              <textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="How can we help?"
                className="flex w-full rounded-[12px] border border-[#EADCE5] bg-white px-3 py-2 text-sm text-[#49263D] shadow-sm placeholder:text-[#927C8B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4] focus-visible:ring-offset-2"
              />
            </div>
          </div>

          {error ? (
            <p className="mt-3 text-sm font-medium text-[#B4233D]" role="alert">
              {error}
            </p>
          ) : null}
          {sentHint ? (
            <p className="mt-3 text-sm font-medium text-[#287D58]" role="status">
              {sentHint}
            </p>
          ) : null}

          <Button type="submit" className="mt-6 w-full sm:w-auto">
            Send message
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <div className="space-y-3">
          <QuickLink
            href="/help"
            icon={LifeBuoy}
            title="Help Center"
            description="Guides to accounts, wellness plans, and emergency settings."
          />
          <QuickLink
            href="/faq"
            icon={MessageCircle}
            title="FAQ"
            description="Answers about free AI features and paid sessions."
          />
          <QuickLink
            href="/pricing"
            icon={Stethoscope}
            title="Talk to a Psychologist"
            description="Book an optional licensed online consultation."
          />
          <p className="px-1 pt-2 text-xs leading-relaxed text-[#927C8B]">
            If you are in crisis or immediate danger, contact local emergency
            services. You can also manage emergency contacts in{" "}
            <Link href="/settings/emergency" className="font-semibold text-[#B74783] hover:underline">
              Emergency settings
            </Link>
            .
          </p>
        </div>
      </div>
    </InfoPageShell>
  );
}

function QuickLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex gap-4 rounded-[18px] border border-[#EADCE5] bg-white p-5 shadow-[0_8px_28px_rgba(123,57,98,0.06)] transition-all hover:-translate-y-0.5 hover:border-[#DFC7D6] hover:shadow-[0_12px_32px_rgba(123,57,98,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFE5F0] text-[#B74783]">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block font-semibold text-[#49263D] group-hover:text-[#B74783]">
          {title}
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-[#795A70]">
          {description}
        </span>
      </span>
    </Link>
  );
}
