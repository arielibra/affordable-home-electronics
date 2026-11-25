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
 * Items are packed the way a warehouse packs them: everything from the same
 * brand's warehouse goes into shared cartons (up to CARTON_MAX_LB each), and
 * only heavy or oversized items (a recorder, a cable box) travel in a box of
 * their own. Each carton is quoted from that warehouse's ZIP and the customer
 * pays the cheapest carrier rate for each. (Until 2026-11-25 every unit was
 * quoted as its own box, which made 14 headphones cost $217 to ship.)
 *
 * Never throws. With no Shippo key, or if Shippo fails, the old flat rule
 * applies, so checkout keeps working exactly as before.
 */
import { bindings } from "./bindings.server";
import { zipPlace } from "./zip.server";
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
/** A shared carton is closed at this weight and a new one started. */
const CARTON_MAX_LB = 40;
/** Anything this heavy, or this long on its longest side, ships in its own box. */
const OWN_BOX_LB = 10;
const OWN_BOX_IN = 24;
/** Room for padding when several boxes share one carton. */
const PACK_SLACK = 1.15;
/**
 * A product's recorded L x W x H and weight are the item in its own retail
 * packaging (owner, 2026-11-25), not the box it ships in. Every shipment goes
 * out in an outer shipping box: this much bigger on each side, plus the weight
 * of the box and its padding.
 */
const OUTER_PAD_IN = 2;
const OUTER_BOX_LB = 0.4;
const OUTER_BOX_LB_PER_CUIN = 0.0005;

/** Wraps a packed load in its outer shipping box. */
function outerBox(origin: string, weight: number, dims: number[]): Parcel {
  const [l, w, h] = dims.map((d) => Math.ceil(d + OUTER_PAD_IN)).sort((a, b) => b - a);
  const lb = weight + OUTER_BOX_LB + l * w * h * OUTER_BOX_LB_PER_CUIN;
  return { origin, weight: round1(lb), length: l, width: w, height: h };
}

type Unit = { weight: number; dims: [number, number, number] };

/**
 * Packs one warehouse's units into cartons. Heavy or long items keep their own
 * box; the rest are combined, filling cartons up to CARTON_MAX_LB. A combined
 * carton is as long as its longest item and squared off around the total
 * volume (plus padding), so the carrier's dimensional weight stays realistic.
 */
function packCartons(origin: string, units: Unit[]): Parcel[] {
  const out: Parcel[] = [];
  const small: Unit[] = [];
  for (const u of units) {
    const longest = Math.max(...u.dims);
    if (u.weight >= OWN_BOX_LB || longest >= OWN_BOX_IN) {
      out.push(outerBox(origin, u.weight, u.dims));
    } else small.push(u);
  }
  // Heaviest first, so cartons fill evenly.
  small.sort((a, b) => b.weight - a.weight);
  let carton: Unit[] = [];
  let lb = 0;
  const close = () => {
    if (!carton.length) return;
    if (carton.length === 1) {
      out.push(outerBox(origin, carton[0].weight, carton[0].dims));
    } else {
      const vol = carton.reduce((v, u) => v + u.dims[0] * u.dims[1] * u.dims[2], 0) * PACK_SLACK;
      const sorted = carton.map((u) => [...u.dims].sort((a, b) => b - a));
      const length = Math.max(...sorted.map((d) => d[0]));
      const minW = Math.max(...sorted.map((d) => d[1]));
      const minH = Math.max(...sorted.map((d) => d[2]));
      const side = Math.sqrt(vol / length);
      const width = Math.ceil(Math.max(minW, side));
      const height = Math.ceil(Math.max(minH, vol / length / width));
      out.push(outerBox(origin, lb, [length, width, height]));
    }
    carton = [];
    lb = 0;
  };
  for (const u of small) {
    if (carton.length && lb + u.weight > CARTON_MAX_LB) close();
    carton.push(u);
    lb += u.weight;
  }
  close();
  return out;
}

function round1(n: number): number {
  return Math.ceil(n * 10) / 10;
}

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

