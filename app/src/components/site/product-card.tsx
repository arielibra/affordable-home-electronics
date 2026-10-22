import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { money, savings } from "../../lib/site";
import { useCart } from "./cart-context";

export type CardProduct = {
  slug: string;
  name: string;
  brand: string;
  price_cents: number;
  msrp_cents: number | null;
  image: string;
  stock?: number;
  stock_tracked?: number;
};

/**
 * The green status line. "In stock" only when the shop actually counts that
 * item; uncounted items get the processing promise from the shipping policy
 * instead, which is true whatever is on the shelf.
 */
export function stockLabel(p: { stock?: number; stock_tracked?: number }): string {
  if (!isAvailable(p)) return "Out of stock";
  return p.stock_tracked ? "In stock" : "Ships in 2 business days";
}

export function isAvailable(p: { stock?: number; stock_tracked?: number }): boolean {
  return !p.stock_tracked || (p.stock ?? 0) > 0;
}

/** Bespoke chrome: a hairline box whose label swaps to a mono confirmation. */
export function AddToCartButton({
  slug,
  block = true,
  soldOut = false,
}: {
  slug: string;
  block?: boolean;
  soldOut?: boolean;
}) {
  const { add } = useCart();
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");

  async function onClick() {
    setState("busy");
    try {
      await add(slug, 1);
      setState("done");
      window.setTimeout(() => setState("idle"), 1800);
    } catch {
      setState("idle");
    }
  }

  if (soldOut) {
    return (
      <span
        className={`inline-flex h-11 items-center justify-center rounded-[10px] bg-[#e6eef6] text-[14px] font-semibold text-muted ${
          block ? "w-full" : "px-8"
        }`}
      >
        Out of stock
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === "busy"}
      className={`inline-flex h-11 items-center justify-center rounded-[10px] text-[14px] font-semibold transition-colors duration-200 ${
        block ? "w-full" : "px-8"
      } ${state === "done" ? "bg-[#11805a] text-white" : "bg-ink text-surface hover:bg-ink-soft disabled:bg-line disabled:text-muted"}`}
    >
      {state === "done" ? "✓ In your cart" : "Add to cart"}
    </button>
  );
}

export function ProductCard({ p }: { p: CardProduct }) {
  const save = savings(p.price_cents, p.msrp_cents);
  const available = isAvailable(p);
  return (
    <article className="group flex min-w-0 flex-col rounded-[14px] border border-[#dbe7f3] bg-surface p-2.5 transition-[border-color,box-shadow] duration-200 hover:border-[#9db6cf] hover:shadow-[0_14px_30px_-22px_rgba(27,58,92,0.55)] sm:p-3">
      <Link to="/p/$slug" params={{ slug: p.slug }} className="ahe-photo">
        {save && available ? (
          <span className="ahe-display absolute left-2 top-2 z-[1] rounded-md bg-signal px-2 py-0.5 text-[14px] leading-tight text-white sm:text-[16px]">
            Save {save}%
          </span>
        ) : null}
        <img src={p.image} alt={p.name} loading="lazy" width={520} height={520} />
      </Link>
      <div className="flex flex-1 flex-col px-1 pt-3">
        <p className="text-[12px] font-semibold text-signal sm:text-[13px]">{p.brand}</p>
        <h3 className="mt-0.5 line-clamp-2 min-h-[2.7em] text-[13px] leading-snug text-ink sm:text-[14px]">
          <Link to="/p/$slug" params={{ slug: p.slug }} className="hover:text-signal">
            {p.name}
          </Link>
        </h3>
        <div className="mt-2 flex flex-1 flex-wrap items-end gap-x-2 gap-y-1">
          <span className="ahe-price text-[21px] text-ink sm:text-[24px]">{money(p.price_cents)}</span>
          {p.msrp_cents && p.msrp_cents > p.price_cents ? (
            <span className="pb-0.5 text-[12px] text-muted line-through tabular-nums sm:text-[13px]">{money(p.msrp_cents)}</span>
          ) : null}
        </div>
        <span className={`ahe-live mt-1 ${available ? "" : "is-out"}`}>{stockLabel(p)}</span>
        <div className="mt-2.5">
          <AddToCartButton slug={p.slug} soldOut={!available} />
        </div>
      </div>
    </article>
  );
}
