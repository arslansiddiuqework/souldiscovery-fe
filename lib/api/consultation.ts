/**
 * Consultation API client.
 * Persists locally and syncs to backend so admin can track bookings.
 */
import {
  ConsultationBooking,
  DEFAULT_PSYCHOLOGIST,
  SESSION_DURATION_MINUTES,
  SESSION_PRICE_USD,
} from "@/lib/consultation/types";
import {
  loadConsultations,
  saveConsultations,
  updateConsultationStatus,
  upsertConsultation,
} from "@/lib/consultation/storage";

function uid() {
  return `consult_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function authHeaders(): HeadersInit | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function syncConsultationToBackend(booking: ConsultationBooking): Promise<void> {
  const headers = authHeaders();
  if (!headers) return;
  try {
    await fetch("/api/consultations", {
      method: "PUT",
      headers,
      body: JSON.stringify(booking),
    });
  } catch {
    /* offline / backend down — local copy remains */
  }
}

async function syncStatusToBackend(
  id: string,
  status: ConsultationBooking["status"]
): Promise<void> {
  const headers = authHeaders();
  if (!headers) return;
  try {
    await fetch(`/api/consultations/${id}/status`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status }),
    });
  } catch {
    /* ignore */
  }
}

async function pullConsultationsFromBackend(): Promise<ConsultationBooking[] | null> {
  const headers = authHeaders();
  if (!headers) return null;
  try {
    const response = await fetch("/api/consultations", {
      headers,
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = await response.json();
    return Array.isArray(data.consultations) ? data.consultations : null;
  } catch {
    return null;
  }
}

export async function getConsultations(): Promise<ConsultationBooking[]> {
  const local = loadConsultations();
  const remote = await pullConsultationsFromBackend();

  // Migrate local-only bookings to backend for admin tracking
  if (authHeaders() && local.length) {
    const remoteIds = new Set((remote || []).map((b) => b.id));
    for (const booking of local) {
      if (!remoteIds.has(booking.id)) {
        await syncConsultationToBackend(booking);
      }
    }
  }

  if (remote) {
    const merged = [...remote];
    const remoteIds = new Set(remote.map((b) => b.id));
    for (const booking of local) {
      if (!remoteIds.has(booking.id)) merged.push(booking);
    }
    saveConsultations(merged);
    return merged;
  }
  return local;
}

export async function getUpcomingConsultation(): Promise<ConsultationBooking | null> {
  const all = await getConsultations();
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = all
    .filter((b) => b.status === "scheduled" && b.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  return upcoming[0] || null;
}

export interface CreateBookingInput {
  date: string;
  time: string;
  clientName: string;
  clientEmail: string;
  reason: string;
  notes?: string;
}

/**
 * Creates a scheduled booking with payment placeholder.
 * Syncs to backend for admin tracking.
 */
export async function createConsultationBooking(
  input: CreateBookingInput
): Promise<ConsultationBooking> {
  const now = new Date().toISOString();
  const booking: ConsultationBooking = {
    id: uid(),
    psychologistId: DEFAULT_PSYCHOLOGIST.id,
    psychologistName: DEFAULT_PSYCHOLOGIST.name,
    date: input.date,
    time: input.time,
    durationMinutes: SESSION_DURATION_MINUTES,
    priceUsd: SESSION_PRICE_USD,
    status: "scheduled",
    clientName: input.clientName.trim(),
    clientEmail: input.clientEmail.trim(),
    reason: input.reason.trim(),
    notes: input.notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
    paymentStatus: "placeholder",
  };

  upsertConsultation(booking);
  await syncConsultationToBackend(booking);
  return booking;
}

export async function cancelConsultation(
  id: string
): Promise<ConsultationBooking[]> {
  const updated = updateConsultationStatus(id, "cancelled");
  await syncStatusToBackend(id, "cancelled");
  return updated;
}

export async function completeConsultation(
  id: string
): Promise<ConsultationBooking[]> {
  const updated = updateConsultationStatus(id, "completed");
  await syncStatusToBackend(id, "completed");
  return updated;
}

/** Placeholder for future Stripe Checkout / Payment Intent flow. */
export async function initiateConsultationPayment(
  _bookingId: string
): Promise<{ status: "coming_soon"; message: string }> {
  return {
    status: "coming_soon",
    message: "Stripe payment gateway integration coming soon.",
  };
}

export function clearAllConsultations(): void {
  saveConsultations([]);
}

export type { ConsultationBooking };
