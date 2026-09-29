import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { ProductCard, type CardProduct } from "../site/product-card";
import { Shell } from "../site/section";

export type Cat = { slug: string; name: string; blurb: string };

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price, low first" },
  { value: "price-desc", label: "Price, high first" },
  { value: "name", label: "Name" },
] as const;

export function CatalogHeader({ title, lead, crumb }: { title: string; lead: string; crumb?: ReactNode }) {
  return (
    <div className="border-b border-line bg-surface py-12">
      <Shell>
        {crumb ? <div className="mb-5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{crumb}</div> : null}
        <h1 className="max-w-[18ch] text-4xl font-semibold leading-[1.0] tracking-tighter text-ink md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-muted">{lead}</p>
      </Shell>
    </div>
  );
}

export function CatalogBody({
  categories,
  counts,
  active,
  sort,
  products,
  emptyNote,
}: {
  categories: Cat[];
  counts?: Record<string, number>;
  active: string;
  sort: string;
  products: CardProduct[];
  emptyNote?: string;
}) {
  return (
    <Shell className="grid gap-10 py-12 lg:grid-cols-[220px_1fr] lg:gap-12">
      <aside>
        <h2 className="border-b border-line pb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Categories</h2>
        <ul className="mt-1">
          <li>
            <Link
              to="/shop"
              className={`flex items-center justify-between border-b border-line py-3 text-sm transition-colors hover:text-signal ${
                active === "all" ? "text-ink" : "text-muted"
              }`}
            >
              <span>Everything</span>
              {counts ? (
                <span className="font-mono text-[11px] text-muted">
                  {Object.values(counts).reduce((a, b) => a + b, 0)}
                </span>
              ) : null}
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                to="/shop/$category"
                params={{ category: c.slug }}
                className={`flex items-center justify-between gap-3 border-b border-line py-3 text-sm transition-colors hover:text-signal ${
                  active === c.slug ? "text-ink" : "text-muted"
                }`}
              >
                <span className="leading-snug">{c.name}</span>
                {counts ? <span className="font-mono text-[11px] text-muted">{counts[c.slug] ?? 0}</span> : null}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            {products.length} {products.length === 1 ? "item" : "items"}
          </p>
          <div className="flex flex-wrap items-center gap-1">
            {SORTS.map((s) => {
              const cls = `px-3 py-1.5 text-xs transition-colors ${
                s.value === sort ? "bg-ink text-surface" : "text-muted hover:text-ink"
              }`;
              return active === "all" ? (
                <Link key={s.value} to="/shop" search={{ sort: s.value }} className={cls}>
                  {s.label}
                </Link>
              ) : (
                <Link
                  key={s.value}
                  to="/shop/$category"
                  params={{ category: active }}
                  search={{ sort: s.value }}
                  className={cls}
                >
                  {s.label}
                </Link>
              );
            })}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="border border-line bg-surface p-10 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Out of stock</p>
            <p className="mt-4 text-2xl font-semibold tracking-tight text-ink">
              {emptyNote ?? "Nothing in this category yet."}
            </p>
            <p className="mt-2 text-sm text-muted">Email us and we will tell you what we can order in.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.slug} p={p} />
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
