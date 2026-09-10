import { createFileRoute } from "@tanstack/react-router";

import { finalizePaypalOrder } from "../../../lib/paypal-order.server";
import { paypalEnabled, paypalFetch } from "../../../lib/paypal.server";

type Capture = { id: string; status: string };

export const Route = createFileRoute("/api/paypal/capture")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!paypalEnabled()) {
          return Response.json({ ok: false, error: "PayPal is not switched on yet." }, { status: 503 });
        }

        let body: { orderId?: unknown };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return Response.json({ ok: false, error: "Bad request." }, { status: 400 });
        }
        const orderId = typeof body.orderId === "string" ? body.orderId.slice(0, 64) : "";
        if (!/^[A-Z0-9]{6,40}$/i.test(orderId)) {
          return Response.json({ ok: false, error: "Bad request." }, { status: 400 });
        }

        let capture: Capture;
        try {
          capture = await paypalFetch<Capture>(`/v2/checkout/orders/${orderId}/capture`, {
            method: "POST",
            body: {},
            // Same order id, same request id: a double-click cannot double-charge.
            requestId: `capture-${orderId}`,
          });
        } catch (error) {
          console.error("paypal capture failed", error);
          const message = error instanceof Error ? error.message : "PayPal could not take the payment.";
          return Response.json({ ok: false, error: message }, { status: 502 });
        }

        if (capture.status !== "COMPLETED") {
          return Response.json(
            { ok: false, error: "PayPal did not complete the payment. Nothing has been charged." },
            { status: 402 },
          );
        }

        const done = await finalizePaypalOrder(orderId);
        if (!done) {
          // The money is taken but the order row is missing, which should be
          // impossible. Tell the customer the truth and leave a loud log.
          console.error("paypal capture completed with no parked order", orderId);
          return Response.json(
            { ok: false, error: "The payment went through but the order did not save. Please call the shop." },
            { status: 500 },
          );
        }

        return Response.json({ ok: true, reference: done.reference });
      },
    },
  },
});
