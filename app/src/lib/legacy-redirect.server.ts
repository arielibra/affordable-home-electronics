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
 *
 * An old page that is neither a product nor anything with a part number in
 * it (an old section such as /homeautomation.aspx) is answered 410 Gone. It
 * used to fall back to the whole catalogue, which told customers the shop had
 * a Home Automation section and told Google the page still existed. A 410 is
 * the signal that makes Google drop the result, and the page itself still
 * gives a customer a way into the shop.
 */

export type LegacyTarget = { path: string; permanent: boolean } | { gone: true };

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
  return { gone: true };
}

function gonePage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Page no longer here · Affordable Home Electronics</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <style>
      body { font: 16px/1.55 system-ui, -apple-system, sans-serif; background: #eef5fc; color: #0f2a4a; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 30rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.5rem; margin: 0 0 0.6rem; }
      p { color: #3f5875; margin: 0 0 1.6rem; }
      .actions { display: flex; gap: 0.6rem; justify-content: center; flex-wrap: wrap; }
      a { padding: 0.7rem 1.2rem; border-radius: 999px; text-decoration: none; border: 1px solid #1668c1; }
      .primary { background: #1668c1; color: #fff; }
      .secondary { background: #fff; color: #1668c1; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>That page was on our old website</h1>
      <p>It does not exist any more. Everything we sell now is in the shop, or you can search for a part number.</p>
      <div class="actions">
        <a class="primary" href="/shop">Browse the shop</a>
        <a class="secondary" href="/search">Search</a>
      </div>
    </div>
  </body>
</html>`;
}

let cache: { at: number; products: { slug: string }[]; categories: { slug: string; name: string }[] } | undefined;

/**
 * Deleted products. A /p/<slug> whose product is gone, looked up in
 * product_redirects and sent on with a 301. Only consulted for /p/ paths, and
 * the map is small, so it is cached per isolate like the legacy lookup.
 */
let productMap: { at: number; map: Map<string, string> } | undefined;

async function productRedirect(url: URL): Promise<Response | null> {
  const m = url.pathname.match(/^\/p\/([^/]+)$/);
  if (!m) return null;
  let slug = m[1];
  try {
    slug = decodeURIComponent(slug);
  } catch {
    // keep it raw
  }
  if (!productMap || Date.now() - productMap.at > 5 * 60_000) {
    const map = new Map<string, string>();
    const db = bindings().DB;
    if (db) {
      try {
        const rows = (await db.prepare("SELECT old_slug, to_path FROM product_redirects").all<{ old_slug: string; to_path: string }>()).results ?? [];
        for (const r of rows) map.set(r.old_slug, r.to_path);
      } catch {
        // table missing or DB down: fall through to the normal page / 404
      }
    }
    productMap = { at: Date.now(), map };
  }
  const to = productMap.map.get(slug);
  if (!to || !to.startsWith("/")) return null;
  return new Response(null, {
    status: 301,
    headers: { Location: new URL(to, url.origin).toString(), "Cache-Control": "public, max-age=86400" },
  });
}

export async function legacyRedirect(url: URL): Promise<Response | null> {
  if (url.pathname.startsWith("/p/")) return productRedirect(url);
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
  if ("gone" in target) {
    return new Response(gonePage(), {
      status: 410,
      headers: { "content-type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600" },
    });
  }
  return new Response(null, {
    status: target.permanent ? 301 : 302,
    headers: {
      Location: new URL(target.path, url.origin).toString(),
      "Cache-Control": target.permanent ? "public, max-age=86400" : "no-store",
    },
  });
}
