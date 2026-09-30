import { createFileRoute } from "@tanstack/react-router";

import { denied, isSignedIn, logAdmin } from "../../../lib/admin.server";
import { bindings } from "../../../lib/bindings.server";
import { CARRIERS, CHANNELS, MANUAL_STATES, type OrderState } from "../../../lib/orders";

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
  channel: string;
  channel_ref: string;
};

const COLUMNS = `id,reference,name,email,phone,address1,address2,city,state,zip,notes,
  subtotal_cents,shipping_cents,tax_cents,amount_total_cents,status,provider,
  carrier,tracking_number,hold_reason,created_at,paid_at,shipped_at,channel,channel_ref`;

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
        const channel = url.searchParams.get("channel") ?? "";
        if (channel && channel !== "all") {
          binds.push(channel);
          where.push(`channel = ?${binds.length}`);
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
        const chan = await DB.prepare(
          "SELECT channel, COUNT(*) AS n FROM orders GROUP BY channel",
        ).all<{ channel: string; n: number }>();

        return Response.json(
          {
            ok: true,
            orders: rows.map((o) => ({ ...o, items: byOrder[o.id] ?? [] })),
            counts: Object.fromEntries((counts.results ?? []).map((c) => [c.status, c.n])),
            years: (years.results ?? []).map((r) => r.y).filter(Boolean),
            channels: Object.fromEntries((chan.results ?? []).map((c) => [c.channel, c.n])),
          },
          { headers: { "Cache-Control": "no-store" } },
        );
      },

      /**
       * Record an order that did not come through this site.
       *
       * His dad also sells on Amazon and eBay and wants one place to look, so
       * these are typed in by hand and then travel through exactly the same
       * Paid -> Ready to ship -> Shipped workflow as everything else.
       *
       * Two things this deliberately does not do. It does not touch stock:
       * marketplace listings are managed on the marketplace, and a late entry
       * silently changing what this site has on the shelf would be worse than
       * no link at all. And it records no sales tax, because Amazon, eBay,
       * Walmart and Etsy collect and remit it themselves \u2014 putting it here
       * would mean New York is paid twice for the same sale.
       */
      PUT: async ({ request }) => {
        if (!(await isSignedIn(request))) return denied();
        const DB = bindings().DB;
        if (!DB) return Response.json({ ok: false, error: "No database." }, { status: 503 });

        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ ok: false, error: "Bad request." }, { status: 400 });
        }

        const channel = str(body.channel, 20);
        const chan = CHANNELS.find((c) => c.id === channel);
        if (!chan || channel === "site") {
          return Response.json({ ok: false, error: "Pick where the order came from." }, { status: 400 });
        }

        const channelRef = str(body.channel_ref, 80);
        if (!channelRef) {
          return Response.json(
            { ok: false, error: `Put in the ${chan.name} order number, so this can be matched back later.` },
            { status: 400 },
          );
        }

        // Entering the same order twice is the easy mistake here, and it would
        // quietly inflate the year's takings with a sale that never happened.
        const dupe = await DB.prepare(
          "SELECT reference FROM orders WHERE channel = ?1 AND channel_ref = ?2",
        )
          .bind(channel, channelRef)
          .first<{ reference: string }>();
        if (dupe) {
          return Response.json(
            { ok: false, error: `That ${chan.name} order is already in here as ${dupe.reference}.` },
            { status: 409 },
          );
        }

        // Items. Either picked from the catalogue or typed in free-hand; both
        // end up as the same order_items rows, so the rest of the back office
        // cannot tell the difference.
        const rawItems = Array.isArray(body.items) ? body.items : [];
        const items: { slug: string; name: string; qty: number; price: number }[] = [];
        for (const raw of rawItems) {
          if (!raw || typeof raw !== "object") continue;
          const r = raw as Record<string, unknown>;
          const name = str(r.name, 200);
          const qty = Math.trunc(Number(r.qty));
          const price = Math.trunc(Number(r.price_cents));
          if (!name) continue;
          if (!Number.isFinite(qty) || qty < 1 || qty > 9999) {
            return Response.json({ ok: false, error: `Check the quantity on "${name}".` }, { status: 400 });
          }
          if (!Number.isFinite(price) || price < 0 || price > 99_999_999) {
            return Response.json({ ok: false, error: `Check the price on "${name}".` }, { status: 400 });
          }
          items.push({ slug: str(r.product_slug, 200), name, qty, price });
        }
        if (items.length === 0) {
          return Response.json({ ok: false, error: "Add at least one item." }, { status: 400 });
        }

        const shipping = Math.trunc(Number(body.shipping_cents ?? 0));
        if (!Number.isFinite(shipping) || shipping < 0 || shipping > 99_999_999) {
          return Response.json({ ok: false, error: "Check the shipping amount." }, { status: 400 });
        }

        const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
        const total = subtotal + shipping;

        // The date the money landed. Drives the year report, so it is the sale
        // date on the marketplace, not the day he got round to typing it in.
        const day = str(body.paid_on, 10);
        const paidOn = /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : new Date().toISOString().slice(0, 10);
        const paidAt = `${paidOn} 12:00:00`;

        const status = str(body.status, 30) || "paid";
        if (!MANUAL_STATES.includes(status as OrderState)) {
          return Response.json({ ok: false, error: "That is not a state you can set by hand." }, { status: 400 });
        }

        const carrier = str(body.carrier, 20);
        if (carrier && !CARRIERS.some((c) => c.id === carrier)) {
          return Response.json({ ok: false, error: "Unknown carrier." }, { status: 400 });
        }
        const tracking = str(body.tracking_number, 80);
        if (status === "shipped" && !tracking) {
          return Response.json(
            { ok: false, error: "Add a tracking number before marking this shipped." },
            { status: 400 },
          );
        }

        const id = crypto.randomUUID();
        const bytes = crypto.getRandomValues(new Uint8Array(3));
        const reference = "AHE-" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();

        await DB.prepare(
          `INSERT INTO orders
             (id,reference,name,email,phone,company,address1,address2,city,state,zip,notes,
              subtotal_cents,shipping_cents,tax_cents,amount_total_cents,
              status,provider,channel,channel_ref,carrier,tracking_number,paid_at,shipped_at)
           VALUES (?1,?2,?3,?4,?5,'',?6,?7,?8,?9,?10,?11,?12,?13,0,?14,?15,'manual',?16,?17,?18,?19,?20,?21)`,
        )
          .bind(
            id,
            reference,
            str(body.name, 120),
            str(body.email, 160),
            str(body.phone, 40),
            str(body.address1, 200),
            str(body.address2, 200),
            str(body.city, 120),
            str(body.state, 40),
            str(body.zip, 20),
            str(body.notes, 1000),
            subtotal,
            shipping,
            total,
            status,
            channel,
            channelRef,
            carrier,
            tracking,
            paidAt,
            status === "shipped" ? paidAt : null,
          )
          .run();

        for (const it of items) {
          await DB.prepare(
            "INSERT INTO order_items (order_id,product_slug,name,qty,price_cents) VALUES (?1,?2,?3,?4,?5)",
          )
            .bind(id, it.slug, it.name, it.qty, it.price)
            .run();
        }

        await logAdmin("order_manual_add", reference, `${channel} ${channelRef} ${total}`);

        const row = await DB.prepare(`SELECT ${COLUMNS} FROM orders WHERE id = ?1`).bind(id).first<Order>();
        return Response.json({ ok: true, order: row });
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
