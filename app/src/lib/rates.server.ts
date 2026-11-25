/**
 * Live shipping quotes.
 *
 * Suppliers (Alibi and the rest) drop-ship on the shop's own UPS, FedEx and
 * USPS accounts, and the carriers bill those accounts by weight, box size and
 * distance. A flat $14.95 lost money on every bulky box, so the price comes
 * from the carriers instead, through Shippo, which holds the shop's own
 * carrier accounts and so returns the rates he is actually billed.
 *
 * The rules (owner's decision, 2026-11-24):
 *   - Free shipping only when the order is at or over the threshold AND the
 *     whole order weighs FREE_SHIPPING_MAX_LB or less, packed.
 *   - Anything else pays the live rate for the whole order.
 *
 * Every item is quoted as its own parcel from its brand's warehouse ZIP (one
 * label per drop-shipped box, which is how the suppliers send them), and the
 * customer pays the cheapest carrier rate for each.
 *
 * Never throws. With no Shippo key, or if Shippo fails, the old flat rule
 * applies, so checkout keeps working exactly as before.
 */
import { bindings } from "./bindings.server";
import { FREE_SHIPPING_THRESHOLD_CENTS, FREE_SHIPPING_MAX_LB, SHIPPING_FLAT_CENTS, SHOP_ZIP } from "./shipping";

export type ShipLine = { slug: string; price_cents: number; qty: number };
export type ShipTo = { zip: string; country?: string; state?: string; city?: string };
export type ShippingQuote = {
  cents: number;
  /** "live" = carrier rates, "free", or "flat" = the old rule, used as a fallback. */
  source: "live" | "free" | "flat";
  label: string;
  minDays: number;
  maxDays: number;
};

/** Used when a product has no packed weight or box size recorded yet. */
const DEFAULT_PARCEL = { weight: 3, length: 12, width: 10, height: 6 };
/** No cart in this shop needs more; past it, fall back rather than run up calls. */
const MAX_LOOKUPS = 12;

function key(): string {
  return (bindings() as unknown as Record<string, string | undefined>).SHIPPO_API_KEY ?? "";
}

export function liveRatesEnabled(): boolean {
  return Boolean(key());
}

/** The fallback when carriers can't be asked: free under the same two
 *  conditions (over the threshold, light enough), otherwise the flat rate. */
function flat(subtotal: number, totalLb: number): ShippingQuote {
  return subtotal >= FREE_SHIPPING_THRESHOLD_CENTS && totalLb <= FREE_SHIPPING_MAX_LB
    ? { cents: 0, source: "free", label: "Free shipping", minDays: 3, maxDays: 7 }
    : { cents: SHIPPING_FLAT_CENTS, source: "flat", label: "Standard shipping", minDays: 3, maxDays: 7 };
}

type Parcel = { origin: string; weight: number; length: number; width: number; height: number };
type Rate = { cents: number; carrier: string; service: string; days: number | null };

