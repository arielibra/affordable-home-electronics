export const ORIGIN = "https://affordable-home-electronics.higgsfield.app";

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
  legacyStore: "https://affordablehomeelectronics.com",
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
