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
    <div className="pb-2 pt-8 md:pt-10">
      <Shell>
        {crumb ? <div className="mb-3 text-[14px] text-muted">{crumb}</div> : null}
        <h1 className="max-w-[20ch] text-[40px] text-ink md:text-[56px]">{title}</h1>
        {lead ? <p className="mt-3 max-w-[62ch] text-[17px] leading-relaxed text-muted">{lead}</p> : null}
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
    <Shell className="grid gap-6 py-6 lg:grid-cols-[230px_1fr] lg:gap-8">
      <aside className="h-fit rounded-[14px] border border-[#dbe7f3] bg-surface p-4 max-lg:hidden">
        <h2 className="ahe-plain px-2 pb-2 text-[15px] font-bold text-ink">Categories</h2>
        <ul>
          <li>
            <Link
              to="/shop"
              className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-[15px] transition-colors hover:bg-ground ${
                active === "all" ? "bg-[#e6f1fb] font-semibold text-ink" : "text-ink-soft"
              }`}
            >
              <span>Everything</span>
              {counts ? (
                <span className="tabular-nums text-muted">{Object.values(counts).reduce((a, b) => a + b, 0)}</span>
              ) : null}
            </Link>
          </li>
          {categories
            // An aisle with nothing in it is a dead end for a shopper. It drops
            // off the list and comes back on its own once a product is added.
            .filter((c) => !counts || (counts[c.slug] ?? 0) > 0 || c.slug === active)
            .map((c) => (
              <li key={c.slug}>
                <Link
                  to="/shop/$category"
                  params={{ category: c.slug }}
                  className={`flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-[15px] transition-colors hover:bg-ground ${
                    active === c.slug ? "bg-[#e6f1fb] font-semibold text-ink" : "text-ink-soft"
                  }`}
                >
                  <span className="leading-snug">{c.name}</span>
                  {counts ? <span className="tabular-nums text-muted">{counts[c.slug] ?? 0}</span> : null}
                </Link>
              </li>
            ))}
        </ul>
      </aside>

      <div className="min-w-0">
        {/* Phones and tablets: the category list as a row of chips to swipe. */}
        <nav aria-label="Categories" className="-mx-5 mb-4 overflow-x-auto px-5 lg:hidden">
          <ul className="flex w-max gap-2">
            <li>
              <Link
                to="/shop"
                className={`block whitespace-nowrap rounded-full border px-3.5 py-2 text-[14px] font-semibold ${
                  active === "all" ? "border-ink bg-ink text-surface" : "border-[#dbe7f3] bg-surface text-ink-soft"
                }`}
              >
                Everything
              </Link>
            </li>
            {categories
              .filter((c) => !counts || (counts[c.slug] ?? 0) > 0 || c.slug === active)
              .map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/shop/$category"
                    params={{ category: c.slug }}
                    className={`block whitespace-nowrap rounded-full border px-3.5 py-2 text-[14px] font-semibold ${
                      active === c.slug ? "border-ink bg-ink text-surface" : "border-[#dbe7f3] bg-surface text-ink-soft"
                    }`}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <p className="text-[15px] text-ink">
            <b>{products.length}</b> {products.length === 1 ? "item" : "items"}
          </p>
          <div className="flex flex-wrap items-center gap-1">
            {SORTS.map((s) => {
              const cls = `rounded-full px-3.5 py-1.5 text-[14px] font-semibold transition-colors ${
                s.value === sort ? "bg-ink text-surface" : "text-ink-soft hover:bg-surface hover:text-ink"
              }`;
              return active === "all" ? (
                <Link key={s.value} to="/shop" search={s.value === "featured" ? {} : { sort: s.value as never }} className={cls}>
                  {s.label}
                </Link>
              ) : (
                <Link
                  key={s.value}
                  to="/shop/$category"
                  params={{ category: active }}
                  search={s.value === "featured" ? {} : { sort: s.value as never }}
                  className={cls}
                >
                  {s.label}
                </Link>
              );
            })}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-[14px] border border-[#dbe7f3] bg-surface p-10 text-center">
            <p className="text-[14px] font-semibold text-muted">Out of stock</p>
            <p className="ahe-display mt-3 text-[30px] text-ink">
              {emptyNote ?? "Nothing in this category yet."}
            </p>
            <p className="mt-2 text-sm text-muted">Call the shop and we will tell you what we can order in.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.slug} p={p} />
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}

type TileProduct = { category: string; image: string; featured?: number };

/**
 * The main catalog page opens with the departments as picture tiles: a real
 * product photo from each one and how many items it holds. The five biggest
 * departments get large tiles; the rest line up as compact rows underneath.
 * Empty departments are left off, and reappear on their own once stocked.
 */
export function CategoryTiles({
  categories,
  counts,
  products,
}: {
  categories: Cat[];
  counts: Record<string, number>;
  products: TileProduct[];
}) {
  const photo = (slug: string) => {
    const inCat = products.filter((p) => p.category === slug && p.image);
    return (inCat.find((p) => p.featured) ?? inCat[0])?.image ?? "";
  };
  const stocked = categories.filter((c) => (counts[c.slug] ?? 0) > 0);
  const big = [...stocked].sort((a, b) => (counts[b.slug] ?? 0) - (counts[a.slug] ?? 0)).slice(0, 5);
  const bigSet = new Set(big.map((c) => c.slug));
  const main = stocked.filter((c) => bigSet.has(c.slug));
  const more = stocked.filter((c) => !bigSet.has(c.slug));
  const n = (slug: string) => `${counts[slug]} product${counts[slug] === 1 ? "" : "s"}`;

  return (
    <Shell className="pt-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-3.5 md:grid-cols-3 lg:grid-cols-5">
        {main.map((c, i) => (
          <Link
            key={c.slug}
            to="/shop/$category"
            params={{ category: c.slug }}
            // Phones show the big tiles two by two; a fifth would sit alone, so
            // it joins the compact list below instead.
            className={`${i === 4 ? "max-md:hidden " : ""}group flex flex-col rounded-[14px] border border-[#dbe7f3] bg-surface p-2.5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[#9db6cf] hover:shadow-[0_14px_30px_-22px_rgba(27,58,92,0.55)]`}
          >
            <span className="ahe-photo">
              {photo(c.slug) ? <img src={photo(c.slug)} alt="" loading="lazy" /> : null}
              <span className="ahe-display absolute left-2 top-2 z-[1] rounded bg-ink px-1.5 text-[12px] tracking-[0.04em] text-white">
                CH {String(i + 1).padStart(2, "0")}
              </span>
            </span>
            <span className="mt-auto px-1 pt-3 text-[16px] font-bold leading-snug text-ink">{c.name}</span>
            <span className="ahe-live px-1">{n(c.slug)}</span>
          </Link>
        ))}
      </div>
      {more.length > 0 || main.length === 5 ? (
        <>
          <p className="mt-5 text-[15px] font-bold text-ink-soft">More departments</p>
          <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {[...(main.length === 5 ? [main[4]] : []), ...more].map((c, i) => (
              <Link
                key={c.slug}
                to="/shop/$category"
                params={{ category: c.slug }}
                className={`${main.length === 5 && i === 0 ? "md:hidden " : ""}flex items-center gap-3 rounded-[14px] border border-[#dbe7f3] bg-surface p-2.5 transition-colors hover:border-[#9db6cf]`}
              >
                <span className="ahe-photo w-16 shrink-0">
                  {photo(c.slug) ? <img src={photo(c.slug)} alt="" loading="lazy" /> : null}
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-bold leading-snug text-ink">{c.name}</span>
                  <span className="ahe-live">{n(c.slug)}</span>
                </span>
              </Link>
            ))}
          </div>
        </>
      ) : null}
      <h2 className="mt-10 text-[32px] text-ink">All products</h2>
    </Shell>
  );
}
