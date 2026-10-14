import Link from "next/link";
import { InfoPageShell } from "@/components/marketing/info-page-shell";
import { LegalCard, LegalSection } from "@/components/marketing/legal-content";
import { BRAND_NAME } from "@/lib/branding";

export default function CookiesPage() {
  return (
    <InfoPageShell
      badge="Cookie Policy"
      title={
        <>
          How {BRAND_NAME} uses{" "}
          <span className="text-gradient-brand">cookies</span>
        </>
      }
      description="A short overview of cookies and similar technologies used to keep the app working."
    >
      <LegalCard>
        <p className="text-sm text-[#927C8B]">Last updated: October 13, 2026</p>

        <LegalSection title="What cookies are">
          <p>
            Cookies are small text files stored on your device. {BRAND_NAME} may also
            use related storage such as local storage for session and preference data.
          </p>
        </LegalSection>

        <LegalSection title="Why we use them">
          <p>
            Essential cookies and storage help you stay signed in, remember settings,
            protect security, and keep core features working across pages.
          </p>
          <p>
            We may use limited analytics-style information to understand product
            reliability and improve the experience. We do not use cookies to sell your
            personal information.
          </p>
        </LegalSection>

        <LegalSection title="Your controls">
          <p>
            Most browsers let you block or delete cookies. If you disable essential
            cookies, some features (including sign-in) may not work correctly.
          </p>
        </LegalSection>

        <LegalSection title="Learn more">
          <p>
            For broader data practices, see our{" "}
            <Link href="/privacy" className="font-semibold text-[#B74783] hover:underline">
              Privacy Policy
            </Link>
            . Questions are welcome via{" "}
            <Link href="/contact" className="font-semibold text-[#B74783] hover:underline">
              Contact Us
            </Link>
            .
          </p>
        </LegalSection>
      </LegalCard>
    </InfoPageShell>
  );
}
