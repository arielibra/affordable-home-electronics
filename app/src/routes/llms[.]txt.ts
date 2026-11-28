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
          `> Security cameras, NVR/DVR recorders, access control, smart locks, doorbells and home electronics. An authorized security camera dealer since ${SITE.since}, based in Rego Park, Queens, shipping genuine USA-stock product with the full manufacturer warranty to homes and businesses anywhere in the United States, with installation arranged across New York City. Authorized dealer for Alibi, LTS, Anviz and ENS.`,
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
          `- [Shipping](${ORIGIN}/shipping): UPS, FedEx or USPS with tracking to the US and Canada. On orders over ${usd(FREE_SHIPPING_THRESHOLD_CENTS)}, every package weighing ${FREE_SHIPPING_MAX_LB} lb or less ships free (items ship from each brand's warehouse, so one order can be several packages); heavier packages and smaller orders are priced at checkout from weight, size and destination. Ships within 2 business days, 3 to 7 days in transit.`,
          `- [Returns](${ORIGIN}/returns): 10 days from delivery, returned by mail, 15% restocking fee. Refunds go to the original payment method.`,
          `- [Warranty](${ORIGIN}/warranty): full manufacturer warranty on every item.`,
          `- Payment: credit card and PayPal.`,
          ``,
          `## Services`,
          ``,
          `- [Installation](${ORIGIN}/installation): security camera and access control installation in Queens, Brooklyn, Manhattan, the Bronx and Staten Island, plus Nassau and Westchester on request. Written itemised quote, no monthly subscription.`,
          `- [Authorized dealer and warranty](${ORIGIN}/authorized-dealer): how to buy security cameras that carry the full US manufacturer warranty, which brands we are authorized for, and how to spot grey-market stock.`,
          `- [Camera installation guide](${ORIGIN}/installation-guide): what a professional CCTV installation includes, what drives the cost, how long it takes, and when installing it yourself makes sense.`,
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
