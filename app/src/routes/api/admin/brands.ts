import { createFileRoute } from "@tanstack/react-router";

import { denied, isSignedIn, logAdmin } from "../../../lib/admin.server";
import { bindings } from "../../../lib/bindings.server";
import { slugify } from "../../../lib/slug";

type Brand = {
  slug: string;
  name: string;
  blurb: string;
  logo: string;
  position: number;
  active: number;
  products: number;
};

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export const Route = createFileRoute("/api/admin/brands")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!(await isSignedIn(request))) return denied();
        const DB = bindings().DB;
        if (!DB) return Response.json({ ok: false, error: "No database." }, { status: 503 });

        const res = await DB.prepare(
          `SELECT b.slug, b.name, b.blurb, b.logo, b.position, b.active,
                  (SELECT COUNT(*) FROM products p WHERE p.brand_slug = b.slug) AS products
             FROM brands b
            ORDER BY b.position, b.name`,
        ).all<Brand>();
        return Response.json({ ok: true, brands: res.results ?? [] }, { headers: { "Cache-Control": "no-store" } });
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
        if (!name) return Response.json({ ok: false, error: "A brand needs a name." }, { status: 400 });

        // An existing brand keeps its slug even when renamed, because products
        // point at it and the public /brands page links by it.
        const existing = str(body.slug, 80);
        const slug = existing || slugify(name);
        if (!slug) return Response.json({ ok: false, error: "That name has no usable letters in it." }, { status: 400 });

        const blurb = str(body.blurb, 400);
        const logo = str(body.logo, 300);
        const position = Number.isFinite(Number(body.position)) ? Math.max(0, Math.min(999, Math.round(Number(body.position)))) : 100;
        const active = body.active === false ? 0 : 1;

        if (existing) {
          const found = await DB.prepare("SELECT slug FROM brands WHERE slug = ?1").bind(existing).first();
          if (!found) return Response.json({ ok: false, error: "That brand no longer exists." }, { status: 404 });
          await DB.prepare("UPDATE brands SET name=?2, blurb=?3, logo=?4, position=?5, active=?6 WHERE slug=?1")
            .bind(slug, name, blurb, logo, position, active)
            .run();
          // Keep the denormalised copy on products in step, so the storefront
          // and the search box show the new name straight away.
          await DB.prepare("UPDATE products SET brand = ?2 WHERE brand_slug = ?1").bind(slug, name).run();
          await logAdmin("brand_update", slug, name);
        } else {
          const clash = await DB.prepare("SELECT slug FROM brands WHERE slug = ?1").bind(slug).first();
          if (clash) return Response.json({ ok: false, error: `${name} is already on the list.` }, { status: 409 });
          await DB.prepare(
            "INSERT INTO brands (slug,name,blurb,logo,position,active) VALUES (?1,?2,?3,?4,?5,?6)",
          )
            .bind(slug, name, blurb, logo, position, active)
            .run();
          await logAdmin("brand_create", slug, name);
        }

        const row = await DB.prepare(
          `SELECT b.slug,b.name,b.blurb,b.logo,b.position,b.active,
                  (SELECT COUNT(*) FROM products p WHERE p.brand_slug = b.slug) AS products
             FROM brands b WHERE b.slug = ?1`,
        )
          .bind(slug)
          .first<Brand>();
        return Response.json({ ok: true, brand: row });
      },

      DELETE: async ({ request }) => {
        if (!(await isSignedIn(request))) return denied();
        const DB = bindings().DB;
        if (!DB) return Response.json({ ok: false, error: "No database." }, { status: 503 });

        const slug = (new URL(request.url).searchParams.get("slug") ?? "").trim().slice(0, 80);
        if (!slug) return Response.json({ ok: false, error: "Bad request." }, { status: 400 });

        // Refuse rather than orphan products. Hiding is the safe alternative
        // and is one click away in the same row.
        const count = await DB.prepare("SELECT COUNT(*) AS n FROM products WHERE brand_slug = ?1")
          .bind(slug)
          .first<{ n: number }>();
        if ((count?.n ?? 0) > 0) {
          return Response.json(
            {
              ok: false,
              error: `${count?.n} product${count?.n === 1 ? " is" : "s are"} still using this brand. Move them first, or hide the brand instead of deleting it.`,
            },
            { status: 409 },
          );
        }

        await DB.prepare("DELETE FROM brands WHERE slug = ?1").bind(slug).run();
        await logAdmin("brand_delete", slug, "");
        return Response.json({ ok: true });
      },
    },
  },
});
