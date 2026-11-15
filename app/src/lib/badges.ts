/**
 * Key features and feature badges for a product page.
 *
 * Both are stored as text on the product row: `highlights` one feature per
 * line, `badges` a JSON array. Parsing never throws, so a hand-edited value
 * that is not quite right shows less on the page rather than breaking it.
 */

export type Badge = {
  /** Short name under the icon: "NDAA", "IP67". */
  label: string;
  /** What it means, shown on hover and read by search engines and AI assistants. */
  detail: string;
  /** Our own copy of the icon, under /media/. Optional: a badge without one shows as text. */
  icon: string;
};

export const BADGES_MAX = 16;
export const HIGHLIGHTS_MAX = 30;

/** One feature per line, blanks and bullet characters dropped. */
export function parseHighlights(text: string | null | undefined): string[] {
  return (text ?? "")
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*[-•*·]\s*/, "").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, HIGHLIGHTS_MAX);
}

/** Validates whatever arrives (JSON text or an array) into clean badges. */
export function cleanBadges(value: unknown): Badge[] {
  let v = value;
  if (typeof v === "string") {
    try {
      v = v.trim() ? JSON.parse(v) : [];
    } catch {
      return [];
    }
  }
  if (!Array.isArray(v)) return [];
  const out: Badge[] = [];
  for (const raw of v) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const label = typeof r.label === "string" ? r.label.replace(/\s+/g, " ").trim().slice(0, 40) : "";
    if (!label || out.some((b) => b.label.toLowerCase() === label.toLowerCase())) continue;
    const detail = typeof r.detail === "string" ? r.detail.replace(/\s+/g, " ").trim().slice(0, 240) : "";
    const icon = typeof r.icon === "string" && /^\/media\/[\w.-]+$/.test(r.icon.trim()) ? r.icon.trim() : "";
    out.push({ label, detail, icon });
    if (out.length >= BADGES_MAX) break;
  }
  return out;
}

export const parseBadges = (text: string | null | undefined): Badge[] => cleanBadges(text ?? "");
