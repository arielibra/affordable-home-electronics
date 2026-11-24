import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { useCart } from "../components/site/cart-context";
import { resolveFeedItem } from "../lib/api/store.functions";
import { SiteShell } from "../components/site/chrome";
import { CheckoutCta } from "../components/site/cta";
import { Mark } from "../components/site/mark";
import { Shell } from "../components/site/section";
import { ORIGIN, SITE, money } from "../lib/site";
import { FREE_SHIPPING_THRESHOLD_CENTS } from "../lib/shipping";

type CartSearch = { add?: string; qty?: number };

export const Route = createFileRoute("/cart")({
  // ?add=<Merchant Center id>&qty=<n> is the checkout link Google's
  // "Checkout" button opens: the product goes into the cart on arrival.
  validateSearch: (s: Record<string, unknown>): CartSearch => {
    const out: CartSearch = {};
    if (typeof s.add === "string" && s.add.trim()) out.add = s.add.trim().slice(0, 120);
    const q = Number(s.qty);
    if (Number.isInteger(q) && q >= 1 && q <= 99) out.qty = q;
    return out;
  },
  head: () => ({
    meta: [{ title: "Your cart | Affordable Home Electronics" }, { name: "robots", content: "noindex" }],
    links: [{ rel: "canonical", href: `${ORIGIN}/cart` }],
  }),
  component: CartPage,
});

/** Quantity changes and removals that fail (a dropped connection, a timeout)
 *  used to throw silently. Now the shopper is told, and nothing is left
 *  half-done: the cart simply keeps its last good state. */
function useSafeSetQty() {
  const { setQty } = useCart();
  const [failed, setFailed] = useState(false);
  const run = async (slug: string, qty: number) => {
    try {
      setFailed(false);
      await setQty(slug, qty);
    } catch {
      setFailed(true);
    }
  };
  return { run, failed };
}

function QtyStepper({ slug, qty, onChange }: { slug: string; qty: number; onChange: (slug: string, qty: number) => void }) {
  const setQty = onChange;
  const btn = "h-10 w-10 rounded-[10px] border-[1.5px] border-[#c6d9ec] bg-surface text-[18px] text-signal transition-colors hover:border-signal disabled:text-muted";
  return (
    <div className="flex items-center gap-1">
      <button type="button" aria-label="Decrease quantity" className={btn} onClick={() => void setQty(slug, qty - 1)}>
        &minus;
      </button>
      <span className="w-10 text-center text-[16px] font-semibold tabular-nums text-ink">{qty}</span>
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

/** Adds the product named in ?add= once the cart is ready, then drops the
 *  query so a reload or a shared link does not add it a second time. */
function useAddFromLink() {
  const { add: addParam, qty } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { add, ready } = useCart();
  const [adding, setAdding] = useState(Boolean(addParam));
  const [missing, setMissing] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    if (!addParam || !ready || done.current) return;
    done.current = true;
    void (async () => {
      try {
        const r = await resolveFeedItem({ data: { id: addParam } });
        if (r.slug) await add(r.slug, qty ?? 1);
        else setMissing(true);
      } catch {
        setMissing(true);
      } finally {
        setAdding(false);
        void navigate({ search: {}, replace: true });
      }
    })();
  }, [addParam, qty, ready, add, navigate]);

  return { adding, missing };
}

