import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { CatalogBody, CatalogHeader } from "../../components/shop/catalog";
import { SiteShell } from "../../components/site/chrome";
import { getCategoryPage } from "../../lib/api/store.functions";
import { ORIGIN } from "../../lib/site";

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
  head: ({ params }) => ({
    links: [{ rel: "canonical", href: `${ORIGIN}/shop/${params.category}` }],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { categories, category, products } = Route.useLoaderData();
  const sort = Route.useSearch().sort ?? "featured";
  if (!category) return null;
  return (
    <SiteShell>
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
