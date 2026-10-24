"use client";

import { Trash2, PhoneCall, User, MessageCircle } from "lucide-react";

interface Contact {
  _id: string;
  name: string;
  relationship: string;
  phone?: string;
  whatsappNumber?: string;
  preferredContactMethod?: "phone" | "whatsapp" | "both";
  priority: number;
  enabled: boolean;
}

interface Props {
  contact: Contact;
  onDelete: () => void;
  onToggle: (enabled: boolean) => void;
  onEdit: () => void;
  onTestCall: () => void;
  testCallLoading?: boolean;
}

export function EmergencyContactCard({ contact, onDelete, onToggle, onEdit, onTestCall, testCallLoading }: Props) {
  return (
    <div
      className={`p-4 rounded-xl border border-[#EADCE5] flex items-center justify-between gap-3 transition-all hover:shadow-[var(--shadow-card)] ${
        contact.enabled ? "opacity-100 bg-white" : "opacity-60 bg-white/[0.02]"
      }`}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[#FFE5F0] text-[#B74783]">
          <User className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-sm tracking-tight text-[#49263D]">{contact.name}</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold bg-[#FFF0F6] text-[#927C8B]">
              {contact.relationship}
            </span>
          </div>

          <div className="flex flex-col gap-1 mt-1 text-sm text-[#927C8B]">
            {(!contact.preferredContactMethod || contact.preferredContactMethod === "phone" || contact.preferredContactMethod === "both") && contact.phone && (
              <div className="flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{contact.phone}</span>
              </div>
            )}
            {(contact.preferredContactMethod === "whatsapp" || contact.preferredContactMethod === "both") && contact.whatsappNumber && (
              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-success" />
                <span>{contact.whatsappNumber} (WhatsApp)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onTestCall}
          disabled={testCallLoading || !contact.enabled}
          className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
            contact.enabled
              ? "bg-info/10 text-info hover:bg-info/20"
              : "bg-[#FFF0F6] text-[#927C8B] cursor-not-allowed"
          }`}
          title="Send a test emergency call"
        >
          {testCallLoading ? "Sending..." : "Test SMS"}
        </button>

        <button
          onClick={onEdit}
          className="px-2 py-1.5 text-xs font-medium text-[#927C8B] hover:bg-[#FFF0F6] hover:text-[#49263D] rounded-lg transition-colors"
          title="Edit contact"
        >
          Edit
        </button>
        <button
          onClick={() => onToggle(!contact.enabled)}
          className={`relative w-9 h-5 rounded-full transition-colors ${
            contact.enabled ? "bg-success" : "bg-[#FFF0F6]-foreground/30"
          }`}
          title={contact.enabled ? "Disable contact" : "Enable contact"}
        >
          <span
            className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full shadow transition-transform ${
              contact.enabled ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>

        <button
          onClick={onDelete}
          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          title="Delete contact"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
