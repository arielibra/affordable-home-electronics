import { createFileRoute } from "@tanstack/react-router";
import { clearedCookie, destroySession } from "../../../lib/admin.server";

export const Route = createFileRoute("/api/admin/logout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        await destroySession(request);
        return Response.json({ ok: true }, { headers: { "Set-Cookie": clearedCookie() } });
      },
    },
  },
});
