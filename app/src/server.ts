import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { legacyRedirect } from "./lib/legacy-redirect.server";
import { applySecurityHeaders } from "./lib/security-headers.server";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

type ScheduledCtx = { waitUntil: (p: Promise<unknown>) => void };

export default {
  /**
   * Once a day (the cron in wrangler.jsonc): ask buyers whose order shipped
   * two weeks ago for a review. Each order is asked once, ever.
   */
  async scheduled(_event: unknown, _env: unknown, ctx: ScheduledCtx) {
    // Loaded on demand, not imported at the top: a static import pulls the
    // shared store code into this entry file, the bundler then exports those
    // helpers from it, and workerd refuses to start a Worker whose entry
    // exports anything that is not a handler.
    ctx.waitUntil(
      import("./lib/reviews.server")
        .then((m) => m.sendDueReviewRequests())
        .then((r) => console.log(`review requests: ${r.sent} sent, ${r.skipped} skipped`))
        .catch((err) => console.error("review requests failed", err)),
    );
  },

  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      // One address per page: www. and trailing slashes both 301 to the
      // plain form in a single hop, so ten years of www rankings move over.
      let moved = false;
      if (url.hostname.startsWith("www.")) {
        url.hostname = url.hostname.slice(4);
        moved = true;
      }
      if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
        url.pathname = url.pathname.replace(/\/+$/, "") || "/";
        moved = true;
      }
      if (moved) return Response.redirect(url.toString(), 301);
      const handler = await getServerEntry();
      // Old-site addresses Google still links to (…/something.aspx).
      const legacy = await legacyRedirect(url);
      if (legacy) return applySecurityHeaders(legacy);
      const response = await handler.fetch(request, env, ctx);
      return applySecurityHeaders(await normalizeCatastrophicSsrResponse(response));
    } catch (error) {
      console.error(error);
      return applySecurityHeaders(
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
      );
    }
  },
};
