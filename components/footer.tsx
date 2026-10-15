import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { BRAND_NAME } from "@/lib/branding";

const productLinks = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Assessment Center", href: "/assessments" },
  { label: "Wellness Plans", href: "/wellness-plan" },
  { label: "To-Do List", href: "/todo" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "About", href: "/about" },
];

const otherLinks = [
  { label: "FAQ", href: "/faq" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "Help Center", href: "/help" },
];

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden fill="#1877F2">
      <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <defs>
        <radialGradient id="footer-ig" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#FDF497" />
          <stop offset="5%" stopColor="#FDF497" />
          <stop offset="45%" stopColor="#FD5949" />
          <stop offset="60%" stopColor="#D6249F" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <path
        fill="url(#footer-ig)"
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
      />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden fill="#FF0000">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden fill="#0A66C2">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const socialLinks = [
  { label: "Facebook", href: null, Icon: FacebookIcon },
  { label: "Instagram", href: null, Icon: InstagramIcon },
  { label: "YouTube", href: null, Icon: YouTubeIcon },
  { label: "LinkedIn", href: null, Icon: LinkedInIcon },
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
      className="text-[13px] font-medium text-[#795A70] transition-colors duration-200 hover:text-[#B74783] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      {children}
    </Link>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-6 border-t border-[#EADCE5] bg-white">
      <div className="container-app py-8 md:py-9">
        {/* Compact main row */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          {/* Brand */}
          <div className="max-w-[260px] shrink-0">
            <Link
              href="/"
              className="inline-flex transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4] focus-visible:ring-offset-2"
              aria-label={BRAND_NAME}
            >
              <BrandLogo variant="mark" size={32} tone="dark" />
            </Link>
            <p className="mt-3 text-[12.5px] leading-relaxed text-[#927C8B]">
              Free AI wellness support — with optional licensed psychologist
              sessions when you need deeper guidance.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid flex-1 grid-cols-2 gap-6 lg:max-w-[420px] lg:gap-10">
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#B74783]/80">
                Product
              </h3>
              <ul className="mt-3 space-y-2">
                {productLinks.map((item) => (
                  <li key={item.label}>
                    <FooterLink href={item.href}>{item.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#B74783]/80">
                Other Links
              </h3>
              <ul className="mt-3 space-y-2">
                {otherLinks.map((item) => (
                  <li key={item.label}>
                    <FooterLink href={item.href}>{item.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Support + social — slim column */}
          <div className="flex w-full shrink-0 flex-col gap-4 lg:w-[240px]">
            <div className="rounded-2xl border border-[#EADCE5] bg-[#FFF6FA] px-4 py-3.5">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#927C8B]">
                Need Support?
              </h3>
              <p className="mt-1.5 text-[13px] leading-snug text-[#795A70]">
                Take the next step toward better mental wellbeing.
              </p>
              <Link
                href="/pricing"
                className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-[#B74783] px-4 text-[13px] font-semibold text-white transition hover:bg-[#A63F79]"
              >
                Talk to a Psychologist
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#927C8B]">
                Follow Us
              </h3>
              <ul className="mt-2.5 flex flex-wrap gap-2">
                {socialLinks.map(({ label, href, Icon }) => {
                  const icon = <Icon className="h-5 w-5" />;
                  const shell =
                    "flex h-9 w-9 items-center justify-center rounded-full border border-[#EADCE5] bg-white transition hover:border-[#DFC7D6] hover:bg-[#FFF8FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]";
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
                          className={`${shell} cursor-default opacity-90`}
                        >
                          {icon}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Slim legal strip */}
        <div className="mt-7 flex flex-col gap-2 border-t border-[#EADCE5] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-[#927C8B]">
            © {year} Soul Discovery. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link
              href="/privacy"
              className="text-[12px] font-medium text-[#795A70] transition-colors hover:text-[#B74783]"
            >
              Privacy Policy
            </Link>
            <span aria-hidden className="text-[#DFC7D6]">
              ·
            </span>
            <Link
              href="/terms"
              className="text-[12px] font-medium text-[#795A70] transition-colors hover:text-[#B74783]"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
