import { createFileRoute } from "@tanstack/react-router";
import { bindings } from "../../../lib/bindings.server";
import { denied, isSignedIn } from "../../../lib/admin.server";

type Order = {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
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

export const Route = createFileRoute("/api/admin/orders")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!(await isSignedIn(request))) return denied();
        const DB = bindings().DB;
        if (!DB) return Response.json({ ok: false, error: "No database." }, { status: 503 });

        const orders = await DB.prepare(
          `SELECT id,reference,name,email,phone,address1,address2,city,state,zip,notes,
                  subtotal_cents,shipping_cents,tax_cents,amount_total_cents,status,created_at,paid_at
             FROM orders ORDER BY created_at DESC LIMIT 200`,
        ).all<Order>();

        const items = await DB.prepare(
          `SELECT order_id, name, qty, price_cents FROM order_items
            WHERE order_id IN (SELECT id FROM orders ORDER BY created_at DESC LIMIT 200)`,
        ).all<{ order_id: string; name: string; qty: number; price_cents: number }>();

        const byOrder: Record<string, { name: string; qty: number; price_cents: number }[]> = {};
        for (const it of items.results ?? []) {
          (byOrder[it.order_id] ??= []).push({ name: it.name, qty: it.qty, price_cents: it.price_cents });
        }

        return Response.json(
          { ok: true, orders: (orders.results ?? []).map((o) => ({ ...o, items: byOrder[o.id] ?? [] })) },
          { headers: { "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
