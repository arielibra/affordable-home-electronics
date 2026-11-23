import type { D1PreparedStatement } from "@cloudflare/workers-types";
import { createFileRoute } from "@tanstack/react-router";

import { denied, isSignedIn } from "../../../lib/admin.server";
import { bindings } from "../../../lib/bindings.server";
import { paymentsEnabled, stripeGet } from "../../../lib/stripe.server";

/**
 * Checkouts that were started and never paid for.
 *
 * Every checkout parks a `pending_payment` order before sending the customer
 * off to pay, so the unpaid ones are already in the orders table. What they
 * lack depends on how the customer tried to pay:
 *
 * - PayPal: our own form collected name, email and address first, so those are
 *   on the row. The basket comes from the cart the PayPal order points at.
 * - Card (Stripe): the row is empty apart from the cart value. The basket and
 *   anything the customer typed are on Stripe's session, so we ask Stripe —
 *   once, if the session has expired (see migration 0029).
 *
 * Stripe also says whether the session was in fact paid. A "complete" session
 * whose order is still pending means the webhook never arrived: money taken,
 * no order in the back office. That is flagged rather than fixed here, because
 * turning it into an order is the webhook's job and doing it twice is worse.
 */

type Item = { name: string; qty: number; price_cents: number };

type Row = {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  subtotal_cents: number | null;
  amount_total_cents: number | null;
  provider: string;
  created_at: string;
  stripe_session_id: string | null;
  paypal_order_id: string | null;
};

type Snapshot = {
  stripe_status: string;
  name: string;
  email: string;
  phone: string;
  items: string;
};

type StripeSession = {
  status: "open" | "complete" | "expired" | null;
  payment_status: string;
  url: string | null;
  amount_total: number | null;
  customer_details: { email?: string | null; name?: string | null; phone?: string | null } | null;
  line_items?: {
    data: { description: string | null; quantity: number | null; amount_subtotal: number }[];
  };
};

/** Workers on the free plan may make 50 outbound calls per request. Leave room. */
const STRIPE_LOOKUPS_PER_LOAD = 30;

