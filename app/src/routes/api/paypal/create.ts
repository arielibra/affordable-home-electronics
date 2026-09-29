import { createFileRoute } from "@tanstack/react-router";

import { undeliverableReason } from "../../../lib/address";
import { bindings } from "../../../lib/bindings.server";
import { parkPaypalOrder, type PaypalAddress } from "../../../lib/paypal-order.server";
import { paypalEnabled, paypalFetch, usd } from "../../../lib/paypal.server";
import { cartLines, unavailableInCart } from "../../../lib/store.server";
import { FREE_SHIPPING_THRESHOLD_CENTS, SHIPPING_FLAT_CENTS, calculateTax } from "../../../lib/stripe.server";

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export const Route = createFileRoute("/api/paypal/create")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!paypalEnabled()) {
          return Response.json({ ok: false, error: "PayPal is not switched on yet." }, { status: 503 });
        }

        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ ok: false, error: "Bad request." }, { status: 400 });
        }

        const cartId = str(body.cartId, 64);
        if (cartId.length < 8) return Response.json({ ok: false, error: "Bad request." }, { status: 400 });

        const who: PaypalAddress = {
          name: str(body.name, 120),
          email: str(body.email, 160),
          phone: str(body.phone, 40),
          company: str(body.company, 120),
          address1: str(body.address1, 160),
          address2: str(body.address2, 160),
          city: str(body.city, 80),
          state: str(body.state, 40),
          zip: str(body.zip, 16),
          notes: str(body.notes, 900),
        };
        const pickup = body.pickup === true;

        if (!who.name || !who.email || !who.phone) {
          return Response.json({ ok: false, error: "Name, email and phone are all needed." }, { status: 400 });
        }
        if (!pickup && (!who.address1 || !who.city || !who.state || !who.zip)) {
          return Response.json({ ok: false, error: "A full shipping address is needed." }, { status: 400 });
        }
        if (!pickup) {
          const bad = undeliverableReason(who);
          if (bad) return Response.json({ ok: false, error: bad }, { status: 400 });
        }

        const DB = bindings().DB;
        if (!DB) return Response.json({ ok: false, error: "The store is unavailable." }, { status: 503 });

        const lines = await cartLines(cartId);
        if (lines.length === 0) return Response.json({ ok: false, error: "Your cart is empty." }, { status: 400 });

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

        const subtotal = lines.reduce((s, l) => s + l.price_cents * l.qty, 0);
        const shipping = pickup || subtotal >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_FLAT_CENTS;

        // PayPal computes no tax of its own, so ask the same engine Stripe
        // Checkout uses and keep both routes reporting into one place.
        const quote = pickup
          ? await calculateTax(lines, shipping, { line1: "62-65 Saunders Street", city: "Rego Park", state: "NY", zip: "11374" })
          : await calculateTax(lines, shipping, {
              line1: who.address1,
              line2: who.address2 || undefined,
              city: who.city,
              state: who.state,
              zip: who.zip,
            });
        const tax = quote?.taxCents ?? 0;
        const total = subtotal + shipping + tax;

        const shippingBlock = pickup
          ? undefined
          : {
              type: "SHIPPING",
              name: { full_name: who.name },
              address: {
                address_line_1: who.address1,
                address_line_2: who.address2 || undefined,
                admin_area_2: who.city,
                admin_area_1: who.state,
                postal_code: who.zip,
                country_code: "US",
              },
            };

        let created: { id: string };
        try {
          created = await paypalFetch<{ id: string }>("/v2/checkout/orders", {
            method: "POST",
            body: {
              intent: "CAPTURE",
              purchase_units: [
                {
                  custom_id: cartId,
                  description: "Affordable Home Electronics",
                  amount: {
                    currency_code: "USD",
                    value: usd(total),
                    breakdown: {
                      item_total: { currency_code: "USD", value: usd(subtotal) },
                      shipping: { currency_code: "USD", value: usd(shipping) },
                      tax_total: { currency_code: "USD", value: usd(tax) },
                    },
                  },
                  items: lines.map((l) => ({
                    name: l.name.slice(0, 127),
                    sku: l.slug.slice(0, 127),
                    quantity: String(l.qty),
                    unit_amount: { currency_code: "USD", value: usd(l.price_cents) },
                  })),
                  shipping: shippingBlock,
                },
              ],
              payment_source: {
                paypal: {
                  experience_context: {
                    brand_name: "Affordable Home Electronics",
                    user_action: "PAY_NOW",
                    shipping_preference: pickup ? "NO_SHIPPING" : "SET_PROVIDED_ADDRESS",
                  },
                },
              },
            },
          });
        } catch (error) {
          console.error("paypal create order failed", error);
          const message = error instanceof Error ? error.message : "PayPal could not start the order.";
          return Response.json({ ok: false, error: message }, { status: 502 });
        }

        await parkPaypalOrder({
          paypalOrderId: created.id,
          cartId,
          who,
          subtotalCents: subtotal,
          shippingCents: shipping,
          taxCents: tax,
          totalCents: total,
          taxCalculationId: quote?.calculationId ?? null,
        });
        await DB.prepare("INSERT OR REPLACE INTO paypal_carts (paypal_order_id, cart_id) VALUES (?1,?2)")
          .bind(created.id, cartId)
          .run();

        return Response.json({
          ok: true,
          id: created.id,
          subtotalCents: subtotal,
          shippingCents: shipping,
          taxCents: tax,
          totalCents: total,
          taxed: quote !== null,
        });
      },
    },
  },
});
