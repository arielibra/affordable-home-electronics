import { createFileRoute } from "@tanstack/react-router";

import { undeliverableReason } from "../../lib/address";
import { bindings } from "../../lib/bindings.server";
import { cartLines, clearCart, decrementStock } from "../../lib/store.server";
import { verifyStripeSignature, webhookSecret } from "../../lib/stripe.server";
import {
  type ConfirmationOrder,
  deliverableAddress,
  type NewOrder,
  newOrderMessage,
  orderConfirmationMessage,
  ownerAddress,
  sendMail,
} from "../../lib/email.server";

type SessionEvent = {
  type: string;
  data: {
    object: {
      id: string;
      payment_intent?: string | null;
      amount_total?: number | null;
      amount_subtotal?: number | null;
      total_details?: { amount_shipping?: number | null; amount_tax?: number | null } | null;
      customer_details?: {
        name?: string | null;
        email?: string | null;
        phone?: string | null;
        address?: Record<string, string | null> | null;
      } | null;
      shipping_details?: { name?: string | null; address?: Record<string, string | null> | null } | null;
      metadata?: Record<string, string> | null;
    };
  };
};

export const Route = createFileRoute("/api/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();

        let ok = false;
        try {
          ok = await verifyStripeSignature(raw, request.headers.get("stripe-signature"), webhookSecret());
        } catch (error) {
          console.error("webhook secret missing", error);
          return new Response("not configured", { status: 500 });
        }
        if (!ok) return new Response("bad signature", { status: 400 });

        let event: SessionEvent;
        try {
          event = JSON.parse(raw) as SessionEvent;
        } catch {
          return new Response("bad payload", { status: 400 });
        }

        if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded") {
          return new Response("ignored", { status: 200 });
        }

        const DB = bindings().DB;
        if (!DB) return new Response("no database", { status: 503 });

        const s = event.data.object;
        const addr = s.shipping_details?.address ?? s.customer_details?.address ?? {};
        const cartId = s.metadata?.cart_id ?? "";

        const existing = await DB.prepare("SELECT id, status FROM orders WHERE stripe_session_id = ?1")
          .bind(s.id)
          .first<{ id: string; status: string }>();
        if (existing?.status === "paid") return new Response("already handled", { status: 200 });

        const orderId = existing?.id ?? crypto.randomUUID();
        if (!existing) {
          await DB.prepare("INSERT INTO orders (id,reference,name,email,stripe_session_id) VALUES (?1,?2,'','',?3)")
            .bind(orderId, "AHE-" + s.id.slice(-6).toUpperCase(), s.id)
            .run();
        }

        // Stripe collects the shipping address on its own page, so a PO box or
        // an APO cannot be refused before the card is charged the way it is on
        // our own form. The money is taken and the parcel is undeliverable.
        //
        // So the order is still recorded as paid — it is paid — but it lands in
        // On hold with the reason spelled out, instead of sitting in the Paid
        // queue looking ready to pack. The shop finds out when the order
        // arrives rather than at the counter with a label half printed.
        const undeliverable = undeliverableReason({
          address1: addr.line1 ?? "",
          address2: addr.line2 ?? "",
          city: addr.city ?? "",
          state: addr.state ?? "",
        });
        const status = undeliverable ? "on_hold" : "paid";
        const hold = undeliverable
          ? "Customer gave an address UPS cannot deliver to. Call them for a street address before shipping."
          : "";

        await DB.prepare(
          `UPDATE orders SET name=?2, email=?3, phone=?4, address1=?5, address2=?6, city=?7, state=?8, zip=?9,
             amount_total_cents=?10, shipping_cents=?11, tax_cents=?12, subtotal_cents=?13,
             stripe_payment_intent=?14, status=?15, hold_reason=?16, paid_at=datetime('now') WHERE id=?1`,
        )
          .bind(
            orderId,
            s.shipping_details?.name ?? s.customer_details?.name ?? "",
            s.customer_details?.email ?? "",
            s.customer_details?.phone ?? "",
            addr.line1 ?? "",
            addr.line2 ?? "",
            addr.city ?? "",
            addr.state ?? "",
            addr.postal_code ?? "",
            s.amount_total ?? 0,
            s.total_details?.amount_shipping ?? 0,
            s.total_details?.amount_tax ?? 0,
            s.amount_subtotal ?? 0,
            s.payment_intent ?? "",
            status,
            hold,
          )
          .run();

        /* ---- what was bought, before anyone is told about it ----
         * These two emails list the line items, and the line items do not
         * exist until this block has run. Sending first is how both went out
         * naming no products at all. */
        // Snapshot what was bought, then empty the basket.
        if (cartId) {
          const lines = await cartLines(cartId);
          if (lines.length > 0) {
            const stmt = DB.prepare(
              "INSERT INTO order_items (order_id,product_slug,name,qty,price_cents) VALUES (?1,?2,?3,?4,?5)",
            );
            await DB.batch(lines.map((l) => stmt.bind(orderId, l.slug, l.name, l.qty, l.price_cents)));
            await decrementStock(lines.map((l) => ({ slug: l.slug, qty: l.qty })));
          }
          await clearCart(cartId);
        }

        /* ---- tell the shop a sale has landed ----
         * Until now nothing did, and the only way to find out was to open the
         * back office. Wrapped so a mail provider having a bad afternoon can
         * never make a paid order look unpaid to Stripe: this handler must
         * return 200 or Stripe retries the whole webhook. */
        try {
          const paid = await DB.prepare(
            "SELECT reference,name,email,phone,address1,address2,city,state,zip,subtotal_cents,shipping_cents,tax_cents,amount_total_cents,provider,hold_reason FROM orders WHERE id = ?1",
          )
            .bind(orderId)
            .first<NewOrder>();
          const to = ownerAddress();
          if (paid && to) {
            const lines = await DB.prepare("SELECT name, qty, price_cents FROM order_items WHERE order_id = ?1")
              .bind(orderId)
              .all<{ name: string; qty: number; price_cents: number }>();
            const msg = newOrderMessage(paid, lines.results ?? []);
            await sendMail(paid.reference, "new_order", { to, ...msg });
          }
        } catch {
          // Never the reason a webhook fails.
        }
          // And the buyer. Separate try/catch from the shop's copy: if one
          // address bounces the other must still go.
          try {
            {
              const full = await DB.prepare(
                "SELECT reference,name,email,address1,address2,city,state,zip,subtotal_cents,shipping_cents,tax_cents,amount_total_cents,hold_reason FROM orders WHERE id = ?1",
              )
                .bind(orderId)
                .first<ConfirmationOrder>();
              const detail = await DB.prepare(
                "SELECT name, qty, price_cents FROM order_items WHERE order_id = ?1",
              )
                .bind(orderId)
                .all<{ name: string; qty: number; price_cents: number }>();
              if (full && deliverableAddress(full.email)) {
                await sendMail(full.reference, "confirmation", {
                  to: full.email,
                  ...orderConfirmationMessage(full, detail.results ?? []),
                });
              }
            }
          } catch {
            // Never the reason a payment looks like a failure.
          }


        return new Response("ok", { status: 200 });
      },
    },
  },
});
