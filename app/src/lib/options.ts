/**
 * Add-on drop-downs for a product page, such as "Add a Hard Drive".
 *
 * Stored on the parent product as JSON. Each choice names an add-on product
 * (a product row with addon = 1) by slug, so its price and name live in one
 * place and checkout charges exactly what the drop-down showed.
 */

export type ProductOption = {
  /** The drop-down's heading: "Add a Hard Drive". */
  label: string;
  /** One line under it: "A hard drive is needed to store recordings." */
  help: string;
  /** Add-on product slugs, in the order shown. */
  choices: string[];
};

/** A drop-down as the product page draws it, with each choice resolved. */
export type ResolvedOption = {
  label: string;
  help: string;
  choices: { slug: string; name: string; price_cents: number }[];
};

export const OPTIONS_MAX = 6;
export const CHOICES_MAX = 20;

/** Validates whatever arrives (JSON text or an array). Never throws. */
export function cleanOptions(value: unknown): ProductOption[] {
  let v = value;
  if (typeof v === "string") {
    try {
      v = v.trim() ? JSON.parse(v) : [];
    } catch {
      return [];
    }
  }
  if (!Array.isArray(v)) return [];
  const out: ProductOption[] = [];
  for (const raw of v) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const label = typeof r.label === "string" ? r.label.replace(/\s+/g, " ").trim().slice(0, 80) : "";
    const help = typeof r.help === "string" ? r.help.replace(/\s+/g, " ").trim().slice(0, 240) : "";
    const choices = Array.isArray(r.choices)
      ? [...new Set(r.choices.filter((c): c is string => typeof c === "string" && /^[a-z0-9-]{1,120}$/.test(c)))].slice(0, CHOICES_MAX)
      : [];
    if (!label || choices.length === 0) continue;
    out.push({ label, help, choices });
    if (out.length >= OPTIONS_MAX) break;
  }
  return out;
}
