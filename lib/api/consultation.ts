/**
 * Consultation API client.
 * Local persistence today; shaped for future Stripe + backend booking endpoints.
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

export async function getConsultations(): Promise<ConsultationBooking[]> {
  // Future: GET /api/consultations
  return loadConsultations();
}

export async function getUpcomingConsultation(): Promise<ConsultationBooking | null> {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = loadConsultations()
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
 * Future: POST /api/consultations + Stripe Checkout session.
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
  return booking;
}

export async function cancelConsultation(
  id: string
): Promise<ConsultationBooking[]> {
  // Future: POST /api/consultations/:id/cancel
  return updateConsultationStatus(id, "cancelled");
}

export async function completeConsultation(
  id: string
): Promise<ConsultationBooking[]> {
  return updateConsultationStatus(id, "completed");
}

/** Placeholder for future Stripe Checkout / Payment Intent flow. */
export async function initiateConsultationPayment(
  _bookingId: string
): Promise<{ status: "coming_soon"; message: string }> {
  // Future: POST /api/consultations/:id/checkout → Stripe session URL
  return {
    status: "coming_soon",
    message: "Stripe payment gateway integration coming soon.",
  };
}

export function clearAllConsultations(): void {
  saveConsultations([]);
}

export type { ConsultationBooking };
