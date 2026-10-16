import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { CatalogBody, CatalogHeader } from "../../components/shop/catalog";
import { SiteShell } from "../../components/site/chrome";
import { getCategoryPage } from "../../lib/api/store.functions";
import { ORIGIN } from "../../lib/site";
import { STORE_ID, WEBSITE_ID, abs, breadcrumbs, toJsonLd } from "../../lib/structured-data";

type Sort = "featured" | "price-asc" | "price-desc" | "name";
const SORTS: Sort[] = ["featured", "price-asc", "price-desc", "name"];

export const Route = createFileRoute("/shop/$category")({
  validateSearch: (s: Record<string, unknown>): { sort?: Sort } => {
    const raw = String(s.sort ?? "featured");
    return { sort: (SORTS as string[]).includes(raw) ? (raw as Sort) : "featured" };
  },
  loaderDeps: ({ search }) => ({ sort: search.sort ?? ("featured" as Sort) }),
  loader: async ({ params, deps }) => {
    const data = await getCategoryPage({ data: { slug: params.category, sort: deps.sort } });
    if (!data.category) throw notFound();
    return data;
  },
  head: ({ params, loaderData }) => {
    const c = loaderData?.category;
    const n = loaderData?.products.length ?? 0;
    const title = c ? `${c.name} | Affordable Home Electronics` : "Affordable Home Electronics";
    const description = c
      ? (c.blurb?.trim() || `Shop ${c.name.toLowerCase()} at Affordable Home Electronics.`) +
        ` ${n} ${n === 1 ? "item" : "items"} from an authorized dealer in Queens, NY, shipped across the US.`
      : "";
    return {
      meta: [
        { title },
        ...(description ? [{ name: "description", content: description }] : []),
        { property: "og:title", content: title },
        ...(description ? [{ property: "og:description", content: description }] : []),
        // An empty aisle has nothing to rank for; keep it out of the index until it is stocked.
        ...(c && n === 0 ? [{ name: "robots", content: "noindex, follow" }] : []),
      ],
      links: [{ rel: "canonical", href: `${ORIGIN}/shop/${params.category}` }],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { categories, category, products } = Route.useLoaderData();
  const sort = Route.useSearch().sort ?? "featured";
  if (!category) return null;
  const url = `${ORIGIN}/shop/${category.slug}`;
  // What this aisle holds, in the order shown, for search engines and assistants.
  const json = toJsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": url,
        url,
        name: category.name,
        ...(category.blurb ? { description: category.blurb } : {}),
        isPartOf: { "@id": WEBSITE_ID },
        provider: { "@id": STORE_ID },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: products.length,
          itemListElement: products.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${ORIGIN}/p/${p.slug}`,
            name: p.name,
            ...(p.image ? { image: abs(p.image) } : {}),
          })),
        },
      },
      breadcrumbs([
        { name: "Catalog", path: "/shop" },
        { name: category.name, path: `/shop/${category.slug}` },
      ]),
    ],
  });
  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      <CatalogHeader
        title={category.name}
        lead={category.blurb}
        crumb={
          <>
            <Link to="/shop" className="hover:text-signal">
              Catalog
            </Link>
            <span className="mx-2 text-line">/</span>
            <span className="text-ink">{category.name}</span>
          </>
        }
      />
      <CatalogBody
        categories={categories}
        active={category.slug}
        sort={sort}
        products={products}
        emptyNote={`We are between shipments on ${category.name.toLowerCase()}.`}
      />
    </SiteShell>
  );
}
