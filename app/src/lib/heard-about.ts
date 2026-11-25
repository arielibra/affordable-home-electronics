// "How did you hear about us?" — the answers offered after checkout.
//
// The id is what is stored on the order (orders.heard_about); the label is what
// the customer and the back office see. When the answer is "other", whatever
// the customer typed is stored in orders.heard_about_other.
//
// Never reuse or rename an id, or old orders will read as a different answer.
// Answers that are no longer offered stay in LEGACY so old orders still show
// their label.
export const HEARD_ABOUT = [
  { id: "google", label: "Google" },
  { id: "chatgpt", label: "ChatGPT" },
  { id: "gemini", label: "Gemini" },
  { id: "other", label: "Other" },
] as const;

const LEGACY: Record<string, string> = {
  bing: "Bing",
  amazon: "Amazon",
  walmart: "Walmart",
  word_of_mouth: "Word of mouth",
  youtube: "YouTube",
  instagram: "Instagram",
  facebook: "Facebook",
  ordered_before: "I've ordered before",
};

export type HeardAboutId = (typeof HEARD_ABOUT)[number]["id"];

export const HEARD_ABOUT_IDS = HEARD_ABOUT.map((h) => h.id) as [HeardAboutId, ...HeardAboutId[]];

export const HEARD_ABOUT_OTHER_MAX = 120;

/**
 * Validates an answer sent from the checkout page. Unknown or missing answers
 * become "" (not answered); the typed text is kept only for "other", with
 * control characters and runs of spaces squeezed out.
 */
export function cleanHeardAbout(answer: unknown, other: unknown): { id: string; other: string } {
  const id = typeof answer === "string" && (HEARD_ABOUT_IDS as readonly string[]).includes(answer) ? answer : "";
  const text =
    id === "other" && typeof other === "string"
      ? other.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, HEARD_ABOUT_OTHER_MAX)
      : "";
  return { id, other: text };
}

export function heardAboutLabel(id: string | null | undefined, other?: string | null): string {
  if (!id) return "";
  const label = HEARD_ABOUT.find((h) => h.id === id)?.label ?? LEGACY[id] ?? id;
  return id === "other" && other ? `${label}: ${other}` : label;
}
