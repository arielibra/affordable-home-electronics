import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { StructuredData } from "../../components/StructuredData";
import { SiteShell } from "../../components/site/chrome";
import { IconShield, IconTruck } from "../../components/site/icons";
import { AddToCartButton, ProductCard, isAvailable, stockLabel } from "../../components/site/product-card";
import { ProductReviews, Stars, type ReviewData } from "../../components/site/reviews";
import { Shell } from "../../components/site/section";
import { getProductPage } from "../../lib/api/store.functions";
import { FREE_SHIPPING_MAX_LB, FREE_SHIPPING_THRESHOLD_CENTS } from "../../lib/shipping";
import { ORIGIN, SITE, money, savings } from "../../lib/site";
import { parseSpecSheet, renderRichText, renderSpecSheet, specLinkLabel } from "../../lib/rich-text";
import { pageDescription, pageKeywords, pageTitle } from "../../lib/seo";
import { parseBadges, parseHighlights, type Badge } from "../../lib/badges";
import type { ResolvedOption } from "../../lib/options";
import { STORE_ID, abs, breadcrumbs, structuredName, toJsonLd } from "../../lib/structured-data";
import { gaItem, track } from "../../lib/analytics";

/**
 * Product data for Google, as schema.org JSON-LD.
 *
 * Without it Google sees a page of text and has to guess that it is a product,
 * what it costs and whether it is in stock. With it the page can show price
 * and availability in results and qualify for Google's free product listings.
 * Only facts the page itself shows go in: name, photos, brand, price, stock.
 */
/**
 * The spec sheet as name/value pairs (schema.org PropertyValue), so search
 * engines and AI assistants can quote "Fingerprint capacity: 3,000" without
 * reading the table. Only labelled rows; capped so a huge sheet stays sane.
 */
function specProperties(text: string | null | undefined) {
  if (!text) return [];
  const out: { "@type": "PropertyValue"; name: string; value: string }[] = [];
  for (const block of parseSpecSheet(text).blocks) {
    if (!("rows" in block)) continue;
    for (const r of block.rows) {
      const name = (r.label ?? "").replace(/\*\*/g, "").replace(/:$/, "").trim();
      const value = r.value.replace(/\*\*/g, "").trim();
      if (!name || !value || r.note || name.length > 80 || value.length > 300) continue;
      out.push({ "@type": "PropertyValue", name, value });
      if (out.length >= 60) return out;
    }
  }
  return out;
}

/**
 * Feature badges and key features as PropertyValues too, ahead of the spec
 * rows, so "NDAA compliant: Yes" or a headline feature is the first thing a
 * search engine or AI assistant reads about the product.
 */
function featureProperties(p: { badges?: string | null; highlights?: string | null }) {
  const out: { "@type": "PropertyValue"; name: string; value: string }[] = [];
  for (const b of parseBadges(p.badges)) out.push({ "@type": "PropertyValue", name: b.label, value: b.detail || "Yes" });
  for (const h of parseHighlights(p.highlights)) out.push({ "@type": "PropertyValue", name: "Key feature", value: h });
  return out;
}

function productJsonLd(
  p: { slug: string; name: string; brand: string; price_cents: number; blurb?: string; meta_description?: string; gtin?: string; mpn?: string; image: string; category: string; specs?: string | null; highlights?: string | null; badges?: string | null; ship_weight_lb?: number | null },
  categoryName: string,
  shots: string[],
  available: boolean,
  reviews?: ReviewData,
): string {
  const url = `${ORIGIN}/p/${p.slug}`;
  const product = {
    "@type": "Product",
    "@id": `${url}#product`,
    name: structuredName(p.name),
    url,
    sku: p.mpn || p.slug,
    ...(() => {
      const props = [...featureProperties(p), ...specProperties(p.specs)].slice(0, 90);
      return props.length ? { additionalProperty: props } : {};
    })(),
    ...(categoryName ? { category: categoryName } : {}),
    image: (shots.length ? shots : [p.image]).filter(Boolean).slice(0, 10).map(abs),
    description: pageDescription(p),
    ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}),
    ...(p.gtin ? { gtin: p.gtin } : {}),
    ...(p.mpn ? { mpn: p.mpn } : {}),
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
      seller: { "@id": STORE_ID },
      // Matches the /shipping page. Only stated when it is known to be free
      // ($199 or more and 5 lb or less packed); everything else is priced
      // live at checkout, so no fixed figure is claimed for it.
      ...(p.price_cents >= FREE_SHIPPING_THRESHOLD_CENTS && p.ship_weight_lb != null && p.ship_weight_lb <= FREE_SHIPPING_MAX_LB
        ? {
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingRate: { "@type": "MonetaryAmount", value: "0.00", currency: "USD" },
              shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
              deliveryTime: {
                "@type": "ShippingDeliveryTime",
                handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 2, unitCode: "DAY" },
                transitTime: { "@type": "QuantitativeValue", minValue: 3, maxValue: 7, unitCode: "DAY" },
              },
            },
          }
        : {}),
      // Matches the /returns page: ten days from delivery, returned by mail,
      // 15% restocking fee on every return.
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "US",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 10,
        returnMethod: "https://schema.org/ReturnByMail",
        // Customer pays return postage; the 15% is restockingFee (a percentage).
        returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
        restockingFee: 15,
        merchantReturnLink: `${ORIGIN}/returns`,
      },
    },
  };
  const trail = breadcrumbs([
    { name: "Catalog", path: "/shop" },
    ...(categoryName ? [{ name: categoryName, path: `/shop/${p.category}` }] : []),
    { name: structuredName(p.name), path: `/p/${p.slug}` },
  ]);
  return toJsonLd({ "@context": "https://schema.org", "@graph": [product, trail] });
}

