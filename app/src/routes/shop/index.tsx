import { createFileRoute } from "@tanstack/react-router";

import { CatalogBody, CatalogHeader } from "../../components/shop/catalog";
import { SiteShell } from "../../components/site/chrome";
import { getShop } from "../../lib/api/store.functions";
import { ORIGIN } from "../../lib/site";

type Sort = "featured" | "price-asc" | "price-desc" | "name";
const SORTS: Sort[] = ["featured", "price-asc", "price-desc", "name"];

export const Route = createFileRoute("/shop/")({
  validateSearch: (s: Record<string, unknown>): { sort: Sort } => {
    const raw = String(s.sort ?? "featured");
    return { sort: (SORTS as string[]).includes(raw) ? (raw as Sort) : "featured" };
  },
  loaderDeps: ({ search }) => ({ sort: search.sort }),
  loader: ({ deps }) => getShop({ data: { sort: deps.sort } }),
  head: () => ({
    meta: [
      { title: "Catalog | Affordable Home Electronics" },
      {
        name: "description",
        content:
          "The full counter: security cameras, DVRs and NVRs, complete systems, access control, doorbells and the parts that finish an install.",
      },
    ],
    links: [{ rel: "canonical", href: `${ORIGIN}/shop` }],
  }),
  component: ShopIndex,
});

function ShopIndex() {
  const { categories, counts, products } = Route.useLoaderData();
  const { sort } = Route.useSearch();
  return (
    <SiteShell>
      <CatalogHeader
        title="Everything on the counter."
        lead="Real stock at the price we sell it for. Every item is genuine USA product from an authorized dealer, with the manufacturer warranty behind it."
      />
      <CatalogBody categories={categories} counts={counts} active="all" sort={sort} products={products} />
    </SiteShell>
  );
}
