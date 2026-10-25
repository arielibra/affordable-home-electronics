import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { SiteShell } from "../components/site/chrome";
import { ProductCard } from "../components/site/product-card";
import { Shell } from "../components/site/section";
import { getBrandPage } from "../lib/api/store.functions";
import { ORIGIN } from "../lib/site";
import { STORE_ID, WEBSITE_ID, abs, breadcrumbs, toJsonLd } from "../lib/structured-data";

type Sort = "featured" | "price-asc" | "price-desc" | "name";
const SORTS: { value: Sort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price, low first" },
  { value: "price-desc", label: "Price, high first" },
  { value: "name", label: "Name" },
];

/**
 * Everything one brand has on the shelf: /brands/<slug>, opened from the
 * brand wall on /brands. "featured" is the default sort and is kept out of the
 * address so search engines meet one URL per brand, as on the category pages.
 */
export const Route = createFileRoute("/brands_/$brand")({
  validateSearch: (s: Record<string, unknown>): { sort?: Sort } => {
    const raw = String(s.sort ?? "");
    return raw !== "featured" && SORTS.some((o) => o.value === raw) ? { sort: raw as Sort } : {};
  },
  loaderDeps: ({ search }) => ({ sort: search.sort ?? ("featured" as Sort) }),
  loader: async ({ params, deps }) => {
    const data = await getBrandPage({ data: { slug: params.brand, sort: deps.sort } });
    if (!data.brand) throw notFound();
    return data;
  },
  head: ({ params, loaderData }) => {
    const b = loaderData?.brand;
    const n = loaderData?.products.length ?? 0;
    const title = b ? `${b.brand} | Affordable Home Electronics` : "Affordable Home Electronics";
    const description = b
      ? `Shop ${b.brand} at Affordable Home Electronics: ${n} ${n === 1 ? "item" : "items"} from an authorized dealer in Queens, NY, with the full manufacturer warranty and shipping across the US.`
      : "";
    return {
      meta: [
        { title },
        ...(description ? [{ name: "description", content: description }] : []),
        { property: "og:title", content: title },
        ...(description ? [{ property: "og:description", content: description }] : []),
        ...(b && n === 0 ? [{ name: "robots", content: "noindex, follow" }] : []),
      ],
      links: [{ rel: "canonical", href: `${ORIGIN}/brands/${params.brand}` }],
    };
  },
  component: BrandPage,
});

function BrandPage() {
  const { brand, products } = Route.useLoaderData();
  const sort = Route.useSearch().sort ?? "featured";
  if (!brand) return null;
  const url = `${ORIGIN}/brands/${brand.slug}`;
  const n = products.length;

  const json = toJsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": url,
        url,
        name: `${brand.brand} products`,
        isPartOf: { "@id": WEBSITE_ID },
        provider: { "@id": STORE_ID },
        about: { "@type": "Brand", name: brand.brand, ...(brand.logo ? { logo: abs(brand.logo) } : {}) },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: n,
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
        { name: "Brands", path: "/brands" },
        { name: brand.brand, path: `/brands/${brand.slug}` },
      ]),
    ],
  });

  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      <Shell className="pb-2 pt-8 md:pt-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-[14px] text-muted">
          <Link to="/brands" className="hover:text-signal">
            Brands
          </Link>
          <span className="mx-2 text-muted">/</span>
          <span className="font-semibold text-ink">{brand.brand}</span>
        </nav>

        <div className="flex flex-wrap items-center gap-5 md:gap-7">
          {brand.logo ? (
            <span className="flex h-24 w-40 shrink-0 items-center justify-center rounded-[16px] border border-[#dbe7f3] bg-surface p-4 md:h-28 md:w-48">
              <img src={brand.logo} alt={`${brand.brand} logo`} className="max-h-full max-w-full object-contain" />
            </span>
          ) : null}
          <div className="min-w-0">
            <h1 className="text-[40px] leading-none text-ink md:text-[56px]">{brand.brand}</h1>
            <p className="mt-2 text-[16px] text-muted">
              <span className="ahe-live">
                {n} {n === 1 ? "item" : "items"} listed
              </span>
              <span className="mx-2">·</span>
              Authorized dealer, full manufacturer warranty
            </p>
          </div>
        </div>
        {brand.blurb ? <p className="mt-4 max-w-[62ch] text-[17px] leading-relaxed text-muted">{brand.blurb}</p> : null}
      </Shell>

      <Shell className="py-6">
        {n > 1 ? (
          <div className="mb-5 flex flex-wrap items-center gap-2 text-[14px]">
            <span className="mr-1 text-muted">Sort</span>
            {SORTS.map((o) => (
              <Link
                key={o.value}
                to="/brands/$brand"
                params={{ brand: brand.slug }}
                search={o.value === "featured" ? {} : { sort: o.value }}
                className={`rounded-full px-3.5 py-1.5 font-medium transition-colors ${
                  sort === o.value ? "bg-ink text-surface" : "bg-surface text-ink-soft shadow-[inset_0_0_0_1px_#dbe7f3] hover:shadow-[inset_0_0_0_1px_#9db6cf]"
                }`}
              >
                {o.label}
              </Link>
            ))}
          </div>
        ) : null}

        {n === 0 ? (
          <p className="rounded-[14px] border border-[#dbe7f3] bg-surface p-6 text-[16px] text-muted">
            Nothing from {brand.brand} is listed right now.{" "}
            <Link to="/contact" className="font-semibold text-signal underline underline-offset-4">
              Ask us
            </Link>{" "}
            and we will tell you what we can order.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <li key={p.slug} className="min-w-0">
                <ProductCard p={p} />
              </li>
            ))}
          </ul>
        )}

        <p className="mt-10 text-[15px] text-muted">
          <Link to="/brands" className="font-semibold text-signal underline underline-offset-4 hover:text-ink">
            See all brands
          </Link>
        </p>
      </Shell>
    </SiteShell>
  );
}
