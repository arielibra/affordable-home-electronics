import { createFileRoute } from "@tanstack/react-router";

import { bindings } from "../lib/bindings.server";
import { plainText } from "../lib/rich-text";
import { SITE } from "../lib/site";

/**
 * The product feed for Google Merchant Center.
 *
 * Merchant Center's "add products from your website" option starts from the
 * pages Google already knows for the domain, which for this shop are the old
 * cart's thousands of .aspx products. This feed is the shop's own list instead:
 * every listed product, its price and its stock, read from the database on
 * every fetch, so a price or stock change in the admin reaches Google on the
 * next daily fetch without anyone exporting anything.
 *
 * Format: RSS 2.0 with the g: namespace, which is what Merchant Center reads as
 * a scheduled-fetch data source. Shipping and returns are configured in
 * Merchant Center itself, not repeated here.
 */

type Row = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  price_cents: number;
  blurb: string;
  image: string;
  stock: number;
  stock_tracked: number;
  cat_name: string | null;
};

function xml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    // Characters XML 1.0 does not allow at all; one would break the whole feed.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

/** Merchant Center ids are at most 50 characters and must never change for a
 *  product, or Google treats it as a new item and loses its history. Short
 *  slugs are used as they are; long ones are cut and given a stable hash of
 *  the full slug so two products with a long shared prefix cannot collide. */
function feedId(slug: string): string {
  if (slug.length <= 50) return slug;
  let h = 0x811c9dc5;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `${slug.slice(0, 41).replace(/-+$/, "")}-${h.toString(16).padStart(8, "0")}`;
}

export const Route = createFileRoute("/merchant-feed.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const abs = (src: string) => (/^https?:\/\//.test(src) ? src : `${origin}${src.startsWith("/") ? "" : "/"}${src}`);
        const db = bindings().DB;
        if (!db) return new Response("Feed unavailable", { status: 503 });

        // A 5xx tells Merchant Center to try again later. An empty feed would
        // tell it every product had been withdrawn.
        let rows: Row[];
        let shots: Map<string, string[]>;
        try {
          rows =
            (
              await db
                .prepare(
                  `SELECT p.slug, p.name, p.brand, p.category, p.price_cents, p.blurb, p.image, p.stock, p.stock_tracked,
                          c.name AS cat_name
                     FROM products p LEFT JOIN categories c ON c.slug = p.category
                    WHERE p.active = 1 AND p.price_cents > 0
                    ORDER BY p.featured DESC, p.slug`,
                )
                .all<Row>()
            ).results ?? [];
          const imgs =
            (await db.prepare("SELECT product_slug, url FROM product_images ORDER BY product_slug, position").all<{
              product_slug: string;
              url: string;
            }>()).results ?? [];
          shots = new Map();
          for (const i of imgs) {
            const list = shots.get(i.product_slug) ?? [];
            list.push(i.url);
            shots.set(i.product_slug, list);
          }
        } catch {
          return new Response("Feed temporarily unavailable", { status: 503, headers: { "Retry-After": "3600" } });
        }

        const items = rows.map((p) => {
          const photos = [...(shots.get(p.slug) ?? []), p.image].filter(Boolean);
          const unique = [...new Set(photos)];
          const main = unique[0];
          const extra = unique.slice(1, 11);
          const inStock = p.stock_tracked === 0 || p.stock > 0;
          const description = (plainText(p.blurb) || p.name).slice(0, 5000);
          const lines = [
            `<g:id>${xml(feedId(p.slug))}</g:id>`,
            `<g:title>${xml(p.name.slice(0, 150))}</g:title>`,
            `<g:description>${xml(description)}</g:description>`,
            `<g:link>${xml(`${origin}/p/${p.slug}`)}</g:link>`,
            main ? `<g:image_link>${xml(abs(main))}</g:image_link>` : "",
            ...extra.map((src) => `<g:additional_image_link>${xml(abs(src))}</g:additional_image_link>`),
            `<g:availability>${inStock ? "in_stock" : "out_of_stock"}</g:availability>`,
            `<g:price>${(p.price_cents / 100).toFixed(2)} USD</g:price>`,
            `<g:condition>new</g:condition>`,
            p.brand ? `<g:brand>${xml(p.brand)}</g:brand>` : "",
            p.cat_name ? `<g:product_type>${xml(p.cat_name)}</g:product_type>` : "",
          ].filter(Boolean);
          return `    <item>\n      ${lines.join("\n      ")}\n    </item>`;
        });

        const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${xml(SITE.name)}</title>
    <link>${xml(origin)}</link>
    <description>${xml(`${SITE.name} product feed`)}</description>
${items.join("\n")}
  </channel>
</rss>
`;
        return new Response(body, {
          headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
