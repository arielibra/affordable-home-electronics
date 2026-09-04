import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { IconArrow } from "./icons";

/** Hero primary: ink slab with a signal rule that draws across on hover. */
export function ShopCta({ to = "/shop", children = "Shop cameras" }: { to?: string; children?: ReactNode }) {
  return (
    <Link
      to={to}
      className="group relative inline-flex h-12 items-center overflow-hidden bg-ink px-7 text-sm font-medium text-surface transition-transform duration-150 active:scale-[0.98]"
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute bottom-0 left-0 h-[3px] w-0 bg-signal transition-[width] duration-300 ease-out group-hover:w-full" />
    </Link>
  );
}

/** Hero secondary: hairline ghost, mono numerals, fills to surface on hover. */
export function CallCta({ phone, href }: { phone: string; href: string }) {
  return (
    <a
      href={href}
      className="inline-flex h-12 items-center gap-3 border border-line bg-transparent px-6 text-sm font-medium text-ink transition-colors duration-200 hover:bg-surface active:scale-[0.98]"
    >
      <span>Call the shop</span>
      <span className="font-mono text-[13px] tracking-tight text-muted">{phone}</span>
    </a>
  );
}

/** Installation band: signal field, white label, arrow steps right. */
export function QuoteCta({ children = "Get a quote", href }: { children?: ReactNode; href?: string }) {
  const cls =
    "group inline-flex h-12 items-center gap-3 bg-signal px-7 text-sm font-medium text-white transition-transform duration-150 active:scale-[0.98]";
  const inner = (
    <>
      <span>{children}</span>
      <IconArrow className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
    </>
  );
  if (href) {
    return (
      <a href={href} className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <Link to="/installation" className={cls}>
      {inner}
    </Link>
  );
}

/** Cart page: ink slab carrying one record indicator that lights on hover. */
export function CheckoutCta({ disabled = false }: { disabled?: boolean }) {
  return (
    <Link
      to="/checkout"
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
      className={`group inline-flex h-12 w-full items-center justify-center gap-3 px-7 text-sm font-medium transition-transform duration-150 sm:w-auto ${
        disabled ? "pointer-events-none bg-line text-muted" : "bg-ink text-surface active:scale-[0.98]"
      }`}
    >
      <span className="h-2 w-2 bg-muted transition-colors duration-200 group-hover:bg-signal" />
      <span>Place the order</span>
    </Link>
  );
}

/** Forms: outlined, with corner brackets that close on focus within the form. */
export function SendCta({ label, pending }: { label: string; pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative inline-flex h-12 items-center border border-ink px-8 text-sm font-medium text-ink transition-colors duration-200 hover:bg-ink hover:text-surface disabled:cursor-not-allowed disabled:border-line disabled:text-muted disabled:hover:bg-transparent"
    >
      <span className="pointer-events-none absolute left-[-1px] top-[-1px] h-2 w-2 border-l-2 border-t-2 border-signal opacity-0 transition-opacity duration-200 group-focus-visible:opacity-100 group-hover:opacity-100" />
      <span className="pointer-events-none absolute bottom-[-1px] right-[-1px] h-2 w-2 border-b-2 border-r-2 border-signal opacity-0 transition-opacity duration-200 group-focus-visible:opacity-100 group-hover:opacity-100" />
      {pending ? "Sending" : label}
    </button>
  );
}
