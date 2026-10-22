import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

import { NAV, SITE } from "../../lib/site";
import { CartProvider, useCart } from "./cart-context";
import { IconCart, IconMail, IconPhone, IconPin, IconSearch } from "./icons";
import { Lockup } from "./mark";
import { useHalloween } from "./halloween";
import { PayMarks } from "./pay-marks";

function CartLink() {
  const { count, ready } = useCart();
  return (
    <Link
      to="/cart"
      className="relative inline-flex h-11 items-center gap-2 rounded-[10px] border border-line bg-surface px-3.5 text-[15px] font-semibold text-ink transition-colors hover:border-line-dark"
    >
      <IconCart className="h-[18px] w-[18px]" />
      <span className="hidden sm:inline">Cart</span>
      <span className="min-w-[1.5rem] rounded-full bg-ink px-1.5 text-center text-[12px] font-semibold leading-5 text-surface">
        {ready ? count : "0"}
      </span>
    </Link>
  );
}

/** The search box in the header. Sends the same ?q= the search page already reads. */
function HeaderSearch({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  return (
    <form
      role="search"
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        void navigate({ to: "/search", search: { q: q.trim() } });
      }}
    >
      <label className="relative block">
        <span className="sr-only">Search the catalog</span>
        <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.currentTarget.value)}
          placeholder="Search cameras, recorders, locks"
          className="h-11 w-full rounded-[10px] border-[1.5px] border-[#c6d9ec] bg-ground pl-10 pr-3 text-[15px] text-ink placeholder:text-muted/80 focus:border-signal focus:outline-none"
        />
      </label>
    </form>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const halloween = useHalloween();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      {/* One bar across the very top. During Halloween it turns night blue
          and carries the greeting; the rest of the year it is the brand blue. */}
      <div className={halloween ? "bg-[#1b2b45] text-[#ffe9d2]" : "bg-band text-surface"}>
        <div className="mx-auto flex min-h-9 max-w-[1240px] items-center justify-between gap-4 px-5 py-1.5 text-[13px] font-medium">
          <span className="flex min-w-0 items-center gap-2.5">
            {halloween ? (
              <>
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] shrink-0">
                  <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" fill="#ffd27a" />
                </svg>
                <b className="ahe-display shrink-0 text-[16px] tracking-[0.04em] text-[#ff9a3c]">Happy Halloween</b>
                <span className="hidden truncate md:inline">· Authorized dealer. Full USA warranty on every item.</span>
              </>
            ) : (
              <span className="hidden truncate sm:inline">Authorized dealer. Full USA warranty on every item.</span>
            )}
          </span>
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

      <div className="mx-auto flex max-w-[1240px] items-center gap-5 px-5 py-3">
        <Link to="/" className="shrink-0" aria-label={`${SITE.name} home`}>
          <Lockup />
        </Link>

        <HeaderSearch className="hidden flex-1 md:block" />

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link
            to="/search"
            className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-line bg-surface text-ink md:hidden"
            aria-label="Search the catalog"
          >
            <IconSearch className="h-[18px] w-[18px]" />
          </Link>
          <CartLink />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-line bg-surface text-ink lg:hidden"
          >
            <span className="flex flex-col gap-[5px]">
              <span className="block h-[2px] w-4 bg-ink" />
              <span className="block h-[2px] w-4 bg-ink" />
            </span>
          </button>
        </div>
      </div>

      <nav className="hidden border-t border-line lg:block" aria-label="Primary">
        <div className="mx-auto flex max-w-[1240px] items-center gap-1 px-5 py-2">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-1.5 text-[15px] font-semibold text-ink-soft transition-colors hover:bg-ground hover:text-ink"
              activeProps={{ className: "bg-[#e6f1fb] text-ink" }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {open ? (
        <nav className="border-t border-line bg-surface lg:hidden" aria-label="Mobile">
          <ul className="mx-auto max-w-[1240px] divide-y divide-line px-5">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} onClick={() => setOpen(false)} className="block py-3.5 text-[16px] font-medium text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/orders"
                onClick={() => setOpen(false)}
                className="block py-3.5 text-[16px] font-semibold text-signal"
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
      <h3 className="ahe-display text-[18px] tracking-[0.03em] text-white">{title}</h3>
      <ul className="mt-3 space-y-2.5 text-[15px] text-[#dcebfa] ">{children}</ul>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-20 bg-band text-surface">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" aria-label={`${SITE.name} home`}>
            <Lockup reversed />
          </Link>
          <p className="mt-4 max-w-[34ch] text-[15px] leading-relaxed text-[#dcebfa]">
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
            <IconPhone className="mt-[3px] h-4 w-4 shrink-0 text-[#9cc3e8]" />
            <a href={SITE.phoneHref} className="ahe-onblue">
              {SITE.phone}
            </a>
          </li>
          <li className="flex items-start gap-2.5">
            <IconMail className="mt-[3px] h-4 w-4 shrink-0 text-[#9cc3e8]" />
            <a href={SITE.emailHref} className="ahe-onblue break-all">
              {SITE.email}
            </a>
          </li>
          <li className="flex items-start gap-2.5">
            <IconPin className="mt-[3px] h-4 w-4 shrink-0 text-[#9cc3e8]" />
            <span>
              {SITE.street}
              <br />
              {SITE.cityLine}
              <br />
              <span className="text-[#cfe1ef]">{SITE.hours.plain}</span>
            </span>
          </li>
        </FooterColumn>
      </div>

      <div className="border-t border-white/20">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-5 py-5 text-[13px] text-[#cfe1ef] md:flex-row md:items-center md:justify-between">
          <span>
            © {SITE.since}–{new Date().getFullYear()} Affordable Home Electronics · Retail, wholesale and government orders welcome
          </span>
          <PayMarks strip />
        </div>
      </div>
    </footer>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const halloween = useHalloween();
  return (
    <CartProvider>
      <div className={`flex min-h-dvh flex-col bg-ground ${halloween ? "ahe-hw" : ""}`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  );
}
