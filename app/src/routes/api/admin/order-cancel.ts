import { createFileRoute } from "@tanstack/react-router";

import { denied, isSignedIn, logAdmin } from "../../../lib/admin.server";
import { bindings } from "../../../lib/bindings.server";
import { cancellationMessage, deliverableAddress, sendMail } from "../../../lib/email.server";
import { channelName, shopMayEmailBuyer } from "../../../lib/orders";

type Row = {
  id: string;
  reference: string;
  name: string;
  email: string;
  status: string;
  channel: string;
  amount_total_cents: number | null;
};

/**
 * Cancel an order and tell the customer why.
 *
 * The reason is required: it is the whole point of the email, and an empty one
 * would send a customer "your order was cancelled" with nothing after it.
 *
 * This moves no money and touches no stock. A refund is done in Stripe or
 * PayPal, which is where the payment actually lives; the admin says so next to
 * the button. The order is kept (status "cancelled"), never deleted, so the
 * books still show what happened.
 *
 * Amazon and Walmart orders are cancelled here without an email: those
 * marketplaces forbid contacting buyers outside their own messaging.
 */
export const Route = createFileRoute("/api/admin/order-cancel")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!(await isSignedIn(request))) return denied();
        const DB = bindings().DB;
        if (!DB) return Response.json({ ok: false, error: "No database." }, { status: 503 });

        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ ok: false, error: "Bad request." }, { status: 400 });
        }

        const reference = typeof body.reference === "string" ? body.reference.trim().slice(0, 60) : "";
        const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 2000) : "";
        const mentionRefund = body.mention_refund === true;
        if (!reference) return Response.json({ ok: false, error: "Bad request." }, { status: 400 });
        if (reason.length < 3) {
          return Response.json(
            { ok: false, error: "Write the reason for cancelling. It goes in the email to the customer." },
            { status: 400 },
          );
        }

        const order = await DB.prepare(
          "SELECT id,reference,name,email,status,channel,amount_total_cents FROM orders WHERE reference = ?1",
        )
          .bind(reference)
          .first<Row>();
        if (!order) return Response.json({ ok: false, error: "No such order." }, { status: 404 });
        if (order.status === "cancelled") {
          return Response.json({ ok: false, error: "This order is already cancelled." }, { status: 409 });
        }

        await DB.prepare(
          "UPDATE orders SET status = 'cancelled', cancel_reason = ?2, cancelled_at = datetime('now'), cancel_notified_at = NULL WHERE id = ?1",
        )
          .bind(order.id, reason)
          .run();
        await logAdmin("order_cancel", reference, `${order.status} -> cancelled | ${reason}`);

        // The order is cancelled whatever happens below; a failed email is
        // reported back, never a reason to undo the cancellation.
        let notified: { ok: boolean; error: string; expected: boolean };
        if (!shopMayEmailBuyer(order.channel)) {
          notified = {
            ok: false,
            expected: true,
            error: `${channelName(order.channel)} does not allow contacting buyers directly, so nothing was emailed. Cancel it on ${channelName(order.channel)} too.`,
          };
        } else if (!deliverableAddress(order.email)) {
          notified = { ok: false, expected: true, error: "No email address on this order, so the customer was not emailed." };
        } else {
          const items = await DB.prepare("SELECT name, qty FROM order_items WHERE order_id = ?1")
            .bind(order.id)
            .all<{ name: string; qty: number }>();
          const sent = await sendMail(order.reference, "cancelled", {
            to: order.email,
            ...cancellationMessage(order, items.results ?? [], reason, mentionRefund),
          });
          notified = { ...sent, expected: false };
          if (sent.ok) {
            await DB.prepare("UPDATE orders SET cancel_notified_at = datetime('now') WHERE id = ?1").bind(order.id).run();
          }
        }

        return Response.json({ ok: true, notified, emailedTo: notified.ok ? order.email : "" });
      },
    },
  },
});
