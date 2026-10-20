"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowRight, Heart, Leaf, Mail, MapPin, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { BRAND_NAME } from "@/lib/branding";

/** Colors matched to IMAGE 1 (target). */
const C = {
  deepPlum: "#401B36",
  darkPlum: "#2B1027",
  mauve: "#713653",
  rose: "#C0448B",
  bright: "#E65BA5",
  blush: "#F9DCEB",
  pale: "#FFF1F7",
  white: "#FFFFFF",
  muted: "#A67D9B",
  link: "#F3D5E6",
} as const;

const CONTAINER = "mx-auto w-full max-w-[1120px] px-6";

const productLinks = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Assessment Center", href: "/assessments" },
  { label: "Wellness Plans", href: "/wellness-plan" },
  { label: "To-Do List", href: "/todo" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "About", href: "/about" },
];

const exploreLinks = [
  { label: "FAQ", href: "/faq" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
];

const supportLinks = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "Help Center", href: "/help" },
];

const perks = [
  { label: "Mindful Tips", Icon: Leaf },
  { label: "Expert Guidance", Icon: Heart },
  { label: "Wellness Resources", Icon: Sparkles },
];

const socialLinks = [
  {
    label: "Facebook",
    href: null as string | null,
    path: "M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z",
  },
  {
    label: "Instagram",
    href: null,
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    label: "YouTube",
    href: null,
    path: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
  {
    label: "LinkedIn",
    href: null,
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
];

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-[13px] font-medium text-[#F3D5E6]/90 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E65BA5]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#401B36]"
    >
      {children}
    </Link>
  );
}

function LinkColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <nav aria-label={title}>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
        {title}
      </h3>
      <span
        aria-hidden
        className="mt-2 block h-px w-4"
        style={{ background: C.bright }}
      />
      <ul className="mt-3.5 space-y-2">
        {links.map((item) => (
          <li key={item.label}>
            <FooterLink href={item.href}>{item.label}</FooterLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Light band: pale blush wash only — no repeated full-width wave stripes.
 * One soft accent on the right, behind the newsletter card.
 */
function SoftUpperBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(185deg, ${C.white} 0%, ${C.pale} 48%, #FCE8F3 100%)`,
        }}
      />
      {/* One soft right-side wash only — no full-width stripes */}
      <div
        className="absolute right-0 top-[12%] h-[62%] w-[48%] max-w-full rounded-[45%] opacity-50 blur-2xl"
        style={{
          background: `radial-gradient(ellipse at center, ${C.blush} 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}

/**
 * Compact join: thin blush lip + single deep-plum crest (IMAGE 1 silhouette).
 */
function OrganicWaveTransition() {
  return (
    <div
      className="relative z-[1] -mb-px h-[64px] w-full sm:h-[74px]"
      aria-hidden
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 74"
        preserveAspectRatio="none"
      >
        <path
          fill={C.blush}
          opacity="0.65"
          d="M0,22 C260,40 520,8 820,24 C1100,38 1280,10 1440,26 L1440,40 C1200,24 1000,48 760,32 C500,14 240,44 0,30 Z"
        />
        <path
          fill={C.deepPlum}
          d="M0,38 C240,20 460,56 740,34 C1020,12 1220,52 1440,30 L1440,74 L0,74 Z"
        />
      </svg>
    </div>
  );
}

/**
 * Deep plum surface. Bottom décor = one full-width SVG with gentle undulating
 * paths (long wavelengths, low amplitude). Steep mid-page peaks read as
 * abrupt vertical edges when stretched — keep crests low and soft.
 */
function DarkFooterAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${C.deepPlum} 0%, ${C.deepPlum} 55%, ${C.darkPlum} 100%)`,
        }}
      />
      <svg
        className="absolute inset-x-0 bottom-0 h-[72px] w-full sm:h-[86px]"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="footerWaveFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.mauve} stopOpacity="0" />
            <stop offset="40%" stopColor={C.mauve} stopOpacity="0.5" />
            <stop offset="100%" stopColor={C.mauve} stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="footerWaveFadeBright" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.bright} stopOpacity="0" />
            <stop offset="45%" stopColor={C.bright} stopOpacity="0.4" />
            <stop offset="100%" stopColor={C.bright} stopOpacity="0.7" />
          </linearGradient>
          <radialGradient id="footerRightGlow" cx="82%" cy="100%" r="48%">
            <stop offset="0%" stopColor={C.bright} stopOpacity="0.22" />
            <stop offset="55%" stopColor={C.mauve} stopOpacity="0.1" />
            <stop offset="100%" stopColor={C.darkPlum} stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Soft right-side bloom — no hard edges */}
        <ellipse cx="1180" cy="108" rx="560" ry="78" fill="url(#footerRightGlow)" />
        {/* Gentle continuous ribbons — full width, low amplitude */}
        <path
          fill="url(#footerWaveFade)"
          opacity="0.22"
          d="M0,80 C220,72 400,90 620,78 C840,66 1040,88 1240,76 C1340,70 1400,78 1440,74 L1440,100 L0,100 Z"
        />
        <path
          fill="url(#footerWaveFadeBright)"
          opacity="0.12"
          d="M0,88 C260,82 520,96 800,86 C1080,76 1280,94 1440,84 L1440,100 L0,100 Z"
        />
      </svg>
      {/* Tiny sparkles — far right, above the wave */}
      <svg
        className="absolute bottom-9 right-8 h-9 w-16 opacity-40"
        viewBox="0 0 100 48"
      >
        <circle cx="14" cy="30" r="1" fill={C.blush} />
        <circle cx="42" cy="18" r="0.8" fill={C.white} opacity="0.7" />
        <circle cx="70" cy="34" r="1.1" fill={C.blush} opacity="0.8" />
        <path
          d="M86 10 l0.7 1.8 1.8 0.7 -1.8 0.7 -0.7 1.8 -0.7 -1.8 -1.8 -0.7 1.8 -0.7 z"
          fill={C.blush}
        />
      </svg>
    </div>
  );
}

