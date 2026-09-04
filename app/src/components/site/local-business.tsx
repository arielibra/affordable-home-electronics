import { ORIGIN, SITE } from "../../lib/site";

const DATA = {
  "@context": "https://schema.org",
  "@type": "ElectronicsStore",
  name: SITE.name,
  url: ORIGIN,
  telephone: "+1-718-275-9343",
  faxNumber: "+1-866-365-7643",
  email: SITE.email,
  foundingDate: String(SITE.since),
  image: `${ORIGIN}/assets/hero-storefront.png`,
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.street,
    addressLocality: "Rego Park",
    addressRegion: "NY",
    postalCode: "11374",
    addressCountry: "US",
  },
  areaServed: SITE.areas.map((a) => ({ "@type": "Place", name: a })),
  makesOffer: {
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: "Security camera supply and installation",
      areaServed: "New York City",
    },
  },
};

export function LocalBusinessData() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(DATA) }} />;
}
