import { createFileRoute } from "@tanstack/react-router";

import { displayName, orderFor, reviewableFor, submitReviews, type Submission } from "../../lib/reviews.server";

/**
 * The buyer's side of reviews.
 *
 * Proves who they are with the link from the follow-up email ({ token }) or
 * with the order number and the email on the order, the same pair the order
 * lookup uses. Without `reviews` it answers which products from that order can
 * be reviewed; with `reviews` it saves them, held for the shop's approval.
 */

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

export const Route = createFileRoute("/api/reviews")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ ok: false, error: "Bad request." }, { status: 400 });
        }

        const order = await orderFor({
          token: str(body.token, 64),
          reference: str(body.reference, 40),
          email: str(body.email, 160),
        });
        if (!order) {
          // Same answer for a wrong number, a wrong email and an order not yet
          // shipped, and a pause, so this cannot be used to probe for orders.
          await new Promise((r) => setTimeout(r, 600));
          return Response.json(
            {
              ok: false,
              error: body.token
                ? "This review link has expired or is not valid. Use your order number and email instead."
                : "No shipped order matches that number and email. Check both, or call the shop.",
            },
            { status: 404 },
          );
        }

        if (!Array.isArray(body.reviews)) {
          const products = await reviewableFor(order);
          return Response.json(
            {
              ok: true,
              reference: order.reference,
              suggestedName: displayName(order.name),
              products: products.map((p) => ({ slug: p.slug, name: p.name, image: p.image, existing: p.existing })),
            },
            { headers: { "Cache-Control": "no-store" } },
          );
        }

        const items: Submission[] = (body.reviews as unknown[]).slice(0, 20).map((r) => {
          const o = (r ?? {}) as Record<string, unknown>;
          return {
            slug: str(o.slug, 120),
            rating: typeof o.rating === "number" ? o.rating : 0,
            title: str(o.title, 200),
            body: str(o.body, 4000),
          };
        });
        const result = await submitReviews(order, str(body.author, 60), items);
        if (!result.saved) return Response.json({ ok: false, error: result.error }, { status: 400 });
        return Response.json({ ok: true, saved: result.saved });
      },
    },
  },
});
