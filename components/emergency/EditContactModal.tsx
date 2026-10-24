"use client";

import { useState } from "react";
import { X, User, Heart } from "lucide-react";
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
  initialData: {
    _id: string;
    name: string;
    relationship: string;
    phone?: string;
    whatsappNumber?: string;
    preferredContactMethod?: "phone" | "whatsapp" | "both";
  };
  onEdit: (data: ContactPayload) => Promise<void>;
  onClose: () => void;
}

export function EditContactModal({ initialData, onEdit, onClose }: Props) {
  const [name, setName] = useState(initialData.name || "");
  const [relationship, setRelationship] = useState(initialData.relationship || "");
  const [preferredContactMethod, setPreferredContactMethod] = useState<"phone" | "whatsapp" | "both">(initialData.preferredContactMethod || "phone");
  const [phone, setPhone] = useState(initialData.phone || "");
  const [whatsappNumber, setWhatsappNumber] = useState(initialData.whatsappNumber || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !relationship.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if ((preferredContactMethod === "phone" || preferredContactMethod === "both") && !phone) {
      setError("Phone number is required for emergency calls.");
      return;
    }
    if ((preferredContactMethod === "phone" || preferredContactMethod === "both") && phone && !isValidPhoneNumber(phone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    if ((preferredContactMethod === "whatsapp" || preferredContactMethod === "both") && !whatsappNumber) {
      setError("WhatsApp number is required for WhatsApp notifications.");
      return;
    }
    if ((preferredContactMethod === "whatsapp" || preferredContactMethod === "both") && whatsappNumber && !isValidPhoneNumber(whatsappNumber)) {
      setError("Please enter a valid WhatsApp number.");
      return;
    }

    setLoading(true);
    try {
      await onEdit({
        name: name.trim(),
        relationship: relationship.trim(),
        preferredContactMethod,
        phone: phone.trim() || undefined,
        whatsappNumber: whatsappNumber.trim() || undefined,
        priority: 1,
        enabled: true,
      });
    } catch (err: any) {
      setError(err.message || "Failed to add contact");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl p-6 shadow-[var(--shadow-card-hover)] animate-in fade-in zoom-in-95 duration-200 bg-[#FFF0F6]/95 text-[#49263D] border border-[#EADCE5] backdrop-blur-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#FFF0F6] transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-[#927C8B]" />
        </button>

        <h2 className="text-xl font-bold mb-6 tracking-tight">Edit Emergency Contact</h2>

        {error && (
          <div className="mb-4 p-3 text-sm rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[#927C8B]">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#927C8B]/60" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EADCE5] bg-white text-[#49263D] focus:outline-none focus:ring-2 focus:ring-[#B74783]/30 focus:border-[rgba(183,71,131,0.55)] transition-shadow"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-[#927C8B]">Relationship</label>
            <div className="relative">
              <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#927C8B]/60" />
              <input
                type="text"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="Spouse, Parent, Therapist..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EADCE5] bg-white text-[#49263D] focus:outline-none focus:ring-2 focus:ring-[#B74783]/30 focus:border-[rgba(183,71,131,0.55)] transition-shadow"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-[#927C8B]">Preferred Emergency Method</label>
            <div className="flex p-1 rounded-xl bg-[#FFF0F6] border border-[#EADCE5]">
              {(["phone", "whatsapp", "both"] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPreferredContactMethod(method)}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    preferredContactMethod === method
                      ? "bg-[#FFF0F6] text-[#D9B8F5] shadow-sm"
                      : "text-[#927C8B] hover:text-[#49263D]"
                  }`}
                >
                  {method === "phone" ? "SMS (phone)" : method === "whatsapp" ? "SMS (alt number)" : "Both numbers"}
                </button>
              ))}
            </div>
          </div>

          {(preferredContactMethod === "phone" || preferredContactMethod === "both") && (
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#927C8B]">Phone Number (Voice Calls)</label>
              <div className="w-full px-4 py-2.5 rounded-xl border border-[#EADCE5] bg-white focus-within:ring-2 focus-within:ring-[#B74783]/30 focus-within:border-[rgba(183,71,131,0.55)] transition-shadow phone-input-wrapper">
                <PhoneInput
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(val: string | undefined) => setPhone(val || "")}
                  international
                  defaultCountry="US"
                  className="phone-input-field"
                />
              </div>
            </div>
          )}

          {(preferredContactMethod === "whatsapp" || preferredContactMethod === "both") && (
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#927C8B]">WhatsApp Number</label>
              <div className="w-full px-4 py-2.5 rounded-xl border border-[#EADCE5] bg-white focus-within:ring-2 focus-within:ring-[#B74783]/30 focus-within:border-[rgba(183,71,131,0.55)] transition-shadow phone-input-wrapper">
                <PhoneInput
                  placeholder="Enter WhatsApp number"
                  value={whatsappNumber}
                  onChange={(val: string | undefined) => setWhatsappNumber(val || "")}
                  international
                  defaultCountry="US"
                  className="phone-input-field"
                />
              </div>
            </div>
          )}

          <style jsx global>{`
            .phone-input-wrapper .PhoneInput {
              display: flex;
              align-items: center;
            }
            .phone-input-wrapper .PhoneInputCountry {
              margin-right: 12px;
            }
            .phone-input-wrapper .PhoneInputInput {
              border: none;
              background: transparent;
              outline: none;
              flex: 1;
              color: hsl(var(--foreground));
              font-size: 1rem;
            }
            .phone-input-wrapper .PhoneInputCountrySelectArrow {
              opacity: 0.5;
            }
          `}</style>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-medium border border-[#EADCE5] hover:bg-[#FFF0F6] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl font-medium bg-white text-[#49263D] shadow-[rgba(255,255,255,0.7)_0px_1px_0px_0px_inset,rgba(183,71,131,0.35)_0px_10px_30px_0px] hover:brightness-105 transition-all disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
