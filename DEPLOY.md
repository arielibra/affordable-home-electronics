# Moving this site to Cloudflare and GitHub

Nothing here is required while the site still lives on Higgsfield. This is the
recipe for when you are ready to move.

## Why not GitHub Pages

GitHub Pages serves static files only. This site renders every page on a server
and reads its catalog, carts, orders and quote requests from a database, so it
cannot run there without gutting the store. Cloudflare Workers runs it as is,
on a free plan.

## What you need

1. A free Cloudflare account.
2. A GitHub account and an empty repository.

## Steps

### 1. Create the database

In the Cloudflare dashboard: **Storage & Databases -> D1 -> Create database**.
Name it `affordable-home-electronics-db`. Copy the **Database ID** it shows you
and paste it into `app/wrangler.jsonc`, replacing
`PASTE_YOUR_D1_DATABASE_ID_HERE`. The Database ID is not a secret.

### 2. Create the API token

In the Cloudflare dashboard: **My Profile -> API Tokens -> Create Token**, using
the **Edit Cloudflare Workers** template. Also note your **Account ID** from the
dashboard sidebar. Keep both private.

### 3. Put the code on GitHub

Create an empty repository, then from this folder:

    git init
    git add -A
    git commit -m "Affordable Home Electronics website"
    git branch -M main
    git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
    git push -u origin main

### 4. Add the secrets

In the GitHub repository: **Settings -> Secrets and variables -> Actions -> New
repository secret**. Add two:

- `CLOUDFLARE_API_TOKEN` — the token from step 2
- `CLOUDFLARE_ACCOUNT_ID` — your Cloudflare account id

Enter these yourself. They should never be pasted into a chat.

### 5. Push

Every push to `main` now runs `.github/workflows/deploy.yml`, which typechecks,
builds, applies any new database migrations and deploys the Worker. The first
run seeds the catalog from `app/migrations/0003_seed.sql`.

Your site will be at `affordable-home-electronics.<your-subdomain>.workers.dev`.

### 6. Point the real domain at it

In the Cloudflare dashboard, add `affordablehomeelectronics.com` as a zone, then
under the Worker add a custom domain route. Cloudflare issues the certificate.

## Running it locally

    cd app
    bun install
    bun run db:migrate:local
    bun run dev
