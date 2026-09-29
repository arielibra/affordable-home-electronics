/**
 * The site's public address. Canonical links, social images, the sitemap and
 * the structured data all hang off this, so it has to be the address customers
 * and Google actually see — not whichever host happened to build it.
 *
 * Set VITE_SITE_URL at build time to override. The fallback is the real
 * domain, so a forgotten variable points somewhere correct rather than at a
 * temporary preview host.
 */
const CONFIGURED_ORIGIN = import.meta.env.VITE_SITE_URL as string | undefined;

export const ORIGIN = (
  CONFIGURED_ORIGIN && CONFIGURED_ORIGIN.trim()
    ? CONFIGURED_ORIGIN.trim()
    : "https://affordablehomeelectronics.com"
).replace(/\/+$/, "");

export const SITE = {
  name: "Affordable Home Electronics",
  short: "AHE",
  since: 2003,
  phone: "718.275.9343",
  phoneHref: "tel:+17182759343",
  whatsapp: "(917) 407-8921",
  whatsappHref: "https://wa.me/19174078921",
  fax: "866.365.7643",
  email: "info@AffordableHomeElectronics.com",
  emailHref: "mailto:info@AffordableHomeElectronics.com",
  street: "62-65 Saunders Street",
  cityLine: "Rego Park, NY 11374",
  areas: ["Rego Park", "Forest Hills", "Elmhurst", "Jackson Heights", "Astoria", "The Bronx", "Manhattan", "Brooklyn"],
  /** Sunday to Friday, 9 to 7. Closed Saturday. Stated once here so the contact
   *  page, the footer and the structured data Google reads can never drift
   *  apart. 24-hour times because that is what schema.org expects. */
  hours: {
    opens: "09:00",
    closes: "19:00",
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    plain: "Sunday to Friday, 9am to 7pm",
    closed: "Closed Saturday",
  },
} as const;

export function money(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function savings(price: number, msrp: number | null): number | null {
  if (!msrp || msrp <= price) return null;
  return Math.round(((msrp - price) / msrp) * 100);
}

export const NAV = [
  { to: "/shop", label: "Shop" },
  { to: "/security-cameras", label: "Security cameras" },
  { to: "/installation", label: "Installation" },
  { to: "/brands", label: "Brands" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;
