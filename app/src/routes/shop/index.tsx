import { createFileRoute } from "@tanstack/react-router";

import { CatalogBody, CatalogHeader } from "../../components/shop/catalog";
import { SiteShell } from "../../components/site/chrome";
import { getShop } from "../../lib/api/store.functions";
import { ORIGIN } from "../../lib/site";
import { JsonLd } from "../../components/JsonLd";
import { STORE_ID, pageJsonLd } from "../../lib/structured-data";

type Sort = "featured" | "price-asc" | "price-desc" | "name";
const SORTS: Sort[] = ["featured", "price-asc", "price-desc", "name"];

export const Route = createFileRoute("/shop/")({
  validateSearch: (s: Record<string, unknown>): { sort?: Sort } => {
    const raw = String(s.sort ?? "featured");
    return { sort: (SORTS as string[]).includes(raw) ? (raw as Sort) : "featured" };
  },
  loaderDeps: ({ search }) => ({ sort: search.sort ?? ("featured" as Sort) }),
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
  const sort = Route.useSearch().sort ?? "featured";
  return (
    <SiteShell>
      <JsonLd json={pageJsonLd({ type: "CollectionPage", path: "/shop", name: "Catalog", description: "Every product we sell, by category.", crumbs: [{ name: "Catalog", path: "/shop" }], mainEntity: { "@type": "ItemList", numberOfItems: categories.length, itemListElement: categories.map((c, i) => ({ "@type": "ListItem", position: i + 1, url: `${ORIGIN}/shop/${c.slug}`, name: c.name })) } })} />
      <CatalogHeader
        title="Everything on the counter."
        lead="Real stock at the price we sell it for. Every item is genuine USA product from an authorized dealer, with the manufacturer warranty behind it."
      />
      <CatalogBody categories={categories} counts={counts} active="all" sort={sort} products={products} />
    </SiteShell>
  );
}
