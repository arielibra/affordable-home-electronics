import { createFileRoute } from "@tanstack/react-router";
import { adminConfigured, isSignedIn } from "../../../lib/admin.server";

export const Route = createFileRoute("/api/admin/session")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const configured = adminConfigured();
        const authed = configured ? await isSignedIn(request) : false;
        return Response.json(
          { ok: true, configured, authed },
          { headers: { "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
