# Affordable Home Electronics

The website and storefront for Affordable Home Electronics, 62-65 Saunders Street,
Rego Park, NY 11374.

## What this is

A server-rendered React 19 + TanStack Start application that deploys as a single
Cloudflare Worker, with a D1 (SQLite) database behind it. The project lives in
`app/`; run every command from there.

It is NOT a static site. It needs a server at runtime for:

- every page (server-side rendering)
- the product catalog, read from D1
- the cart, stored in D1 and keyed by the `ahe_cart` cookie
- order placement and quote requests, written to D1

## Layout

    app/src/routes/          pages (file based routing)
    app/src/components/      site chrome, home sections, shop, forms
    app/src/lib/             business data, server functions, D1 access
    app/migrations/          D1 schema (0002) and the seeded catalog (0003)
    app/public/assets/       brand imagery and 127 product photographs
    app/design-brief.md      the design system, palette and type decisions

## Local development

    cd app
    bun install
    bun run dev

`bun run typecheck` runs tsc. `bun run build` produces `dist/server/server.js`
(the Worker) and `dist/client`.

## Deploying

Currently deployed through the Higgsfield platform, which provisions the D1
database from `app/app.manifest.json` and applies `app/migrations/*.sql` on each
deploy.

To host it anywhere else, the target must be able to run a server. Cloudflare
Workers is the closest fit because the D1 binding carries over unchanged. Static
hosts such as GitHub Pages cannot run this build without removing the database
and the server functions.

## The store

Checkout deliberately takes no card details. It records the order, returns an
`AHE-` reference and tells the customer the shop will call to confirm stock,
shipping and the total. Quote requests land in the `quote_requests` table.
Neither currently sends email; read them from the database.
