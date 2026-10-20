/** Fired after a wellness-plan task is saved, so every open view can refresh. */
export const WELLNESS_UPDATED_EVENT = "soul:wellness-updated";

export function notifyWellnessUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(WELLNESS_UPDATED_EVENT));
}
