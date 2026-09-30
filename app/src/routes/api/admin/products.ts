import { createFileRoute } from "@tanstack/react-router";
import type { D1Database } from "@cloudflare/workers-types";

import { denied, isSignedIn, logAdmin } from "../../../lib/admin.server";
import { bindings } from "../../../lib/bindings.server";
import { slugify } from "../../../lib/slug";

type Row = {
  slug: string;
  name: string;
  brand: string;
  brand_slug: string;
  category: string;
  price_cents: number;
  msrp_cents: number | null;
  cost_cents: number | null;
  blurb: string;
  image: string;
  featured: number;
  stock: number;
  stock_tracked: number;
  active: number;
};

const COLUMNS =
  "slug,name,brand,brand_slug,category,price_cents,msrp_cents,cost_cents,blurb,image,featured,stock,stock_tracked,active";

/** At most twenty, no blanks, no duplicates, order preserved. */
function cleanImages(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null;
  const out: string[] = [];
  for (const raw of v) {
    const u = typeof raw === "string" ? raw.trim().slice(0, 300) : "";
    if (!u || out.includes(u)) continue;
    out.push(u);
    if (out.length >= 20) break;
  }
  return out;
}

/** Rewrite a product's gallery, and keep products.image pointing at the first
 *  one. The single column is what the shop grid, the cart, the checkout and
 *  the social card all read, so it has to stay in step or the listing shows a
 *  different photo from the product page. */
async function writeImages(DB: D1Database, slug: string, images: string[]): Promise<void> {
  await DB.prepare("DELETE FROM product_images WHERE product_slug = ?1").bind(slug).run();
  for (let i = 0; i < images.length; i += 1) {
    await DB.prepare(
      "INSERT OR IGNORE INTO product_images (product_slug, url, position) VALUES (?1,?2,?3)",
    )
      .bind(slug, images[i], i)
      .run();
  }
  await DB.prepare("UPDATE products SET image = ?2 WHERE slug = ?1").bind(slug, images[0] ?? "").run();
}

/**
 * D1 refuses a query with more than 100 bound parameters, so the slugs go in
 * batches. One `IN (?…)` with a parameter per product looked fine against the
 * 127 products that existed when it was written and broke the whole Products
 * tab the moment there were more — the query threw, the endpoint 500'd, and
 * the panel sat on "Loading." with nothing to say.
 */
const BATCH = 50;

async function readImages(DB: D1Database, slugs: string[]): Promise<Record<string, string[]>> {
  const out: Record<string, string[]> = {};
  for (let i = 0; i < slugs.length; i += BATCH) {
    const group = slugs.slice(i, i + BATCH);
    if (group.length === 0) continue;
    const ph = group.map((_, j) => `?${j + 1}`).join(",");
    const r = await DB.prepare(
      `SELECT product_slug, url FROM product_images WHERE product_slug IN (${ph}) ORDER BY product_slug, position`,
    )
      .bind(...group)
      .all<{ product_slug: string; url: string }>();
    for (const row of r.results ?? []) (out[row.product_slug] ??= []).push(row.url);
  }
  return out;
}

