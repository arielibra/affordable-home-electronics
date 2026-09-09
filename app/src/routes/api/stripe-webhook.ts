import { createFileRoute } from "@tanstack/react-router";

import { bindings } from "../../lib/bindings.server";
import { cartLines, clearCart, decrementStock } from "../../lib/store.server";
import { verifyStripeSignature, webhookSecret } from "../../lib/stripe.server";

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

        await DB.prepare(
          `UPDATE orders SET name=?2, email=?3, phone=?4, address1=?5, address2=?6, city=?7, state=?8, zip=?9,
             amount_total_cents=?10, shipping_cents=?11, tax_cents=?12, subtotal_cents=?13,
             stripe_payment_intent=?14, status='paid', paid_at=datetime('now') WHERE id=?1`,
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
          )
          .run();

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

        return new Response("ok", { status: 200 });
      },
    },
  },
});
