import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ProductCard } from "../components/site/product-card";
import { SiteShell } from "../components/site/chrome";
import { IconSearch } from "../components/site/icons";
import { Shell } from "../components/site/section";
import { searchCatalog } from "../lib/api/store.functions";
import { ORIGIN } from "../lib/site";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): { q?: string } => ({ q: String(s.q ?? "").slice(0, 80) }),
  loaderDeps: ({ search }) => ({ q: search.q ?? "" }),
  loader: ({ deps }) => searchCatalog({ data: { q: deps.q } }),
  head: () => ({
    meta: [{ title: "Search the catalog | Affordable Home Electronics" }],
    links: [{ rel: "canonical", href: `${ORIGIN}/search` }],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { products, q } = Route.useLoaderData();
  const [term, setTerm] = useState(q);
  const navigate = Route.useNavigate();

  return (
    <SiteShell>
      <div className="border-b border-line bg-surface py-12">
        <Shell>
          <h1 className="text-4xl font-semibold leading-none tracking-tighter text-ink md:text-5xl">Find the part.</h1>
          <p className="mt-4 max-w-[58ch] text-base leading-relaxed text-muted">
            Search by model, part number or brand. If it is not listed, call the shop and we will check what we can order.
          </p>
          <form
            className="mt-8 flex max-w-[620px] gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void navigate({ search: { q: term } });
            }}
          >
            <label htmlFor="q" className="sr-only">
              Search the catalog
            </label>
            <input
              id="q"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="LTS CMIP, Anviz C2, 8 channel NVR"
              maxLength={80}
              className="h-12 w-full border border-line bg-surface px-4 text-sm text-ink placeholder:text-muted/70 focus:border-ink focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex h-12 shrink-0 items-center gap-2 bg-ink px-6 text-sm font-medium text-surface active:scale-[0.98]"
            >
              <IconSearch className="h-4 w-4" /> Search
            </button>
          </form>
        </Shell>
      </div>

      <Shell className="py-12">
        {q.trim().length < 2 ? (
          <p className="text-sm text-muted">Type at least two characters to search the catalog.</p>
        ) : products.length === 0 ? (
          <div className="border border-line bg-surface p-10 text-center">
            <img src="/assets/empty-box.png" alt="" width={1168} height={880} className="mx-auto h-40 w-auto object-contain" />
            <p className="mt-6 text-base text-ink">Nothing matched &ldquo;{q}&rdquo;.</p>
            <p className="mt-2 text-sm text-muted">
              Try a shorter term, or{" "}
              <Link to="/shop" className="text-ink underline underline-offset-4 hover:text-signal">
                browse the catalog
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            <p className="border-b border-line pb-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
              {products.length} {products.length === 1 ? "match" : "matches"} for {q}
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.slug} p={p} />
              ))}
            </div>
          </>
        )}
      </Shell>
    </SiteShell>
  );
}
