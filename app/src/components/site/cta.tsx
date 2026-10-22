import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { IconArrow } from "./icons";

/** Hero primary: ink slab with a signal rule that draws across on hover. */
export function ShopCta({ category, children = "Shop cameras" }: { category?: string; children?: ReactNode }) {
  const cls =
    "group relative inline-flex h-12 items-center overflow-hidden rounded-[10px] bg-ink px-7 text-[15px] font-semibold text-surface transition-transform duration-150 active:scale-[0.98]";
  const inner = (
    <>
      <span className="relative z-10">{children}</span>
      <span className="absolute bottom-0 left-0 h-[3px] w-0 bg-signal transition-[width] duration-300 ease-out group-hover:w-full" />
    </>
  );
  return category ? (
    <Link to="/shop/$category" params={{ category }} className={cls}>
      {inner}
    </Link>
  ) : (
    <Link to="/shop" className={cls}>
      {inner}
    </Link>
  );
}

/** Hero secondary: hairline ghost, mono numerals, fills to surface on hover. */
export function CallCta({ phone, href }: { phone: string; href: string }) {
  return (
    <a
      href={href}
      className="inline-flex h-12 items-center gap-3 rounded-[10px] px-6 text-[15px] font-semibold text-ink shadow-[inset_0_0_0_1.5px_#9db6cf] transition-colors duration-200 hover:bg-surface active:scale-[0.98]"
    >
      <span>Call the shop</span>
      <span className="tabular-nums text-muted">{phone}</span>
    </a>
  );
}

/** Installation band: signal field, white label, arrow steps right. */
export function QuoteCta({ children = "Get a quote", href }: { children?: ReactNode; href?: string }) {
  const cls =
    "group inline-flex h-12 items-center gap-3 rounded-[10px] bg-signal px-7 text-[15px] font-semibold text-white transition-transform duration-150 hover:bg-ink active:scale-[0.98]";
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
      className={`group inline-flex h-12 w-full items-center justify-center gap-3 rounded-[10px] px-7 text-[15px] font-semibold transition-transform duration-150 ${
        disabled
          ? "pointer-events-none border border-line bg-transparent text-muted"
          : "bg-ink text-surface active:scale-[0.98]"
      }`}
    >
      <span>{disabled ? "Add something first" : "Go to checkout"}</span>
    </Link>
  );
}

/** Forms: outlined, with corner brackets that close on focus within the form. */
export function SendCta({ label, pending }: { label: string; pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-ink px-8 text-[15px] font-semibold text-surface transition-colors duration-200 hover:bg-ink-soft disabled:cursor-not-allowed disabled:bg-line disabled:text-muted sm:w-auto"
    >
      {pending ? "Sending…" : label}
    </button>
  );
}
