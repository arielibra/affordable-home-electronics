import { createFileRoute } from "@tanstack/react-router";

import { finalizePaypalOrder } from "../../lib/paypal-order.server";
import { paypalFetch, verifyPaypalWebhook } from "../../lib/paypal.server";

type Event = {
  event_type?: string;
  resource?: {
    id?: string;
    supplementary_data?: { related_ids?: { order_id?: string } };
  };
};

/**
 * The safety net behind the browser capture. If the buyer approves in PayPal
 * and then closes the tab before the capture call lands, this is what still
 * turns their payment into an order.
 */
export const Route = createFileRoute("/api/paypal-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();

        const ok = await verifyPaypalWebhook(request.headers, raw);
        if (!ok) return new Response("bad signature", { status: 400 });

        let event: Event;
        try {
          event = JSON.parse(raw) as Event;
        } catch {
          return new Response("bad payload", { status: 400 });
        }

        if (event.event_type !== "PAYMENT.CAPTURE.COMPLETED" && event.event_type !== "CHECKOUT.ORDER.APPROVED") {
          return new Response("ignored", { status: 200 });
        }

        // A capture event carries the capture's own id; the order id it belongs
        // to hides in supplementary_data. An approval event is the order itself.
        const approved = event.event_type === "CHECKOUT.ORDER.APPROVED";
        const orderId =
          event.resource?.supplementary_data?.related_ids?.order_id ?? (approved ? event.resource?.id : undefined);
        if (!orderId) return new Response("no order id", { status: 200 });

        try {
          // Approval is not payment. If the buyer approved and then vanished
          // before the browser could capture, the money has NOT been taken, so
          // take it here before writing the order down. The request id makes
          // this the same capture the browser would have made, not a second one.
          if (approved) {
            const capture = await paypalFetch<{ status?: string }>(`/v2/checkout/orders/${orderId}/capture`, {
              method: "POST",
              body: {},
              requestId: `capture-${orderId}`,
            });
            if (capture.status !== "COMPLETED") return new Response("not completed", { status: 200 });
          }
          await finalizePaypalOrder(orderId);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          // Already captured by the browser a moment ago: nothing to retry.
          if (message.includes("ORDER_ALREADY_CAPTURED")) {
            await finalizePaypalOrder(orderId);
            return new Response("ok", { status: 200 });
          }
          console.error("paypal webhook finalise failed", error);
          return new Response("retry", { status: 500 });
        }
        return new Response("ok", { status: 200 });
      },
    },
  },
});
