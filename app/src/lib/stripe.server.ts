import { bindings } from "./bindings.server";

const API = "https://api.stripe.com/v1";

/** Flat rate shipping, free above the threshold. Change these two numbers and
 *  the checkout, the cart copy and the shipping page all follow. */
export const SHIPPING_FLAT_CENTS = 1495;
export const FREE_SHIPPING_THRESHOLD_CENTS = 19900;

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
