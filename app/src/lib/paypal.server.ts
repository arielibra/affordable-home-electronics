import { bindings } from "./bindings.server";

/**
 * PayPal Orders v2, hand-rolled against fetch.
 *
 * The official PayPal SDK assumes Node, which a Worker is not, so this is the
 * small subset the shop actually needs: an access token, create an order,
 * capture it, and verify a webhook. Everything is plain fetch + Web Crypto.
 */

type Env = Record<string, string | undefined>;
function env(): Env {
  return bindings() as unknown as Env;
}

/** Live only when the account is explicitly switched over. Sandbox otherwise. */
export function paypalLive(): boolean {
  return env().PAYPAL_ENV === "live";
}

function api(): string {
  return paypalLive() ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

export function paypalEnabled(): boolean {
  const e = env();
  return Boolean(e.PAYPAL_CLIENT_ID && e.PAYPAL_SECRET);
}

/** Safe to hand to the browser: the client id is public by design. */
export function paypalClientId(): string {
  return env().PAYPAL_CLIENT_ID ?? "";
}

function credentials(): { id: string; secret: string } {
  const e = env();
  if (!e.PAYPAL_CLIENT_ID || !e.PAYPAL_SECRET) throw new Error("PayPal is not configured yet.");
  return { id: e.PAYPAL_CLIENT_ID, secret: e.PAYPAL_SECRET };
}

// One isolate serves many requests, so a token fetched for one is reused by the
// next. PayPal tokens last about nine hours; ours retires a minute early.
let cached: { token: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string> {
  const now = Date.now();
  if (cached && cached.expiresAt > now) return cached.token;

  const { id, secret } = credentials();
  const res = await fetch(`${api()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${id}:${secret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const json = (await res.json()) as { access_token?: string; expires_in?: number; error_description?: string };
  if (!res.ok || !json.access_token) {
    throw new Error(json.error_description ?? `PayPal auth failed (${res.status})`);
  }
  cached = { token: json.access_token, expiresAt: now + (json.expires_in ?? 3600) * 1000 - 60_000 };
  return json.access_token;
}

type PaypalError = { message?: string; details?: { description?: string; issue?: string }[]; name?: string };

export async function paypalFetch<T>(
  path: string,
  init: { method: "GET" | "POST"; body?: unknown; requestId?: string },
): Promise<T> {
  const send = async (token: string) => {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    // Idempotency: a replayed capture must not take the money twice.
    if (init.requestId) headers["PayPal-Request-Id"] = init.requestId;
    return fetch(`${api()}${path}`, {
      method: init.method,
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  };

  let res = await send(await accessToken());
  if (res.status === 401) {
    cached = null; // a rotated secret must not wedge the isolate
    res = await send(await accessToken());
  }

  const text = await res.text();
  const json = (text ? JSON.parse(text) : {}) as T & PaypalError;
  if (!res.ok) {
    const detail = json.details?.[0];
    throw new Error(detail?.description ?? detail?.issue ?? json.message ?? `PayPal returned ${res.status}`);
  }
  return json;
}

/**
 * Webhook authenticity. PayPal does not sign with a shared secret the way
 * Stripe does: it asks you to hand the headers back to its own verify
 * endpoint, which checks them against the certificate it signed with.
 */
export async function verifyPaypalWebhook(headers: Headers, rawBody: string): Promise<boolean> {
  const webhookId = env().PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;

  const names = [
    "paypal-auth-algo",
    "paypal-cert-url",
    "paypal-transmission-id",
    "paypal-transmission-sig",
    "paypal-transmission-time",
  ] as const;
  const got: Record<string, string> = {};
  for (const h of names) {
    const v = headers.get(h);
    if (!v) return false;
    got[h] = v;
  }

  try {
    const r = await paypalFetch<{ verification_status?: string }>("/v1/notifications/verify-webhook-signature", {
      method: "POST",
      body: {
        auth_algo: got["paypal-auth-algo"],
        cert_url: got["paypal-cert-url"],
        transmission_id: got["paypal-transmission-id"],
        transmission_sig: got["paypal-transmission-sig"],
        transmission_time: got["paypal-transmission-time"],
        webhook_id: webhookId,
        webhook_event: JSON.parse(rawBody) as unknown,
      },
    });
    return r.verification_status === "SUCCESS";
  } catch (error) {
    console.error("paypal webhook verification failed", error);
    return false;
  }
}

/** PayPal wants decimal strings, and the parts must add up to the total exactly. */
export function usd(cents: number): string {
  return (Math.round(cents) / 100).toFixed(2);
}
