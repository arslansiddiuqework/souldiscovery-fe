import { ConsultationBooking } from "./types";

const STORAGE_KEY = "aurapulse_consultations_v1";

export function loadConsultations(): ConsultationBooking[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveConsultations(bookings: ConsultationBooking[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

export function upsertConsultation(booking: ConsultationBooking): ConsultationBooking[] {
  const all = loadConsultations();
  const idx = all.findIndex((b) => b.id === booking.id);
  if (idx >= 0) all[idx] = booking;
  else all.unshift(booking);
  saveConsultations(all);
  return all;
}

export function updateConsultationStatus(
  id: string,
  status: ConsultationBooking["status"]
): ConsultationBooking[] {
  const all = loadConsultations().map((b) =>
    b.id === id
      ? { ...b, status, updatedAt: new Date().toISOString() }
      : b
  );
  saveConsultations(all);
  return all;
}
