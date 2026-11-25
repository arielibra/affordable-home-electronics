/**
 * "Black Friday deals are here" welcome popup.
 *
 * Shows on every visit, a moment after the visitor lands, from November 23
 * through December 1 (shop time, New York), every year. Closing it (the X,
 * "Keep browsing", a click outside, or Esc) or tapping "Shop the deals" keeps
 * it away for the rest of that visit only (sessionStorage), so it doesn't pop
 * up again on every page they click; it comes back the next time they visit. It never appears on the
 * cart, checkout, order pages or admin.
 *
 * Wording follows the owner's rule: every price on the site IS the Black Friday
 * price, so "Black Friday prices are live" is honest. No invented percentages.
 *
 * Browser-only: nothing renders on the server, so there is no hydration risk,
 * and if browser storage is blocked the popup simply shows once per page load.
 */
import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

const SHOP_TZ = "America/New_York";
const SEEN_KEY = "ahe-bf-popup";

function shopYMD(now: Date): { y: number; m: number; d: number } {
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: SHOP_TZ, year: "numeric", month: "numeric", day: "numeric" }).formatToParts(now);
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
    if (get("year")) return { y: get("year"), m: get("month"), d: get("day") };
  } catch {
    // fall through
  }
  const ny = new Date(now.getTime() - 5 * 60 * 60 * 1000);
  return { y: ny.getUTCFullYear(), m: ny.getUTCMonth() + 1, d: ny.getUTCDate() };
}

/** November 23 through December 1, New York time. */
export function isBlackFridaySale(now: Date = new Date()): boolean {
  const { m, d } = shopYMD(now);
  return (m === 11 && d >= 23) || (m === 12 && d === 1);
}

const QUIET_PATHS = ["/cart", "/checkout", "/order-confirmed", "/orders", "/admin", "/review"];

export function BlackFridayPopup() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const yearKey = `${SEEN_KEY}-${shopYMD(new Date()).y}`;

  useEffect(() => {
    if (!isBlackFridaySale()) return;
    if (QUIET_PATHS.some((p) => path.startsWith(p))) return;
    try {
      if (window.sessionStorage.getItem(yearKey)) return;
    } catch {
      // storage blocked: show it this once
    }
    const t = window.setTimeout(() => setOpen(true), 1200);
    return () => window.clearTimeout(t);
    // Only on first arrival; later navigation shouldn't re-trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = () => {
    setOpen(false);
    try {
      window.sessionStorage.setItem(yearKey, "1");
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!open) return;
    cardRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div className="ahe-bf-backdrop" onClick={dismiss}>
      <div
        ref={cardRef}
        tabIndex={-1}
        className="ahe-bf-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ahe-bf-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="ahe-bf-x" aria-label="Close" onClick={dismiss}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="ahe-bf-head">
          <span className="ahe-bf-ribbon" aria-hidden="true" />
          <p className="ahe-bf-tag">Nov 23 – Dec 1</p>
          <h2 id="ahe-bf-title" className="ahe-bf-title">
            Black Friday
            <br />
            <span>deals are here</span>
          </h2>
        </div>
        <div className="ahe-bf-body">
          <p>
            Black Friday prices are live on cameras, recorders, locks and access control, from the brands
            installers trust. Genuine USA stock with full manufacturer warranty.
          </p>
          <ul>
            <li>Free shipping on $199+ orders, packages up to 5&nbsp;lb</li>
            <li>Ends December 1 at midnight</li>
          </ul>
          <div className="ahe-bf-actions">
            <Link to="/shop" className="ahe-bf-go" onClick={dismiss}>
              Shop the deals
            </Link>
            <button type="button" className="ahe-bf-later" onClick={dismiss}>
              Keep browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
