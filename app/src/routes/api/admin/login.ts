import { createFileRoute } from "@tanstack/react-router";
import { adminConfigured, checkPassword, createSession, logAdmin, sessionCookie } from "../../../lib/admin.server";

export const Route = createFileRoute("/api/admin/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!adminConfigured()) {
          return Response.json(
            { ok: false, error: "No admin password has been set for this site yet." },
            { status: 503 },
          );
        }

        let body: { password?: unknown };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return Response.json({ ok: false, error: "Bad request." }, { status: 400 });
        }
        const password = typeof body.password === "string" ? body.password : "";

        if (!checkPassword(password)) {
          // Slow every failure down so the password cannot be guessed quickly.
          await new Promise((r) => setTimeout(r, 700));
          await logAdmin("login_failed", "", "");
          return Response.json({ ok: false, error: "That password is not right." }, { status: 401 });
        }

        const token = await createSession();
        await logAdmin("login", "", "");
        return Response.json({ ok: true }, { headers: { "Set-Cookie": sessionCookie(token), "Cache-Control": "no-store" } });
      },
    },
  },
});
