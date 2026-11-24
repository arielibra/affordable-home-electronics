/**
 * Google Analytics 4 — measurement ID G-XPQ9ZS5C0J (property under
 * affordableelectronics1@gmail.com; the same ID sits inside the shop's Tag
 * Manager container GTM-TB55WLWM, but the site loads gtag directly).
 *
 * Page views are sent by hand on every route change (`send_page_view: false`
 * in the config), because this is a single-page app: the browser loads one
 * document and the router swaps pages, so GA's automatic page view would
 * count only the first page of each visit.
 *
 * The back office is never tracked — an owner checking orders all day would
 * otherwise be the site's busiest "visitor".
 *
 * Every call is fire-and-forget and swallowed on failure: an ad blocker or a
 * slow Google must never break the cart or the checkout.
 */
export const GA_ID = "G-XPQ9ZS5C0J";

type Gtag = (...args: unknown[]) => void;

/** Paths that are not storefront pages. */
export function untracked(pathname: string): boolean {
  return pathname.startsWith("/admin") || pathname.startsWith("/review/");
}

function gtag(): Gtag | null {
  if (typeof window === "undefined") return null;
  if (untracked(window.location.pathname)) return null;
  const g = (window as unknown as { gtag?: Gtag }).gtag;
  return typeof g === "function" ? g : null;
}

export function track(event: string, params: Record<string, unknown> = {}): void {
  try {
    gtag()?.("event", event, params);
  } catch {
    // Analytics is never the reason something fails.
  }
}

export type GaItem = { item_id: string; item_name: string; item_brand?: string; item_category?: string; price: number; quantity: number };

export function gaItem(p: { slug: string; name: string; brand?: string; category?: string; price_cents: number }, qty = 1): GaItem {
  return {
    item_id: p.slug,
    item_name: p.name,
    ...(p.brand ? { item_brand: p.brand } : {}),
    ...(p.category ? { item_category: p.category } : {}),
    price: Math.round(p.price_cents) / 100,
    quantity: qty,
  };
}

/**
 * A purchase is counted once per order reference, even if the confirmation
 * page is reloaded or reopened from the browser history. GA also de-duplicates
 * on transaction_id, but only within a session; this covers a reload the next
 * day.
 */
export function trackPurchase(params: { reference: string; total_cents: number; shipping_cents?: number | null; tax_cents?: number | null; items?: GaItem[] }): void {
  const key = `ahe_ga_purchase_${params.reference}`;
  try {
    if (window.localStorage.getItem(key)) return;
  } catch {
    // Private mode etc: send anyway; GA's own de-duplication still applies.
  }
  track("purchase", {
    transaction_id: params.reference,
    currency: "USD",
    value: params.total_cents / 100,
    ...(params.shipping_cents != null ? { shipping: params.shipping_cents / 100 } : {}),
    ...(params.tax_cents != null ? { tax: params.tax_cents / 100 } : {}),
    ...(params.items?.length ? { items: params.items } : {}),
  });
  try {
    window.localStorage.setItem(key, "1");
  } catch {
    // ignore
  }
}

/** The inline bootstrap placed in <head>: queue + config, no automatic page view. */
export const GA_BOOTSTRAP = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:false});`;
