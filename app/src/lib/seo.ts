import { plainText } from "./rich-text";

/**
 * What a product page puts in its <head> for search engines.
 *
 * Shared by the product page and the admin form, so the "this is what Google
 * will see" preview in the back office is computed by the same code that
 * writes the real tag, and cannot drift from it.
 *
 * Each of the three can be set by hand on a product. Blank means automatic.
 */

/** Roughly what Google shows before cutting a result off with "…". Not a hard
 *  rule (Google measures pixels, not characters), so the form warns past these
 *  rather than refusing. */
export const TITLE_SHOWN = 60;
export const DESCRIPTION_SHOWN = 160;

const SUFFIX = " | Affordable Home Electronics";

export function autoTitle(name: string): string {
  return `${name}${SUFFIX}`;
}

/** Search engines show about 160 characters and drop the rest, so the full
 *  description does not belong in the head. Cut on a word, never mid-word. */
export function autoDescription(blurb: string | undefined, fallback: string): string {
  const text = plainText(blurb);
  if (!text) return fallback;
  if (text.length <= DESCRIPTION_SHOWN) return text;
  const cut = text.slice(0, DESCRIPTION_SHOWN);
  const space = cut.lastIndexOf(" ");
  return `${(space > 100 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

type SeoSource = {
  name: string;
  blurb?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
};

/** A typed title is used exactly as typed — no shop name added — so he has
 *  the whole width Google gives to spend as he likes. */
export function pageTitle(p: SeoSource): string {
  return p.meta_title?.trim() || autoTitle(p.name);
}

export function pageDescription(p: SeoSource): string {
  return p.meta_description?.trim() || autoDescription(p.blurb, p.name);
}

/** Keywords have no automatic version: an empty tag is left out entirely. */
export function pageKeywords(p: SeoSource): string {
  return p.meta_keywords?.trim() ?? "";
}
