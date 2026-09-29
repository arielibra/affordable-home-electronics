import { createFileRoute } from "@tanstack/react-router";

import { bindings } from "../../lib/bindings.server";

/**
 * Serves uploaded product photography out of R2. The bucket stays private and
 * everything goes through here, so the shop never has to think about public
 * bucket settings, and we can change where images live later without changing
 * a single stored URL.
 */
export const Route = createFileRoute("/media/$key")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const key = decodeURIComponent(new URL(request.url).pathname.slice("/media/".length));
        if (!/^p_[a-z0-9-]+\.[a-z0-9]+$/i.test(key)) {
          return new Response("Not found", { status: 404 });
        }

        const store = bindings().STORAGE;
        if (!store) return new Response("Not found", { status: 404 });

        const object = await store.get(key);
        if (!object) return new Response("Not found", { status: 404 });

        const headers = new Headers();
        headers.set("Content-Type", object.httpMetadata?.contentType ?? "application/octet-stream");
        // Keys are unique per upload and never reused, so this can cache hard.
        headers.set("Cache-Control", "public, max-age=31536000, immutable");
        if (object.httpEtag) headers.set("ETag", object.httpEtag);

        if (request.headers.get("if-none-match") === object.httpEtag) {
          return new Response(null, { status: 304, headers });
        }
        return new Response(object.body as unknown as BodyInit, { headers });
      },
    },
  },
});
