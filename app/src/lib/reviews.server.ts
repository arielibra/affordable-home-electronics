import { bindings } from "./bindings.server";
import { ownerAddress, reviewRequestMessage, newReviewMessage, sendMail, deliverableAddress } from "./email.server";
import { shopMayEmailBuyer } from "./orders";
import { lineMatches, type Line } from "./review-match";

/**
 * Verified-buyer reviews.
 *
 * The rule that matters: a review only exists against a real order that was
 * shipped and that contains the product. Nothing here invents, imports or
 * copies a rating from anywhere else, because Google treats that as
 * spam and the cost would be the whole Merchant Center account.
 */

function db() {
  const DB = bindings().DB;
  if (!DB) throw new Error("No database.");
  return DB;
}

/* Matching an order line to a product lives in review-match.ts, where it can be tested. */

type LiveProduct = { slug: string; name: string; image: string };

async function liveProducts(): Promise<LiveProduct[]> {
  const r = await db().prepare("SELECT slug, name, image FROM products WHERE active = 1").all<LiveProduct>();
  return r.results ?? [];
}

/** The products on the site that this order's lines bought. */
async function productsInOrder(orderId: string): Promise<LiveProduct[]> {
  const lines = await db()
    .prepare("SELECT product_slug, name FROM order_items WHERE order_id = ?1")
    .bind(orderId)
    .all<Line>();
  const items = lines.results ?? [];
  if (!items.length) return [];
  const all = await liveProducts();
  return all.filter((p) => items.some((l) => lineMatches(l, p.slug, p.name)));
}

/* ------------------------------------------------------------------ *
 * Who is allowed to review
 * ------------------------------------------------------------------ */

type ReviewOrder = { id: string; reference: string; name: string; email: string; status: string; channel: string };

const ORDER_COLS = "id, reference, name, email, status, channel";

function normalizeReference(input: string): string {
  const bare = input.trim().toUpperCase().replace(/\s+/g, "").replace(/^AHE[-\s]?/, "");
  return `AHE-${bare}`;
}

export type Auth = { token?: string; reference?: string; email?: string };

/** The order behind a review link or an order number + email. Shipped only:
 *  someone still waiting for the parcel has nothing to review yet. */
export async function orderFor(auth: Auth): Promise<ReviewOrder | null> {
  let order: ReviewOrder | null = null;
  if (auth.token && /^[a-f0-9]{32}$/.test(auth.token)) {
    order = await db().prepare(`SELECT ${ORDER_COLS} FROM orders WHERE review_token = ?1`).bind(auth.token).first<ReviewOrder>();
  } else if (auth.reference && auth.email) {
    order = await db()
      .prepare(`SELECT ${ORDER_COLS} FROM orders WHERE reference = ?1 AND lower(email) = ?2`)
      .bind(normalizeReference(auth.reference.slice(0, 40)), auth.email.trim().toLowerCase().slice(0, 160))
      .first<ReviewOrder>();
  }
  return order && order.status === "shipped" ? order : null;
}

