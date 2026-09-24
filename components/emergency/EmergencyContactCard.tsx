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
      className={`p-4 rounded-xl border border-[rgba(216,191,227,0.18)] flex items-center justify-between gap-3 transition-all hover:shadow-[var(--shadow-card)] ${
        contact.enabled ? "opacity-100 bg-white/[0.035]" : "opacity-60 bg-white/[0.02]"
      }`}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[rgba(179,132,201,0.12)] text-[#b384c9]">
          <User className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-sm tracking-tight text-white">{contact.name}</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold bg-white/[0.06] text-[rgba(231,218,237,0.55)]">
              {contact.relationship}
            </span>
          </div>

          <div className="flex flex-col gap-1 mt-1 text-sm text-[rgba(231,218,237,0.55)]">
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
              : "bg-white/[0.06] text-[rgba(231,218,237,0.55)] cursor-not-allowed"
          }`}
          title="Send a test emergency call"
        >
          {testCallLoading ? "Calling..." : "Test Call"}
        </button>

        <button
          onClick={onEdit}
          className="px-2 py-1.5 text-xs font-medium text-[rgba(231,218,237,0.55)] hover:bg-white/[0.06] hover:text-white rounded-lg transition-colors"
          title="Edit contact"
        >
          Edit
        </button>
        <button
          onClick={() => onToggle(!contact.enabled)}
          className={`relative w-9 h-5 rounded-full transition-colors ${
            contact.enabled ? "bg-success" : "bg-white/[0.06]-foreground/30"
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