/** The cheapest rate for one parcel, or null if no carrier answered. */
async function cheapestRate(p: Parcel, to: ShipTo, token: string): Promise<Rate | null> {
  const body = {
    address_from: { zip: p.origin, country: "US" },
    address_to: {
      zip: to.zip,
      country: to.country ?? "US",
      ...(to.state ? { state: to.state } : {}),
      ...(to.city ? { city: to.city } : {}),
    },
    parcels: [
      {
        length: String(p.length),
        width: String(p.width),
        height: String(p.height),
        distance_unit: "in",
        weight: String(p.weight),
        mass_unit: "lb",
      },
    ],
    async: false,
  };
  const res = await fetch("https://api.goshippo.com/shipments/", {
    method: "POST",
    headers: { Authorization: `ShippoToken ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`shippo ${res.status}`);
  const data = (await res.json()) as {
    rates?: { amount?: string; currency?: string; provider?: string; servicelevel?: { name?: string }; estimated_days?: number | null }[];
  };
  let best: Rate | null = null;
  for (const r of data.rates ?? []) {
    if ((r.currency ?? "USD") !== "USD") continue;
    const cents = Math.ceil(Number(r.amount) * 100);
    if (!Number.isFinite(cents) || cents <= 0) continue;
    // Nothing slower than about a week and a half; customers were promised 3-7 days.
    if (r.estimated_days != null && r.estimated_days > 10) continue;
    if (!best || cents < best.cents) {
      best = { cents, carrier: r.provider ?? "", service: r.servicelevel?.name ?? "", days: r.estimated_days ?? null };
    }
  }
  return best;
}

/** Small per-isolate memo, so a customer typing at checkout does not re-quote the same thing. */
const memo = new Map<string, { at: number; quote: ShippingQuote }>();

export async function shippingQuote(lines: ShipLine[], to: ShipTo): Promise<ShippingQuote> {
  const subtotal = lines.reduce((s, l) => s + l.price_cents * l.qty, 0);
  const token = key();
  const zip = (to.zip ?? "").trim();
  const country = (to.country ?? "US").toUpperCase();
  const zipOk = country === "CA" ? /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/.test(zip) : /^\d{5}(-\d{4})?$/.test(zip);
  if (lines.length === 0) return flat(subtotal, 0);

  const DB = bindings().DB;
  if (!DB) return flat(subtotal, Infinity);

  const memoKey = JSON.stringify([lines.map((l) => [l.slug, l.qty, l.price_cents]), zip, country, Boolean(token)]);
  const hit = memo.get(memoKey);
  if (hit && Date.now() - hit.at < 10 * 60_000) return hit.quote;

  let totalLb = Infinity;
  try {
    const slugs = [...new Set(lines.map((l) => l.slug))].slice(0, 50);
    const ph = slugs.map((_, i) => `?${i + 1}`).join(",");
    const rows =
      (
        await DB.prepare(
          `SELECT p.slug, p.ship_weight_lb, p.ship_length_in, p.ship_width_in, p.ship_height_in, b.ship_from_zip
             FROM products p LEFT JOIN brands b ON b.slug = p.brand_slug
            WHERE p.slug IN (${ph})`,
        )
          .bind(...slugs)
          .all<{
            slug: string;
            ship_weight_lb: number | null;
            ship_length_in: number | null;
            ship_width_in: number | null;
            ship_height_in: number | null;
            ship_from_zip: string | null;
          }>()
      ).results ?? [];
    const info = new Map(rows.map((r) => [r.slug, r]));

    // One parcel per unit; identical parcels are quoted once and multiplied.
    const groups = new Map<string, { parcel: Parcel; count: number }>();
    totalLb = 0;
    for (const l of lines) {
      const r = info.get(l.slug);
      const hasBox = r?.ship_length_in && r?.ship_width_in && r?.ship_height_in;
      const parcel: Parcel = {
        origin: /^\d{5}/.test(r?.ship_from_zip ?? "") ? (r?.ship_from_zip ?? "").slice(0, 5) : SHOP_ZIP,
        weight: r?.ship_weight_lb ?? DEFAULT_PARCEL.weight,
        length: hasBox ? (r?.ship_length_in as number) : DEFAULT_PARCEL.length,
        width: hasBox ? (r?.ship_width_in as number) : DEFAULT_PARCEL.width,
        height: hasBox ? (r?.ship_height_in as number) : DEFAULT_PARCEL.height,
      };
      totalLb += parcel.weight * l.qty;
      const k = JSON.stringify(parcel);
      const g = groups.get(k);
      if (g) g.count += l.qty;
      else groups.set(k, { parcel, count: l.qty });
    }

    const free = subtotal >= FREE_SHIPPING_THRESHOLD_CENTS && totalLb <= FREE_SHIPPING_MAX_LB;
    if (free) return { cents: 0, source: "free", label: "Free shipping", minDays: 3, maxDays: 7 };
    if (!token || !zipOk || groups.size > MAX_LOOKUPS) return flat(subtotal, totalLb);

    const quoted = await Promise.all(
      [...groups.values()].map(async (g) => ({ g, rate: await cheapestRate(g.parcel, { ...to, zip, country }, token) })),
    );
    if (quoted.some((q) => !q.rate)) return flat(subtotal, totalLb);

    const cents = quoted.reduce((s, q) => s + (q.rate as Rate).cents * q.g.count, 0);
    const days = quoted.map((q) => q.rate?.days).filter((d): d is number => typeof d === "number");
    const maxDays = Math.max(3, ...days) + 2; // + up to 2 business days for the supplier to pack it
    const carriers = [...new Set(quoted.map((q) => q.rate?.carrier).filter(Boolean))];
    const quote: ShippingQuote = {
      cents,
      source: "live",
      label: carriers.length === 1 ? `${carriers[0]} shipping` : "Shipping",
      minDays: Math.max(2, Math.min(...(days.length ? days : [3]))),
      maxDays: Math.min(15, maxDays),
    };
    memo.set(memoKey, { at: Date.now(), quote });
    return quote;
  } catch (error) {
    console.error("shipping quote failed, using flat rate", error);
    return flat(subtotal, totalLb);
  }
}