/** "Richard Walsh" → "Richard W." Never the full surname by default. */
export function displayName(full: string): string {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Verified buyer";
  if (parts.length === 1) return parts[0].slice(0, 40);
  return `${parts[0].slice(0, 30)} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

export type Reviewable = LiveProduct & {
  existing: { rating: number; title: string; body: string; status: string } | null;
};

export async function reviewableFor(order: ReviewOrder): Promise<Reviewable[]> {
  const products = await productsInOrder(order.id);
  const mine = await db()
    .prepare("SELECT product_slug, rating, title, body, status FROM reviews WHERE order_id = ?1")
    .bind(order.id)
    .all<{ product_slug: string; rating: number; title: string; body: string; status: string }>();
  const bySlug = new Map((mine.results ?? []).map((r) => [r.product_slug, r]));
  return products.map((p) => {
    const r = bySlug.get(p.slug);
    return { ...p, existing: r ? { rating: r.rating, title: r.title, body: r.body, status: r.status } : null };
  });
}

export type Submission = { slug: string; rating: number; title: string; body: string };

/**
 * Saves the buyer's reviews, each held for approval. Writing again for the
 * same product replaces the earlier one and sends it back to pending, so an
 * edit cannot slip a changed review past the shop.
 */
export async function submitReviews(
  order: ReviewOrder,
  author: string,
  items: Submission[],
): Promise<{ saved: number; error: string }> {
  const allowed = new Set((await productsInOrder(order.id)).map((p) => p.slug));
  const clean = items
    .filter((i) => allowed.has(i.slug) && Number.isInteger(i.rating) && i.rating >= 1 && i.rating <= 5)
    .map((i) => ({
      slug: i.slug,
      rating: i.rating,
      title: i.title.trim().replace(/\s+/g, " ").slice(0, 120),
      body: i.body.trim().replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").slice(0, 3000),
    }));
  if (!clean.length) return { saved: 0, error: "Pick a star rating for at least one product from this order." };

  const name = author.trim().replace(/\s+/g, " ").slice(0, 40) || displayName(order.name);
  const stmt = db().prepare(
    `INSERT INTO reviews (id, product_slug, order_id, rating, title, body, author, status)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 'pending')
     ON CONFLICT (order_id, product_slug) DO UPDATE SET
       rating = excluded.rating, title = excluded.title, body = excluded.body, author = excluded.author,
       status = 'pending', created_at = datetime('now'), decided_at = NULL`,
  );
  await db().batch(clean.map((c) => stmt.bind(crypto.randomUUID(), c.slug, order.id, c.rating, c.title, c.body, name)));

  // Tell the shop there is something to approve. A failure here must not lose the review.
  const owner = ownerAddress();
  if (owner) {
    const names = await db()
      .prepare(`SELECT slug, name FROM products WHERE slug IN (${clean.map((_, i) => `?${i + 1}`).join(",")})`)
      .bind(...clean.map((c) => c.slug))
      .all<{ slug: string; name: string }>();
    const label = new Map((names.results ?? []).map((n) => [n.slug, n.name]));
    await sendMail(order.reference, "review_received", {
      to: owner,
      ...newReviewMessage(
        order.reference,
        name,
        clean.map((c) => ({ ...c, product: label.get(c.slug) ?? c.slug })),
      ),
    });
  }
  return { saved: clean.length, error: "" };
}

/* ------------------------------------------------------------------ *
 * What the product page shows
 * ------------------------------------------------------------------ */

export type PublicReview = { id: string; rating: number; title: string; body: string; author: string; date: string };
export type ReviewSummary = { count: number; average: number; breakdown: number[] };

export async function productReviews(slug: string): Promise<{ summary: ReviewSummary; reviews: PublicReview[] }> {
  const DB = bindings().DB;
  const empty = { summary: { count: 0, average: 0, breakdown: [0, 0, 0, 0, 0] }, reviews: [] };
  if (!DB) return empty;
  try {
    const [agg, list] = await Promise.all([
      DB.prepare("SELECT rating, COUNT(*) AS n FROM reviews WHERE product_slug = ?1 AND status = 'approved' GROUP BY rating")
        .bind(slug)
        .all<{ rating: number; n: number }>(),
      DB.prepare(
        `SELECT id, rating, title, body, author, date(created_at) AS date FROM reviews
          WHERE product_slug = ?1 AND status = 'approved' ORDER BY created_at DESC LIMIT 50`,
      )
        .bind(slug)
        .all<PublicReview>(),
    ]);
    const breakdown = [0, 0, 0, 0, 0];
    let total = 0;
    let count = 0;
    for (const r of agg.results ?? []) {
      breakdown[r.rating - 1] = r.n;
      total += r.rating * r.n;
      count += r.n;
    }
    return {
      summary: { count, average: count ? Math.round((total / count) * 10) / 10 : 0, breakdown },
      reviews: list.results ?? [],
    };
  } catch {
    // Before the migration has run, or a database hiccup: show no reviews
    // rather than break the product page.
    return empty;
  }
}

/* ------------------------------------------------------------------ *
 * The follow-up email
 * ------------------------------------------------------------------ */

/** Long enough for the parcel to arrive and the thing to be installed. */
export const REVIEW_REQUEST_AFTER_DAYS = 14;
/** Only orders shipped from the new site's launch on. Customers from before
 *  never agreed to hear from this site and would not expect it. */
export const REVIEW_REQUESTS_FROM = "2026-10-01";

/**
 * Runs once a day. Each eligible order gets one email, ever: the stamp is set
 * whether it was sent or skipped, so a bad address is not retried daily.
 * Amazon and Walmart orders are never emailed (their rules forbid it).
 */
export async function sendDueReviewRequests(limit = 40): Promise<{ sent: number; skipped: number }> {
  const due = await db()
    .prepare(
      `SELECT ${ORDER_COLS} FROM orders
        WHERE status = 'shipped' AND review_requested_at IS NULL
          AND shipped_at >= ?1 AND shipped_at <= datetime('now', ?2)
        ORDER BY shipped_at LIMIT ?3`,
    )
    .bind(REVIEW_REQUESTS_FROM, `-${REVIEW_REQUEST_AFTER_DAYS} days`, limit)
    .all<ReviewOrder>();

  let sent = 0;
  let skipped = 0;
  for (const order of due.results ?? []) {
    const stamp = (token: string | null) =>
      db()
        .prepare("UPDATE orders SET review_requested_at = datetime('now'), review_token = COALESCE(?2, review_token) WHERE id = ?1")
        .bind(order.id, token)
        .run();

    if (!shopMayEmailBuyer(order.channel) || !deliverableAddress(order.email)) {
      await stamp(null);
      skipped++;
      continue;
    }
    const products = await productsInOrder(order.id);
    if (!products.length) {
      // Nothing from this order is on the site any more, so there is nothing to review.
      await stamp(null);
      skipped++;
      continue;
    }
    const token = [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, "0")).join("");
    // Stamp first: if the send then fails, the buyer misses one email, which
    // is better than a loop that emails them every day.
    await stamp(token);
    const res = await sendMail(order.reference, "review_request", {
      to: order.email,
      ...reviewRequestMessage(order, token, products.map((p) => p.name)),
    });
    if (res.ok) sent++;
    else skipped++;
  }
  return { sent, skipped };
}

/* ------------------------------------------------------------------ *
 * The back office
 * ------------------------------------------------------------------ */

export type AdminReview = {
  id: string;
  product_slug: string;
  product_name: string | null;
  reference: string | null;
  customer: string | null;
  rating: number;
  title: string;
  body: string;
  author: string;
  status: string;
  created_at: string;
};

export async function adminReviews(): Promise<AdminReview[]> {
  const r = await db()
    .prepare(
      `SELECT r.id, r.product_slug, p.name AS product_name, o.reference, o.name AS customer,
              r.rating, r.title, r.body, r.author, r.status, r.created_at
         FROM reviews r
         LEFT JOIN products p ON p.slug = r.product_slug
         LEFT JOIN orders o ON o.id = r.order_id
        ORDER BY CASE r.status WHEN 'pending' THEN 0 ELSE 1 END, r.created_at DESC
        LIMIT 500`,
    )
    .all<AdminReview>();
  return r.results ?? [];
}

export async function decideReview(id: string, status: "approved" | "hidden" | "pending"): Promise<boolean> {
  const r = await db()
    .prepare("UPDATE reviews SET status = ?2, decided_at = CASE WHEN ?2 = 'pending' THEN NULL ELSE datetime('now') END WHERE id = ?1")
    .bind(id, status)
    .run();
  return (r.meta?.changes ?? 0) > 0;
}
