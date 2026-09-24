import Link from "next/link";
import {
  ArrowUpRight,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { BRAND_NAME } from "@/lib/branding";

const productLinks = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Wellness Plan", href: "/wellness-plan" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "About", href: "/about" },
];

const otherLinks = [
  { label: "FAQ", href: "#" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms & Conditions", href: "#" },
  { label: "Cookie Policy", href: "#" },
  { label: "Help Center", href: "#" },
];

const socialLinks = [
  { label: "Facebook", href: "#", Icon: Facebook },
  { label: "X / Twitter", href: "#", Icon: Twitter },
  { label: "Instagram", href: "#", Icon: Instagram },
  { label: "YouTube", href: "#", Icon: Youtube },
  { label: "LinkedIn", href: "#", Icon: Linkedin },
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
      className="group inline-flex items-center gap-1.5 text-[14px] font-medium text-[rgba(231,218,237,0.62)] transition-colors duration-300 hover:text-[#f3eefa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b384c9]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0614]"
    >
      <span>{children}</span>
      <ArrowUpRight className="h-3 w-3 -translate-y-0.5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-70" />
    </Link>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-8 overflow-hidden border-t border-[rgba(216,191,227,0.12)] bg-gradient-to-b from-[rgba(12,8,25,0.35)] via-[rgba(8,5,18,0.72)] to-[rgba(6,3,16,0.92)]">
      {/* Soft atmospheric accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-[rgba(179,132,201,0.08)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-10 h-48 w-48 rounded-full bg-[rgba(179,132,201,0.06)] blur-3xl"
      />

      <div className="container-app relative py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-4">
            <Link
              href="/"
              className="inline-flex transition-opacity duration-300 hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b384c9]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0614]"
              aria-label={BRAND_NAME}
            >
              <BrandLogo variant="stacked" size={56} />
            </Link>
            <p className="mt-5 max-w-sm text-[13px] leading-relaxed text-[rgba(231,218,237,0.38)]">
              Free AI wellness support — with optional licensed psychologist
              sessions when you need deeper guidance.
            </p>
          </div>

          {/* Product */}
          <div className="lg:col-span-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(231,218,237,0.42)]">
              Product
            </h3>
            <ul className="mt-5 space-y-3.5">
              {productLinks.map((item) => (
                <li key={item.label}>
                  <FooterLink href={item.href}>{item.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Other Links */}
          <div className="lg:col-span-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(231,218,237,0.42)]">
              Other Links
            </h3>
            <ul className="mt-5 space-y-3.5">
              {otherLinks.map((item) => (
                <li key={item.label}>
                  <FooterLink href={item.href}>{item.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Need Support + Social */}
          <div className="sm:col-span-2 lg:col-span-3">
            <div className="rounded-[22px] border border-[rgba(216,191,227,0.16)] bg-[rgba(16,11,32,0.45)] p-6 shadow-[0_20px_50px_rgba(6,3,16,0.35)] backdrop-blur-md">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(231,218,237,0.42)]">
                Need Support?
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-[rgba(231,218,237,0.62)]">
                Take the next step toward better mental wellbeing.
              </p>
              <Link
                href="/pricing"
                className="btn-spatium mt-5 inline-flex w-full items-center justify-center gap-2 sm:w-auto"
              >
                Talk to a Psychologist
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(231,218,237,0.42)]">
                Follow Us
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2.5">
                {socialLinks.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      aria-label={label}
                      className="group flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(216,191,227,0.16)] bg-white/[0.03] text-[rgba(231,218,237,0.7)] transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(216,191,227,0.32)] hover:bg-[rgba(179,132,201,0.12)] hover:text-[#f3eefa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b384c9]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0614]"
                    >
                      <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-105" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col gap-4 border-t border-[rgba(216,191,227,0.1)] pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-[rgba(231,218,237,0.4)]">
            © {year} Soul Discovery. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              href="#"
              className="text-[13px] font-medium text-[rgba(231,218,237,0.48)] transition-colors duration-300 hover:text-[#f3eefa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b384c9]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0614]"
            >
              Privacy Policy
            </Link>
            <span
              aria-hidden
              className="hidden h-1 w-1 rounded-full bg-[rgba(231,218,237,0.25)] sm:inline-block"
            />
            <Link
              href="#"
              className="text-[13px] font-medium text-[rgba(231,218,237,0.48)] transition-colors duration-300 hover:text-[#f3eefa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b384c9]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0614]"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
