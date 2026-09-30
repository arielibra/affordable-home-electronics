import { createFileRoute } from "@tanstack/react-router";

import { denied, isSignedIn, logAdmin } from "../../../lib/admin.server";
import { bindings } from "../../../lib/bindings.server";
import { slugify } from "../../../lib/slug";

type Category = {
  slug: string;
  name: string;
  blurb: string;
  position: number;
  products: number;
};

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export const Route = createFileRoute("/api/admin/categories")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!(await isSignedIn(request))) return denied();
        const DB = bindings().DB;
        if (!DB) return Response.json({ ok: false, error: "No database." }, { status: 503 });

        const res = await DB.prepare(
          `SELECT c.slug, c.name, c.blurb, c.position,
                  (SELECT COUNT(*) FROM products p WHERE p.category = c.slug) AS products
             FROM categories c
            ORDER BY c.position, c.name`,
        ).all<Category>();
        return Response.json({ ok: true, categories: res.results ?? [] }, { headers: { "Cache-Control": "no-store" } });
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

        const name = str(body.name, 80);
        if (!name) return Response.json({ ok: false, error: "A category needs a name." }, { status: 400 });

        // An existing category keeps its slug even when renamed. It is the
        // address of a real page — /shop/cameras — so changing it would break
        // every link to it, every bookmark, and its place in search results.
        // Products point at the slug too, not the name, so renaming is free.
        const existing = str(body.slug, 80);
        const slug = existing || slugify(name);
        if (!slug) return Response.json({ ok: false, error: "That name has no usable letters in it." }, { status: 400 });

        const blurb = str(body.blurb, 400);
        const position = Number.isFinite(Number(body.position))
          ? Math.max(0, Math.min(999, Math.round(Number(body.position))))
          : 100;

        if (existing) {
          const found = await DB.prepare("SELECT slug FROM categories WHERE slug = ?1").bind(existing).first();
          if (!found) return Response.json({ ok: false, error: "That category no longer exists." }, { status: 404 });
          await DB.prepare("UPDATE categories SET name=?2, blurb=?3, position=?4 WHERE slug=?1")
            .bind(slug, name, blurb, position)
            .run();
          await logAdmin("category_update", slug, name);
        } else {
          const clash = await DB.prepare("SELECT slug FROM categories WHERE slug = ?1").bind(slug).first();
          if (clash) return Response.json({ ok: false, error: `${name} is already a category.` }, { status: 409 });
          await DB.prepare("INSERT INTO categories (slug,name,blurb,position) VALUES (?1,?2,?3,?4)")
            .bind(slug, name, blurb, position)
            .run();
          await logAdmin("category_create", slug, name);
        }

        const row = await DB.prepare(
          `SELECT c.slug,c.name,c.blurb,c.position,
                  (SELECT COUNT(*) FROM products p WHERE p.category = c.slug) AS products
             FROM categories c WHERE c.slug = ?1`,
        )
          .bind(slug)
          .first<Category>();
        return Response.json({ ok: true, category: row });
      },

      DELETE: async ({ request }) => {
        if (!(await isSignedIn(request))) return denied();
        const DB = bindings().DB;
        if (!DB) return Response.json({ ok: false, error: "No database." }, { status: 503 });

        const slug = (new URL(request.url).searchParams.get("slug") ?? "").trim().slice(0, 80);
        if (!slug) return Response.json({ ok: false, error: "Bad request." }, { status: 400 });

        // Refuse rather than orphan products. A product whose category no
        // longer exists vanishes from the shop pages without ever saying so.
        const count = await DB.prepare("SELECT COUNT(*) AS n FROM products WHERE category = ?1")
          .bind(slug)
          .first<{ n: number }>();
        if ((count?.n ?? 0) > 0) {
          return Response.json(
            {
              ok: false,
              error: `${count?.n} product${count?.n === 1 ? " is" : "s are"} still in this category. Move them to another one first.`,
            },
            { status: 409 },
          );
        }

        // The last category would leave the product form with nothing to pick.
        const total = await DB.prepare("SELECT COUNT(*) AS n FROM categories").first<{ n: number }>();
        if ((total?.n ?? 0) <= 1) {
          return Response.json(
            { ok: false, error: "That is the only category left. Add another one before removing this." },
            { status: 409 },
          );
        }

        await DB.prepare("DELETE FROM categories WHERE slug = ?1").bind(slug).run();
        await logAdmin("category_delete", slug, "");
        return Response.json({ ok: true });
      },
    },
  },
});
