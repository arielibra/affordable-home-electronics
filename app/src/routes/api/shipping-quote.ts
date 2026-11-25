import { createFileRoute } from "@tanstack/react-router";

import { cartLines } from "../../lib/store.server";
import { shippingQuote } from "../../lib/rates.server";

/** The checkout page asks this for the shipping price once it has a ZIP code.
 *  The same function prices the real order server-side, so what the customer
 *  is shown here is what Stripe or PayPal will charge. */
export const Route = createFileRoute("/api/shipping-quote")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ ok: false, error: "Bad request." }, { status: 400 });
        }
        const s = (k: string, n: number) => (typeof body[k] === "string" ? (body[k] as string).trim().slice(0, n) : "");
        const cartId = s("cartId", 64);
        if (cartId.length < 8) return Response.json({ ok: false, error: "Bad request." }, { status: 400 });
        const lines = await cartLines(cartId);
        if (lines.length === 0) return Response.json({ ok: false, error: "Your cart is empty." }, { status: 400 });
        const quote = await shippingQuote(lines, {
          zip: s("zip", 10),
          country: s("country", 2) === "CA" ? "CA" : "US",
          state: s("state", 40) || undefined,
          city: s("city", 80) || undefined,
        });
        return Response.json({ ok: true, quote }, { headers: { "Cache-Control": "no-store" } });
      },
    },
  },
});
