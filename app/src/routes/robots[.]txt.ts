import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin
        const body = [
          'User-agent: *',
          'Allow: /',
          'Disallow: /admin',
          'Disallow: /api/',
          'Disallow: /cart',
          'Disallow: /checkout',
          'Disallow: /order-confirmed',
          '',
          `Sitemap: ${origin}/sitemap.xml`,
        ].join('\n')
        return new Response(body, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=86400',
          },
        })
      },
    },
  },
})
