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
          // Google's Storebot checks that the checkout link (/cart?add={id})
          // works, and reads the payment methods on /checkout (PayPal counts
          // as an e-wallet in Merchant Center's store quality score). It is a
          // shopping crawler, not web search, so this does not index the
          // checkout. A crawler obeys only its own group, so repeat the rest.
          'User-agent: Storebot-Google',
          'Allow: /',
          'Allow: /cart',
          'Allow: /checkout',
          'Disallow: /admin',
          'Disallow: /api/',
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
