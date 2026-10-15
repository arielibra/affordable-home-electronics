/**
 * Which product on the site an order line bought.
 *
 * Orders typed in by hand store the part number ("VF30 PRO") or nothing at all
 * in `product_slug`, not the site's slug, and the name is whatever was typed.
 * So a line matches a product when its slug or name is exact, or when a part
 * number in the line appears in the product's slug or name.
 *
 * A part number has at least two letters and two digits and five characters
 * once punctuation is stripped: VF30PRO, CMIP3342WI28SDL, LTD8316DET. Words,
 * bare numbers ("2030") and measurements ("256Mbps", "1080p", "8Channels")
 * never match on their own, so "4MP Active Deterrence" cannot make one camera
 * reviewable by someone who bought its sibling.
 */

const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

function partish(s: string): boolean {
  const letters = (s.match(/[a-z]/g) ?? []).length;
  const digits = (s.match(/\d/g) ?? []).length;
  return s.length >= 5 && s.length <= 40 && letters >= 2 && digits >= 2 && !/^\d+[a-z]+$/.test(s);
}

export function partNumbers(text: string): string[] {
  const out = new Set<string>();
  const tokens = text
    .split(/[\s;,()]+/)
    .map(squash)
    .filter(Boolean);
  const whole = squash(text);
  if (partish(whole)) out.add(whole);
  tokens.forEach((t, i) => {
    if (partish(t)) out.add(t);
    // A typed name splits a part number the same way the site does:
    // "VF30 PRO" → vf30pro. Only a code joined to a short plain suffix.
    const next = tokens[i + 1];
    if (next && /^[a-z]{1,4}$/.test(next) && /\d/.test(t) && /[a-z]{2}/.test(t)) {
      const pair = t + next;
      if (partish(pair)) out.add(pair);
    }
  });
  return [...out];
}

export type Line = { product_slug: string; name: string };

export function lineMatches(line: Line, productSlug: string, productName: string): boolean {
  if (line.product_slug && line.product_slug === productSlug) return true;
  if (squash(line.name ?? "") && squash(line.name ?? "") === squash(productName)) return true;
  const targets = [squash(productSlug), squash(productName)];
  const codes = [...partNumbers(line.product_slug ?? ""), ...partNumbers(line.name ?? "")];
  return codes.some((c) => targets.some((t) => t.includes(c)));
}
