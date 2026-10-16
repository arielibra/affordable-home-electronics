import { createFileRoute } from "@tanstack/react-router";

import { allProducts, categoryCounts, listCategories } from "../lib/store.server";

/**
 * The pages worth telling Google about.
 *
 * It used to be this list alone — nine static pages — which left all 125
 * product pages and every category out of it. Those are the pages that can
 * actually win a search: nobody looks for "affordable home electronics shop",
 * they look for "ALIBI ALI-TP3125R". A sitemap that omits them is a sitemap
 * for the least valuable part of the site.
 *
 * /search and /orders have gone the other way. One is a form with no content
 * of its own and the other is a lookup that needs an order number, so neither
 * has anything to rank for, and asking Google to index them spends crawl
 * budget that the product pages should get.
 */
const PAGES: [path: string, priority: string, freq: string][] = [
  ["/", "1.0", "daily"],
  ["/shop", "0.9", "daily"],
  ["/security-cameras", "0.8", "weekly"],
  ["/installation", "0.7", "monthly"],
  ["/brands", "0.7", "weekly"],
  ["/about", "0.5", "monthly"],
  ["/contact", "0.5", "monthly"],
  ["/shipping", "0.4", "yearly"],
  ["/returns", "0.4", "yearly"],
  ["/warranty", "0.4", "yearly"],
];

/** Ampersands and angle brackets in a slug would make the XML unparseable. */
function xml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;

        const entry = (path: string, priority: string, freq: string) =>
          `  <url><loc>${xml(origin + path)}</loc><changefreq>${freq}</changefreq><priority>${priority}</priority></url>`;

        const rows: string[] = PAGES.map(([p, pr, f]) => entry(p, pr, f));

        /* The catalogue. A failure here must not take the sitemap down with
         * it — a short sitemap is recoverable, a 500 tells Google the file is
         * broken and it stops asking. */
        try {
          // Empty aisles are noindex, so they stay out of the sitemap too.
          const [cats, counts] = await Promise.all([listCategories(), categoryCounts()]);
          for (const c of cats) if ((counts[c.slug] ?? 0) > 0) rows.push(entry(`/shop/${c.slug}`, "0.8", "weekly"));
        } catch {
          // keep whatever we have
        }
        try {
          const items = await allProducts();
          for (const p of items) rows.push(entry(`/p/${p.slug}`, "0.6", "weekly"));
        } catch {
          // keep whatever we have
        }

        const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join("\n")}\n</urlset>`;
        return new Response(body, {
          headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
