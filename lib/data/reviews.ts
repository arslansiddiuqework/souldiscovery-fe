export type Review = {
  id: string;
  name: string;
  rating: number;
  text: string;
  /** Optional role / context line under the name */
  role?: string;
  /** Single initial for avatar fallback */
  initial: string;
  /** Soft avatar tint — keep restrained */
  accent: string;
};

/**
 * Demo / placeholder testimonials for the marketing homepage.
 * Replace with real review data when available.
 */
export const homepageReviews: Review[] = [
  {
    id: "sarah-m",
    name: "Sarah M.",
    rating: 5,
    initial: "S",
    accent: "rgba(183, 71, 131, 0.16)",
    role: "Evening mindfulness",
    text: "Soul Discovery has become part of my evening routine. The guided sessions help me slow down and actually disconnect from the noise of the day.",
  },
  {
    id: "daniel-r",
    name: "Daniel R.",
    rating: 5,
    initial: "D",
    accent: "rgba(217, 184, 245, 0.4)",
    role: "Stress management",
    text: "The experience feels calm and personal rather than overwhelming. I really like how easy it is to find something that matches how I'm feeling.",
  },
  {
    id: "emily-r",
    name: "Emily R.",
    rating: 5,
    initial: "E",
    accent: "rgba(255, 229, 240, 0.95)",
    role: "Daily wellness habit",
    text: "I started using Soul Discovery for short mindfulness sessions and ended up making it part of my daily routine.",
  },
  {
    id: "jordan-k",
    name: "Jordan K.",
    rating: 5,
    initial: "J",
    accent: "rgba(244, 232, 255, 0.95)",
    role: "Self-reflection",
    text: "Having a private space to reflect without judgment has changed how I check in with myself. It feels supportive, never pushy.",
  },
  {
    id: "maya-l",
    name: "Maya L.",
    rating: 5,
    initial: "M",
    accent: "rgba(183, 71, 131, 0.12)",
    role: "Guided AI support",
    text: "The conversations feel gentle and grounded. When my mind is racing, Soul Discovery helps me name what's going on and breathe again.",
  },
  {
    id: "alex-t",
    name: "Alex T.",
    rating: 5,
    initial: "A",
    accent: "rgba(217, 140, 180, 0.28)",
    role: "Emotional wellbeing",
    text: "I was skeptical of wellness apps, but this one stays quiet and useful. No noise — just a steady place to land when I need it.",
  },
];
