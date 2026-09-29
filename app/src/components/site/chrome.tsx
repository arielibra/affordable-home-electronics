import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

import { NAV, SITE } from "../../lib/site";
import { CartProvider, useCart } from "./cart-context";
import { IconCart, IconMail, IconPhone, IconPin, IconSearch } from "./icons";
import { Mark } from "./mark";
import { PayMarks } from "./pay-marks";

function CartLink() {
  const { count, ready } = useCart();
  return (
    <Link
      to="/cart"
      className="relative inline-flex h-10 items-center gap-2 border border-line bg-surface px-3 text-sm font-medium text-ink transition-colors hover:border-ink"
    >
      <IconCart className="h-4 w-4" />
      <span className="hidden sm:inline">Cart</span>
      <span className="min-w-[1.5rem] bg-ink px-1 text-center font-mono text-[11px] leading-5 text-surface">
        {ready ? count : "0"}
      </span>
    </Link>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ground/95 backdrop-blur">
      <div className="border-b border-line bg-band text-surface">
        <div className="mx-auto flex h-9 max-w-[1240px] items-center justify-between gap-4 px-5 font-mono text-[11px] tracking-tight">
          {/* Hidden on the narrowest screens so the two useful links keep their
              room. A reassurance is worth less than a way to do something. */}
          <span className="hidden truncate sm:inline">Authorized dealer. Full USA warranty on every item.</span>
          <div className="flex shrink-0 items-center gap-5">
            <Link to="/orders" className="ahe-onblue">
              Track an order
            </Link>
            <a href={SITE.phoneHref} className="ahe-onblue">
              {SITE.phone}
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-[70px] max-w-[1240px] items-center justify-between gap-6 px-5">
        <Link to="/" className="flex shrink-0 items-center gap-2.5 text-ink" aria-label={`${SITE.name} home`}>
          <Mark className="h-[26px] w-[37px]" />
          <span className="hidden text-[15px] font-semibold leading-none tracking-tight sm:inline">
            Affordable Home Electronics
          </span>
          <span className="text-[15px] font-semibold leading-none tracking-tight sm:hidden">AHE</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm text-muted transition-colors hover:text-ink [&.active]:text-ink"
              activeProps={{ className: "text-ink" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/search"
            className="inline-flex h-10 w-10 items-center justify-center border border-line bg-surface text-ink transition-colors hover:border-ink"
            aria-label="Search the catalog"
          >
            <IconSearch className="h-4 w-4" />
          </Link>
          <CartLink />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle menu"
            className="inline-flex h-10 w-10 items-center justify-center border border-line bg-surface text-ink lg:hidden"
          >
            <span className="flex flex-col gap-[5px]">
              <span className="block h-[2px] w-4 bg-ink" />
              <span className="block h-[2px] w-4 bg-ink" />
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-line bg-surface lg:hidden" aria-label="Mobile">
          <ul className="mx-auto max-w-[1240px] divide-y divide-line px-5">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} onClick={() => setOpen(false)} className="block py-3.5 text-sm text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/orders"
                onClick={() => setOpen(false)}
                className="block py-3.5 text-sm font-medium text-signal"
              >
                Track an order
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">{title}</h3>
      <ul className="mt-4 space-y-2.5 text-sm text-white/75">{children}</ul>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-24 bg-band text-surface">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <img
            src="/assets/logo-reversed.png"
            alt="Affordable Home Electronics"
            loading="lazy"
            className="h-auto w-[250px]"
          />
          <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-white/60">
            Security cameras, recorders and access control, sold and installed out of Rego Park since {SITE.since}.
          </p>
        </div>

        <FooterColumn title="Shop">
          <li>
            <Link to="/shop" className="ahe-onblue">
              Full catalog
            </Link>
          </li>
          <li>
            <Link to="/security-cameras" className="ahe-onblue">
              Security cameras
            </Link>
          </li>
          <li>
            <Link to="/brands" className="ahe-onblue">
              Brands we carry
            </Link>
          </li>
          <li>
            <Link to="/search" className="ahe-onblue">
              Search by part number
            </Link>
          </li>
          <li>
            <Link to="/orders" className="ahe-onblue">
              Track an order
            </Link>
          </li>
        </FooterColumn>

        <FooterColumn title="Company">
          <li>
            <Link to="/about" className="ahe-onblue">
              About the shop
            </Link>
          </li>
          <li>
            <Link to="/installation" className="ahe-onblue">
              Installation in NYC
            </Link>
          </li>
          <li>
            <Link to="/contact" className="ahe-onblue">
              Contact
            </Link>
          </li>
          <li>
            <Link to="/shipping" className="ahe-onblue">
              Shipping
            </Link>
          </li>
          <li>
            <Link to="/returns" className="ahe-onblue">
              Returns and refunds
            </Link>
          </li>
          <li>
            <Link to="/warranty" className="ahe-onblue">
              Warranty
            </Link>
          </li>
        </FooterColumn>

        <FooterColumn title="Reach us">
          <li className="flex items-start gap-2.5">
            <IconPhone className="mt-[3px] h-4 w-4 shrink-0 text-white/40" />
            <a href={SITE.phoneHref} className="ahe-onblue font-mono text-[13px]">
              {SITE.phone}
            </a>
          </li>
          <li className="flex items-start gap-2.5">
            <IconMail className="mt-[3px] h-4 w-4 shrink-0 text-white/40" />
            <a href={SITE.emailHref} className="ahe-onblue break-all">
              {SITE.email}
            </a>
          </li>
          <li className="flex items-start gap-2.5">
            <IconPin className="mt-[3px] h-4 w-4 shrink-0 text-white/40" />
            <span>
              {SITE.street}
              <br />
              {SITE.cityLine}
              <br />
              <span className="text-white/50">{SITE.hours.plain}</span>
            </span>
          </li>
        </FooterColumn>
      </div>

      <div className="border-t border-line-dark">
        <div className="mx-auto max-w-[1240px] px-5 py-6">
          <PayMarks />
        </div>
      </div>

      <div className="border-t border-line-dark">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-2 px-5 py-6 font-mono text-[11px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Copyright {SITE.since} to {new Date().getFullYear()} Affordable Home Electronics
          </span>
          <span>Retail, wholesale and government orders welcome</span>
        </div>
      </div>
    </footer>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <div className="flex min-h-dvh flex-col bg-ground">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  );
}
