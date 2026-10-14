import { InfoPageShell } from "@/components/marketing/info-page-shell";
import { LegalCard, LegalSection } from "@/components/marketing/legal-content";
import { BRAND_NAME } from "@/lib/branding";

export default function PrivacyPage() {
  return (
    <InfoPageShell
      badge="Privacy Policy"
      title={
        <>
          Your privacy matters to{" "}
          <span className="text-gradient-brand">{BRAND_NAME}</span>
        </>
      }
      description="How we handle account information, wellness data, and optional professional consultations."
    >
      <LegalCard>
        <p className="text-sm text-[#927C8B]">Last updated: October 13, 2026</p>

        <LegalSection title="Overview">
          <p>
            {BRAND_NAME} provides AI-powered emotional wellness tools and optional
            licensed psychologist consultations. This policy explains what information
            we collect to operate the service and how we protect it.
          </p>
        </LegalSection>

        <LegalSection title="Information we collect">
          <p>
            Account details such as name and email, profile preferences, wellness
            activity progress, mood entries, conversation history with the AI assistant,
            and booking details when you schedule a psychologist session.
          </p>
          <p>
            Optional features (for example camera-based mood tools) process data only
            when you enable them and are designed with privacy in mind.
          </p>
        </LegalSection>

        <LegalSection title="How we use information">
          <p>
            We use your information to provide personalized wellness support, save
            progress, improve product reliability and safety, enable optional
            consultations, and communicate important account or service updates.
          </p>
        </LegalSection>

        <LegalSection title="Sharing">
          <p>
            We do not sell your personal information. Limited sharing may occur with
            trusted processors needed to run the service (for example hosting,
            authentication, or payment providers when booking paid sessions), or when
            required by law.
          </p>
          <p>
            Emergency contact features only notify contacts you configure, according to
            the permissions and workflows available in Emergency settings.
          </p>
        </LegalSection>

        <LegalSection title="Your choices">
          <p>
            You can update profile information in your account, manage emergency
            contacts, and request account-related changes through the Contact or Help
            pages. Some data is retained as needed for security, legal, or service
            continuity reasons.
          </p>
        </LegalSection>

        <LegalSection title="Important note">
          <p>
            {BRAND_NAME} is a wellness platform and does not replace emergency
            services or clinical care. If you are in immediate danger, contact local
            emergency services right away.
          </p>
        </LegalSection>
      </LegalCard>
    </InfoPageShell>
  );
}
