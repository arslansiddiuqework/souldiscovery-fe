"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, Phone, Plus, AlertTriangle, CheckCircle2, Clock, ChevronRight } from "lucide-react";
import { ConsentModal } from "@/components/emergency/ConsentModal";
import { AddContactModal } from "@/components/emergency/AddContactModal";
import { EditContactModal } from "@/components/emergency/EditContactModal";
import { EmergencyContactCard } from "@/components/emergency/EmergencyContactCard";

// ── Types ─────────────────────────────────────────────────────────────────────
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

interface EscalationStatus {
  consentAccepted: boolean;
  autoCallEnabled: boolean;
  contactCount: number;
  onCooldown: boolean;
  cooldownExpiresAt: string | null;
  lastEscalation: { outcome: string; createdAt: string } | null;
}

const API = process.env.NEXT_PUBLIC_API_URL;

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(err.message || "Request failed");
  }
  return res.json();
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function EmergencySettingsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [status, setStatus] = useState<EscalationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoCallEnabled, setAutoCallEnabled] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [testCallLoadingId, setTestCallLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    try {
      const [contactsRes, statusRes] = await Promise.all([
        apiFetch("/api/emergency/contacts"),
        apiFetch("/api/emergency/status"),
      ]);
      setContacts(contactsRes.contacts || []);
      setStatus(statusRes);
      setAutoCallEnabled(statusRes.autoCallEnabled || false);
    } catch (err) {
      showToast("Failed to load emergency settings", "err");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleConsentAccepted = async () => {
    try {
      await apiFetch("/api/emergency/consent", { method: "POST" });
      setShowConsentModal(false);
      showToast("Consent accepted — you can now add emergency contacts.");
      await loadData();
    } catch { showToast("Failed to save consent", "err"); }
  };

  const handleToggleAutoCall = async (enabled: boolean) => {
    if (enabled && !status?.consentAccepted) {
      setShowConsentModal(true);
      return;
    }
    try {
      setAutoCallEnabled(enabled);
      await apiFetch("/api/emergency/settings", {
        method: "PUT",
        body: JSON.stringify({ autoCallEnabled: enabled }),
      });
      showToast(enabled ? "Auto-calling enabled." : "Auto-calling disabled.");
      await loadData();
    } catch { showToast("Failed to update setting", "err"); setAutoCallEnabled(!enabled); }
  };

  const handleAddContact = async (data: Omit<Contact, "_id">) => {
    try {
      const res = await apiFetch("/api/emergency/contacts", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setContacts(res.contacts);
      setShowAddModal(false);
      showToast("Emergency contact saved successfully.");
    } catch (err: any) { showToast(err.message || "Failed to add contact", "err"); }
  };

  const handleEditContact = async (contactId: string, data: Omit<Contact, "_id">) => {
    try {
      const res = await apiFetch(`/api/emergency/contacts/${contactId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      setContacts(res.contacts);
      setEditingContact(null);
      showToast("Emergency contact updated successfully.");
    } catch (err: any) { showToast(err.message || "Failed to update contact", "err"); }
  };

  const handleTestCall = async (contactId: string) => {
    setTestCallLoadingId(contactId);
    try {
      const res = await apiFetch("/api/emergency/test-call", {
        method: "POST",
        body: JSON.stringify({ contactId }),
      });
      showToast(res.message || "Test call initiated successfully.");
    } catch (err: any) {
      showToast(err.message || "Failed to initiate test call", "err");
    } finally {
      setTestCallLoadingId(null);
    }
  };

  const handleDeleteContact = async (contactId: string, name: string) => {
    try {
      const res = await apiFetch(`/api/emergency/contacts/${contactId}`, { method: "DELETE" });
      setContacts(res.contacts);
      showToast("Emergency contact deleted successfully.");
    } catch { showToast("Failed to remove contact", "err"); }
  };

  const handleToggleContact = async (contactId: string, enabled: boolean) => {
    try {
      const res = await apiFetch(`/api/emergency/contacts/${contactId}`, {
        method: "PUT",
        body: JSON.stringify({ enabled }),
      });
      setContacts(res.contacts);
      showToast("Emergency contact updated successfully.");
    } catch { showToast("Failed to update contact", "err"); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="animate-pulse text-center">
          <Shield className="w-12 h-12 mx-auto mb-3 text-[#b384c9]/40" />
          <p className="text-[rgba(231,218,237,0.55)]">Loading emergency settings…</p>
        </div>
      </div>
    );
  }

  const isReady = status?.consentAccepted && contacts.filter(c => c.enabled).length > 0 && autoCallEnabled;

  return (
    <div className="page-shell pb-16 text-[#f3eefa]">
      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed right-4 top-24 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-premium transition-all ${
            toast.type === "ok" ? "bg-success" : "bg-destructive"
          }`}
        >
          {toast.type === "ok" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="border-b border-[rgba(216,191,227,0.18)] bg-white/[0.03] backdrop-blur-sm">
        <div className="container-app max-w-2xl py-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-destructive/10 p-3">
              <Shield className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#f3eefa]">
                Emergency Settings
              </h1>
              <p className="text-sm text-[rgba(231,218,237,0.55)]">
                Configure crisis escalation and emergency contacts
              </p>
            </div>
          </div>

          {/* System status badge */}
          <div
            className={`mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm border ${
              isReady
                ? "bg-success/10 border-success/20 text-success"
                : "bg-warning/10 border-warning/20 text-warning-foreground"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isReady ? "bg-success" : "bg-warning"}`} />
            <span className="font-medium">
              {isReady
                ? "Emergency system active — auto-calling enabled"
                : "Emergency system inactive — complete setup below"}
            </span>
          </div>
        </div>
      </div>

      <div className="container-app max-w-2xl space-y-6 py-8">

        {/* ── Step 1: Consent ── */}
        <section className="glass-panel space-y-4 rounded-[22px] border-[rgba(216,191,227,0.18)] p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold
                ${status?.consentAccepted ? "bg-success text-success-foreground" : "bg-white/[0.08] text-[rgba(231,218,237,0.55)]"}`}>
                {status?.consentAccepted ? "✓" : "1"}
              </div>
              <div>
                <p className="font-semibold text-sm">Privacy Consent</p>
                <p className="text-xs text-[rgba(231,218,237,0.55)]">Required before adding contacts</p>
              </div>
            </div>
            {status?.consentAccepted ? (
              <span className="text-xs text-success font-medium">Accepted</span>
            ) : (
              <button
                onClick={() => setShowConsentModal(true)}
                className="text-xs px-3 py-1.5 rounded-lg font-medium rounded-full bg-white text-[#1c1033] shadow-[rgba(255,255,255,0.7)_0px_1px_0px_0px_inset,rgba(179,132,201,0.35)_0px_10px_30px_0px] transition-opacity hover:opacity-90"
              >
                Review & Accept
              </button>
            )}
          </div>
        </section>

        {/* ── Step 2: Contacts ── */}
        <section className="glass-panel space-y-4 rounded-[22px] border-[rgba(216,191,227,0.18)] p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold
                ${contacts.length > 0 ? "bg-success text-success-foreground" : "bg-white/[0.08] text-[rgba(231,218,237,0.55)]"}`}>
                {contacts.length > 0 ? "✓" : "2"}
              </div>
              <div>
                <p className="font-semibold text-sm">Emergency Contacts</p>
                <p className="text-xs text-[rgba(231,218,237,0.55)]">{contacts.length} / 5 contacts added</p>
              </div>
            </div>
            {contacts.length < 5 && (
              <button
                onClick={() => {
                  if (!status?.consentAccepted) { setShowConsentModal(true); return; }
                  setShowAddModal(true);
                }}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium rounded-full bg-white text-[#1c1033] shadow-[rgba(255,255,255,0.7)_0px_1px_0px_0px_inset,rgba(179,132,201,0.35)_0px_10px_30px_0px] transition-opacity hover:opacity-90"
              >
                <Plus className="w-3 h-3" /> Add Contact
              </button>
            )}
          </div>

          {contacts.length === 0 ? (
            <div className="text-center py-8 rounded-xl border-2 border-dashed border-[rgba(216,191,227,0.18)] text-[rgba(231,218,237,0.55)]">
              <Phone className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No emergency contacts yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((c) => (
                <EmergencyContactCard
                  key={c._id}
                  contact={c}
                  onDelete={() => handleDeleteContact(c._id, c.name)}
                  onToggle={(enabled) => handleToggleContact(c._id, enabled)}
                  onEdit={() => setEditingContact(c)}
                  onTestCall={() => handleTestCall(c._id)}
                  testCallLoading={testCallLoadingId === c._id}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Step 3: Auto-call toggle ── */}
        <section className="glass-panel rounded-[22px] border-[rgba(216,191,227,0.18)] p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold
                ${autoCallEnabled ? "bg-success text-success-foreground" : "bg-white/[0.08] text-[rgba(231,218,237,0.55)]"}`}>
                {autoCallEnabled ? "✓" : "3"}
              </div>
              <div>
                <p className="font-semibold text-sm">Enable Auto-Calling</p>
                <p className="text-xs text-[rgba(231,218,237,0.55)]">Soul Discovery will call your contacts in a crisis</p>
              </div>
            </div>
            <button
              onClick={() => handleToggleAutoCall(!autoCallEnabled)}
              className={`relative w-11 h-6 rounded-full transition-colors ${autoCallEnabled ? "bg-success" : "bg-muted-foreground/30"}`}
              aria-pressed={autoCallEnabled}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${autoCallEnabled ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
        </section>

        {/* ── Cooldown status ── */}
        {status?.onCooldown && status.cooldownExpiresAt && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm bg-warning/10 border border-warning/20 text-warning-foreground">
            <Clock className="w-4 h-4 text-warning shrink-0" />
            <span>
              Cooldown active — next call available{" "}
              {new Date(status.cooldownExpiresAt).toLocaleString()}
            </span>
          </div>
        )}

        {/* ── Last escalation ── */}
        {status?.lastEscalation && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-[rgba(231,218,237,0.55)] bg-white/[0.035] border border-[rgba(216,191,227,0.18)]">
            <ChevronRight className="w-4 h-4 shrink-0" />
            <span>
              Last escalation:{" "}
              <strong className="text-[#f3eefa]">{status.lastEscalation.outcome}</strong> on{" "}
              {new Date(status.lastEscalation.createdAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showConsentModal && (
        <ConsentModal onAccept={handleConsentAccepted} onClose={() => setShowConsentModal(false)} />
      )}
      {showAddModal && (
        <AddContactModal onAdd={handleAddContact} onClose={() => setShowAddModal(false)} />
      )}
      {editingContact && (
        <EditContactModal
          initialData={editingContact}
          onEdit={(data) => handleEditContact(editingContact._id, data)}
          onClose={() => setEditingContact(null)}
        />
      )}
    </div>
  );
}