/** Carriers the shop actually ships with (owner, 2026-11-24: UPS only for now).
 *  Add "fedex" or "usps" here once those accounts are connected in Shippo. */
const SHOP_CARRIERS = ["ups"];

/**
 * The shop's OWN carrier accounts in Shippo. A new Shippo account also comes
 * with Shippo's discounted master accounts switched on; quoting from those
 * would show customers a price below what his own UPS account is billed, and
 * he would lose the difference on every order. So quotes are restricted to
 * his accounts. Looked up once per isolate.
 */
let accounts: { at: number; ids: string[] } | undefined;
async function ownAccounts(token: string): Promise<string[]> {
  if (accounts && Date.now() - accounts.at < 60 * 60_000) return accounts.ids;
  const res = await fetch("https://api.goshippo.com/carrier_accounts/?results=100", {
    headers: { Authorization: `ShippoToken ${token}` },
  });
  if (!res.ok) throw new Error(`shippo accounts ${res.status}`);
  const data = (await res.json()) as {
    results?: { object_id?: string; carrier?: string; active?: boolean; is_shippo_account?: boolean; test?: boolean }[];
  };
  const ids = (data.results ?? [])
    .filter((a) => a.active !== false && a.test !== true && !a.is_shippo_account && SHOP_CARRIERS.includes((a.carrier ?? "").toLowerCase()))
    .map((a) => a.object_id ?? "")
    .filter(Boolean);
  accounts = { at: Date.now(), ids };
  return ids;
}
type Rate = { cents: number; carrier: string; service: string; days: number | null };

