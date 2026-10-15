import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";

import { StructuredData } from "../../components/StructuredData";
import { SiteShell } from "../../components/site/chrome";
import { IconShield, IconTruck } from "../../components/site/icons";
import { AddToCartButton, ProductCard, isAvailable } from "../../components/site/product-card";
import { ProductReviews, Stars, type ReviewData } from "../../components/site/reviews";
import { Shell } from "../../components/site/section";
import { getProductPage } from "../../lib/api/store.functions";
import { FREE_SHIPPING_THRESHOLD_CENTS, SHIPPING_FLAT_CENTS } from "../../lib/shipping";
import { ORIGIN, SITE, money, savings } from "../../lib/site";
import { parseSpecSheet, plainText, renderRichText, renderSpecSheet, specLinkLabel } from "../../lib/rich-text";

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

/**
 * Product data for Google, as schema.org JSON-LD.
 *
 * Without it Google sees a page of text and has to guess that it is a product,
 * what it costs and whether it is in stock. With it the page can show price
 * and availability in results and qualify for Google's free product listings.
 * Only facts the page itself shows go in: name, photos, brand, price, stock.
 */
function productJsonLd(
  p: { slug: string; name: string; brand: string; price_cents: number; blurb?: string; image: string },
  shots: string[],
  available: boolean,
  reviews?: ReviewData,
): string {
  const abs = (src: string) => (/^https?:\/\//.test(src) ? src : `${ORIGIN}${src.startsWith("/") ? "" : "/"}${src}`);
  const url = `${ORIGIN}/p/${p.slug}`;
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    url,
    image: (shots.length ? shots : [p.image]).filter(Boolean).slice(0, 10).map(abs),
    description: metaDescription(p.blurb, p.name),
    ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}),
    // Only approved reviews from verified buyers, exactly as shown on the
    // page. Left out entirely until there is at least one: Google's optional
    // "review" warning is harmless, a made-up rating is not.
    ...(reviews && reviews.summary.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: reviews.summary.average.toFixed(1),
            reviewCount: reviews.summary.count,
            bestRating: 5,
            worstRating: 1,
          },
          review: reviews.reviews.slice(0, 10).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.author },
            datePublished: r.date,
            reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
            ...(r.title ? { name: r.title } : {}),
            ...(r.body ? { reviewBody: r.body } : {}),
          })),
        }
      : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "USD",
      price: (p.price_cents / 100).toFixed(2),
      availability: available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE.name },
      // Matches the /shipping page: UPS, $14.95 flat in the US or free over
      // $199, ships within two business days, three to seven in transit.
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: (p.price_cents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_FLAT_CENTS / 100).toFixed(2),
          currency: "USD",
        },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 2, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 3, maxValue: 7, unitCode: "DAY" },
        },
      },
      // Matches the /returns page: ten days from delivery, returned by mail,
      // 15% restocking fee on every return.
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "US",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 10,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/RestockingFees",
        restockingFee: 15,
        merchantReturnLink: `${ORIGIN}/returns`,
      },
    },
  };
  // "</script>" inside a product name must not end the script tag early.
  return JSON.stringify(data).replace(/</g, "\\u003c");
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
  const { product, images, related, categoryName, reviews } = Route.useLoaderData();
  const shots = images && images.length > 0 ? images : product?.image ? [product.image] : [];
  const [shown, setShown] = useState(0);
  if (!product) return null;
  const main = shots[shown] ?? product.image;
  const save = savings(product.price_cents, product.msrp_cents);
  const available = isAvailable(product);

  return (
    <SiteShell>
      <StructuredData json={productJsonLd(product, shots, available, reviews)} />
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
          {reviews && reviews.summary.count > 0 ? (
            <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
              <Stars value={reviews.summary.average} />
              <span>
                {reviews.summary.average.toFixed(1)} · {reviews.summary.count}{" "}
                {reviews.summary.count === 1 ? "review" : "reviews"}
              </span>
            </a>
          ) : null}
          {product.blurb ? (
            <div className="mt-5 max-w-[58ch] text-base leading-relaxed text-muted">{renderRichText(product.blurb)}</div>
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
                Call the shop and we will tell you when the next shipment lands, or find you an equivalent.
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
            <a href={SITE.phoneHref} className="font-mono text-ink underline underline-offset-4 hover:text-signal">
              {SITE.phone}
            </a>{" "}
            and we will check it against your recorder before you buy.
          </p>
        </div>
      </Shell>

      {product.specs ? <Specifications text={product.specs} /> : null}

      <Shell>
        <ProductReviews
          slug={product.slug}
          data={reviews ?? { summary: { count: 0, average: 0, breakdown: [0, 0, 0, 0, 0] }, reviews: [] }}
        />
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

/** Rows shown before "Show all". Short sheets never collapse. */
const SPEC_PREVIEW_ROWS = 12;

/**
 * The spec sheet, full width below the product.
 *
 * It used to sit in the right-hand column between the description and the
 * price, so a long sheet pushed the price and the cart button a whole screen
 * down. Here it can be as long as the manufacturer made it.
 *
 * A long sheet is folded, not cut: every row is in the HTML, so search
 * engines index the whole thing and Ctrl-F still finds a figure, and the fold
 * is only a height limit that the button lifts.
 */
function Specifications({ text }: { text: string }) {
  const sheet = parseSpecSheet(text);
  const [open, setOpen] = useState(false);
  if (sheet.blocks.length === 0 && sheet.links.length === 0) return null;
  const foldable = sheet.rowCount > SPEC_PREVIEW_ROWS + 4;
  const folded = foldable && !open;

  return (
    <section className="border-t border-line py-14" aria-labelledby="specs-title">
      <Shell>
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
          <h2 id="specs-title" className="text-2xl font-semibold leading-none tracking-tighter text-ink">
            Specifications
          </h2>
          {sheet.links.length > 0 ? (
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {sheet.links.map((url) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-sm text-ink underline underline-offset-4 hover:text-signal"
                  >
                    {specLinkLabel(url)}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {sheet.blocks.length > 0 ? (
          <div className="mt-6 max-w-4xl">
            <div
              id="specs-body"
              className={`relative text-base leading-relaxed ${folded ? "max-h-[36rem] overflow-hidden" : ""}`}
            >
              {renderSpecSheet(sheet)}
              {folded ? (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ground to-transparent"
                />
              ) : null}
            </div>
            {foldable ? (
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="specs-body"
                className="mt-5 border border-ink px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-white"
              >
                {open ? "Show fewer" : `Show all ${sheet.rowCount} specifications`}
              </button>
            ) : null}
          </div>
        ) : null}
      </Shell>
    </section>
  );
}