export const Route = createFileRoute("/p/$slug")({
  loader: async ({ params }) => {
    const data = await getProductPage({ data: { slug: params.slug } });
    if (!data.product) throw notFound();
    return data;
  },
  head: ({ loaderData, params }) => ({
    meta: loaderData?.product
      ? (() => {
          const p = loaderData.product;
          const title = pageTitle(p);
          const description = pageDescription(p);
          const keywords = pageKeywords(p);
          return [
            { title },
            { name: "description", content: description },
            ...(keywords ? [{ name: "keywords", content: keywords }] : []),
            // What Facebook, WhatsApp and iMessage show when the link is shared.
            { property: "og:title", content: title },
            { property: "og:description", content: description },
            { property: "og:image", content: `${ORIGIN}${p.image}` },
          ];
        })()
      : [],
    links: [{ rel: "canonical", href: `${ORIGIN}/p/${params.slug}` }],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { product, images, related, categoryName, reviews, options, upsells, installUpsell } = Route.useLoaderData();
  // "Complete your system" add-ons ticked by the shopper, by product slug.
  const [ticked, setTicked] = useState<string[]>([]);
  // The add-on picked in each drop-down ("" = none), by drop-down position.
  const [picked, setPicked] = useState<string[]>([]);
  const shots = images && images.length > 0 ? images : product?.image ? [product.image] : [];
  const [shown, setShown] = useState(0);
  const viewed = product?.slug;
  useEffect(() => {
    if (!product) return;
    track("view_item", { currency: "USD", value: product.price_cents / 100, items: [gaItem({ ...product, category: categoryName ?? product.category })] });
    // Once per product opened, not on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewed]);
  if (!product) return null;
  const main = shots[shown] ?? product.image;
  const save = savings(product.price_cents, product.msrp_cents);
  const available = isAvailable(product);
  const badges = parseBadges(product.badges);
  const highlights = parseHighlights(product.highlights);
  // A long manufacturer write-up would push the price below the fold, so it
  // moves to its own Overview section under the buy box. Short ones stay put.
  const longBlurb = (product.blurb ?? "").length > 700;

  return (
    <SiteShell>
      <StructuredData json={productJsonLd(product, categoryName, shots, available, reviews)} />
      <Shell className="pb-4 pt-6">
        <nav className="text-[14px] text-muted" aria-label="Breadcrumb">
          <Link to="/shop" className="hover:text-signal">
            Catalog
          </Link>
          <span className="mx-2">/</span>
          <Link to="/shop/$category" params={{ category: product.category }} className="hover:text-signal">
            {categoryName}
          </Link>
        </nav>
      </Shell>

      <Shell className="grid gap-8 pb-14 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] lg:gap-12">
        {/* Photos: a calm, medium-sized panel. Thumbnails sit beside it on wide
            screens and in a row underneath on narrow ones, never on top of it. */}
        <div className="flex flex-col gap-3 lg:flex-row-reverse lg:items-start">
          <figure className="ahe-photo w-full max-w-[460px] rounded-[14px] border border-[#dbe7f3] max-lg:mx-auto max-lg:max-w-[300px]">
            <img src={main} alt={product.name} width={520} height={520} />
            {shots.length > 1 ? (
              <span className="absolute bottom-2.5 right-2.5 rounded-full bg-ground px-2.5 py-0.5 text-[12px] font-semibold text-muted">
                {shown + 1} / {shots.length}
              </span>
            ) : null}
          </figure>

          {/* Only worth showing when there is actually a choice to make. */}
          {shots.length > 1 ? (
            <ul className="flex flex-wrap gap-2 max-lg:justify-center lg:w-16 lg:flex-col">
              {shots.map((src, i) => (
                <li key={src}>
                  <button
                    type="button"
                    onClick={() => setShown(i)}
                    aria-label={`Photo ${i + 1} of ${shots.length}`}
                    aria-current={i === shown}
                    className={`ahe-photo h-14 w-14 rounded-[10px] border lg:h-16 lg:w-16 ${
                      i === shown ? "border-signal shadow-[0_0_0_1px_var(--color-signal)]" : "border-[#dbe7f3] hover:border-[#9db6cf]"
                    }`}
                  >
                    <img src={src} alt="" loading="lazy" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-signal">{product.brand}</p>
          <h1 className="mt-1.5 text-[30px] text-ink md:text-[40px]">{product.name}</h1>
          {reviews && reviews.summary.count > 0 ? (
            <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
              <Stars value={reviews.summary.average} />
              <span>
                {reviews.summary.average.toFixed(1)} · {reviews.summary.count}{" "}
                {reviews.summary.count === 1 ? "review" : "reviews"}
              </span>
            </a>
          ) : null}
          {badges.length ? <FeatureBadges badges={badges} /> : null}
          {highlights.length ? <KeyFeatures items={highlights} /> : null}
          {product.blurb && !longBlurb ? (
            <div className="mt-4 max-w-[58ch] text-[16px] leading-relaxed text-muted">{renderRichText(product.blurb)}</div>
          ) : null}

          <div className="mt-6 grid gap-3.5 rounded-[14px] border border-[#dbe7f3] bg-surface p-5">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
              <span className="ahe-price text-[40px] text-ink">{money(product.price_cents)}</span>
              {product.msrp_cents && product.msrp_cents > product.price_cents ? (
                <span className="text-[15px] text-muted line-through tabular-nums">{money(product.msrp_cents)}</span>
              ) : null}
              {save && product.msrp_cents ? (
                <span className="rounded-full bg-[#e6f1fb] px-2.5 py-1 text-[14px] font-bold text-signal">
                  You save {money(product.msrp_cents - product.price_cents)}
                </span>
              ) : null}
            </div>
            <span className={`ahe-live ${available ? "" : "is-out"}`}>{stockLabel(product)}</span>
            {options && options.length ? (
              <AddOnPicker
                options={options}
                picked={picked}
                onPick={(i, v) => setPicked((prev) => Object.assign([...prev], { [i]: v }))}
                basePrice={product.price_cents}
              />
            ) : null}
            {available && ((upsells && upsells.length) || installUpsell) ? (
              <CompleteYourSystem
                items={upsells ?? []}
                install={!!installUpsell}
                ticked={ticked}
                onToggle={(slug) => setTicked((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]))}
                basePrice={
                  product.price_cents +
                  (options ?? []).reduce((sum, o, i) => sum + (o.choices.find((c) => c.slug === picked[i])?.price_cents ?? 0), 0)
                }
              />
            ) : null}
            <div className="max-w-[420px]">
              <AddToCartButton slug={product.slug} soldOut={!available} extras={[...picked.filter(Boolean), ...ticked]} />
              {available && product.stock_tracked === 1 && product.stock <= 3 ? (
                <p className="mt-2 text-[14px] font-semibold text-signal">Only {product.stock} left</p>
              ) : null}
              {!available ? (
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  Call the shop and we will tell you when the next shipment lands, or find you an equivalent.
                </p>
              ) : null}
            </div>
          </div>

          <dl className="mt-6 grid gap-3.5">
            <div className="flex gap-3">
              <IconShield className="mt-0.5 h-5 w-5 shrink-0 text-[#19a974]" />
              <div>
                <dt className="text-[15px] font-semibold text-ink">Authorized dealer stock</dt>
                <dd className="mt-0.5 max-w-[52ch] text-[14px] leading-relaxed text-muted">
                  Sealed USA retail product with the full manufacturer warranty and every accessory the factory packed.
                </dd>
              </div>
            </div>
            <div className="flex gap-3">
              <IconTruck className="mt-0.5 h-5 w-5 shrink-0 text-[#19a974]" />
              <div>
                <dt className="text-[15px] font-semibold text-ink">Shipping</dt>
                <dd className="mt-0.5 max-w-[52ch] text-[14px] leading-relaxed text-muted">
                  Ships anywhere in the United States and Canada. NYC installation can be added to the order.
                </dd>
              </div>
            </div>
          </dl>

          <p className="mt-5 text-[14px] leading-relaxed text-muted">
            Questions on compatibility or channel count? Call{" "}
            <a href={SITE.phoneHref} className="font-semibold text-ink underline underline-offset-4 hover:text-signal">
              {SITE.phone}
            </a>{" "}
            and we will check it against your recorder before you buy.
          </p>
        </div>
      </Shell>

      {product.blurb && longBlurb ? <Overview text={product.blurb} /> : null}

      {product.specs ? <Specifications text={product.specs} /> : null}

      <Shell>
        <ProductReviews
          slug={product.slug}
          data={reviews ?? { summary: { count: 0, average: 0, breakdown: [0, 0, 0, 0, 0] }, reviews: [] }}
        />
      </Shell>

      {related.length > 0 ? (
        <section className="py-12">
          <Shell>
            <h2 className="text-[32px] text-ink">Sits near it on the shelf</h2>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
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
    <section className="pb-6 pt-2" aria-labelledby="specs-title">
      <Shell>
        <div className="flex flex-wrap items-end justify-between gap-4 pb-3">
          <h2 id="specs-title" className="text-[32px] text-ink">
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
          <div className="rounded-[14px] border border-[#dbe7f3] bg-surface p-5 md:p-7">
            <div
              id="specs-body"
              className={`relative max-w-4xl text-[15px] leading-relaxed ${folded ? "max-h-[36rem] overflow-hidden" : ""}`}
            >
              {renderSpecSheet(sheet)}
              {folded ? (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-surface to-transparent"
                />
              ) : null}
            </div>
            {foldable ? (
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="specs-body"
                className="mt-5 rounded-[10px] border border-ink px-5 py-2.5 text-[14px] font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
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

/** Feature icons (NDAA, Starlight, IP67…). The meaning shows on hover and is
 *  also written out for screen readers. */
function FeatureBadges({ badges }: { badges: Badge[] }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-3" aria-label="Features">
      {badges.map((b) => (
        <li key={b.label} title={b.detail || b.label} className="flex w-[64px] flex-col items-center text-center">
          {b.icon ? (
            <img src={b.icon} alt="" width={56} height={51} loading="lazy" className="h-[51px] w-[56px] object-contain" />
          ) : (
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#e6f1fb] text-[11px] font-bold text-signal">
              {b.label.slice(0, 4)}
            </span>
          )}
          {/* Manufacturer icons print their own caption; only text badges need one. */}
          <span className={b.icon ? "sr-only" : "mt-1 text-[11px] font-semibold uppercase leading-tight tracking-wide text-ink"}>{b.label}</span>
          {b.detail ? <span className="sr-only">: {b.detail}</span> : null}
        </li>
      ))}
    </ul>
  );
}

const KEY_FEATURES_PREVIEW = 5;

/** The manufacturer's key-feature list, first few showing, the rest behind See more. */
function KeyFeatures({ items }: { items: string[] }) {
  const [open, setOpen] = useState(false);
  const foldable = items.length > KEY_FEATURES_PREVIEW + 1;
  const shown = foldable && !open ? items.slice(0, KEY_FEATURES_PREVIEW) : items;
  return (
    <div className="mt-4 max-w-[60ch]">
      <h2 className="text-[15px] font-semibold text-ink">Key features</h2>
      <ul className="mt-2 grid list-disc gap-1 pl-5 text-[15px] leading-relaxed text-muted marker:text-signal">
        {shown.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      {foldable ? (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="mt-1.5 text-[14px] font-semibold text-signal underline-offset-4 hover:underline"
        >
          {open ? "See less" : `See all ${items.length} features`}
        </button>
      ) : null}
    </div>
  );
}

/** The full manufacturer write-up, below the buy box. */
function Overview({ text }: { text: string }) {
  return (
    <section className="pb-6 pt-2" aria-labelledby="overview-title">
      <Shell>
        <h2 id="overview-title" className="pb-3 text-[32px] text-ink">
          Overview
        </h2>
        <div className="max-w-[75ch] text-[16px] leading-relaxed text-muted">{renderRichText(text)}</div>
      </Shell>
    </section>
  );
}

/** Add-on drop-downs ("Add a Hard Drive"), with the total including what is picked. */
function AddOnPicker({
  options,
  picked,
  onPick,
  basePrice,
}: {
  options: ResolvedOption[];
  picked: string[];
  onPick: (index: number, slug: string) => void;
  basePrice: number;
}) {
  const extra = options.reduce((sum, o, i) => sum + (o.choices.find((c) => c.slug === picked[i])?.price_cents ?? 0), 0);
  return (
    <div className="grid gap-3">
      {options.map((o, i) => (
        <label key={o.label} className="block">
          <span className="text-[15px] font-semibold text-ink">{o.label}</span>
          {o.help ? <span className="mt-0.5 block text-[14px] leading-relaxed text-muted">{o.help}</span> : null}
          <select
            value={picked[i] ?? ""}
            onChange={(e) => onPick(i, e.target.value)}
            className="mt-1.5 h-11 w-full max-w-[420px] rounded-[10px] border border-[#cfdcea] bg-white px-3 text-[15px] text-ink focus:border-signal focus:outline-none"
          >
            <option value="">None selected</option>
            {o.choices.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name} + {money(c.price_cents)}
              </option>
            ))}
          </select>
        </label>
      ))}
      {extra > 0 ? (
        <p className="text-[15px] text-ink">
          Total with add-ons: <span className="ahe-price text-[20px]">{money(basePrice + extra)}</span>
        </p>
      ) : null}
    </div>
  );
}

/**
 * "Complete your system": optional extras the shopper ticks before adding
 * to the cart (a drive and monitor for a recorder, cable for an IP camera).
 * Each ticked item goes into the cart as its own line. Nothing is pre-ticked.
 */
function CompleteYourSystem({
  items,
  install,
  ticked,
  onToggle,
  basePrice,
}: {
  items: { slug: string; name: string; image: string | null; price_cents: number }[];
  install: boolean;
  ticked: string[];
  onToggle: (slug: string) => void;
  basePrice: number;
}) {
  const extra = items.filter((i) => ticked.includes(i.slug)).reduce((s, i) => s + i.price_cents, 0);
  return (
    <section aria-labelledby="complete-system-h" className="grid gap-2.5 rounded-[12px] border border-[#dbe7f3] bg-[#f8fbfe] p-4">
      <h2 id="complete-system-h" className="ahe-display text-[22px] leading-none tracking-[0.3px] text-ink">
        COMPLETE YOUR SYSTEM
      </h2>
      {items.map((it) => {
        const on = ticked.includes(it.slug);
        return (
          <button
            key={it.slug}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(it.slug)}
            className={`flex min-h-[60px] w-full items-center gap-3 rounded-[10px] bg-white px-3 py-2 text-left transition-colors ${
              on ? "border-2 border-signal bg-[#eef5fc]" : "border border-[#cfdcea] hover:border-[#4a86c9]"
            }`}
          >
            <span
              aria-hidden="true"
              className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px] border-2 ${
                on ? "border-signal bg-signal" : "border-[#8aa6c4] bg-white"
              }`}
            >
              {on ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              ) : null}
            </span>
            {it.image ? <img src={it.image} alt="" loading="lazy" className="h-11 w-11 shrink-0 object-contain" /> : null}
            <span className="min-w-0 flex-1 text-[15px] font-semibold leading-snug text-ink">{it.name}</span>
            <span className="whitespace-nowrap text-[15px] font-bold tabular-nums text-ink">+{money(it.price_cents)}</span>
          </button>
        );
      })}
      {install ? (
        <Link
          to="/installation"
          className="flex min-h-[52px] items-center gap-3 rounded-[10px] border border-dashed border-[#4a86c9] bg-white px-3 py-2 text-ink no-underline"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-signal">
            <path d="M14.7 6.3a4 4 0 0 0 5 5L22 14l-8 8-2.3-2.3a4 4 0 0 0-5-5L4 12l2.6-2.6" />
            <path d="M3 21l5-5" />
          </svg>
          <span className="flex-1">
            <span className="block text-[15px] font-semibold">Want it installed?</span>
            <span className="block text-[14px] text-muted">We arrange professional installation. Get a quote.</span>
          </span>
          <span className="text-[14px] font-bold text-signal">Quote</span>
        </Link>
      ) : null}
      {extra > 0 ? (
        <p className="text-[15px] text-ink">
          Total with add-ons: <span className="ahe-price text-[20px]">{money(basePrice + extra)}</span>
        </p>
      ) : null}
    </section>
  );
}
