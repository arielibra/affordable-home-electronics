// "How did you hear about us?" — the answers offered after checkout.
//
// The id is what is stored on the order (orders.heard_about); the label is what
// the customer and the back office see. Add new answers at the end, and never
// reuse or rename an id, or old orders will read as a different answer.
export const HEARD_ABOUT = [
  { id: "google", label: "Google" },
  { id: "bing", label: "Bing" },
  { id: "amazon", label: "Amazon" },
  { id: "walmart", label: "Walmart" },
  { id: "word_of_mouth", label: "Word of mouth" },
  { id: "youtube", label: "YouTube" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "ordered_before", label: "I've ordered before" },
] as const;

export type HeardAboutId = (typeof HEARD_ABOUT)[number]["id"];

export const HEARD_ABOUT_IDS = HEARD_ABOUT.map((h) => h.id) as [HeardAboutId, ...HeardAboutId[]];

export function heardAboutLabel(id: string | null | undefined): string {
  if (!id) return "";
  return HEARD_ABOUT.find((h) => h.id === id)?.label ?? id;
}