/** The cheapest rate for one parcel, or null if no carrier answered. */
async function cheapestRate(p: Parcel, to: ShipTo, token: string, carrierAccounts: string[]): Promise<Rate | null> {
  // UPS will not quote without a state at both ends ("Missing ship from state
  // province code"), so fill it in from the ZIP where it wasn't given.
  const from = await zipPlace(p.origin, "US");
  const toPlace = to.state ? { city: to.city ?? "", state: to.state } : await zipPlace(to.zip, to.country ?? "US");
  const body = {
    carrier_accounts: carrierAccounts,
    address_from: { zip: p.origin, country: "US", ...(from ? { state: from.state, city: from.city } : {}) },
    address_to: {
      zip: to.zip,
      country: to.country ?? "US",
      ...(toPlace?.state ? { state: toPlace.state } : {}),
      ...(toPlace?.city ? { city: toPlace.city } : {}),
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
    rates?: {
      amount?: string;
      currency?: string;
      provider?: string;
      carrier_account?: string;
      servicelevel?: { name?: string };
      estimated_days?: number | null;
    }[];
  };
  let best: Rate | null = null;
  for (const r of data.rates ?? []) {
    if ((r.currency ?? "USD") !== "USD") continue;
    // Belt and braces: only rates from his own accounts, whatever Shippo sends.
    if (!r.carrier_account || !carrierAccounts.includes(r.carrier_account)) continue;
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

    // Gather every unit by the warehouse it ships from, then pack each
    // warehouse's units into cartons. Identical cartons are quoted once.
    const byOrigin = new Map<string, Unit[]>();
    totalLb = 0;
    for (const l of lines) {
      const r = info.get(l.slug);
      const hasBox = r?.ship_length_in && r?.ship_width_in && r?.ship_height_in;
      const origin = /^\d{5}/.test(r?.ship_from_zip ?? "") ? (r?.ship_from_zip ?? "").slice(0, 5) : SHOP_ZIP;
      const unit: Unit = {
        weight: r?.ship_weight_lb ?? DEFAULT_PARCEL.weight,
        dims: hasBox
          ? [r?.ship_length_in as number, r?.ship_width_in as number, r?.ship_height_in as number]
          : [DEFAULT_PARCEL.length, DEFAULT_PARCEL.width, DEFAULT_PARCEL.height],
      };
      totalLb += unit.weight * l.qty;
      const list = byOrigin.get(origin) ?? [];
      for (let n = 0; n < Math.min(l.qty, 500); n++) list.push(unit);
      byOrigin.set(origin, list);
    }
    const groups = new Map<string, { parcel: Parcel; count: number }>();
    for (const [origin, units] of byOrigin) {
      for (const parcel of packCartons(origin, units)) {
        const k = JSON.stringify(parcel);
        const g = groups.get(k);
        if (g) g.count += 1;
        else groups.set(k, { parcel, count: 1 });
      }
    }

    const free = subtotal >= FREE_SHIPPING_THRESHOLD_CENTS && totalLb <= FREE_SHIPPING_MAX_LB;
    if (free) return { cents: 0, source: "free", label: "Free shipping", minDays: 3, maxDays: 7 };
    if (!token || !zipOk || groups.size > MAX_LOOKUPS) return flat(subtotal, totalLb);

    const mine = await ownAccounts(token);
    if (mine.length === 0) {
      console.error("shipping quote: no shop-owned carrier account found in Shippo, using flat rate");
      return flat(subtotal, totalLb);
    }
    const quoted = await Promise.all(
      [...groups.values()].map(async (g) => ({ g, rate: await cheapestRate(g.parcel, { ...to, zip, country }, token, mine) })),
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

/** For the back office's shipping check: which carrier accounts Shippo holds,
 *  which of them quotes will use, and a sample quote. Never returns the key. */
export async function shippingDiagnostics(): Promise<Record<string, unknown>> {
  const token = key();
  if (!token) return { ok: false, live: false, note: "SHIPPO_API_KEY is not set, so the flat $14.95 rule applies." };
  const out: Record<string, unknown> = { ok: true, live: true, keyType: token.startsWith("shippo_live_") ? "live" : "test (rates are not real)" };
  try {
    const res = await fetch("https://api.goshippo.com/carrier_accounts/?results=100", {
      headers: { Authorization: `ShippoToken ${token}` },
    });
    const data = (await res.json()) as { results?: Record<string, unknown>[] };
    out.accounts = (data.results ?? []).map((a) => ({
      carrier: a.carrier,
      account: typeof a.account_id === "string" ? `…${(a.account_id as string).slice(-4)}` : "",
      active: a.active,
      shippoOwned: a.is_shippo_account ?? null,
      test: a.test,
    }));
    accounts = undefined;
    const mine = await ownAccounts(token);
    out.usedForQuotes = mine.length;
    if (mine.length) {
      // Raw Shippo reply for the same sample, so a missing rate can be explained.
      const raw = await fetch("https://api.goshippo.com/shipments/", {
        method: "POST",
        headers: { Authorization: `ShippoToken ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          carrier_accounts: mine,
          address_from: { zip: SHOP_ZIP, country: "US", ...((await zipPlace(SHOP_ZIP)) ?? {}) },
          address_to: { zip: "90001", country: "US", ...((await zipPlace("90001")) ?? {}) },
          parcels: [{ length: "17", width: "15", height: "5", distance_unit: "in", weight: "7.4", mass_unit: "lb" }],
          async: false,
        }),
      });
      const rj = (await raw.json()) as {
        status?: string;
        messages?: { source?: string; code?: string; text?: string }[];
        rates?: { provider?: string; amount?: string; carrier_account?: string; servicelevel?: { name?: string }; estimated_days?: number }[];
      };
      out.raw = {
        http: raw.status,
        status: rj.status,
        messages: (rj.messages ?? []).map((m) => `${m.source ?? ""} ${m.code ?? ""}: ${m.text ?? ""}`.slice(0, 300)),
        rates: (rj.rates ?? []).map((r) => `${r.provider} ${r.servicelevel?.name} $${r.amount} ${r.estimated_days ?? "?"}d ${mine.includes(r.carrier_account ?? "") ? "(own)" : "(other)"}`),
      };
      out.sample = {
        what: "7.4 lb NVR box 17x15x5 from 11374 to 90001 (Los Angeles)",
        rate: await cheapestRate({ origin: SHOP_ZIP, weight: 7.4, length: 17, width: 15, height: 5 }, { zip: "90001", country: "US" }, token, mine),
      };
    }
  } catch (error) {
    out.ok = false;
    out.error = error instanceof Error ? error.message : String(error);
  }
  return out;
}
