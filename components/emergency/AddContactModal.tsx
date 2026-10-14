"use client";

import { useState } from "react";
import {
  X,
  User,
  Heart,
  Phone,
  MessageCircle,
  ChevronDown,
  Plus,
  UserRoundPlus,
  Smartphone,
} from "lucide-react";
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";

interface ContactPayload {
  name: string;
  relationship: string;
  phone?: string;
  whatsappNumber?: string;
  preferredContactMethod: "phone" | "whatsapp" | "both";
  priority: number;
  enabled: boolean;
}

interface Props {
  onAdd: (data: ContactPayload) => Promise<void>;
  onClose: () => void;
}

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const RELATIONSHIP_OPTIONS = [
  "Spouse",
  "Parent",
  "Sibling",
  "Friend",
  "Therapist",
  "Partner",
  "Family",
  "Other",
];

export function AddContactModal({ onAdd, onClose }: Props) {
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] = useState<
    "phone" | "whatsapp" | "both"
  >("whatsapp");
  const [phone, setPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !relationship.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (
      (preferredContactMethod === "phone" ||
        preferredContactMethod === "both") &&
      !phone
    ) {
      setError("Phone number is required for emergency calls.");
      return;
    }
    if (
      (preferredContactMethod === "phone" ||
        preferredContactMethod === "both") &&
      phone &&
      !isValidPhoneNumber(phone)
    ) {
      setError("Please enter a valid phone number.");
      return;
    }

    if (
      (preferredContactMethod === "whatsapp" ||
        preferredContactMethod === "both") &&
      !whatsappNumber
    ) {
      setError("WhatsApp number is required for WhatsApp notifications.");
      return;
    }
    if (
      (preferredContactMethod === "whatsapp" ||
        preferredContactMethod === "both") &&
      whatsappNumber &&
      !isValidPhoneNumber(whatsappNumber)
    ) {
      setError("Please enter a valid WhatsApp number.");
      return;
    }

    setLoading(true);
    try {
      await onAdd({
        name: name.trim(),
        relationship: relationship.trim(),
        preferredContactMethod,
        phone: phone.trim() || undefined,
        whatsappNumber: whatsappNumber.trim() || undefined,
        priority: 1,
        enabled: true,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to add contact";
      setError(message);
      setLoading(false);
    }
  };

  const methods = [
    {
      id: "phone" as const,
      label: "Phone Call",
      icon: Phone,
    },
    {
      id: "whatsapp" as const,
      label: "WhatsApp",
      icon: WhatsAppGlyph,
    },
    {
      id: "both" as const,
      label: "Both",
      icon: MessageCircle,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#49263D]/35 p-4 backdrop-blur-[6px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-contact-title"
        className="relative w-full max-w-[440px] overflow-hidden rounded-[28px] border border-[#F0E4EC] bg-[#FFFBFD] p-6 shadow-[0_24px_64px_rgba(123,57,98,0.18)] animate-in fade-in zoom-in-95 duration-200 sm:p-7"
      >
        {/* Soft pink blob — matches reference wash in top-right */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,rgba(232,168,198,0.45)_0%,rgba(245,210,230,0.2)_45%,transparent_70%)] blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-6 top-0 h-28 w-40 rotate-12 rounded-[40%] bg-gradient-to-br from-[#F8D6E8]/70 via-[#EED4F5]/40 to-transparent blur-xl"
        />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#F0E4EC] bg-white/80 text-[#795A70] transition hover:bg-[#FFF0F6] hover:text-[#49263D]"
          aria-label="Close"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>

        <div className="relative mb-6 flex items-start gap-3.5 pr-10">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFF0F6] text-[#B74783] shadow-[inset_0_0_0_1px_rgba(234,220,229,0.8)]">
            <UserRoundPlus className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 pt-0.5">
            <h2
              id="add-contact-title"
              className="text-[1.25rem] font-bold tracking-[-0.02em] text-[#49263D]"
            >
              Add Emergency Contact
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-[#927C8B]">
              Add a trusted person who can be reached in case of an emergency.
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="relative mb-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative space-y-5">
          {/* Full Name */}
          <div>
            <label
              htmlFor="add-contact-name"
              className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#49263D]"
            >
              <User className="h-3.5 w-3.5 text-[#B74783]" strokeWidth={2} />
              Full Name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B8A3B2]" />
              <input
                id="add-contact-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                autoComplete="name"
                className="h-12 w-full rounded-full border border-[#EADCE5] bg-white pl-11 pr-4 text-[15px] text-[#49263D] shadow-[0_2px_8px_rgba(123,57,98,0.03)] placeholder:text-[#B8A3B2] outline-none transition focus:border-[#D98CB4] focus:ring-2 focus:ring-[#B74783]/20"
              />
            </div>
          </div>

          {/* Relationship */}
          <div>
            <label
              htmlFor="add-contact-relationship"
              className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#49263D]"
            >
              <Heart className="h-3.5 w-3.5 text-[#B74783]" strokeWidth={2} />
              Relationship
            </label>
            <div className="relative">
              <Heart className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B8A3B2]" />
              <select
                id="add-contact-relationship"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="h-12 w-full appearance-none rounded-full border border-[#EADCE5] bg-white pl-11 pr-11 text-[15px] leading-[3rem] text-[#49263D] shadow-[0_2px_8px_rgba(123,57,98,0.03)] outline-none transition focus:border-[#D98CB4] focus:ring-2 focus:ring-[#B74783]/20"
              >
                <option value="" disabled>
                  Spouse, Parent, Therapist...
                </option>
                {RELATIONSHIP_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#927C8B]" />
            </div>
          </div>

          {/* Preferred method */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#49263D]">
              <Smartphone
                className="h-3.5 w-3.5 text-[#B74783]"
                strokeWidth={2}
              />
              Preferred Emergency Method
            </p>
            <div
              role="radiogroup"
              aria-label="Preferred emergency method"
              className="flex gap-1 rounded-full border border-[#EADCE5] bg-[#FCF6FA] p-1"
            >
              {methods.map((method) => {
                const active = preferredContactMethod === method.id;
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setPreferredContactMethod(method.id)}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-2.5 text-[12px] font-semibold transition sm:text-[13px] ${
                      active
                        ? "bg-gradient-to-r from-[#C45A96] to-[#A63F79] text-white shadow-[0_6px_16px_rgba(183,71,131,0.35)]"
                        : "text-[#795A70] hover:bg-white/70 hover:text-[#49263D]"
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 shrink-0 ${
                        active ? "text-white" : "text-[#B74783]"
                      }`}
                    />
                    <span className="truncate">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {(preferredContactMethod === "phone" ||
            preferredContactMethod === "both") && (
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#49263D]">
                <Phone className="h-3.5 w-3.5 text-[#B74783]" strokeWidth={2} />
                Phone Number
              </label>
              <div className="add-contact-phone flex h-12 items-center rounded-full border border-[#EADCE5] bg-white px-4 shadow-[0_2px_8px_rgba(123,57,98,0.03)] transition focus-within:border-[#D98CB4] focus-within:ring-2 focus-within:ring-[#B74783]/20">
                <PhoneInput
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(val: string | undefined) => setPhone(val || "")}
                  international
                  defaultCountry="US"
                  className="phone-input-field w-full"
                />
              </div>
            </div>
          )}

          {(preferredContactMethod === "whatsapp" ||
            preferredContactMethod === "both") && (
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#49263D]">
                <WhatsAppGlyph className="h-3.5 w-3.5 text-[#25D366]" />
                WhatsApp Number
              </label>
              <div className="add-contact-phone flex h-12 items-center rounded-full border border-[#EADCE5] bg-white px-4 shadow-[0_2px_8px_rgba(123,57,98,0.03)] transition focus-within:border-[#D98CB4] focus-within:ring-2 focus-within:ring-[#B74783]/20">
                <PhoneInput
                  placeholder="Enter WhatsApp number"
                  value={whatsappNumber}
                  onChange={(val: string | undefined) =>
                    setWhatsappNumber(val || "")
                  }
                  international
                  defaultCountry="US"
                  className="phone-input-field w-full"
                />
              </div>
            </div>
          )}

          <style jsx global>{`
            .add-contact-phone .PhoneInput {
              display: flex;
              align-items: center;
              width: 100%;
            }
            .add-contact-phone .PhoneInputCountry {
              margin-right: 10px;
            }
            .add-contact-phone .PhoneInputInput {
              border: none;
              background: transparent;
              outline: none;
              flex: 1;
              color: #49263d;
              font-size: 15px;
            }
            .add-contact-phone .PhoneInputInput::placeholder {
              color: #b8a3b2;
            }
            .add-contact-phone .PhoneInputCountrySelectArrow {
              opacity: 0.55;
              margin-left: 4px;
            }
          `}</style>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-12 flex-1 rounded-full border border-[#E8C5D8] bg-white text-[15px] font-semibold text-[#49263D] transition hover:bg-[#FFF0F6]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#C45A96] to-[#A63F79] text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(183,71,131,0.32)] transition hover:brightness-105 disabled:opacity-50"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/80">
                <Plus className="h-3 w-3" strokeWidth={2.5} />
              </span>
              {loading ? "Adding…" : "Add Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
