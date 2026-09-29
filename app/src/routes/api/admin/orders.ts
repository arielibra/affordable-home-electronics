import { createFileRoute } from "@tanstack/react-router";

import { denied, isSignedIn, logAdmin } from "../../../lib/admin.server";
import { bindings } from "../../../lib/bindings.server";
import { CARRIERS, MANUAL_STATES, type OrderState } from "../../../lib/orders";

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
  provider: string;
  carrier: string;
  tracking_number: string;
  hold_reason: string;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
};

const COLUMNS = `id,reference,name,email,phone,address1,address2,city,state,zip,notes,
  subtotal_cents,shipping_cents,tax_cents,amount_total_cents,status,provider,
  carrier,tracking_number,hold_reason,created_at,paid_at,shipped_at`;

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export const Route = createFileRoute("/api/admin/orders")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!(await isSignedIn(request))) return denied();
        const DB = bindings().DB;
        if (!DB) return Response.json({ ok: false, error: "No database." }, { status: 503 });

        const url = new URL(request.url);
        const status = url.searchParams.get("status") ?? "";
        const year = (url.searchParams.get("year") ?? "").replace(/[^0-9]/g, "").slice(0, 4);

        const where: string[] = [];
        const binds: unknown[] = [];
        if (status && status !== "all") {
          binds.push(status);
          where.push(`status = ?${binds.length}`);
        }
        if (year) {
          binds.push(year);
          where.push(`strftime('%Y', created_at) = ?${binds.length}`);
        }
        const clause = where.length ? ` WHERE ${where.join(" AND ")}` : "";

        const orders = await DB.prepare(
          `SELECT ${COLUMNS} FROM orders${clause} ORDER BY created_at DESC LIMIT 300`,
        )
          .bind(...binds)
          .all<Order>();

        const rows = orders.results ?? [];
        const ids = rows.map((o) => o.id);

        let byOrder: Record<string, { name: string; qty: number; price_cents: number }[]> = {};
        if (ids.length > 0) {
          const placeholders = ids.map((_, i) => `?${i + 1}`).join(",");
          const items = await DB.prepare(
            `SELECT order_id, name, qty, price_cents FROM order_items WHERE order_id IN (${placeholders})`,
          )
            .bind(...ids)
            .all<{ order_id: string; name: string; qty: number; price_cents: number }>();
          byOrder = {};
          for (const it of items.results ?? []) {
            (byOrder[it.order_id] ??= []).push({ name: it.name, qty: it.qty, price_cents: it.price_cents });
          }
        }

        // What each tab should show as its count, in one round trip.
        const counts = await DB.prepare(
          "SELECT status, COUNT(*) AS n FROM orders GROUP BY status",
        ).all<{ status: string; n: number }>();
        const years = await DB.prepare(
          "SELECT DISTINCT strftime('%Y', created_at) AS y FROM orders ORDER BY y DESC",
        ).all<{ y: string }>();

        return Response.json(
          {
            ok: true,
            orders: rows.map((o) => ({ ...o, items: byOrder[o.id] ?? [] })),
            counts: Object.fromEntries((counts.results ?? []).map((c) => [c.status, c.n])),
            years: (years.results ?? []).map((r) => r.y).filter(Boolean),
          },
          { headers: { "Cache-Control": "no-store" } },
        );
      },

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

        const reference = str(body.reference, 40);
        if (!reference) return Response.json({ ok: false, error: "Bad request." }, { status: 400 });

        const existing = await DB.prepare("SELECT id, status FROM orders WHERE reference = ?1")
          .bind(reference)
          .first<{ id: string; status: string }>();
        if (!existing) return Response.json({ ok: false, error: "No such order." }, { status: 404 });

        const sets: string[] = [];
        const binds: unknown[] = [];
        const note: string[] = [];
        const put = (col: string, val: unknown) => {
          binds.push(val);
          sets.push(`${col} = ?${binds.length + 1}`);
          note.push(`${col}=${String(val)}`);
        };

        if ("carrier" in body) {
          const v = str(body.carrier, 20);
          if (v && !CARRIERS.some((c) => c.id === v)) {
            return Response.json({ ok: false, error: "Unknown carrier." }, { status: 400 });
          }
          put("carrier", v);
        }
        if ("tracking_number" in body) put("tracking_number", str(body.tracking_number, 80));
        if ("hold_reason" in body) put("hold_reason", str(body.hold_reason, 300));

        if ("status" in body) {
          const next = str(body.status, 30) as OrderState;
          if (!MANUAL_STATES.includes(next)) {
            return Response.json({ ok: false, error: "That is not a state you can set by hand." }, { status: 400 });
          }
          // Shipping without a tracking number is how parcels get lost and
          // customers get told "it's on its way" with nothing to show them.
          if (next === "shipped") {
            const tracking = "tracking_number" in body ? str(body.tracking_number, 80) : "";
            if (!tracking) {
              const current = await DB.prepare("SELECT tracking_number FROM orders WHERE id = ?1")
                .bind(existing.id)
                .first<{ tracking_number: string }>();
              if (!current?.tracking_number) {
                return Response.json(
                  { ok: false, error: "Add a tracking number before marking this shipped." },
                  { status: 400 },
                );
              }
            }
            put("shipped_at", new Date().toISOString().slice(0, 19).replace("T", " "));
          }
          put("status", next);
        }

        if (sets.length === 0) return Response.json({ ok: false, error: "Nothing to change." }, { status: 400 });

        await DB.prepare(`UPDATE orders SET ${sets.join(", ")} WHERE id = ?1`)
          .bind(existing.id, ...binds)
          .run();
        await logAdmin("order_update", reference, note.join(" "));

        const row = await DB.prepare(`SELECT ${COLUMNS} FROM orders WHERE id = ?1`).bind(existing.id).first<Order>();
        return Response.json({ ok: true, order: row });
      },
    },
  },
});