function clampInt(v: unknown, min: number, max: number): number | null {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
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
        const slug = (url.searchParams.get("slug") ?? "").trim().slice(0, 120);

        if (slug) {
          const one = await DB.prepare(`SELECT ${COLUMNS} FROM products WHERE slug = ?1`).bind(slug).first<Row>();
          if (!one) return Response.json({ ok: false, error: "No such product." }, { status: 404 });
          const gallery = await readImages(DB, [slug]);
          return Response.json(
            { ok: true, product: { ...one, images: gallery[slug] ?? (one.image ? [one.image] : []) } },
            { headers: { "Cache-Control": "no-store" } },
          );
        }

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
          `SELECT ${COLUMNS} FROM products` +
          (where.length ? ` WHERE ${where.join(" AND ")}` : "") +
          " ORDER BY active DESC, brand, name LIMIT 400";

        const res = await DB.prepare(sql).bind(...binds).all<Row>();
        const rows = res.results ?? [];
        // One extra query for the whole page rather than one per product.
        const gallery = await readImages(DB, rows.map((r) => r.slug));
        return Response.json(
          {
            ok: true,
            products: rows.map((r) => ({ ...r, images: gallery[r.slug] ?? (r.image ? [r.image] : []) })),
          },
          { headers: { "Cache-Control": "no-store" } },
        );
      },

      // Create a product.
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

        const name = str(body.name, 200);
        if (!name) return Response.json({ ok: false, error: "A product needs a name." }, { status: 400 });

        const price = clampInt(body.price_cents, 1, 100000000);
        if (price === null) return Response.json({ ok: false, error: "A product needs a price." }, { status: 400 });

        const category = str(body.category, 40);
        const cat = await DB.prepare("SELECT slug FROM categories WHERE slug = ?1").bind(category).first();
        if (!cat) return Response.json({ ok: false, error: "Pick a category." }, { status: 400 });

        const brandSlug = str(body.brand_slug, 80);
        let brandName = "";
        if (brandSlug) {
          const b = await DB.prepare("SELECT name FROM brands WHERE slug = ?1").bind(brandSlug).first<{ name: string }>();
          if (!b) return Response.json({ ok: false, error: "That brand is not on the list." }, { status: 400 });
          brandName = b.name;
        }

        // Part numbers make better slugs than names, so honour one if given.
        const wanted = slugify(str(body.slug, 120) || name);
        if (!wanted) return Response.json({ ok: false, error: "That name has no usable letters in it." }, { status: 400 });

        let slug = wanted;
        for (let i = 2; i < 50; i += 1) {
          const clash = await DB.prepare("SELECT slug FROM products WHERE slug = ?1").bind(slug).first();
          if (!clash) break;
          slug = `${wanted}-${i}`;
        }

        const msrp = body.msrp_cents === null || body.msrp_cents === "" ? null : clampInt(body.msrp_cents, 1, 100000000);
        // Null means "not recorded", which is not the same as a cost of zero.
        const cost =
          body.cost_cents === null || body.cost_cents === "" || body.cost_cents === undefined
            ? null
            : clampInt(body.cost_cents, 0, 100000000);
        const stock = clampInt(body.stock, 0, 100000) ?? 0;

        await DB.prepare(
          `INSERT INTO products (slug,name,brand,brand_slug,category,price_cents,msrp_cents,cost_cents,blurb,image,featured,stock,stock_tracked,active)
           VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14)`,
        )
          .bind(
            slug,
            name,
            brandName,
            brandSlug,
            category,
            price,
            msrp,
            cost,
            str(body.blurb, 600),
            // Filled in properly by writeImages below; this keeps the insert
            // valid for a product saved without any pictures at all.
            "",
            body.featured ? 1 : 0,
            stock,
            body.stock_tracked ? 1 : 0,
            body.active === false ? 0 : 1,
          )
          .run();
        const images = cleanImages(body.images) ?? (str(body.image, 300) ? [str(body.image, 300)] : []);
        await writeImages(DB, slug, images);
        await logAdmin("product_create", slug, `${name} (${images.length} photo${images.length === 1 ? "" : "s"})`);

        const row = await DB.prepare(`SELECT ${COLUMNS} FROM products WHERE slug = ?1`).bind(slug).first<Row>();
        return Response.json({ ok: true, product: { ...row, images } });
      },

      // Change one. Any subset of fields; the slug itself never moves, because
      // customers, search engines and old orders all point at it.
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
        if ("featured" in body) put("featured", body.featured ? 1 : 0);
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
        if ("cost_cents" in body) {
          if (body.cost_cents === null || body.cost_cents === "") put("cost_cents", null);
          else {
            const n = clampInt(body.cost_cents, 0, 100000000);
            if (n === null) return Response.json({ ok: false, error: "Cost must be a number." }, { status: 400 });
            put("cost_cents", n);
          }
        }
        if ("name" in body) {
          const v = str(body.name, 200);
          if (!v) return Response.json({ ok: false, error: "A product needs a name." }, { status: 400 });
          put("name", v);
        }
        if ("blurb" in body) put("blurb", str(body.blurb, 600));
        // The gallery is authoritative when it is sent; the single column is
        // kept in step by writeImages rather than set here.
        const nextImages = "images" in body ? cleanImages(body.images) : null;
        if ("images" in body && nextImages === null) {
          return Response.json({ ok: false, error: "Photos must be a list." }, { status: 400 });
        }
        if (nextImages === null && "image" in body) put("image", str(body.image, 300));
        if ("category" in body) {
          const v = str(body.category, 40);
          const cat = await DB.prepare("SELECT slug FROM categories WHERE slug = ?1").bind(v).first();
          if (!cat) return Response.json({ ok: false, error: "That category does not exist." }, { status: 400 });
          put("category", v);
        }
        if ("brand_slug" in body) {
          const v = str(body.brand_slug, 80);
          if (v) {
            const b = await DB.prepare("SELECT name FROM brands WHERE slug = ?1").bind(v).first<{ name: string }>();
            if (!b) return Response.json({ ok: false, error: "That brand is not on the list." }, { status: 400 });
            put("brand_slug", v);
            put("brand", b.name);
          } else {
            put("brand_slug", "");
            put("brand", "");
          }
        }

        if (sets.length === 0 && nextImages === null) {
          return Response.json({ ok: false, error: "Nothing to change." }, { status: 400 });
        }

        if (sets.length > 0) {
          await DB.prepare(`UPDATE products SET ${sets.join(", ")} WHERE slug = ?1`)
            .bind(slug, ...binds)
            .run();
        }
        if (nextImages !== null) {
          await writeImages(DB, slug, nextImages);
          note.push(`photos=${nextImages.length}`);
        }
        await logAdmin("product_update", slug, note.join(" "));

        const row = await DB.prepare(`SELECT ${COLUMNS} FROM products WHERE slug = ?1`).bind(slug).first<Row>();
        const gallery = await readImages(DB, [slug]);
        return Response.json({ ok: true, product: { ...row, images: gallery[slug] ?? [] } });
      },
    },
  },
});
