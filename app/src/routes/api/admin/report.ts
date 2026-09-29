import { createFileRoute } from "@tanstack/react-router";

import { denied, isSignedIn } from "../../../lib/admin.server";
import { bindings } from "../../../lib/bindings.server";
import { carrierName } from "../../../lib/orders";

type Row = {
  reference: string;
  paid_at: string | null;
  created_at: string;
  status: string;
  provider: string;
  name: string;
  email: string;
  city: string;
  state: string;
  zip: string;
  subtotal_cents: number | null;
  shipping_cents: number | null;
  tax_cents: number | null;
  amount_total_cents: number | null;
  carrier: string;
  tracking_number: string;
};

const money = (c: number | null) => ((c ?? 0) / 100).toFixed(2);

/** Escape for a spreadsheet. Anything starting with = + - @ is prefixed so
 *  Excel treats it as text rather than a formula. */
function cell(v: string | number | null): string {
  let s = v === null ? "" : String(v);
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

/**
 * What a year of trading looked like — the numbers an accountant asks for.
 *
 * Counts money actually taken, so it keys off paid_at rather than the date the
 * order was created. An order raised in December and paid in January belongs
 * to January's takings, which is the answer the tax return wants.
 */
export const Route = createFileRoute("/api/admin/report")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!(await isSignedIn(request))) return denied();
        const DB = bindings().DB;
        if (!DB) return Response.json({ ok: false, error: "No database." }, { status: 503 });

        const url = new URL(request.url);
        const year = (url.searchParams.get("year") ?? "").replace(/[^0-9]/g, "").slice(0, 4);
        if (year.length !== 4) return Response.json({ ok: false, error: "Which year?" }, { status: 400 });
        const csv = url.searchParams.get("format") === "csv";

        const res = await DB.prepare(
          `SELECT reference,paid_at,created_at,status,provider,name,email,city,state,zip,
                  subtotal_cents,shipping_cents,tax_cents,amount_total_cents,carrier,tracking_number
             FROM orders
            WHERE paid_at IS NOT NULL AND strftime('%Y', paid_at) = ?1
            ORDER BY paid_at`,
        )
          .bind(year)
          .all<Row>();
        const rows = res.results ?? [];

        const totals = rows.reduce(
          (a, r) => ({
            orders: a.orders + 1,
            subtotal: a.subtotal + (r.subtotal_cents ?? 0),
            shipping: a.shipping + (r.shipping_cents ?? 0),
            tax: a.tax + (r.tax_cents ?? 0),
            total: a.total + (r.amount_total_cents ?? 0),
          }),
          { orders: 0, subtotal: 0, shipping: 0, tax: 0, total: 0 },
        );

        if (!csv) {
          // Also show what is sitting unpaid, so the year's picture is honest.
          const unpaid = await DB.prepare(
            `SELECT COUNT(*) AS n FROM orders
              WHERE paid_at IS NULL AND strftime('%Y', created_at) = ?1`,
          )
            .bind(year)
            .first<{ n: number }>();

          return Response.json(
            { ok: true, year, totals, unpaid: unpaid?.n ?? 0 },
            { headers: { "Cache-Control": "no-store" } },
          );
        }

        const header = [
          "Reference", "Paid", "Status", "Paid via", "Customer", "Email", "City", "State", "ZIP",
          "Subtotal", "Shipping", "Tax", "Total", "Carrier", "Tracking",
        ];
        const lines = [header.map(cell).join(",")];
        for (const r of rows) {
          lines.push(
            [
              r.reference, r.paid_at ?? "", r.status, r.provider, r.name, r.email, r.city, r.state, r.zip,
              money(r.subtotal_cents), money(r.shipping_cents), money(r.tax_cents), money(r.amount_total_cents),
              carrierName(r.carrier), r.tracking_number,
            ]
              .map(cell)
              .join(","),
          );
        }
        lines.push("");
        lines.push(
          [`Totals for ${year}`, "", "", "", "", "", "", "", "",
            money(totals.subtotal), money(totals.shipping), money(totals.tax), money(totals.total), "", ""]
            .map(cell)
            .join(","),
        );

        // The BOM is what makes Excel open a UTF-8 CSV without mangling
        // accented names.
        return new Response("﻿" + lines.join("\r\n"), {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="affordable-home-electronics-${year}.csv"`,
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
