import { createFileRoute } from "@tanstack/react-router";

import { denied, isSignedIn, logAdmin } from "../../../lib/admin.server";
import { bindings } from "../../../lib/bindings.server";
import { CARRIERS, CHANNELS, MANUAL_STATES, channelName, shopMayEmailBuyer, type OrderState } from "../../../lib/orders";
import { deliverableAddress, sendMail, shippedMessage } from "../../../lib/email.server";

/** Dollars-or-cents from a form field, as whole cents. */
function money(v: unknown): number | null {
  const n = Math.trunc(Number(v));
  if (!Number.isFinite(n) || n < 0 || n > 99_999_999) return null;
  return n;
}

type Order = {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  company: string;
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
  shipped_notified_at: string | null;
  channel: string;
  channel_ref: string;
};

const COLUMNS = `id,reference,name,email,phone,company,address1,address2,city,state,zip,notes,
  subtotal_cents,shipping_cents,tax_cents,amount_total_cents,status,provider,
  carrier,tracking_number,hold_reason,created_at,paid_at,shipped_at,shipped_notified_at,channel,channel_ref`;

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

        // In batches: D1 refuses more than 100 bound parameters in one query,
        // and "Everything" already returns more orders than that.
        const byOrder: Record<string, { name: string; qty: number; price_cents: number }[]> = {};
        for (let i = 0; i < ids.length; i += 50) {
          const group = ids.slice(i, i + 50);
          const placeholders = group.map((_, j) => `?${j + 1}`).join(",");
          const items = await DB.prepare(
            `SELECT order_id, name, qty, price_cents FROM order_items WHERE order_id IN (${placeholders})`,
          )
            .bind(...group)
            .all<{ order_id: string; name: string; qty: number; price_cents: number }>();
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
       * His dad also sells on Amazon, Walmart and Facebook and wants one place to look, so
       * these are typed in by hand and then travel through exactly the same
       * Paid -> Ready to ship -> Shipped workflow as everything else.
       *
       * Two things this deliberately does not do. It does not touch stock:
       * marketplace listings are managed on the marketplace, and a late entry
       * silently changing what this site has on the shelf would be worse than
       * no link at all. And it records no sales tax, because Amazon,
       * Walmart and Facebook collect and remit it themselves \u2014 putting it here
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

        /* ---- an order typed straight in as shipped still tells the buyer ----
         *
         * The notice on the update path fires when an order MOVES into
         * shipped. An order created already shipped never moves, so without
         * this it would quietly tell nobody — which is exactly the case when
         * he records a sale he has already posted.
         *
         * Sent after the line items are written so the message lists them, and
         * stamped the same way so it can never go twice. */
        let notified: { ok: boolean; error: string; expected: boolean } | null = null;
        if (status === "shipped" && !shopMayEmailBuyer(channel)) {
          notified = {
            ok: false,
            expected: true,
            error: `${channelName(channel)} sends its own notice and does not allow contacting buyers directly, so nothing was emailed from here.`,
          };
        } else if (status === "shipped" && tracking && deliverableAddress(str(body.email, 160))) {
          const fresh = (await DB.prepare(`SELECT ${COLUMNS} FROM orders WHERE id = ?1`)
            .bind(id)
            .first<Order>()) as Order | null;
          if (fresh) {
            const sent = await sendMail(fresh.reference, "shipped", {
              to: fresh.email,
              ...shippedMessage(fresh, items.map((i) => ({ name: i.name, qty: i.qty }))),
            });
            notified = { ...sent, expected: false };
            if (sent.ok) {
              await DB.prepare("UPDATE orders SET shipped_notified_at = datetime('now') WHERE id = ?1")
                .bind(id)
                .run();
            }
          }
        } else if (status === "shipped" && !deliverableAddress(str(body.email, 160))) {
          notified = { ok: false, expected: true, error: "No email address on this order, so the buyer was not told." };
        }

        const row = await DB.prepare(`SELECT ${COLUMNS} FROM orders WHERE id = ?1`).bind(id).first<Order>();
        return Response.json({ ok: true, order: row, notified });
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

        // The whole row, because every field is editable now and the audit
        // line records what each one changed FROM as well as to. With money
        // editable that trail stops being a nicety: a mistyped total quietly
        // moves the year's takings, and without a before-value there is no way
        // to tell later what it used to say.
        const existing = await DB.prepare(`SELECT ${COLUMNS} FROM orders WHERE reference = ?1`)
          .bind(reference)
          .first<Order>();
        if (!existing) return Response.json({ ok: false, error: "No such order." }, { status: 404 });

        const before = existing as unknown as Record<string, unknown>;
        const sets: string[] = [];
        const binds: unknown[] = [];
        const note: string[] = [];
        const put = (col: string, val: unknown) => {
          const was = before[col];
          if (String(was ?? "") === String(val ?? "")) return; // nothing actually changed
          binds.push(val);
          sets.push(`${col} = ?${binds.length + 1}`);
          note.push(`${col}: ${String(was ?? "")} -> ${String(val ?? "")}`);
        };

        /* ---- who it goes to ---- */
        if ("name" in body) put("name", str(body.name, 120));
        if ("email" in body) put("email", str(body.email, 160));
        if ("phone" in body) put("phone", str(body.phone, 40));
        if ("company" in body) put("company", str(body.company, 120));
        if ("address1" in body) put("address1", str(body.address1, 200));
        if ("address2" in body) put("address2", str(body.address2, 200));
        if ("city" in body) put("city", str(body.city, 120));
        if ("state" in body) put("state", str(body.state, 40));
        if ("zip" in body) put("zip", str(body.zip, 20));
        if ("notes" in body) put("notes", str(body.notes, 1000));

        /* ---- where it came from ---- */
        if ("channel" in body) {
          const v = str(body.channel, 20);
          if (!CHANNELS.some((c) => c.id === v)) {
            return Response.json({ ok: false, error: "Unknown sales channel." }, { status: 400 });
          }
          put("channel", v);
        }
        if ("channel_ref" in body) put("channel_ref", str(body.channel_ref, 80));

        /* ---- the money ---- */
        for (const [key, label] of [
          ["subtotal_cents", "goods"],
          ["shipping_cents", "shipping"],
          ["tax_cents", "tax"],
          ["amount_total_cents", "total"],
        ] as const) {
          if (key in body) {
            const n = money(body[key]);
            if (n === null) return Response.json({ ok: false, error: `Check the ${label} amount.` }, { status: 400 });
            put(key, n);
          }
        }

        /* ---- when the money landed: this drives which tax year it falls in ---- */
        if ("paid_on" in body) {
          const day = str(body.paid_on, 10);
          if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
            return Response.json({ ok: false, error: "Use a date like 2026-09-30." }, { status: 400 });
          }
          const keepTime = (existing.paid_at ?? "").slice(11, 19) || "12:00:00";
          put("paid_at", `${day} ${keepTime}`);
        }

        if ("carrier" in body) {
          const v = str(body.carrier, 20);
          if (v && !CARRIERS.some((c) => c.id === v)) {
            return Response.json({ ok: false, error: "Unknown carrier." }, { status: 400 });
          }
          put("carrier", v);
        }
        if ("tracking_number" in body) put("tracking_number", str(body.tracking_number, 80));
        if ("hold_reason" in body) put("hold_reason", str(body.hold_reason, 300));

        let justShipped = false;
        if ("status" in body) {
          const next = str(body.status, 30) as OrderState;
          if (!MANUAL_STATES.includes(next)) {
            return Response.json({ ok: false, error: "That is not a state you can set by hand." }, { status: 400 });
          }
          // Shipping without a tracking number is how parcels get lost and
          // customers get told "it's on its way" with nothing to show them.
          // Moving an order BACK out of shipped is always allowed — that is
          // usually somebody fixing a mistake.
          if (next === "shipped") {
            const tracking = "tracking_number" in body ? str(body.tracking_number, 80) : "";
            if (!tracking && !existing.tracking_number) {
              return Response.json(
                { ok: false, error: "Add a tracking number before marking this shipped." },
                { status: 400 },
              );
            }
            if (existing.status !== "shipped") {
              put("shipped_at", new Date().toISOString().slice(0, 19).replace("T", " "));
              justShipped = true;
            }
          } else if (existing.status === "shipped") {
            /* Moving an order OUT of shipped clears the record of having told
             * the customer, so putting it back in tells them again.
             *
             * Without this, an order that was already sitting in shipped could
             * never notify. That is right for the 119 imported from the old
             * cart, which were loaded as shipped and whose customers were told
             * at the time — but wrong the moment he actually fulfils one of
             * them, which is exactly what happened with AHE-29688: real
             * address, real tracking number, and silence.
             *
             * Pulling an order back out is deliberate. Nobody does it by
             * accident, and nothing else does it for him, so it is a safe
             * signal that the next shipment is a genuinely new one. */
            put("shipped_notified_at", null);
          }
          put("status", next);
        }

        /* ---- the lines on the order, replaced wholesale ---- */
        let itemsChanged = false;
        if (Array.isArray(body.items)) {
          const rows: { slug: string; name: string; qty: number; price: number }[] = [];
          for (const raw of body.items) {
            if (!raw || typeof raw !== "object") continue;
            const r = raw as Record<string, unknown>;
            const name = str(r.name, 200);
            if (!name) continue;
            const qty = Math.trunc(Number(r.qty));
            const price = money(r.price_cents);
            if (!Number.isFinite(qty) || qty < 1 || qty > 9999) {
              return Response.json({ ok: false, error: `Check the quantity on "${name}".` }, { status: 400 });
            }
            if (price === null) {
              return Response.json({ ok: false, error: `Check the price on "${name}".` }, { status: 400 });
            }
            rows.push({ slug: str(r.product_slug, 200), name, qty, price });
          }
          if (rows.length === 0) {
            return Response.json({ ok: false, error: "An order needs at least one line." }, { status: 400 });
          }
          await DB.prepare("DELETE FROM order_items WHERE order_id = ?1").bind(existing.id).run();
          for (const it of rows) {
            await DB.prepare(
              "INSERT INTO order_items (order_id,product_slug,name,qty,price_cents) VALUES (?1,?2,?3,?4,?5)",
            )
              .bind(existing.id, it.slug, it.name, it.qty, it.price)
              .run();
          }
          note.push(`items: ${rows.length} line${rows.length === 1 ? "" : "s"} rewritten`);
          itemsChanged = true;
        }

        if (sets.length === 0 && !itemsChanged) {
          return Response.json({ ok: false, error: "Nothing to change." }, { status: 400 });
        }

        if (sets.length > 0) {
          await DB.prepare(`UPDATE orders SET ${sets.join(", ")} WHERE id = ?1`)
            .bind(existing.id, ...binds)
            .run();
        }
        await logAdmin("order_update", reference, note.join(" | "));

        /* ---- tell the customer, once, and only on the way in ----
         *
         * Four things have to be true, and each one is a way this would
         * otherwise go wrong:
         *   - the order moved INTO shipped on this save. Every field is
         *     editable now, so a shipped order gets saved repeatedly.
         *   - it has not been told already (shipped_notified_at), which also
         *     covers moving an order out of shipped and back in.
         *   - telling the buyer is his job. Amazon and Walmart send their own
         *     shipping notices and forbid contacting a buyer directly; their
         *     addresses are proxies anyway, and the 93 imported marketplace
         *     orders have no address at all.
         *   - there is an address worth trying.
         *
         * A failure here is reported but never fails the save: the parcel is
         * already gone, and refusing to record that would be worse. */
        let notified: { ok: boolean; error: string; expected: boolean } | null = null;
        const shipping = (await DB.prepare(`SELECT ${COLUMNS} FROM orders WHERE id = ?1`)
          .bind(existing.id)
          .first<Order>()) as Order | null;

        if (justShipped && shipping && !shipping.shipped_notified_at) {
          if (!shopMayEmailBuyer(shipping.channel)) {
            // Correct, not broken — so it is stated plainly rather than in red.
            notified = {
              ok: false,
              expected: true,
              error: `${channelName(shipping.channel)} sends its own notice and does not allow contacting buyers directly, so nothing was emailed from here.`,
            };
          } else if (!deliverableAddress(shipping.email)) {
            notified = {
              ok: false,
              expected: true,
              error: "No email address on this order, so the customer was not told.",
            };
          } else {
            const lines = await DB.prepare("SELECT name, qty FROM order_items WHERE order_id = ?1")
              .bind(existing.id)
              .all<{ name: string; qty: number }>();
            const msg = shippedMessage(shipping, lines.results ?? []);
            const sent = await sendMail(shipping.reference, "shipped", { to: shipping.email, ...msg });
            notified = { ...sent, expected: false };
            if (sent.ok) {
              await DB.prepare("UPDATE orders SET shipped_notified_at = datetime('now') WHERE id = ?1")
                .bind(existing.id)
                .run();
            }
          }
        }

        const row = await DB.prepare(`SELECT ${COLUMNS} FROM orders WHERE id = ?1`).bind(existing.id).first<Order>();
        return Response.json({ ok: true, order: row, notified });
      },

      /**
       * Remove an order, keeping a copy.
       *
       * Most deletions are a test row or something entered twice, and those
       * should simply go. A paid order is different: it counts toward the
       * year's takings and the sales tax he files, and Stripe or PayPal still
       * holds its own record of the money either way — so deleting one here
       * makes his books disagree with the processor rather than undoing
       * anything. That case asks a second time and says what it is worth.
       *
       * Stock is deliberately left alone. If an order shipped, the goods left
       * the shelf; quietly putting them back because the paperwork was tidied
       * up would make the counts wrong.
       */
      DELETE: async ({ request }) => {
        if (!(await isSignedIn(request))) return denied();
        const DB = bindings().DB;
        if (!DB) return Response.json({ ok: false, error: "No database." }, { status: 503 });

        const url = new URL(request.url);
        const reference = (url.searchParams.get("reference") ?? "").trim().slice(0, 60);
        if (!reference) return Response.json({ ok: false, error: "Bad request." }, { status: 400 });

        const order = await DB.prepare(`SELECT ${COLUMNS} FROM orders WHERE reference = ?1`)
          .bind(reference)
          .first<Order>();
        if (!order) return Response.json({ ok: false, error: "That order is already gone." }, { status: 404 });

        const paid = Boolean(order.paid_at);
        if (paid && url.searchParams.get("force") !== "1") {
          const amount = `$${((order.amount_total_cents ?? 0) / 100).toFixed(2)}`;
          const year = String(order.paid_at ?? "").slice(0, 4);
          const where = order.provider && order.provider !== "manual" ? ` ${order.provider} still has its own record of the payment.` : "";
          return Response.json(
            {
              ok: false,
              needsConfirm: true,
              error: `This one was paid — ${amount}, counted in ${year}. Removing it changes that year's takings and the sales tax figure.${where}`,
            },
            { status: 409 },
          );
        }

        const items = await DB.prepare("SELECT product_slug, name, qty, price_cents FROM order_items WHERE order_id = ?1")
          .bind(order.id)
          .all<{ product_slug: string; name: string; qty: number; price_cents: number }>();

        // The copy goes in first. If this fails, nothing is destroyed.
        await DB.prepare(
          "INSERT OR REPLACE INTO deleted_orders (reference, was_paid, amount_total_cents, record) VALUES (?1,?2,?3,?4)",
        )
          .bind(
            reference,
            paid ? 1 : 0,
            order.amount_total_cents ?? 0,
            JSON.stringify({ order, items: items.results ?? [] }),
          )
          .run();

        await DB.prepare("DELETE FROM order_items WHERE order_id = ?1").bind(order.id).run();
        await DB.prepare("DELETE FROM orders WHERE id = ?1").bind(order.id).run();
        await logAdmin(
          "order_delete",
          reference,
          `${paid ? "paid " : ""}${((order.amount_total_cents ?? 0) / 100).toFixed(2)} ${order.channel} - copy kept`,
        );

        return Response.json({ ok: true });
      },
    },
  },
});
