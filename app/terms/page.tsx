import Link from "next/link";
import { InfoPageShell } from "@/components/marketing/info-page-shell";
import { LegalCard, LegalSection } from "@/components/marketing/legal-content";
import { BRAND_NAME } from "@/lib/branding";
import {
  SESSION_DURATION_MINUTES,
  SESSION_PRICE_USD,
} from "@/lib/consultation/types";

export default function TermsPage() {
  return (
    <InfoPageShell
      badge="Terms & Conditions"
      title={
        <>
          Terms for using{" "}
          <span className="text-gradient-brand">{BRAND_NAME}</span>
        </>
      }
      description="The basics of using our free AI wellness tools and optional paid psychologist sessions."
    >
      <LegalCard>
        <p className="text-sm text-[#927C8B]">Last updated: October 13, 2026</p>

        <LegalSection title="Agreement">
          <p>
            By creating an account or using {BRAND_NAME}, you agree to these terms and
            our{" "}
            <Link href="/privacy" className="font-semibold text-[#B74783] hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </LegalSection>

        <LegalSection title="The service">
          <p>
            {BRAND_NAME} offers AI-guided emotional wellness features at no charge,
            including conversations, wellness plans, mood tracking, and related tools.
            Optional one-to-one psychologist consultations are available for $
            {SESSION_PRICE_USD} per {SESSION_DURATION_MINUTES}-minute session when you
            choose to book.
          </p>
        </LegalSection>

        <LegalSection title="Accounts">
          <p>
            You are responsible for keeping your login credentials secure and for
            activity that occurs under your account. Provide accurate information when
            registering or booking a consultation.
          </p>
        </LegalSection>

        <LegalSection title="Wellness disclaimer">
          <p>
            AI guidance is supportive and educational. It is not a medical diagnosis,
            emergency service, or substitute for licensed clinical care. Psychologist
            sessions are separate professional consultations subject to applicable
            professional standards.
          </p>
        </LegalSection>

        <LegalSection title="Acceptable use">
          <p>
            Do not misuse the platform, attempt unauthorized access, interfere with
            other users, or use the service for unlawful purposes. We may suspend
            access when needed to protect users or the integrity of the service.
          </p>
        </LegalSection>

        <LegalSection title="Changes">
          <p>
            We may update these terms as the product evolves. Continued use after
            updates means you accept the revised terms. Questions can be sent through
            our{" "}
            <Link href="/contact" className="font-semibold text-[#B74783] hover:underline">
              Contact
            </Link>{" "}
            page.
          </p>
        </LegalSection>
      </LegalCard>
    </InfoPageShell>
  );
}
