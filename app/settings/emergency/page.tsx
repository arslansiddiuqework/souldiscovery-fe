"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Shield,
  Phone,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  ArrowLeft,
  FileCheck,
  Users,
  PhoneCall,
} from "lucide-react";
import { ConsentModal } from "@/components/emergency/ConsentModal";
import { AddContactModal } from "@/components/emergency/AddContactModal";
import { EditContactModal } from "@/components/emergency/EditContactModal";
import { EmergencyContactCard } from "@/components/emergency/EmergencyContactCard";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

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

type EmergencyTab = "consent" | "contacts" | "autocall";

const TABS: Array<{
  id: EmergencyTab;
  label: string;
  description: string;
  icon: typeof FileCheck;
  step: number;
}> = [
  {
    id: "consent",
    label: "Consent",
    description: "Privacy agreement",
    icon: FileCheck,
    step: 1,
  },
  {
    id: "contacts",
    label: "Contacts",
    description: "Who to reach",
    icon: Users,
    step: 2,
  },
  {
    id: "autocall",
    label: "Auto-Calling",
    description: "Crisis escalation",
    icon: PhoneCall,
    step: 3,
  },
];

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

export default function EmergencySettingsPage() {
  const [activeTab, setActiveTab] = useState<EmergencyTab>("consent");
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
    } catch {
      showToast("Failed to load emergency settings", "err");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleConsentAccepted = async () => {
    try {
      await apiFetch("/api/emergency/consent", { method: "POST" });
      setShowConsentModal(false);
      showToast("Consent accepted — you can now add emergency contacts.");
      await loadData();
      setActiveTab("contacts");
    } catch {
      showToast("Failed to save consent", "err");
    }
  };

  const handleToggleAutoCall = async (enabled: boolean) => {
    if (enabled && !status?.consentAccepted) {
      setShowConsentModal(true);
      setActiveTab("consent");
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
    } catch {
      showToast("Failed to update setting", "err");
      setAutoCallEnabled(!enabled);
    }
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
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to add contact", "err");
    }
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
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to update contact", "err");
    }
  };

  const handleTestCall = async (contactId: string) => {
    setTestCallLoadingId(contactId);
    try {
      const res = await apiFetch("/api/emergency/test-call", {
        method: "POST",
        body: JSON.stringify({ contactId }),
      });
      showToast(res.message || "Test call initiated successfully.");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to initiate test call", "err");
    } finally {
      setTestCallLoadingId(null);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      const res = await apiFetch(`/api/emergency/contacts/${contactId}`, {
        method: "DELETE",
      });
      setContacts(res.contacts);
      showToast("Emergency contact deleted successfully.");
    } catch {
      showToast("Failed to remove contact", "err");
    }
  };

  const handleToggleContact = async (contactId: string, enabled: boolean) => {
    try {
      const res = await apiFetch(`/api/emergency/contacts/${contactId}`, {
        method: "PUT",
        body: JSON.stringify({ enabled }),
      });
      setContacts(res.contacts);
      showToast("Emergency contact updated successfully.");
    } catch {
      showToast("Failed to update contact", "err");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[#49263D]">
        <div className="animate-pulse text-center">
          <Shield className="mx-auto mb-3 h-12 w-12 text-[#B74783]/40" />
          <p className="text-[#927C8B]">Loading emergency settings…</p>
        </div>
      </div>
    );
  }

  const enabledContacts = contacts.filter((c) => c.enabled).length;
  const isReady =
    Boolean(status?.consentAccepted) && enabledContacts > 0 && autoCallEnabled;

  const tabDone: Record<EmergencyTab, boolean> = {
    consent: Boolean(status?.consentAccepted),
    contacts: contacts.length > 0,
    autocall: autoCallEnabled,
  };

  return (
    <div className="page-shell relative overflow-hidden pb-10 text-[#49263D]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(183,71,131,0.16),transparent_65%)]"
      />

      {toast && (
        <div
          className={`fixed right-4 top-24 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-[#49263D] shadow-premium transition-all ${
            toast.type === "ok" ? "bg-success" : "bg-destructive"
          }`}
        >
          {toast.type === "ok" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          {toast.msg}
        </div>
      )}

      <Container className="relative max-w-5xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#927C8B] transition-colors hover:text-[#49263D]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7863C6]">
            Safety
          </p>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-[#EADCE5] bg-white/90 shadow-[0_16px_48px_rgba(123,57,98,0.08)] backdrop-blur">
          <div className="border-b border-[#EADCE5] bg-gradient-to-r from-[#FFF0F7] via-white to-[#F0EAFE] px-5 py-5 sm:px-7 sm:py-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF0F7] text-[#B74783]">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-[#302B3D] sm:text-3xl">
                    Emergency Settings
                  </h1>
                  <p className="mt-0.5 text-sm text-[#716B7D]">
                    Configure crisis escalation across three short steps
                  </p>
                </div>
              </div>
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
                  isReady
                    ? "border-[#287D58]/25 bg-[#EAF7EF] text-[#287D58]"
                    : "border-[#946200]/20 bg-[#FFF5D9] text-[#946200]"
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    isReady ? "bg-[#287D58]" : "bg-[#946200]"
                  )}
                />
                {isReady ? "System active" : "Setup incomplete"}
              </div>
            </div>
          </div>

          {/* Mobile tabs */}
          <div className="flex gap-2 overflow-x-auto border-b border-[#EADCE5] px-4 py-3 lg:hidden">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                    active
                      ? "bg-[#B74783] text-white shadow-[0_8px_20px_rgba(183,71,131,0.25)]"
                      : "border border-[#EADCE5] bg-white text-[#795A70] hover:bg-[#FFF0F6]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tabDone[tab.id] && (
                    <CheckCircle2
                      className={cn(
                        "h-3.5 w-3.5",
                        active ? "text-white/90" : "text-[#287D58]"
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-[240px_minmax(0,1fr)]">
            {/* Desktop side nav */}
            <aside className="hidden border-r border-[#EADCE5] bg-[#FBF9FF]/80 p-4 lg:block">
              <nav className="flex flex-col gap-1.5" aria-label="Emergency setup steps">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  const done = tabDone[tab.id];
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-2xl px-3.5 py-3 text-left transition",
                        active
                          ? "bg-white text-[#B74783] shadow-[0_8px_24px_rgba(123,57,98,0.08)] ring-1 ring-[#EADCE5]"
                          : "text-[#716B7D] hover:bg-white/80 hover:text-[#49263D]"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                          done
                            ? "bg-[#EAF7EF] text-[#287D58]"
                            : active
                              ? "bg-[#FFF0F7] text-[#B74783]"
                              : "bg-white text-[#927C8B]"
                        )}
                      >
                        {done ? <CheckCircle2 className="h-4 w-4" /> : tab.step}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 text-sm font-bold">
                          <Icon className="h-3.5 w-3.5 opacity-70" />
                          {tab.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-[#927C8B]">
                          {tab.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Content */}
            <div className="flex min-h-[420px] flex-col">
              <div className="flex-1 p-5 sm:p-7">
                {activeTab === "consent" && (
                  <div className="mx-auto max-w-xl space-y-5">
                    <div>
                      <h2 className="text-lg font-bold text-[#302B3D]">Privacy Consent</h2>
                      <p className="mt-0.5 text-sm text-[#716B7D]">
                        Required before you can add emergency contacts
                      </p>
                    </div>

                    <div
                      className={cn(
                        "rounded-2xl border p-5",
                        status?.consentAccepted
                          ? "border-[#287D58]/20 bg-[#EAF7EF]/50"
                          : "border-[#EADCE5] bg-[#FBF9FF]"
                      )}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                              status?.consentAccepted
                                ? "bg-[#287D58] text-white"
                                : "bg-white text-[#927C8B] ring-1 ring-[#EADCE5]"
                            )}
                          >
                            {status?.consentAccepted ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <FileCheck className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-[#49263D]">
                              {status?.consentAccepted
                                ? "Consent accepted"
                                : "Consent not yet accepted"}
                            </p>
                            <p className="mt-1 text-sm text-[#716B7D]">
                              {status?.consentAccepted
                                ? "You can add contacts and enable auto-calling."
                                : "Review how crisis escalation works, then accept to continue."}
                            </p>
                          </div>
                        </div>
                        {!status?.consentAccepted && (
                          <button
                            type="button"
                            onClick={() => setShowConsentModal(true)}
                            className="shrink-0 rounded-full bg-[#B74783] px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(183,71,131,0.28)] transition hover:bg-[#9F376F]"
                          >
                            Review & Accept
                          </button>
                        )}
                      </div>
                    </div>

                    {status?.consentAccepted && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("contacts")}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#B74783] hover:underline"
                      >
                        Continue to contacts
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}

                {activeTab === "contacts" && (
                  <div className="space-y-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-[#302B3D]">
                          Emergency Contacts
                        </h2>
                        <p className="mt-0.5 text-sm text-[#716B7D]">
                          {contacts.length} / 5 contacts added
                          {enabledContacts > 0
                            ? ` · ${enabledContacts} enabled`
                            : ""}
                        </p>
                      </div>
                      {contacts.length < 5 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (!status?.consentAccepted) {
                              setShowConsentModal(true);
                              setActiveTab("consent");
                              return;
                            }
                            setShowAddModal(true);
                          }}
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#B74783] px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(183,71,131,0.28)] transition hover:bg-[#9F376F]"
                        >
                          <Plus className="h-4 w-4" />
                          Add Contact
                        </button>
                      )}
                    </div>

                    {contacts.length === 0 ? (
                      <div className="rounded-2xl border-2 border-dashed border-[#EADCE5] bg-[#FBF9FF] py-12 text-center text-[#927C8B]">
                        <Phone className="mx-auto mb-2 h-8 w-8 opacity-50" />
                        <p className="text-sm font-medium text-[#716B7D]">
                          No emergency contacts yet
                        </p>
                        <p className="mt-1 text-xs">
                          Add someone you trust to reach in a crisis
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {contacts.map((c) => (
                          <EmergencyContactCard
                            key={c._id}
                            contact={c}
                            onDelete={() => handleDeleteContact(c._id)}
                            onToggle={(enabled) => handleToggleContact(c._id, enabled)}
                            onEdit={() => setEditingContact(c)}
                            onTestCall={() => handleTestCall(c._id)}
                            testCallLoading={testCallLoadingId === c._id}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "autocall" && (
                  <div className="mx-auto max-w-xl space-y-5">
                    <div>
                      <h2 className="text-lg font-bold text-[#302B3D]">
                        Enable Auto-Calling
                      </h2>
                      <p className="mt-0.5 text-sm text-[#716B7D]">
                        Soul Discovery can call your contacts during a crisis
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#EADCE5] bg-[#FBF9FF] p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                              autoCallEnabled
                                ? "bg-[#EAF7EF] text-[#287D58]"
                                : "bg-white text-[#927C8B] ring-1 ring-[#EADCE5]"
                            )}
                          >
                            <PhoneCall className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-[#49263D]">
                              {autoCallEnabled ? "Auto-calling on" : "Auto-calling off"}
                            </p>
                            <p className="mt-1 text-sm text-[#716B7D]">
                              When enabled, crisis signals can escalate to your contacts
                              automatically.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleAutoCall(!autoCallEnabled)}
                          className={cn(
                            "relative h-7 w-12 shrink-0 self-start rounded-full transition-colors sm:self-auto",
                            autoCallEnabled ? "bg-[#287D58]" : "bg-[#EADCE5]"
                          )}
                          aria-pressed={autoCallEnabled}
                          aria-label="Enable auto-calling"
                        >
                          <span
                            className={cn(
                              "absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
                              autoCallEnabled && "translate-x-5"
                            )}
                          />
                        </button>
                      </div>
                    </div>

                    {status?.onCooldown && status.cooldownExpiresAt && (
                      <div className="flex items-start gap-2 rounded-2xl border border-[#946200]/20 bg-[#FFF5D9] px-4 py-3 text-sm text-[#946200]">
                        <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>
                          Cooldown active — next call available{" "}
                          {new Date(status.cooldownExpiresAt).toLocaleString()}
                        </span>
                      </div>
                    )}

                    {status?.lastEscalation && (
                      <div className="flex items-start gap-2 rounded-2xl border border-[#EADCE5] bg-white px-4 py-3 text-sm text-[#716B7D]">
                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[#927C8B]" />
                        <span>
                          Last escalation:{" "}
                          <strong className="text-[#49263D]">
                            {status.lastEscalation.outcome}
                          </strong>{" "}
                          on{" "}
                          {new Date(status.lastEscalation.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-auto flex flex-col gap-2 border-t border-[#EADCE5] bg-[#FBF9FF]/90 px-5 py-3.5 text-xs text-[#927C8B] sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <p>
                  Steps completed:{" "}
                  <strong className="text-[#49263D]">
                    {Object.values(tabDone).filter(Boolean).length} / 3
                  </strong>
                </p>
                <Link
                  href="/profile"
                  className="font-semibold text-[#B74783] hover:underline"
                >
                  Return to Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {showConsentModal && (
        <ConsentModal
          onAccept={handleConsentAccepted}
          onClose={() => setShowConsentModal(false)}
        />
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
