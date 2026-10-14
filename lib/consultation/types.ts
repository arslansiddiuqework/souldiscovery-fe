/** Psychologist consultation domain — structured for future Stripe/backend sync. */

export type ConsultationStatus = "scheduled" | "completed" | "cancelled";

export interface PsychologistProfile {
  id: string;
  name: string;
  title: string;
  specializations: string[];
  yearsExperience: number;
  languages: string[];
  about: string;
  photoUrl?: string | null;
}

export interface ConsultationBooking {
  id: string;
  psychologistId: string;
  psychologistName: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "09:00 AM"
  durationMinutes: number;
  priceUsd: number;
  status: ConsultationStatus;
  clientName: string;
  clientEmail: string;
  reason: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  paymentStatus: "pending" | "placeholder" | "paid" | "failed";
}

export interface BookingDraft {
  date: string | null;
  time: string | null;
  clientName: string;
  clientEmail: string;
  reason: string;
  notes: string;
}

export const SESSION_PRICE_USD = 10;
export const SESSION_DURATION_MINUTES = 90;

export const TIME_SLOTS = [
  "09:00 AM",
  "11:00 AM",
  "01:00 PM",
  "03:00 PM",
  "05:00 PM",
  "07:00 PM",
] as const;

export const DEFAULT_PSYCHOLOGIST: PsychologistProfile = {
  id: "psych_dr_elena",
  name: "Dr. Faya Arslan",
  title: "Licensed Clinical Psychologist",
  specializations: [
    "Anxiety & Stress",
    "Depression",
    "Sleep & Burnout",
    "Life Transitions",
  ],
  yearsExperience: 12,
  languages: ["English", "Spanish"],
  about:
    "Dr. Faya Arslan provides warm, evidence-based online therapy focused on helping you navigate anxiety, stress, and emotional patterns with clarity and compassion. Sessions are private, paced to your needs, and designed to complement your Soul Discovery wellness journey.",
  photoUrl: null,
};
