import { bindings } from "./bindings.server";

const API = "https://api.stripe.com/v1";

export { SHIPPING_FLAT_CENTS, FREE_SHIPPING_THRESHOLD_CENTS } from "./shipping";

function secretKey(): string {
  const key = (bindings() as unknown as Record<string, string | undefined>).STRIPE_SECRET_KEY;
  if (!key) throw new Error("Card payment is not configured yet.");
  return key;
}

export function webhookSecret(): string {
  const key = (bindings() as unknown as Record<string, string | undefined>).STRIPE_WEBHOOK_SECRET;
  if (!key) throw new Error("The payment webhook is not configured yet.");
  return key;
}

export function paymentsEnabled(): boolean {
  const env = bindings() as unknown as Record<string, string | undefined>;
  return Boolean(env.STRIPE_SECRET_KEY);
}

/** Stripe's API takes form encoding with bracketed keys, not JSON. */
export async function stripePost<T>(path: string, fields: Record<string, string>): Promise<T> {
  const body = new URLSearchParams(fields);
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const json = (await res.json()) as T & { error?: { message?: string; type?: string } };
  if (!res.ok) {
    const message = json?.error?.message ?? `Stripe returned ${res.status}`;
    throw new Error(message);
  }
  return json;
}

export async function stripeGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${secretKey()}` } });
  const json = (await res.json()) as T & { error?: { message?: string } };
  if (!res.ok) throw new Error(json?.error?.message ?? `Stripe returned ${res.status}`);
  return json;
}

/**
 * Verify the Stripe-Signature header ourselves. The official library pulls in
 * Node crypto, which a Worker does not have, so this is the Web Crypto version
 * of the same scheme: HMAC-SHA256 over "timestamp.rawBody", compared in
 * constant time, with a five minute tolerance against replay.
 */
export async function verifyStripeSignature(rawBody: string, header: string | null, secret: string): Promise<boolean> {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i).trim(), p.slice(i + 1).trim()];
    }),
  ) as Record<string, string>;

  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${rawBody}`));
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

export type TaxAddress = { line1: string; line2?: string; city: string; state: string; zip: string; country?: string };
export type TaxQuote = { taxCents: number; calculationId: string };

/**
 * Sales tax for a PayPal order.
 *
 * Stripe Checkout works its own tax out, but PayPal does not compute tax at
 * all, so an order paid through PayPal would otherwise be untaxed and the two
 * payment routes would disagree. Rather than run a second tax engine, this
 * asks Stripe Tax for the same answer Checkout would have produced, so his
 * filings stay in one place regardless of how the customer paid.
 *
 * Returns null when Stripe is not configured or the call fails; the caller
 * decides what to do rather than being handed a silently wrong number.
 */
export async function calculateTax(
  lines: { slug: string; name: string; price_cents: number; qty: number }[],
  shippingCents: number,
  address: TaxAddress,
): Promise<TaxQuote | null> {
  if (!paymentsEnabled()) return null;

  const fields: Record<string, string> = {
    currency: "usd",
    "customer_details[address][line1]": address.line1.slice(0, 200),
    "customer_details[address][city]": address.city.slice(0, 100),
    "customer_details[address][state]": address.state.slice(0, 40),
    "customer_details[address][postal_code]": address.zip.slice(0, 20),
    "customer_details[address][country]": address.country ?? "US",
    "customer_details[address_source]": "shipping",
    "shipping_cost[amount]": String(shippingCents),
    "shipping_cost[tax_behavior]": "exclusive",
  };
  if (address.line2) fields["customer_details[address][line2]"] = address.line2.slice(0, 200);

  lines.forEach((l, i) => {
    fields[`line_items[${i}][amount]`] = String(l.price_cents * l.qty);
    fields[`line_items[${i}][quantity]`] = String(l.qty);
    fields[`line_items[${i}][reference]`] = l.slug.slice(0, 100);
    fields[`line_items[${i}][tax_behavior]`] = "exclusive";
  });

  try {
    const calc = await stripePost<{ id: string; tax_amount_exclusive?: number }>("/tax/calculations", fields);
    return { taxCents: calc.tax_amount_exclusive ?? 0, calculationId: calc.id };
  } catch (error) {
    console.error("tax calculation failed", error);
    return null;
  }
}

/**
 * Record the calculation as a real transaction once the money is actually
 * taken, which is what makes it show up in his Stripe Tax reports. Failure
 * here must never undo a captured payment, so it only logs.
 */
export async function recordTaxTransaction(calculationId: string, reference: string): Promise<void> {
  try {
    await stripePost("/tax/transactions/create_from_calculation", {
      calculation: calculationId,
      reference: reference.slice(0, 100),
    });
  } catch (error) {
    console.error("tax transaction not recorded", error);
  }
}
