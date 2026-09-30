import { createFileRoute } from "@tanstack/react-router";

import {
  adminConfigured,
  checkPassword,
  clearFailures,
  clientCountry,
  clientIp,
  createSession,
  lockoutFor,
  logAdmin,
  pruneAttempts,
  recordFailure,
  sessionCookie,
} from "../../../lib/admin.server";

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

        const ip = clientIp(request);

        // Checked BEFORE the password is read or compared. A locked-out
        // address learns nothing at all about whether its guess was right,
        // and a correct password during a lockout still does not let anyone
        // in — which is what makes the limit worth anything.
        const lock = await lockoutFor(ip);
        if (lock.locked) {
          return Response.json(
            {
              ok: false,
              error: `Too many wrong passwords. Try again in ${lock.minutesLeft} minute${
                lock.minutesLeft === 1 ? "" : "s"
              }.`,
            },
            { status: 429, headers: { "Retry-After": String(lock.minutesLeft * 60) } },
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
          const now = await recordFailure(ip, clientCountry(request));
          await logAdmin("login_failed", ip, clientCountry(request));
          if (now.locked) {
            return Response.json(
              {
                ok: false,
                error: `Too many wrong passwords. Try again in ${now.minutesLeft} minutes.`,
              },
              { status: 429, headers: { "Retry-After": String(now.minutesLeft * 60) } },
            );
          }
          return Response.json({ ok: false, error: "That password is not right." }, { status: 401 });
        }

        // The right password wipes that address's record, so an honest
        // mistype or two never accumulates into a lockout later.
        await clearFailures(ip);
        await pruneAttempts();

        const token = await createSession();
        await logAdmin("login", ip, clientCountry(request));
        return Response.json(
          { ok: true },
          { headers: { "Set-Cookie": sessionCookie(token), "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