function NewsletterCard() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
  }

  return (
    <div
      className="relative rounded-[24px] border border-white/80 px-5 py-5 shadow-[0_18px_40px_rgba(192,68,139,0.1)] backdrop-blur-md sm:px-6 sm:py-5"
      style={{ background: "rgba(255, 255, 255, 0.78)" }}
    >
      <p
        className="pointer-events-none absolute right-5 top-4 hidden origin-top-right -rotate-6 text-right leading-[0.95] sm:block"
        style={{ fontFamily: "var(--font-script), cursive", color: C.rose }}
        aria-hidden
      >
        <span className="block text-[24px]">Small steps</span>
        <span className="block text-[24px]">Big changes</span>
        <Heart
          className="ml-auto mt-0.5 h-3 w-3"
          style={{ color: C.bright }}
          strokeWidth={1.6}
        />
      </p>

      <div className="flex items-start gap-3 sm:max-w-[20rem]">
        <span
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ background: C.blush, color: C.rose }}
        >
          <Mail className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <div>
          <h2
            className="text-[15.5px] font-bold tracking-[-0.02em]"
            style={{ color: C.deepPlum }}
          >
            Join our wellness community
          </h2>
          <p className="mt-1 text-[12.5px] leading-snug" style={{ color: C.muted }}>
            Get mindful tips, new features and resources straight to your inbox.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-4" noValidate>
        <label htmlFor="footer-email" className="sr-only">
          Email address
        </label>
        <div className="flex flex-col gap-2 sm:h-[48px] sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:border sm:border-[#F0D0E2] sm:bg-white sm:pl-4 sm:pr-1 sm:shadow-[0_4px_14px_rgba(192,68,139,0.05)] sm:transition sm:focus-within:border-[#E8A8C8] sm:focus-within:shadow-[0_4px_16px_rgba(192,68,139,0.1)]">
          <input
            id="footer-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (error) setError("");
            }}
            className="h-12 min-w-0 flex-1 rounded-full border border-[#F0D0E2] bg-white px-4 text-[13.5px] shadow-none outline-none ring-0 placeholder:text-[#C4A8B8] focus:border-[#E8A8C8] focus:shadow-none focus:outline-none focus:ring-0 focus-visible:border-[#E8A8C8] focus-visible:shadow-none focus-visible:outline-none focus-visible:ring-0 sm:h-full sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0"
            style={{ color: C.deepPlum, boxShadow: "none" }}
          />
          <button
            type="submit"
            className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-1 rounded-full px-4 text-[13px] font-semibold text-white transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E65BA5] focus-visible:ring-offset-2 sm:h-9 sm:w-auto"
            style={{
              background: `linear-gradient(90deg, ${C.bright}, ${C.rose})`,
              boxShadow: "0 6px 14px rgba(192, 68, 139, 0.25)",
            }}
          >
            Subscribe
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-1.5 min-h-[1rem] px-1 text-[12px]" aria-live="polite">
          {error ? <span className="text-[#B4233D]">{error}</span> : null}
        </p>
      </form>

      <ul className="mt-3 grid grid-cols-1 gap-2.5 border-t border-[#F0D4E4] pt-3.5 sm:grid-cols-3 sm:gap-0">
        {perks.map(({ label, Icon }, index) => (
          <li
            key={label}
            className={`flex items-center gap-1.5 sm:justify-center ${
              index > 0 ? "sm:border-l sm:border-[#E8D0DC]" : ""
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: C.rose }} strokeWidth={1.75} />
            <span className="text-[12px] font-medium" style={{ color: C.muted }}>
              {label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="relative z-10 mt-8">
      {/* Light upper band */}
      <section className="relative overflow-hidden">
        <SoftUpperBackdrop />
        {/*
          Fixed navbar (~72–88px) overlays the viewport top when scrolled.
          Generous top padding keeps headline + card clear of the pill nav.
        */}
        <div
          className={`${CONTAINER} relative z-10 grid items-start gap-8 pb-6 pt-6 sm:pb-8 sm:pt-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-12 lg:pb-10 lg:pt-10`}
        >
          <div className="max-w-[420px]">
            <Link
              href="/"
              className="inline-flex rounded-full transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E65BA5] focus-visible:ring-offset-2"
              aria-label={BRAND_NAME}
            >
              <BrandLogo variant="mark" size={38} tone="dark" />
            </Link>

            <h2
              className="mt-5 text-[2.1rem] font-semibold leading-[1.14] tracking-[-0.02em] sm:text-[2.65rem]"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              <span className="block" style={{ color: C.deepPlum }}>
                A little more balance,
              </span>
              <span className="block" style={{ color: C.rose }}>
                every day.
              </span>
            </h2>

            <p
              className="mt-3 max-w-[32ch] text-[14px] leading-relaxed"
              style={{ color: C.muted }}
            >
              Mindful tools for a calmer mind, healthier habits and a brighter
              you.
            </p>

            <Link
              href="/features"
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-full px-5 text-[13.5px] font-semibold text-white transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E65BA5] focus-visible:ring-offset-2"
              style={{
                background: `linear-gradient(90deg, ${C.bright}, ${C.rose})`,
                boxShadow: "0 8px 20px rgba(192, 68, 139, 0.28)",
              }}
            >
              Explore your next step
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <NewsletterCard />
        </div>

        <OrganicWaveTransition />
      </section>

      {/* Dark plum footer — seamless to bottom edge */}
      <section
        className="relative overflow-hidden text-white"
        style={{
          background: `linear-gradient(180deg, ${C.deepPlum} 0%, ${C.darkPlum} 100%)`,
        }}
      >
        <DarkFooterAtmosphere />
        <div className={`${CONTAINER} relative z-10 pb-6 pt-8 sm:pb-7 sm:pt-10`}>
          <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[1.05fr_0.78fr_0.68fr_0.82fr_0.88fr_minmax(240px,1.2fr)] xl:gap-x-6 xl:gap-y-0">
            <div>
              <Link
                href="/"
                className="inline-flex rounded-full transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E65BA5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#401B36]"
                aria-label={BRAND_NAME}
              >
                <BrandLogo variant="mark" size={36} tone="light" />
              </Link>
              <p className="mt-3.5 max-w-[26ch] text-[12.5px] leading-relaxed text-[#F3D5E6]/85">
                Free AI wellness support — with optional licensed psychologist
                sessions when you need deeper guidance.
              </p>
              <Link
                href="/about"
                className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-full border border-white/50 px-3.5 text-[13px] font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E65BA5]"
              >
                Learn more
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <LinkColumn title="Product" links={productLinks} />
            <LinkColumn title="Explore" links={exploreLinks} />
            <LinkColumn title="Support" links={supportLinks} />

            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                Follow us
              </h3>
              <span
                aria-hidden
                className="mt-2 block h-px w-4"
                style={{ background: C.bright }}
              />
              <ul className="mt-3.5 flex flex-wrap gap-2">
                {socialLinks.map(({ label, href, path }) => {
                  const icon = (
                    <svg
                      className="h-3.5 w-3.5 text-[#F9DCEB]"
                      viewBox="0 0 24 24"
                      aria-hidden
                      fill="currentColor"
                    >
                      <path d={path} />
                    </svg>
                  );
                  const shell =
                    "flex h-8 w-8 items-center justify-center rounded-full border border-[#E65BA5]/45 bg-white/[0.05] transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E65BA5]";
                  return (
                    <li key={label}>
                      {href ? (
                        <a
                          href={href}
                          aria-label={label}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={shell}
                        >
                          {icon}
                        </a>
                      ) : (
                        <span
                          aria-label={`${label} (coming soon)`}
                          title="Coming soon"
                          className={`${shell} cursor-default`}
                        >
                          {icon}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 flex items-center gap-2" style={{ color: C.bright }}>
                <Heart className="h-3 w-3 fill-current" />
                <span className="h-px w-6 bg-[#F9DCEB]/30" />
              </div>
              <p className="mt-1.5 text-[12.5px] leading-snug text-[#F3D5E6]/85">
                Real support.
                <br />
                Lasting change.
              </p>
            </div>

            <div
              className="rounded-[30px] border px-7 pb-8 pt-7 sm:col-span-2 xl:col-span-1 xl:min-w-[240px]"
              style={{
                background: "rgba(76, 39, 64, 0.95)",
                borderColor: C.bright,
              }}
            >
              <div className="flex items-center gap-2.5">
                <MapPin
                  className="h-5 w-5 shrink-0"
                  style={{ color: C.bright }}
                  strokeWidth={1.7}
                  aria-hidden
                />
                <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-white">
                  Get in touch
                </h3>
              </div>
              <p className="mt-3.5 text-[14px] leading-[1.55] text-white">
                Our team is here to help with any questions or support you need.
              </p>
              <Link
                href="/contact"
                className="mt-6 inline-flex h-12 w-full items-center justify-between rounded-full border bg-transparent px-5 text-[14px] font-medium text-white transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E65BA5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#401B36]"
                style={{ borderColor: C.bright }}
              >
                <span className="whitespace-nowrap">Contact Support</span>
                <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
              </Link>
            </div>
          </div>

          <div className="relative z-10 mt-10 flex flex-col gap-2.5 border-t border-[#E65BA5]/12 pt-5 sm:mt-12 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:pt-6">
            <p className="text-[12px] leading-none text-[#F9DCEB]/65">
              © 2026 Soul Discovery. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] leading-none">
              <Link
                href="/privacy"
                className="font-medium text-[#F9DCEB]/72 transition-colors hover:text-white"
              >
                Privacy Policy
              </Link>
              <span aria-hidden className="select-none text-[#F9DCEB]/40">
                |
              </span>
              <Link
                href="/terms"
                className="font-medium text-[#F9DCEB]/72 transition-colors hover:text-white"
              >
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}
