import { ORIGIN, SITE } from "./site";

/**
 * schema.org JSON-LD shared across the site.
 *
 * Google, Bing and AI assistants read this to know, without guessing, who the
 * shop is, where it is, when it is open, and what each page sells. Every page
 * carries the store and the website; product and category pages point back to
 * the store by its @id instead of repeating it, so all of it reads as one
 * connected description of one business.
 *
 * Only facts the site itself shows go in. Nothing invented, no ratings that
 * customers did not give.
 */

export const STORE_ID = `${ORIGIN}/#store`;
export const WEBSITE_ID = `${ORIGIN}/#website`;

export const abs = (src: string) =>
  /^https?:\/\//.test(src) ? src : `${ORIGIN}${src.startsWith("/") ? "" : "/"}${src}`;

/** JSON for a <script type="application/ld+json">; "<" escaped so text can never close the tag. */
export function toJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

const STORE = {
  "@type": "ElectronicsStore",
  "@id": STORE_ID,
  name: SITE.name,
  url: ORIGIN,
  logo: `${ORIGIN}/app-icon.png`,
  image: `${ORIGIN}/assets/hero-storefront.png`,
  description:
    "Security cameras, NVR and DVR recorders, access control, smart locks and home electronics, sold online and installed across New York City since 2003.",
  telephone: "+1-718-275-9343",
  faxNumber: "+1-866-365-7643",
  email: SITE.email,
  foundingDate: String(SITE.since),
  currenciesAccepted: "USD",
  paymentAccepted: "Credit Card, PayPal",
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.street,
    addressLocality: "Rego Park",
    addressRegion: "NY",
    postalCode: "11374",
    addressCountry: "US",
  },
  // Google reads this for the opening hours shown in search and on Maps. Wrong
  // hours here send somebody to Rego Park to find the shutters down.
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [...SITE.hours.days],
      opens: SITE.hours.opens,
      closes: SITE.hours.closes,
    },
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: "+1-718-275-9343",
      email: SITE.email,
      areaServed: "US",
      availableLanguage: "English",
    },
  ],
  areaServed: SITE.areas.map((a) => ({ "@type": "Place", name: a })),
  // Store-wide return policy, matching /returns. Google reads this at the
  // business level as well as on each product's offer.
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
  makesOffer: {
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: "Security camera supply and installation",
      areaServed: "New York City",
      url: `${ORIGIN}/installation`,
    },
  },
};

const WEBSITE = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: SITE.name,
  url: ORIGIN,
  inLanguage: "en-US",
  publisher: { "@id": STORE_ID },
  // Lets Google and assistants search the catalog directly.
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${ORIGIN}/search?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

/** The store and the website, on every page. */
export const SITE_JSON_LD = toJsonLd({ "@context": "https://schema.org", "@graph": [STORE, WEBSITE] });

/** Breadcrumb trail as schema.org BreadcrumbList. Last item is the page itself. */
export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${ORIGIN}${it.path}`,
    })),
  };
}

/**
 * A plain page: what kind of page it is, what it is about, which site and
 * business it belongs to, and the breadcrumb trail back to the home page.
 * `extra` adds more nodes to the same graph (a Service, an ItemList…).
 */
export function pageJsonLd(opts: {
  type?: string;
  path: string;
  name: string;
  description?: string;
  crumbs?: { name: string; path: string }[];
  about?: unknown;
  mainEntity?: unknown;
  extra?: unknown[];
}): string {
  const url = `${ORIGIN}${opts.path}`;
  const crumbs = [{ name: "Home", path: "/" }, ...(opts.crumbs ?? [{ name: opts.name, path: opts.path }])];
  return toJsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": opts.type ?? "WebPage",
        "@id": url,
        url,
        name: opts.name,
        ...(opts.description ? { description: opts.description } : {}),
        inLanguage: "en-US",
        isPartOf: { "@id": WEBSITE_ID },
        publisher: { "@id": STORE_ID },
        ...(opts.about ? { about: opts.about } : {}),
        ...(opts.mainEntity ? { mainEntity: opts.mainEntity } : {}),
        breadcrumb: breadcrumbs(crumbs),
      },
      ...(opts.extra ?? []),
    ],
  });
}
