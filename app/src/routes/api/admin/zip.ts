import { createFileRoute } from "@tanstack/react-router";

import { denied, isSignedIn } from "../../../lib/admin.server";
import { bindings } from "../../../lib/bindings.server";

type Hit = { city: string; state: string };

/**
 * ZIP -> city and state, for the address fields in the back office.
 *
 * Signed in only. Left open it would be a free postcode API for the whole
 * internet, running on his account's request budget.
 */
export const Route = createFileRoute("/api/admin/zip")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!(await isSignedIn(request))) return denied();
        const DB = bindings().DB;
        if (!DB) return Response.json({ ok: false, error: "No database." }, { status: 503 });

        const zip = (new URL(request.url).searchParams.get("zip") ?? "").replace(/[^0-9]/g, "").slice(0, 5);
        if (zip.length !== 5) return Response.json({ ok: false, error: "Five digits." }, { status: 400 });

        // Anything seen before is answered from here, so the ZIPs he ships to
        // most cost nothing and keep working whatever happens upstream.
        const known = await DB.prepare("SELECT city, state FROM zip_lookup WHERE zip = ?1")
          .bind(zip)
          .first<Hit>();
        if (known) {
          return Response.json(
            { ok: true, zip, city: known.city, state: known.state, from: "known" },
            { headers: { "Cache-Control": "no-store" } },
          );
        }

        let hit: Hit | null = null;
        try {
          const res = await fetch(`https://api.zippopotam.us/us/${zip}`, {
            signal: AbortSignal.timeout(4000),
          });
          if (res.ok) {
            const data = (await res.json()) as {
              places?: { "place name"?: string; "state abbreviation"?: string }[];
            };
            const first = data.places?.[0];
            const city = String(first?.["place name"] ?? "").slice(0, 120);
            const state = String(first?.["state abbreviation"] ?? "").slice(0, 2);
            if (city && state) hit = { city, state };
          }
        } catch {
          // Offline, slow or gone. Falls through to "no match", and he types
          // the city himself — the address fields are never blocked on this.
        }

        if (!hit) {
          return Response.json({ ok: false, error: "No match for that ZIP." }, { status: 404 });
        }

        await DB.prepare(
          "INSERT INTO zip_lookup (zip, city, state) VALUES (?1,?2,?3) ON CONFLICT(zip) DO NOTHING",
        )
          .bind(zip, hit.city, hit.state)
          .run();

        return Response.json(
          { ok: true, zip, city: hit.city, state: hit.state, from: "lookup" },
          { headers: { "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
