import { createFileRoute } from "@tanstack/react-router";

import { FREE_SHIPPING_MAX_LB, FREE_SHIPPING_THRESHOLD_CENTS } from "../lib/shipping";
import { ORIGIN, SITE } from "../lib/site";
import { allProducts, listCategories, productFeatureIndex, type Product } from "../lib/store.server";
import { parseBadges, parseHighlights } from "../lib/badges";

/**
 * /llms.txt — the shop in plain text for AI assistants (llmstxt.org).
 *
 * ChatGPT, Claude, Perplexity and the like read pages as text. This gives them
 * one clean file with who the shop is, how to reach it, the policies in a
 * sentence each, and every product with its price and link, read live from
 * the catalog so it is never out of date.
 */
const usd = (c: number) => `$${(c / 100).toFixed(2)}`;
const inStock = (p: Product) => !p.stock_tracked || p.stock > 0;

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async () => {
        const out: string[] = [
          `# ${SITE.name}`,
          ``,
          `> Security cameras, NVR/DVR recorders, access control, smart locks, doorbells and home electronics. An authorized dealer selling genuine USA product online, shipping across the US, since ${SITE.since}, with installation arranged across New York City.`,
          ``,
          `## The shop`,
          ``,
          `- Address: ${SITE.street}, ${SITE.cityLine}, USA`,
          `- Phone: ${SITE.phone} · WhatsApp: ${SITE.whatsapp} · Fax: ${SITE.fax}`,
          `- Email: ${SITE.email}`,
          `- Hours: ${SITE.hours.plain}. ${SITE.hours.closed}.`,
          `- Website: ${ORIGIN}`,
          ``,
          `## Policies`,
          ``,
          `- [Shipping](${ORIGIN}/shipping): UPS, FedEx or USPS with tracking to the US and Canada. Free on orders over ${usd(FREE_SHIPPING_THRESHOLD_CENTS)} weighing ${FREE_SHIPPING_MAX_LB} lb or less packed; otherwise shipping is priced at checkout from weight, box size and destination. Ships within 2 business days, 3 to 7 days in transit.`,
          `- [Returns](${ORIGIN}/returns): 10 days from delivery, returned by mail, 15% restocking fee. Refunds go to the original payment method.`,
          `- [Warranty](${ORIGIN}/warranty): full manufacturer warranty on every item.`,
          `- Payment: credit card and PayPal.`,
          ``,
          `## Services`,
          ``,
          `- [Installation](${ORIGIN}/installation): security camera and access control installation in Queens, Brooklyn, Manhattan, the Bronx and Staten Island, plus Nassau and Westchester on request. Written itemised quote, no monthly subscription.`,
          `- [Contact](${ORIGIN}/contact): quotes, questions and orders by phone, WhatsApp, email or the contact form.`,
          ``,
        ];

        try {
          const [cats, items, features] = await Promise.all([listCategories(), allProducts("name"), productFeatureIndex()]);
          const byCat = new Map<string, Product[]>();
          for (const p of items) {
            const list = byCat.get(p.category) ?? [];
            list.push(p);
            byCat.set(p.category, list);
          }
          out.push(`## Products`, ``, `Prices in US dollars. Full catalog: ${ORIGIN}/shop`, ``);
          for (const c of cats) {
            const list = byCat.get(c.slug);
            if (!list?.length) continue;
            out.push(`### [${c.name}](${ORIGIN}/shop/${c.slug})`, ``);
            for (const p of list) {
              const f = features.get(p.slug);
              const bits = [p.brand, f?.mpn ? `part ${f.mpn}` : "", usd(p.price_cents), inStock(p) ? "in stock" : "out of stock"].filter(Boolean);
              const badges = parseBadges(f?.badges).map((b) => b.label);
              const keys = parseHighlights(f?.highlights).slice(0, 4);
              const extra = [badges.length ? `features: ${badges.join(", ")}` : "", keys.length ? keys.join("; ") : ""].filter(Boolean);
              out.push(`- [${p.name}](${ORIGIN}/p/${p.slug}): ${bits.join(", ")}${extra.length ? `. ${extra.join(". ")}` : ""}`);
            }
            out.push(``);
          }
        } catch {
          out.push(`## Products`, ``, `- [Full catalog](${ORIGIN}/shop)`, ``);
        }

        return new Response(out.join("\n"), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