function CartBody() {
  const { lines, subtotal, ready: cartReady } = useCart();
  const { run: setQty, failed } = useSafeSetQty();
  const { adding, missing } = useAddFromLink();
  const ready = cartReady && !adding;

  return (
    <>
      <Shell className="py-8 md:py-10">
        <h1 className="text-[40px] text-ink md:text-[56px]">Your cart</h1>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px] lg:gap-8">
          <div>
            {missing ? (
              <p role="status" className="mb-3 rounded-lg border-l-[3px] border-signal bg-surface px-3.5 py-2.5 text-[15px] text-ink">
                Sorry, that product is no longer in our catalog. Call us and we will find you the closest match.
              </p>
            ) : null}
            {!ready ? (
              <Skeleton />
            ) : lines.length === 0 ? (
              <div className="rounded-[14px] border border-[#dbe7f3] bg-surface p-10 text-center">
                <Mark empty className="mx-auto h-20 w-[114px] text-ink" />
                <p className="mt-7 text-base text-ink">Nothing in the cart yet.</p>
                <p className="mt-2 text-[15px] text-muted">Start with the cameras, or tell us the building and we will spec it.</p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <Link to="/shop" className="inline-flex h-12 items-center rounded-[10px] bg-ink px-6 text-[15px] font-semibold text-surface active:scale-[0.98]">
                    Browse the catalog
                  </Link>
                  <Link to="/installation" className="inline-flex h-12 items-center rounded-[10px] px-6 text-[15px] font-semibold text-ink shadow-[inset_0_0_0_1.5px_#9db6cf] hover:bg-surface">
                    Ask for a quote
                  </Link>
                </div>
              </div>
            ) : (
              <>
              {failed ? (
                <p role="alert" className="mb-3 rounded-lg border-l-[3px] border-signal bg-surface px-3.5 py-2.5 text-[15px] text-signal">
                  We couldn't update your cart. Check your connection and try again.
                </p>
              ) : null}
              <ul className="rounded-[14px] border border-[#dbe7f3] bg-surface px-4 sm:px-5">
                {lines.map((l) => (
                  <li key={l.slug} className="flex gap-4 border-b border-[#eef3f8] py-4 last:border-b-0 sm:gap-5">
                    {/* Add-ons (a hard drive for a recorder) have no page of their own. */}
                    {l.addon ? (
                      <span className="ahe-photo h-[72px] w-[72px] shrink-0 border border-[#e3edf7] sm:h-[88px] sm:w-[88px]">
                        <img src={l.image} alt={l.name} width={96} height={96} />
                      </span>
                    ) : (
                      <Link to="/p/$slug" params={{ slug: l.slug }} className="ahe-photo h-[72px] w-[72px] shrink-0 border border-[#e3edf7] sm:h-[88px] sm:w-[88px]">
                        <img src={l.image} alt={l.name} width={96} height={96} />
                      </Link>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-signal">{l.brand}</p>
                      <h2 className="ahe-plain mt-0.5 max-w-[46ch] text-[15px] leading-snug text-ink">
                        {l.addon ? (
                          l.name
                        ) : (
                          <Link to="/p/$slug" params={{ slug: l.slug }} className="hover:text-signal">
                            {l.name}
                          </Link>
                        )}
                      </h2>
                      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                        <QtyStepper slug={l.slug} qty={l.qty} onChange={(slug, q) => void setQty(slug, q)} />
                        <button
                          type="button"
                          onClick={() => void setQty(l.slug, 0)}
                          className="text-[14px] text-signal underline underline-offset-4 hover:text-ink"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="ahe-price shrink-0 text-right text-[22px] text-ink sm:w-28 sm:text-[24px]">{money(l.price_cents * l.qty)}</div>
                  </li>
                ))}
              </ul>
              </>
            )}
          </div>

          <aside className="h-fit rounded-[14px] border border-[#dbe7f3] bg-surface p-5">
            <h2 className="text-[26px] text-ink">Your order</h2>
            <dl className="mt-3 space-y-1.5 text-[15px]">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular-nums text-ink">{money(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd className="text-ink">{subtotal >= FREE_SHIPPING_THRESHOLD_CENTS ? "Free" : "Calculated at checkout"}</dd>
              </div>
            </dl>
            {lines.length > 0 ? (
              <div className="mt-4">
                <p className="mb-1.5 text-[14px] font-semibold text-[#11805a]">
                  {subtotal >= FREE_SHIPPING_THRESHOLD_CENTS
                    ? "You've unlocked free shipping"
                    : `${money(FREE_SHIPPING_THRESHOLD_CENTS - subtotal)} away from free shipping`}
                </p>
                <div className="h-2 overflow-hidden rounded-full bg-[#e6eef6]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#2ab8e0] to-[#19a974]"
                    style={{ width: `${Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD_CENTS) * 100))}%` }}
                  />
                </div>
              </div>
            ) : null}
            <p className="mt-4 border-t border-[#dbe7f3] pt-4 text-[14px] leading-relaxed text-muted">
              Flat rate shipping, free over $199. Sales tax and the final total are shown before you pay.
            </p>
            <div className="mt-6">
              <CheckoutCta disabled={lines.length === 0} />
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              In a hurry? Call{" "}
              <a href={SITE.phoneHref} className="font-semibold text-ink underline underline-offset-4 hover:text-signal">
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
