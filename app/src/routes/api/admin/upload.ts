import { createFileRoute } from "@tanstack/react-router";

import { denied, isSignedIn, logAdmin } from "../../../lib/admin.server";
import { fetchImageFromUrl, mediaEnabled, storeImage, storeImageFromUrl } from "../../../lib/media.server";

/**
 * Takes a photo two ways and answers the same either way: a file picked off
 * the shop's computer (multipart), or the address of an image on a
 * manufacturer's site (JSON). Both end up stored as ours.
 */
export const Route = createFileRoute("/api/admin/upload")({
  server: {
    handlers: {
      /**
       * Fetch-through without storing: hands a manufacturer's image back to
       * the admin's browser so it can be shrunk before it is kept. Signed-in
       * only, or it would be an open proxy billed to the shop.
       */
      GET: async ({ request }) => {
        if (!(await isSignedIn(request))) return denied();
        const from = new URL(request.url).searchParams.get("url") ?? "";
        if (!from) return Response.json({ ok: false, error: "No address given." }, { status: 400 });
        try {
          const { data, type } = await fetchImageFromUrl(from);
          return new Response(data, { headers: { "Content-Type": type, "Cache-Control": "no-store" } });
        } catch (error) {
          const message = error instanceof Error ? error.message : "That image could not be fetched.";
          return Response.json({ ok: false, error: message }, { status: 400 });
        }
      },
      POST: async ({ request }) => {
        if (!(await isSignedIn(request))) return denied();
        if (!mediaEnabled()) {
          return Response.json({ ok: false, error: "Image storage is not switched on yet." }, { status: 503 });
        }

        const contentType = request.headers.get("content-type") ?? "";

        try {
          if (contentType.includes("multipart/form-data")) {
            const form = await request.formData();
            const file = form.get("file");
            if (!(file instanceof File)) {
              return Response.json({ ok: false, error: "No file arrived." }, { status: 400 });
            }
            const stored = await storeImage(await file.arrayBuffer(), file.type || "application/octet-stream");
            await logAdmin("image_upload", stored.key, `${(stored.bytes / 1024).toFixed(0)}kb ${file.name}`);
            return Response.json({ ok: true, url: stored.url });
          }

          const body = (await request.json()) as { url?: unknown };
          const from = typeof body.url === "string" ? body.url : "";
          if (!from) return Response.json({ ok: false, error: "No address given." }, { status: 400 });

          const stored = await storeImageFromUrl(from);
          await logAdmin("image_import", stored.key, from.slice(0, 200));
          return Response.json({ ok: true, url: stored.url });
        } catch (error) {
          const message = error instanceof Error ? error.message : "That image could not be saved.";
          return Response.json({ ok: false, error: message }, { status: 400 });
        }
      },
    },
  },
});
