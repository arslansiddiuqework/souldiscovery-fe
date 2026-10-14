import { SESSION_DURATION_MINUTES, SESSION_PRICE_USD } from "@/lib/consultation/types";

export type FaqItem = {
  question: string;
  answer: string;
};

/** Shared FAQ content used by /faq and aligned with pricing. */
export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Is Soul Discovery free to use?",
    answer:
      "Yes. AI wellness features — chat, wellness plans, mood tracking, insights, missions, and reports — are free. Licensed psychologist sessions are optional and paid separately.",
  },
  {
    question: "How long is a psychologist session?",
    answer: `Each psychologist consultation is ${SESSION_DURATION_MINUTES} minutes (${Math.floor(SESSION_DURATION_MINUTES / 60)} hour ${SESSION_DURATION_MINUTES % 60} minutes).`,
  },
  {
    question: "How much does a psychologist session cost?",
    answer: `$${SESSION_PRICE_USD} per session. There are no subscriptions — you only pay when you book.`,
  },
  {
    question: "Are sessions private?",
    answer:
      "Yes. Psychologist sessions are confidential one-to-one online consultations. AI conversations are handled with privacy and security in mind.",
  },
  {
    question: "Do I need an account?",
    answer:
      "Yes. Creating an account lets you save progress, access your wellness plan, mood history, and optional psychologist bookings.",
  },
  {
    question: "What should I do in a crisis?",
    answer:
      "If you are in immediate danger, contact local emergency services. In the app, use Emergency settings to manage crisis contacts and support pathways. Soul Discovery is a wellness tool and does not replace emergency care.",
  },
  {
    question: "Where can I get more help?",
    answer:
      "Visit the Help Center for guided links, book a psychologist from Pricing, or reach us through the Contact page.",
  },
];
