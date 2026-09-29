import { createFileRoute } from "@tanstack/react-router";

import { denied, isSignedIn } from "../../../lib/admin.server";
import { bindings } from "../../../lib/bindings.server";

/** The two lists every product form needs to offer as choices. */
export const Route = createFileRoute("/api/admin/taxonomy")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!(await isSignedIn(request))) return denied();
        const DB = bindings().DB;
        if (!DB) return Response.json({ ok: false, error: "No database." }, { status: 503 });

        const [categories, brands] = await Promise.all([
          DB.prepare("SELECT slug, name FROM categories ORDER BY position, name").all<{ slug: string; name: string }>(),
          DB.prepare("SELECT slug, name FROM brands WHERE active = 1 ORDER BY position, name").all<{ slug: string; name: string }>(),
        ]);

        return Response.json(
          { ok: true, categories: categories.results ?? [], brands: brands.results ?? [] },
          { headers: { "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