export const Route = createFileRoute("/api/admin/abandoned")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!(await isSignedIn(request))) return denied();
        const DB = bindings().DB;
        if (!DB) return Response.json({ ok: false, error: "No database." }, { status: 503 });

        const url = new URL(request.url);
        const days = Math.min(Math.max(Number(url.searchParams.get("days") ?? "30") || 0, 0), 3650);
        const since =
          days > 0 ? ` AND created_at >= datetime('now', '-${Math.trunc(days)} days')` : "";

        const rows =
          (
            await DB.prepare(
              `SELECT id,reference,name,email,phone,city,state,subtotal_cents,amount_total_cents,provider,created_at,
                 stripe_session_id,paypal_order_id
               FROM orders WHERE status = 'pending_payment'${since}
               ORDER BY created_at DESC LIMIT 200`,
            ).all<Row>()
          ).results ?? [];

        // Saved Stripe answers, in batches (D1 allows at most 100 bound values).
        const snaps: Record<string, Snapshot> = {};
        const ids = rows.map((r) => r.id);
        for (let i = 0; i < ids.length; i += 50) {
          const group = ids.slice(i, i + 50);
          const res = await DB.prepare(
            `SELECT order_id, stripe_status, name, email, phone, items FROM abandoned_snapshot
             WHERE order_id IN (${group.map((_, j) => `?${j + 1}`).join(",")})`,
          )
            .bind(...group)
            .all<Snapshot & { order_id: string }>();
          for (const s of res.results ?? []) snaps[s.order_id] = s;
        }

        // PayPal baskets: order -> cart -> what is in it.
        const paypalItems: Record<string, Item[]> = {};
        const pp = rows.filter((r) => r.provider === "paypal" && r.paypal_order_id);
        for (let i = 0; i < pp.length; i += 50) {
          const group = pp.slice(i, i + 50);
          const res = await DB.prepare(
            `SELECT pc.paypal_order_id AS pid, p.name AS name, ci.qty AS qty, p.price_cents AS price_cents
             FROM paypal_carts pc
             JOIN cart_items ci ON ci.cart_id = pc.cart_id
             JOIN products p ON p.slug = ci.product_slug
             WHERE pc.paypal_order_id IN (${group.map((_, j) => `?${j + 1}`).join(",")})`,
          )
            .bind(...group.map((r) => r.paypal_order_id))
            .all<Item & { pid: string }>();
          const byPid: Record<string, Item[]> = {};
          for (const it of res.results ?? [])
            (byPid[it.pid] ??= []).push({
              name: it.name,
              qty: it.qty,
              price_cents: it.price_cents,
            });
          for (const r of group) paypalItems[r.id] = byPid[r.paypal_order_id ?? ""] ?? [];
        }

        // Fresh Stripe lookups for card checkouts we have no saved answer for.
        const canAskStripe = paymentsEnabled();
        const toAsk = rows
          .filter((r) => r.provider !== "paypal" && r.stripe_session_id && !snaps[r.id])
          .slice(0, canAskStripe ? STRIPE_LOOKUPS_PER_LOAD : 0);
        const live: Record<string, { snap: Snapshot; url: string | null }> = {};
        const saves: D1PreparedStatement[] = [];
        await Promise.all(
          toAsk.map(async (r) => {
            try {
              const s = await stripeGet<StripeSession>(
                `/checkout/sessions/${encodeURIComponent(r.stripe_session_id ?? "")}?expand[]=line_items`,
              );
              const items: Item[] = (s.line_items?.data ?? []).map((l) => ({
                name: l.description ?? "Item",
                qty: l.quantity ?? 1,
                price_cents: l.quantity
                  ? Math.round(l.amount_subtotal / l.quantity)
                  : l.amount_subtotal,
              }));
              const snap: Snapshot = {
                stripe_status: s.status ?? "",
                name: s.customer_details?.name ?? "",
                email: s.customer_details?.email ?? "",
                phone: s.customer_details?.phone ?? "",
                items: JSON.stringify(items),
              };
              live[r.id] = { snap, url: s.status === "open" ? s.url : null };
              if (s.status === "expired") {
                saves.push(
                  DB.prepare(
                    "INSERT OR REPLACE INTO abandoned_snapshot (order_id,stripe_status,name,email,phone,items) VALUES (?1,?2,?3,?4,?5,?6)",
                  ).bind(r.id, snap.stripe_status, snap.name, snap.email, snap.phone, snap.items),
                );
              }
            } catch {
              // Left unknown; the screen says Stripe could not be asked.
            }
          }),
        );
        if (saves.length) await DB.batch(saves).catch(() => undefined);

        const checkouts = rows.map((r) => {
          const snap = live[r.id]?.snap ?? snaps[r.id];
          const items: Item[] =
            r.provider === "paypal"
              ? (paypalItems[r.id] ?? [])
              : snap
                ? (JSON.parse(snap.items || "[]") as Item[])
                : [];
          return {
            reference: r.reference,
            provider: r.provider === "paypal" ? "paypal" : "card",
            created_at: r.created_at,
            name: r.name || snap?.name || "",
            email: r.email || snap?.email || "",
            phone: r.phone || snap?.phone || "",
            place: [r.city, r.state].filter(Boolean).join(", "),
            value_cents: r.subtotal_cents ?? items.reduce((s, i) => s + i.price_cents * i.qty, 0),
            items,
            // "open" = still on the payment page, "expired" = gave up,
            // "complete" = PAID on Stripe but no order arrived, "" = unknown.
            stripe_status: r.provider === "paypal" ? null : (snap?.stripe_status ?? ""),
            resume_url: live[r.id]?.url ?? null,
          };
        });

        return Response.json(
          {
            ok: true,
            checkouts,
            unchecked: rows.filter((r) => r.provider !== "paypal" && !snaps[r.id] && !live[r.id])
              .length,
          },
          { headers: { "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
