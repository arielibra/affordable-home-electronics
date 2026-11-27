import { createFileRoute } from "@tanstack/react-router";

import { bindings } from "../../lib/bindings.server";
import { cartLines, unavailableInCart } from "../../lib/store.server";
import { stripePost } from "../../lib/stripe.server";
import { liveRatesEnabled, shippingQuote } from "../../lib/rates.server";
import { cleanHeardAbout } from "../../lib/heard-about";

type Session = { id: string; url: string };

export const Route = createFileRoute("/api/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: { cartId?: unknown; notes?: unknown; zip?: unknown; country?: unknown; heardAbout?: unknown; heardAboutOther?: unknown };
        try {
          payload = (await request.json()) as typeof payload;
        } catch {
          return Response.json({ ok: false, error: "Bad request." }, { status: 400 });
        }

        const cartId = typeof payload.cartId === "string" ? payload.cartId : "";
        const notes = typeof payload.notes === "string" ? payload.notes.slice(0, 900) : "";
        // Where it's going, so the shipping price can be quoted before Stripe's
        // page opens. Stripe then collects the full address; the webhook holds
        // the order if it lands in a different ZIP than the one quoted.
        const shipZip = typeof payload.zip === "string" ? payload.zip.trim().slice(0, 10) : "";
        const shipCountry = payload.country === "CA" ? "CA" : "US";
        // "How did you hear about us?", answered (optionally) before paying.
        const heard = cleanHeardAbout(payload.heardAbout, payload.heardAboutOther);
        if (cartId.length < 8 || cartId.length > 64) {
          return Response.json({ ok: false, error: "Bad request." }, { status: 400 });
        }

        const DB = bindings().DB;
        if (!DB) return Response.json({ ok: false, error: "The store is unavailable." }, { status: 503 });

        const lines = await cartLines(cartId);
        if (lines.length === 0) {
          return Response.json({ ok: false, error: "Your cart is empty." }, { status: 400 });
        }

        const gone = await unavailableInCart(cartId);
        if (gone.length > 0) {
          return Response.json(
            {
              ok: false,
              error:
                gone.length === 1
                  ? `${gone[0]} sold out while it was in your cart. Remove it and try again, or call the shop.`
                  : `${gone.length} items in your cart are no longer available. Please review the cart.`,
            },
            { status: 409 },
          );
        }

        const origin = new URL(request.url).origin;
        const subtotal = lines.reduce((s, l) => s + l.price_cents * l.qty, 0);
        const quote = await shippingQuote(lines, { zip: shipZip, country: shipCountry });
        if (liveRatesEnabled() && !shipZip) {
          return Response.json({ ok: false, error: "Enter the ZIP code it's shipping to." }, { status: 400 });
        }

        const fields: Record<string, string> = {
          mode: "payment",
          "automatic_tax[enabled]": "true",
          "phone_number_collection[enabled]": "true",
          // Required so every card and Apple Pay payment carries a name and billing
          // address: Radar blocks far more payments that arrive without them.
          billing_address_collection: "required",
          "shipping_address_collection[allowed_countries][0]": quote.source === "live" ? shipCountry : "US",
          ...(quote.source === "live" ? {} : { "shipping_address_collection[allowed_countries][1]": "CA" }),
          success_url: `${origin}/order-confirmed?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/cart`,
          "metadata[cart_id]": cartId,
          "metadata[notes]": notes,
          "metadata[ship_zip]": quote.source === "live" ? shipZip : "",
          "metadata[ship_source]": quote.source,
        };

        lines.forEach((l, i) => {
          fields[`line_items[${i}][quantity]`] = String(l.qty);
          fields[`line_items[${i}][price_data][currency]`] = "usd";
          fields[`line_items[${i}][price_data][unit_amount]`] = String(l.price_cents);
          fields[`line_items[${i}][price_data][tax_behavior]`] = "exclusive";
          fields[`line_items[${i}][price_data][product_data][name]`] = l.name.slice(0, 250);
          fields[`line_items[${i}][price_data][product_data][images][0]`] = `${origin}${l.image}`;
          fields[`line_items[${i}][price_data][product_data][metadata][slug]`] = l.slug;
        });

        // Shipping choices the customer picks between on Stripe's page.
        const ship = (idx: number, cents: number, label: string, minDays: number, maxDays: number) => {
          const p = `shipping_options[${idx}][shipping_rate_data]`;
          fields[`${p}[type]`] = "fixed_amount";
          fields[`${p}[fixed_amount][amount]`] = String(cents);
          fields[`${p}[fixed_amount][currency]`] = "usd";
          fields[`${p}[display_name]`] = label;
          fields[`${p}[tax_behavior]`] = "exclusive";
          fields[`${p}[delivery_estimate][minimum][unit]`] = "business_day";
          fields[`${p}[delivery_estimate][minimum][value]`] = String(minDays);
          fields[`${p}[delivery_estimate][maximum][unit]`] = "business_day";
          fields[`${p}[delivery_estimate][maximum][value]`] = String(maxDays);
        };
        ship(0, quote.cents, quote.label, quote.minDays, quote.maxDays);

        let session: Session;
        try {
          session = await stripePost<Session>("/checkout/sessions", fields);
        } catch (error) {
          console.error("stripe checkout session failed", error);
          const message = error instanceof Error ? error.message : "Payment could not be started.";
          return Response.json({ ok: false, error: message }, { status: 502 });
        }

        // Park a pending order now so nothing is lost if the webhook is slow.
        await DB.prepare(
          "INSERT INTO orders (id,reference,name,email,phone,notes,subtotal_cents,status,stripe_session_id,heard_about,heard_about_other) VALUES (?1,?2,'','','',?3,?4,'pending_payment',?5,?6,?7)",
        )
          .bind(crypto.randomUUID(), referenceFor(), notes, subtotal, session.id, heard.id, heard.other)
          .run();

        return Response.json({ ok: true, url: session.url });
      },
    },
  },
});

function referenceFor(): string {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  return "AHE-" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}
