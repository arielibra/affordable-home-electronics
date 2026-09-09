import { createFileRoute } from "@tanstack/react-router";

import { bindings } from "../../lib/bindings.server";

type Order = {
  id: string;
  reference: string;
  name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
  subtotal_cents: number | null;
  shipping_cents: number | null;
  tax_cents: number | null;
  amount_total_cents: number | null;
  status: string;
  created_at: string;
  paid_at: string | null;
};

/** Normalise what people actually type: "ahe 1a2b3c", "1A2B3C", "AHE-1a2b3c". */
function normalizeReference(input: string): string {
  const bare = input.trim().toUpperCase().replace(/\s+/g, "").replace(/^AHE[-\s]?/, "");
  return `AHE-${bare}`;
}

export const Route = createFileRoute("/api/order-lookup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { reference?: unknown; email?: unknown };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return Response.json({ ok: false, error: "Bad request." }, { status: 400 });
        }

        const reference = typeof body.reference === "string" ? normalizeReference(body.reference.slice(0, 40)) : "";
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 160) : "";
        if (reference.length < 8 || !email.includes("@")) {
          return Response.json({ ok: false, error: "Enter the order number and the email used on the order." }, { status: 400 });
        }

        const DB = bindings().DB;
        if (!DB) return Response.json({ ok: false, error: "Unavailable right now." }, { status: 503 });

        // Both must match. The same message is returned either way so this
        // cannot be used to discover which order numbers exist.
        const order = await DB.prepare(
          `SELECT id,reference,name,address1,address2,city,state,zip,notes,
                  subtotal_cents,shipping_cents,tax_cents,amount_total_cents,status,created_at,paid_at
             FROM orders WHERE reference = ?1 AND lower(email) = ?2`,
        )
          .bind(reference, email)
          .first<Order>();

        if (!order) {
          await new Promise((r) => setTimeout(r, 600));
          return Response.json(
            { ok: false, error: "No order matches that number and email. Check both, or call the shop." },
            { status: 404 },
          );
        }

        const items = await DB.prepare(
          "SELECT name, qty, price_cents FROM order_items WHERE order_id = ?1",
        )
          .bind(order.id)
          .all<{ name: string; qty: number; price_cents: number }>();

        const { id: _id, ...safe } = order;
        return Response.json(
          { ok: true, order: { ...safe, items: items.results ?? [] } },
          { headers: { "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
