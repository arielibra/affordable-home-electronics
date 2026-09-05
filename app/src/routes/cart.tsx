import { Link, createFileRoute } from "@tanstack/react-router";

import { useCart } from "../components/site/cart-context";
import { SiteShell } from "../components/site/chrome";
import { CheckoutCta } from "../components/site/cta";
import { Mark } from "../components/site/mark";
import { Shell } from "../components/site/section";
import { ORIGIN, SITE, money } from "../lib/site";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [{ title: "Your cart | Affordable Home Electronics" }, { name: "robots", content: "noindex" }],
    links: [{ rel: "canonical", href: `${ORIGIN}/cart` }],
  }),
  component: CartPage,
});

function QtyStepper({ slug, qty }: { slug: string; qty: number }) {
  const { setQty } = useCart();
  const btn = "h-9 w-9 border border-line bg-surface text-ink transition-colors hover:border-ink disabled:text-muted";
  return (
    <div className="flex items-center gap-1">
      <button type="button" aria-label="Decrease quantity" className={btn} onClick={() => void setQty(slug, qty - 1)}>
        &minus;
      </button>
      <span className="w-10 text-center font-mono text-sm text-ink">{qty}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        className={btn}
        disabled={qty >= 99}
        onClick={() => void setQty(slug, qty + 1)}
      >
        +
      </button>
    </div>
  );
}

function Skeleton() {
  return (
    <ul className="border-t border-line">
      {[0, 1].map((i) => (
        <li key={i} className="flex gap-5 border-b border-line py-6">
          <div className="h-24 w-24 shrink-0 bg-line/60" />
          <div className="flex-1 space-y-3 py-1">
            <div className="h-3 w-24 bg-line/60" />
            <div className="h-4 w-2/3 bg-line/60" />
            <div className="h-4 w-20 bg-line/60" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function CartPage() {
  return (
    <SiteShell>
      <CartBody />
    </SiteShell>
  );
}

function CartBody() {
  const { lines, subtotal, ready, setQty } = useCart();

  return (
    <>
      <Shell className="py-12">
        <h1 className="text-4xl font-semibold leading-none tracking-tighter text-ink md:text-5xl">Your cart</h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-14">
          <div>
            {!ready ? (
              <Skeleton />
            ) : lines.length === 0 ? (
              <div className="border border-line bg-surface p-10 text-center">
                <Mark empty className="mx-auto h-20 w-[114px] text-ink" />
                <p className="mt-7 text-base text-ink">Nothing in the cart yet.</p>
                <p className="mt-2 text-sm text-muted">Start with the cameras, or tell us the building and we will spec it.</p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <Link to="/shop" className="inline-flex h-11 items-center bg-ink px-6 text-sm font-medium text-surface active:scale-[0.98]">
                    Browse the catalog
                  </Link>
                  <Link to="/installation" className="inline-flex h-11 items-center border border-line px-6 text-sm font-medium text-ink hover:bg-surface">
                    Ask for a quote
                  </Link>
                </div>
              </div>
            ) : (
              <ul className="border-t border-line">
                {lines.map((l) => (
                  <li key={l.slug} className="flex flex-col gap-5 border-b border-line py-6 sm:flex-row">
                    <Link to="/p/$slug" params={{ slug: l.slug }} className="shrink-0 border border-line bg-white p-2">
                      <img src={l.image} alt={l.name} width={96} height={96} className="h-24 w-24 object-contain" />
                    </Link>
                    <div className="flex-1">
                      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{l.brand}</p>
                      <h2 className="mt-1.5 max-w-[46ch] text-sm leading-snug text-ink">
                        <Link to="/p/$slug" params={{ slug: l.slug }} className="hover:text-signal">
                          {l.name}
                        </Link>
                      </h2>
                      <div className="mt-4 flex flex-wrap items-center gap-5">
                        <QtyStepper slug={l.slug} qty={l.qty} />
                        <button
                          type="button"
                          onClick={() => void setQty(l.slug, 0)}
                          className="text-sm text-muted underline underline-offset-4 hover:text-signal"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-right font-mono text-base text-ink sm:w-28">{money(l.price_cents * l.qty)}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="h-fit border border-line bg-surface p-6">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Order summary</h2>
            <dl className="mt-5 space-y-3 border-b border-line pb-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-mono text-ink">{money(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd className="text-ink">Calculated at checkout</dd>
              </div>
            </dl>
            <p className="mt-5 text-sm leading-relaxed text-muted">
              Flat rate shipping, free over $199, or pick up free in Rego Park. Sales tax and the final total are shown
              before you pay.
            </p>
            <div className="mt-6">
              <CheckoutCta disabled={lines.length === 0} />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              In a hurry? Call{" "}
              <a href={SITE.phoneHref} className="font-mono text-ink underline underline-offset-4 hover:text-signal">
                {SITE.phone}
              </a>
              .
            </p>
          </aside>
        </div>
      </Shell>
    </>
  );
}
