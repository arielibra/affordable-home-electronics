import { createFileRoute } from "@tanstack/react-router";

import { denied, isSignedIn, logAdmin } from "../../../lib/admin.server";
import { bindings } from "../../../lib/bindings.server";
import { imageInfo, mediaEnabled } from "../../../lib/media.server";

/**
 * Photo housekeeping for the "Shrink large photos" tool on the Products tab.
 *
 * GET lists every stored photo the shop is actually using, with its size, a
 * page at a time (each size is one R2 lookup, and a Worker request has a cap
 * on how many of those it may make).
 *
 * POST swaps one photo address for another everywhere it is used: a product's
 * main photo, its gallery, and brand logos. The old file is left in storage on
 * purpose, so an order or a cached page still pointing at it keeps working,
 * and nothing is lost if the swap turns out to be a mistake.
 */

const KEY = /^\/media\/p_[a-z0-9-]+\.[a-z0-9]+$/i;
const PAGE = 60;

export const Route = createFileRoute("/api/admin/media")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!(await isSignedIn(request))) return denied();
        const DB = bindings().DB;
        if (!DB || !mediaEnabled()) {
          return Response.json({ ok: false, error: "Storage is unavailable." }, { status: 503 });
        }
        const offset = Math.max(0, Number(new URL(request.url).searchParams.get("offset") ?? "0") || 0);

        const res = await DB.prepare(
          `SELECT url FROM (
             SELECT image AS url FROM products WHERE image LIKE '/media/%'
             UNION SELECT url FROM product_images WHERE url LIKE '/media/%'
             UNION SELECT logo AS url FROM brands WHERE logo LIKE '/media/%'
           ) ORDER BY url`,
        ).all<{ url: string }>();
        const all = (res.results ?? []).map((r) => r.url).filter((u) => KEY.test(u));
        const page = all.slice(offset, offset + PAGE);

        const photos = await Promise.all(
          page.map(async (url) => {
            const info = await imageInfo(url).catch(() => null);
            return { url, bytes: info?.bytes ?? null, contentType: info?.contentType ?? "" };
          }),
        );

        return Response.json(
          { ok: true, total: all.length, offset, next: offset + PAGE < all.length ? offset + PAGE : null, photos },
          { headers: { "Cache-Control": "no-store" } },
        );
      },

      POST: async ({ request }) => {
        if (!(await isSignedIn(request))) return denied();
        const DB = bindings().DB;
        if (!DB || !mediaEnabled()) {
          return Response.json({ ok: false, error: "Storage is unavailable." }, { status: 503 });
        }

        const body = (await request.json().catch(() => ({}))) as { from?: unknown; to?: unknown };
        const from = typeof body.from === "string" ? body.from : "";
        const to = typeof body.to === "string" ? body.to : "";
        if (!KEY.test(from) || !KEY.test(to) || from === to) {
          return Response.json({ ok: false, error: "Those are not two different stored photos." }, { status: 400 });
        }
        // Never point products at a file that is not actually there.
        const target = await imageInfo(to);
        if (!target) return Response.json({ ok: false, error: "The new photo was not found." }, { status: 400 });

        const results = await DB.batch([
          DB.prepare("UPDATE products SET image = ?2 WHERE image = ?1").bind(from, to),
          // A gallery already holding the new address would collide on the
          // primary key; OR IGNORE skips those and the DELETE tidies up.
          DB.prepare("UPDATE OR IGNORE product_images SET url = ?2 WHERE url = ?1").bind(from, to),
          DB.prepare("DELETE FROM product_images WHERE url = ?1").bind(from),
          DB.prepare("UPDATE brands SET logo = ?2 WHERE logo = ?1").bind(from, to),
        ]);
        const changed = results.reduce((n, r) => n + (r.meta?.changes ?? 0), 0);

        const before = (await imageInfo(from).catch(() => null))?.bytes;
        await logAdmin(
          "image_shrink",
          to,
          `${from} → ${to}${before ? ` ${(before / 1024).toFixed(0)}kb → ${(target.bytes / 1024).toFixed(0)}kb` : ""}`,
        );
        return Response.json({ ok: true, changed, bytes: target.bytes });
      },
    },
  },
});
