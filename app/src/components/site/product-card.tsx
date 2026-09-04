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
};

/** Bespoke chrome: a hairline box whose label swaps to a mono confirmation. */
export function AddToCartButton({ slug, block = true }: { slug: string; block?: boolean }) {
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

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === "busy"}
      className={`inline-flex h-11 items-center justify-center border text-sm font-medium transition-colors duration-200 ${
        block ? "w-full" : "px-8"
      } ${
        state === "done"
          ? "border-ink bg-ink text-surface"
          : "border-line bg-surface text-ink hover:border-ink disabled:text-muted"
      }`}
    >
      {state === "done" ? <span className="font-mono text-[13px] tracking-tight">In your cart</span> : "Add to cart"}
    </button>
  );
}

export function ProductCard({ p }: { p: CardProduct }) {
  const save = savings(p.price_cents, p.msrp_cents);
  return (
    <article className="group flex flex-col border border-line bg-surface">
      <Link to="/p/$slug" params={{ slug: p.slug }} className="relative block bg-white p-6">
        {save ? (
          <span className="absolute left-0 top-0 bg-signal px-2 py-1 font-mono text-[11px] leading-none text-white">
            Save {save}%
          </span>
        ) : null}
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          width={520}
          height={520}
          className="mx-auto h-40 w-auto max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
        />
      </Link>
      <div className="flex flex-1 flex-col border-t border-line p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{p.brand}</p>
        <h3 className="mt-2 text-sm leading-snug text-ink">
          <Link to="/p/$slug" params={{ slug: p.slug }} className="hover:text-signal">
            {p.name}
          </Link>
        </h3>
        <div className="mt-3 flex flex-1 items-end gap-3">
          <span className="font-mono text-lg leading-none tracking-tight text-ink">{money(p.price_cents)}</span>
          {p.msrp_cents && p.msrp_cents > p.price_cents ? (
            <span className="font-mono text-[13px] leading-none text-muted line-through">{money(p.msrp_cents)}</span>
          ) : null}
        </div>
        <div className="mt-4">
          <AddToCartButton slug={p.slug} />
        </div>
      </div>
    </article>
  );
}
