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
  email: "info@AffordableHomeElectronics.com",
  emailHref: "mailto:info@AffordableHomeElectronics.com",
  /** The shop sells and supports online only. There is no published phone
   *  number, no counter and no opening hours: every route to a person is
   *  email or the contact form, and the copy has to say so consistently or
   *  customers are sent looking for something that is not there. */
  city: "Rego Park, Queens",
  /** Installation is still a local service, so the neighbourhoods stay —
   *  they are what the installation page and the structured data advertise. */
  areas: ["Rego Park", "Forest Hills", "Elmhurst", "Jackson Heights", "Astoria", "The Bronx", "Manhattan", "Brooklyn"],
  /** Quoted in every "we could not do that" message so a stuck customer
   *  always has somewhere to go. */
  replyTime: "one business day",
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
