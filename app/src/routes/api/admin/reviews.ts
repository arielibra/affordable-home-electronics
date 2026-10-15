import { createFileRoute } from "@tanstack/react-router";

import { denied, isSignedIn, logAdmin } from "../../../lib/admin.server";
import { adminReviews, decideReview } from "../../../lib/reviews.server";

export const Route = createFileRoute("/api/admin/reviews")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!(await isSignedIn(request))) return denied();
        return Response.json({ ok: true, reviews: await adminReviews() }, { headers: { "Cache-Control": "no-store" } });
      },

      /** { id, status: "approved" | "hidden" | "pending" } */
      POST: async ({ request }) => {
        if (!(await isSignedIn(request))) return denied();
        let body: { id?: unknown; status?: unknown };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return Response.json({ ok: false, error: "Bad request." }, { status: 400 });
        }
        const id = typeof body.id === "string" ? body.id.slice(0, 64) : "";
        const status = body.status;
        if (!id || (status !== "approved" && status !== "hidden" && status !== "pending")) {
          return Response.json({ ok: false, error: "Bad request." }, { status: 400 });
        }
        const changed = await decideReview(id, status);
        if (!changed) return Response.json({ ok: false, error: "That review no longer exists." }, { status: 404 });
        await logAdmin(`review_${status}`, id, "");
        return Response.json({ ok: true });
      },
    },
  },
});
