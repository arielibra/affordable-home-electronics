import { createFileRoute } from "@tanstack/react-router";

import { finalizePaypalOrder } from "../../lib/paypal-order.server";
import { verifyPaypalWebhook } from "../../lib/paypal.server";

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
        const orderId =
          event.resource?.supplementary_data?.related_ids?.order_id ??
          (event.event_type === "CHECKOUT.ORDER.APPROVED" ? event.resource?.id : undefined);
        if (!orderId) return new Response("no order id", { status: 200 });

        try {
          await finalizePaypalOrder(orderId);
        } catch (error) {
          console.error("paypal webhook finalise failed", error);
          return new Response("retry", { status: 500 });
        }
        return new Response("ok", { status: 200 });
      },
    },
  },
});
