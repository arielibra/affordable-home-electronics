import { createFileRoute } from "@tanstack/react-router";

const PAGES = ["/", "/shop", "/security-cameras", "/installation", "/brands", "/about", "/contact", "/search", "/orders"];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const urls = PAGES.map(
          (p) =>
            `  <url><loc>${origin}${p === "/" ? "/" : p}</loc><changefreq>${p === "/" ? "daily" : "weekly"}</changefreq><priority>${p === "/" ? "1.0" : "0.7"}</priority></url>`,
        ).join("\n");
        const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(body, {
          headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
