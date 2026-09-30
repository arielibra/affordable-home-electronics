import { createFileRoute } from "@tanstack/react-router";

import { adminConfigured, intrusionSummary, isSignedIn } from "../../../lib/admin.server";

export const Route = createFileRoute("/api/admin/session")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const configured = adminConfigured();
        const authed = configured ? await isSignedIn(request) : false;

        // Only ever told to someone already signed in. Handing the count of
        // failed attempts to an anonymous caller would tell an attacker
        // whether their own guessing had been noticed.
        const security = authed ? await intrusionSummary() : null;

        return Response.json(
          { ok: true, configured, authed, security },
          { headers: { "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
