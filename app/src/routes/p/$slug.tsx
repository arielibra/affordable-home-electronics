import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";

import { SiteShell } from "../../components/site/chrome";
import { IconShield, IconTruck } from "../../components/site/icons";
import { AddToCartButton, ProductCard, isAvailable } from "../../components/site/product-card";
import { Shell } from "../../components/site/section";
import { getProductPage } from "../../lib/api/store.functions";
import { ORIGIN, SITE, money, savings } from "../../lib/site";
import { plainText, renderRichText, renderSpecs } from "../../lib/rich-text";

/** Search engines show about 160 characters and drop the rest, so the full
 *  description does not belong in the head — it would sit in the page source of
 *  every product and be read by no one. Cut on a word, never mid-word. */
function metaDescription(blurb: string | undefined, fallback: string): string {
  const text = plainText(blurb);
  if (!text) return fallback;
  if (text.length <= 160) return text;
  const cut = text.slice(0, 160);
  const space = cut.lastIndexOf(" ");
  return `${(space > 100 ? cut.slice(0, space) : cut).trimEnd()}\u2026`;
}

export const Route = createFileRoute("/p/$slug")({
  loader: async ({ params }) => {
    const data = await getProductPage({ data: { slug: params.slug } });
    if (!data.product) throw notFound();
    return data;
  },
  head: ({ loaderData, params }) => ({
    meta: loaderData?.product
      ? [
          { title: `${loaderData.product.name} | Affordable Home Electronics` },
          { name: "description", content: metaDescription(loaderData.product.blurb, loaderData.product.name) },
          { property: "og:image", content: `${ORIGIN}${loaderData.product.image}` },
        ]
      : [],
    links: [{ rel: "canonical", href: `${ORIGIN}/p/${params.slug}` }],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { product, images, related, categoryName } = Route.useLoaderData();
  const shots = images && images.length > 0 ? images : product?.image ? [product.image] : [];
  const [shown, setShown] = useState(0);
  if (!product) return null;
  const main = shots[shown] ?? product.image;
  const save = savings(product.price_cents, product.msrp_cents);
  const available = isAvailable(product);

  return (
    <SiteShell>
      <Shell className="py-8">
        <nav className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted" aria-label="Breadcrumb">
          <Link to="/shop" className="hover:text-signal">
            Catalog
          </Link>
          <span className="mx-2 text-line">/</span>
          <Link to="/shop/$category" params={{ category: product.category }} className="hover:text-signal">
            {categoryName}
          </Link>
        </nav>
      </Shell>

      <Shell className="grid gap-10 pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <figure className="border border-line bg-white p-8">
            <img
              src={main}
              alt={product.name}
              width={520}
              height={520}
              className="mx-auto h-[320px] w-auto max-w-full object-contain md:h-[440px]"
            />
          </figure>

          {/* Only worth showing when there is actually a choice to make. */}
          {shots.length > 1 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {shots.map((src, i) => (
                <li key={src}>
                  <button
                    type="button"
                    onClick={() => setShown(i)}
                    aria-label={`Photo ${i + 1} of ${shots.length}`}
                    aria-current={i === shown}
                    className={`flex h-16 w-16 items-center justify-center border bg-white p-1 transition-colors ${
                      i === shown ? "border-ink" : "border-line hover:border-muted"
                    }`}
                  >
                    <img src={src} alt="" className="h-full w-full object-contain" loading="lazy" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{product.brand}</p>
          <h1 className="mt-3 text-3xl font-semibold leading-[1.06] tracking-tighter text-ink md:text-4xl">{product.name}</h1>
          {product.blurb ? (
            <div className="mt-5 max-w-[58ch] text-base leading-relaxed text-muted">{renderRichText(product.blurb)}</div>
          ) : null}
          {product.specs ? (
            <div className="mt-7 max-w-[58ch]">
              <h2 className="text-sm font-semibold tracking-tight text-ink">Specifications</h2>
              <div className="mt-2 text-base leading-relaxed">{renderSpecs(product.specs)}</div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap items-end gap-4 border-t border-line pt-6">
            <span className="font-mono text-4xl leading-none tracking-tighter text-ink">{money(product.price_cents)}</span>
            {product.msrp_cents && product.msrp_cents > product.price_cents ? (
              <span className="font-mono text-base leading-none text-muted line-through">{money(product.msrp_cents)}</span>
            ) : null}
            {save ? (
              <span className="bg-signal px-2 py-1 font-mono text-[11px] leading-none text-white">Save {save}%</span>
            ) : null}
          </div>

          <div className="mt-6 max-w-[380px]">
            <AddToCartButton slug={product.slug} soldOut={!available} />
            {available && product.stock_tracked === 1 && product.stock <= 3 ? (
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-signal">
                Only {product.stock} left
              </p>
            ) : null}
            {!available ? (
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Email us and we will tell you when the next shipment lands, or find you an equivalent.
              </p>
            ) : null}
          </div>

          <dl className="mt-10 border-t border-line">
            <div className="flex gap-4 border-b border-line py-5">
              <IconShield className="mt-0.5 h-5 w-5 shrink-0 text-ink" />
              <div>
                <dt className="text-sm font-medium text-ink">Authorized dealer stock</dt>
                <dd className="mt-1 max-w-[52ch] text-sm leading-relaxed text-muted">
                  Sealed USA retail product with the full manufacturer warranty and every accessory the factory packed.
                </dd>
              </div>
            </div>
            <div className="flex gap-4 border-b border-line py-5">
              <IconTruck className="mt-0.5 h-5 w-5 shrink-0 text-ink" />
              <div>
                <dt className="text-sm font-medium text-ink">Shipping</dt>
                <dd className="mt-1 max-w-[52ch] text-sm leading-relaxed text-muted">
                  Ships anywhere in the United States and Canada. NYC installation can be added to the order.
                </dd>
              </div>
            </div>
          </dl>

          <p className="mt-6 text-sm leading-relaxed text-muted">
            Questions on compatibility or channel count? Call{" "}
            <a href={SITE.emailHref} className="font-mono text-ink underline underline-offset-4 hover:text-signal">
              {SITE.email}
            </a>{" "}
            and we will check it against your recorder before you buy.
          </p>
        </div>
      </Shell>

      {related.length > 0 ? (
        <section className="border-t border-line bg-surface py-14">
          <Shell>
            <h2 className="border-b border-line pb-4 text-2xl font-semibold leading-none tracking-tighter text-ink">
              Sits near it on the shelf
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <ProductCard key={r.slug} p={r} />
              ))}
            </div>
          </Shell>
        </section>
      ) : null}
    </SiteShell>
  );
}
