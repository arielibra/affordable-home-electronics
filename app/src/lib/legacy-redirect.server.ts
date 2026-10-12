import { bindings } from "./bindings.server";

/**
 * The old site's addresses, still in Google, sent to the matching page here.
 *
 * The old cart named a product page after the part number with its hyphens
 * kept and the product name run together with none:
 *
 *   /lts-cmip3342wi-28sdlplatinum4mpactivedeterrenceturretnetworkcamera.aspx
 *
 * The same camera here is
 *
 *   /p/lts-cmip3342wi-28sdl-platinum-4mp-active-deterrence-turret-network-cam
 *
 * Strip everything but letters and digits and they are the same string,
 * except that our slugs are cut at about 72 characters. So one must be a
 * prefix of the other. That is the whole matching rule, and it is strict on
 * purpose: "cmip3342wi" and "cmip3342wib" are different cameras, and a
 * prefix test keeps them apart where a fuzzy match would not.
 *
 * A confident match is a 301, which is what makes Google swap its saved link
 * for ours and carry the old page's ranking across. Anything less certain
 * goes to a search for the part number as a 302, so a customer still lands
 * somewhere useful but Google is not told that a search page is the
 * permanent home of a product we may not carry.
 */

export type LegacyTarget = { path: string; permanent: boolean };

const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Below this, a prefix proves nothing ("lts" is a prefix of half the shop). */
const MIN_MATCH = 12;

export function matchLegacy(
  pathname: string,
  products: { slug: string }[],
  categories: { slug: string; name: string }[],
): LegacyTarget | null {
  if (!/\.aspx?$/i.test(pathname)) return null;
  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    // keep it raw
  }
  const seg = decoded.replace(/\.aspx?$/i, "").split("/").filter(Boolean).pop() ?? "";
  const key = squash(seg);

  if (!key || key === "default" || key === "index" || key === "home") return { path: "/", permanent: true };

  for (const c of categories) {
    if (squash(c.slug) === key || squash(c.name) === key) return { path: `/shop/${c.slug}`, permanent: true };
  }

  if (key.length >= MIN_MATCH) {
    const hits = products.filter((p) => {
      const s = squash(p.slug);
      return s.length >= MIN_MATCH && (key.startsWith(s) || s.startsWith(key));
    });
    if (hits.length === 1) return { path: `/p/${hits[0].slug}`, permanent: true };
    // Several: the old name was cut short enough to fit more than one of ours.
    // The longest shared run is the right one only if it is unique.
    if (hits.length > 1) {
      const best = hits.filter((p) => key.startsWith(squash(p.slug)));
      if (best.length === 1) return { path: `/p/${best[0].slug}`, permanent: true };
    }
  }

  // Not something we carry now. The part number is the second hyphenated
  // piece (brand first), and it is what a customer would search for.
  const parts = seg.split("-").filter(Boolean);
  const model = parts.length > 1 && parts[1].length >= 3 ? parts[1] : parts[0];
  if (model && model.length >= 3 && parts.length > 1) {
    return { path: `/search?q=${encodeURIComponent(model.slice(0, 40))}`, permanent: false };
  }
  return { path: "/shop", permanent: false };
}

let cache: { at: number; products: { slug: string }[]; categories: { slug: string; name: string }[] } | undefined;

export async function legacyRedirect(url: URL): Promise<Response | null> {
  if (!/\.aspx?$/i.test(url.pathname)) return null;

  if (!cache || Date.now() - cache.at > 5 * 60_000) {
    const db = bindings().DB;
    let products: { slug: string }[] = [];
    let categories: { slug: string; name: string }[] = [];
    if (db) {
      try {
        products = (await db.prepare("SELECT slug FROM products WHERE active = 1").all<{ slug: string }>()).results ?? [];
        categories =
          (await db.prepare("SELECT slug, name FROM categories").all<{ slug: string; name: string }>()).results ?? [];
      } catch {
        // fall through to the search fallback rather than an error page
      }
    }
    cache = { at: Date.now(), products, categories };
  }

  const target = matchLegacy(url.pathname, cache.products, cache.categories);
  if (!target) return null;
  return new Response(null, {
    status: target.permanent ? 301 : 302,
    headers: {
      Location: new URL(target.path, url.origin).toString(),
      "Cache-Control": target.permanent ? "public, max-age=86400" : "no-store",
    },
  });
}
