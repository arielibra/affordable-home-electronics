import { createFileRoute } from "@tanstack/react-router";
import { bindings } from "../../../lib/bindings.server";
import { denied, isSignedIn, logAdmin } from "../../../lib/admin.server";

type Row = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  price_cents: number;
  msrp_cents: number | null;
  image: string;
  stock: number;
  stock_tracked: number;
  active: number;
};

function clampInt(v: unknown, min: number, max: number): number | null {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export const Route = createFileRoute("/api/admin/products")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!(await isSignedIn(request))) return denied();
        const DB = bindings().DB;
        if (!DB) return Response.json({ ok: false, error: "No database." }, { status: 503 });

        const url = new URL(request.url);
        const q = (url.searchParams.get("q") ?? "").trim().toLowerCase().slice(0, 60);
        const category = (url.searchParams.get("category") ?? "").trim().slice(0, 40);

        const where: string[] = [];
        const binds: unknown[] = [];
        if (q) {
          binds.push(`%${q}%`);
          where.push(`(lower(name) LIKE ?${binds.length} OR lower(brand) LIKE ?${binds.length} OR lower(slug) LIKE ?${binds.length})`);
        }
        if (category) {
          binds.push(category);
          where.push(`category = ?${binds.length}`);
        }
        const sql =
          "SELECT slug,name,brand,category,price_cents,msrp_cents,image,stock,stock_tracked,active FROM products" +
          (where.length ? ` WHERE ${where.join(" AND ")}` : "") +
          " ORDER BY active DESC, brand, name LIMIT 400";

        const res = await DB.prepare(sql).bind(...binds).all<Row>();
        return Response.json({ ok: true, products: res.results ?? [] }, { headers: { "Cache-Control": "no-store" } });
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

        const slug = typeof body.slug === "string" ? body.slug : "";
        if (!slug || slug.length > 120) return Response.json({ ok: false, error: "Bad request." }, { status: 400 });

        const sets: string[] = [];
        const binds: unknown[] = [];
        const note: string[] = [];
        const put = (col: string, val: unknown) => {
          binds.push(val);
          sets.push(`${col} = ?${binds.length + 1}`);
          note.push(`${col}=${String(val)}`);
        };

        if ("stock" in body) {
          const n = clampInt(body.stock, 0, 100000);
          if (n === null) return Response.json({ ok: false, error: "Stock must be a whole number." }, { status: 400 });
          put("stock", n);
        }
        if ("stock_tracked" in body) put("stock_tracked", body.stock_tracked ? 1 : 0);
        if ("active" in body) put("active", body.active ? 1 : 0);
        if ("price_cents" in body) {
          const n = clampInt(body.price_cents, 1, 100000000);
          if (n === null) return Response.json({ ok: false, error: "Price must be a number." }, { status: 400 });
          put("price_cents", n);
        }
        if ("msrp_cents" in body) {
          if (body.msrp_cents === null || body.msrp_cents === "") put("msrp_cents", null);
          else {
            const n = clampInt(body.msrp_cents, 1, 100000000);
            if (n === null) return Response.json({ ok: false, error: "List price must be a number." }, { status: 400 });
            put("msrp_cents", n);
          }
        }
        if (sets.length === 0) return Response.json({ ok: false, error: "Nothing to change." }, { status: 400 });

        await DB.prepare(`UPDATE products SET ${sets.join(", ")} WHERE slug = ?1`)
          .bind(slug, ...binds)
          .run();
        await logAdmin("product_update", slug, note.join(" "));

        const row = await DB.prepare(
          "SELECT slug,name,brand,category,price_cents,msrp_cents,image,stock,stock_tracked,active FROM products WHERE slug = ?1",
        )
          .bind(slug)
          .first<Row>();
        return Response.json({ ok: true, product: row });
      },
    },
  },
});
