import { ORIGIN, SITE } from "../../lib/site";

/**
 * An OnlineStore, not an ElectronicsStore. ElectronicsStore is a LocalBusiness,
 * which tells Google there is a counter to visit and asks for an address and
 * opening hours to put on Maps. The shop sells online only, so claiming one
 * would send people to a door that does not open.
 */
const DATA = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  name: SITE.name,
  url: ORIGIN,
  email: SITE.email,
  foundingDate: String(SITE.since),
  image: `${ORIGIN}/assets/hero-storefront.png`,
  // Installation is a real local service, so the area served is still true
  // even though there is no address to visit.
  areaServed: SITE.areas.map((a) => ({ "@type": "Place", name: a })),
  makesOffer: {
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: "Security camera supply and installation",
      areaServed: "New York City",
    },
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: SITE.email,
    url: `${ORIGIN}/contact`,
    availableLanguage: "English",
  },
};

export function LocalBusinessData() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(DATA) }} />;
}
