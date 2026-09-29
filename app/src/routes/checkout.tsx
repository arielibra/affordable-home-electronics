import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { useCart } from "../components/site/cart-context";
import { undeliverableReason } from "../lib/address";
import { SiteShell } from "../components/site/chrome";
import { Field, Notice, TextArea, TextInput } from "../components/site/form";
import { PayMarks } from "../components/site/pay-marks";
import { Shell } from "../components/site/section";
import { getCheckoutConfig, placeOrder } from "../lib/api/store.functions";
import { ORIGIN, SITE, money } from "../lib/site";

type PaypalButtons = {
  Buttons: (o: Record<string, unknown>) => { render: (el: HTMLElement) => void; close: () => void };
  FUNDING: Record<string, string>;
};
declare global {
  interface Window {
    paypal?: PaypalButtons;
  }
}

export const Route = createFileRoute("/checkout")({
  loader: () => getCheckoutConfig(),
  head: () => ({
    meta: [{ title: "Checkout | Affordable Home Electronics" }, { name: "robots", content: "noindex" }],
    links: [{ rel: "canonical", href: `${ORIGIN}/checkout` }],
  }),
  component: CheckoutPage,
});

type Method = "card" | "paypal" | "phone";
type Done = { reference: string; paid: boolean; total?: number } | null;

function CheckoutPage() {
  return (
    <SiteShell>
      <CheckoutBody />
    </SiteShell>
  );
}

function json(url: string, body: unknown) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json() as Promise<Record<string, unknown>>);
}

function CheckoutBody() {
  const cfg = Route.useLoaderData();
  const { lines, subtotal, cartId, ready, refresh } = useCart();

  const first: Method = cfg.payments ? "card" : cfg.paypal ? "paypal" : "phone";
  const [method, setMethod] = useState<Method>(first);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<Done>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const stateRef = useRef({ cartId });
  stateRef.current = { cartId };

  const shipping = subtotal >= cfg.freeShippingOverCents ? 0 : cfg.shippingFlatCents;

  function details() {
    const f = new FormData(formRef.current ?? undefined);
    const g = (k: string) => String(f.get(k) ?? "");
    return {
      name: g("name"),
      email: g("email"),
      phone: g("phone"),
      company: g("company"),
      address1: g("address1"),
      address2: g("address2"),
      city: g("city"),
      state: g("state"),
      zip: g("zip"),
      notes: g("notes"),
    };
  }

  async function payByCard() {
    setPending(true);
    setError("");
    try {
      const r = await json("/api/checkout", { cartId, notes: String(new FormData(formRef.current ?? undefined).get("notes") ?? "") });
      if (!r.ok || typeof r.url !== "string") {
        setError(String(r.error ?? "Card payment could not be started. Please try again."));
        return;
      }
      window.location.href = r.url;
    } catch {
      setError(`That did not go through. Call ${SITE.phone} and we will take the order on the phone.`);
    } finally {
      setPending(false);
    }
  }

  async function sendPhoneOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d0 = details();
    const bad0 = undeliverableReason(d0);
    if (bad0) {
      setError(bad0);
      return;
    }
    setPending(true);
    setError("");
    try {
      const d = details();
      const r = await placeOrder({ data: { cartId, ...d } });
      if (!r.ok) {
        setError("The cart emptied before the order went through. Add the items again, or call the shop.");
        return;
      }
      setDone({ reference: r.reference, paid: false, total: r.subtotal });
      await refresh();
    } catch {
      setError(`That did not go through. Call ${SITE.phone} and we will take the order on the phone.`);
    } finally {
      setPending(false);
    }
  }

  // --- PayPal: load the SDK only when that tab is actually chosen ---
  const [sdk, setSdk] = useState(false);
  useEffect(() => {
    if (method !== "paypal" || !cfg.paypal || !cfg.paypalClientId) return;
    if (window.paypal) {
      setSdk(true);
      return;
    }
    const el = document.createElement("script");
    // disable-funding trims what PayPal offers inside its own button:
    //   card     — Stripe already handles cards, and two card paths is two
    //              places for an order to go wrong.
    //   paylater — buy now pay later. The shop does not offer credit, which is
    //              the same call that took Klarna and Affirm off Stripe.
    el.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(cfg.paypalClientId)}&currency=USD&intent=capture&disable-funding=card,paylater`;
    el.async = true;
    el.onload = () => setSdk(true);
    el.onerror = () =>
      setError(
        "PayPal did not load, so that option is unavailable right now. Pay by card instead, or call the shop and we will take the order over the phone.",
      );
    document.body.appendChild(el);
  }, [method, cfg.paypal, cfg.paypalClientId]);

  const slot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!sdk || method !== "paypal" || !slot.current || !window.paypal) return;
    const host = slot.current;
    host.innerHTML = "";
    const buttons = window.paypal.Buttons({
      // Render exactly one button: PayPal itself.
      //
      // `disable-funding` on the script URL is only a hint about what PayPal
      // *may* offer, and Pay Later kept appearing through it. Naming the
      // funding source here is the definitive version — the SDK renders this
      // one and nothing else, so no buy-now-pay-later, no Venmo, no card.
      fundingSource: window.paypal.FUNDING.PAYPAL,
      style: { layout: "vertical", shape: "rect", height: 48 },
      createOrder: async () => {
        const form = formRef.current;
        if (form && !form.reportValidity()) throw new Error("Delivery details are incomplete.");
        const bad = undeliverableReason(details());
        if (bad) {
          setError(bad);
          throw new Error(bad);
        }
        setError("");
        const r = await json("/api/paypal/create", {
          cartId: stateRef.current.cartId,
          ...details(),
        });
        if (!r.ok || typeof r.id !== "string") {
          const message = String(r.error ?? "PayPal could not start the order.");
          setError(message);
          throw new Error(message);
        }
        return r.id;
      },
      onApprove: async (data: { orderID: string }) => {
        setPending(true);
        try {
          const r = await json("/api/paypal/capture", { orderId: data.orderID });
          if (!r.ok || typeof r.reference !== "string") {
            setError(String(r.error ?? "PayPal did not complete the payment."));
            return;
          }
          setDone({ reference: r.reference, paid: true });
          await refresh();
        } finally {
          setPending(false);
        }
      },
      onCancel: () => setError(""),
      onError: () => setError(`PayPal ran into a problem. Try a card, or call ${SITE.phone}.`),
    });
    buttons.render(host);
    return () => {
      try {
        buttons.close();
      } catch {
        /* already gone */
      }
    };
  }, [sdk, method, refresh]);

  if (done) {
    return (
      <Shell className="py-16">
        <div className="max-w-[620px]">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-signal">
            {done.paid ? "Payment received" : "Order received"}
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.02] tracking-tighter text-ink md:text-5xl">
            {done.paid ? "Paid. Reference " : "We have it. Reference "}
            {done.reference}.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted">
            {done.paid
              ? "PayPal has taken the payment and the shop has the order. Someone will call to confirm the shipping date, and you will get a PayPal receipt by email."
              : "Someone from the shop will call to confirm stock, shipping and the final total. Nothing has been charged to you, and nothing ships until you say go."}
          </p>
          <dl className="mt-8 border-y border-line py-5 text-sm">
            <div className="flex justify-between py-1.5">
              <dt className="text-muted">Reference</dt>
              <dd className="font-mono text-ink">{done.reference}</dd>
            </div>
            {done.total !== undefined ? (
              <div className="flex justify-between py-1.5">
                <dt className="text-muted">Items subtotal</dt>
                <dd className="font-mono text-ink">{money(done.total)}</dd>
              </div>
            ) : null}
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/shop" className="inline-flex h-11 items-center bg-ink px-6 text-sm font-medium text-surface active:scale-[0.98]">
              Keep browsing
            </Link>
            <Link to="/orders" className="inline-flex h-11 items-center border border-line px-6 text-sm font-medium text-ink hover:bg-surface">
              Track this order
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  const tabs: { id: Method; label: string; note: string; on: boolean }[] = [
    { id: "card", label: "Credit or debit card", note: "Visa, Mastercard, Amex, Discover, Apple Pay and Google Pay", on: cfg.payments },
    { id: "paypal", label: "PayPal", note: "Pay with your PayPal balance, bank or saved card", on: cfg.paypal },
    { id: "phone", label: "Order without paying now", note: "We call you back to confirm stock and take payment", on: true },
  ];
  const shown = tabs.filter((t) => t.on);
  const needsAddress = method !== "card";

  return (
    <Shell className="py-12">
      <h1 className="text-4xl font-semibold leading-none tracking-tighter text-ink md:text-5xl">Checkout</h1>
      <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-muted">
        {cfg.payments || cfg.paypal
          ? "Pay online and the order goes straight through. Prefer to talk to someone first? Send it as a callback instead and nothing is charged."
          : "Online payment is not switched on yet, so send the order through and the shop will call you back to confirm stock, shipping and the total."}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-14">
        <div>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">How would you like to pay?</h2>
          <div className="mt-4 grid gap-2">
            {shown.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setMethod(t.id);
                  setError("");
                }}
                className={`flex items-start gap-3 border p-4 text-left transition-colors ${
                  method === t.id ? "border-ink bg-surface" : "border-line bg-surface/60 hover:border-line-dark"
                }`}
              >
                <span
                  className={`mt-[3px] h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
                    method === t.id ? "border-signal bg-signal" : "border-line"
                  }`}
                />
                <span>
                  <span className="block text-sm font-medium text-ink">{t.label}</span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-muted">{t.note}</span>
                </span>
              </button>
            ))}
          </div>

          <form ref={formRef} onSubmit={sendPhoneOrder} className="mt-8 space-y-5">
            {needsAddress ? (
              <>
                <fieldset className="space-y-4 border-t border-line pt-6">
                  <legend className="sr-only">Who you are</legend>
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Who you are</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full name" name="name">
                      <TextInput id="name" name="name" required minLength={2} maxLength={120} autoComplete="name" />
                    </Field>
                    <Field label="Company" name="company" hint="Optional">
                      <TextInput id="company" name="company" maxLength={120} autoComplete="organization" />
                    </Field>
                    <Field label="Email" name="email">
                      <TextInput id="email" name="email" type="email" required maxLength={160} autoComplete="email" />
                    </Field>
                    <Field label="Phone" name="phone">
                      <TextInput id="phone" name="phone" required minLength={7} maxLength={40} inputMode="tel" autoComplete="tel" />
                    </Field>
                  </div>
                </fieldset>

                <fieldset className="space-y-4 border-t border-line pt-6">
                  <legend className="sr-only">Where it goes</legend>
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Where it goes</h2>
                      <Field label="Street address" name="address1">
                        <TextInput id="address1" name="address1" required minLength={3} maxLength={160} autoComplete="address-line1" />
                      </Field>
                      <Field label="Apartment, suite, floor" name="address2" hint="Optional">
                        <TextInput id="address2" name="address2" maxLength={160} autoComplete="address-line2" />
                      </Field>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <Field label="City" name="city">
                          <TextInput id="city" name="city" required minLength={2} maxLength={80} autoComplete="address-level2" />
                        </Field>
                        <Field label="State" name="state">
                          <TextInput id="state" name="state" required minLength={2} maxLength={40} autoComplete="address-level1" />
                        </Field>
                        <Field label="ZIP" name="zip">
                          <TextInput id="zip" name="zip" required minLength={3} maxLength={16} autoComplete="postal-code" />
                        </Field>
                      </div>
</fieldset>
              </>
            ) : null}

            <fieldset className="space-y-4 border-t border-line pt-6">
              <legend className="sr-only">Anything else</legend>
              <Field label="Notes for the shop" name="notes" hint="Install request, delivery window, PO number, anything else.">
                <TextArea id="notes" name="notes" rows={3} maxLength={1000} />
              </Field>
            </fieldset>

            <p className="border-t border-line pt-5 text-[13px] leading-relaxed text-muted">
              Before you pay, our{" "}
              <Link to="/returns" className="text-ink underline underline-offset-4 hover:text-signal">
                returns and refunds policy
              </Link>{" "}
              and{" "}
              <Link to="/shipping" className="text-ink underline underline-offset-4 hover:text-signal">
                shipping policy
              </Link>
              . Ten days from delivery to return something, and we ship by UPS, which cannot deliver to a PO box.
            </p>

            {error ? <Notice tone="bad">{error}</Notice> : null}

            {method === "card" ? (
              <>
                <button
                  type="button"
                  onClick={payByCard}
                  disabled={pending || lines.length === 0}
                  className="group inline-flex h-12 items-center gap-3 bg-ink px-8 text-sm font-medium text-surface transition-transform duration-150 active:scale-[0.98] disabled:bg-line disabled:text-muted"
                >
                  <span className="h-2 w-2 bg-muted transition-colors duration-200 group-hover:bg-signal" />
                  {pending ? "Opening secure checkout" : "Pay by card"}
                </button>
                <p className="text-[13px] leading-relaxed text-muted">
                  The card page is hosted by Stripe. Your card details never touch this website. You enter the shipping
                  address there.
                </p>
              </>
            ) : null}

            {method === "paypal" ? (
              <div>
                <div ref={slot} className="max-w-[380px]" />
                {!sdk ? <p className="text-[13px] text-muted">Loading PayPal.</p> : null}
                <p className="mt-3 text-[13px] leading-relaxed text-muted">
                  Shipping and sales tax are worked out from the address above before PayPal asks you to confirm, so the
                  amount you approve is the final amount.
                </p>
              </div>
            ) : null}

            {method === "phone" ? (
              <button
                type="submit"
                disabled={pending || lines.length === 0}
                className="group inline-flex h-12 items-center gap-3 bg-ink px-8 text-sm font-medium text-surface transition-transform duration-150 active:scale-[0.98] disabled:bg-line disabled:text-muted"
              >
                <span className="h-2 w-2 bg-muted transition-colors duration-200 group-hover:bg-signal" />
                {pending ? "Sending the order" : "Send the order"}
              </button>
            ) : null}
          </form>
        </div>

        <aside className="h-fit border border-line bg-surface p-6">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">In this order</h2>
          {!ready ? (
            <p className="mt-5 text-sm text-muted">Loading your cart.</p>
          ) : lines.length === 0 ? (
            <p className="mt-5 text-sm text-muted">
              Your cart is empty.{" "}
              <Link to="/shop" className="text-ink underline underline-offset-4 hover:text-signal">
                Add something first
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {lines.map((l) => (
                <li key={l.slug} className="flex justify-between gap-4 py-3 text-sm">
                  <span className="max-w-[22ch] leading-snug text-ink">
                    {l.name}
                    <span className="ml-2 font-mono text-[11px] text-muted">x{l.qty}</span>
                  </span>
                  <span className="shrink-0 font-mono text-ink">{money(l.price_cents * l.qty)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-5 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span className="font-mono text-ink">{money(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <span className="font-mono text-ink">{shipping === 0 ? "Free" : money(shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Sales tax</span>
              <span className="font-mono text-muted">Worked out at payment</span>
            </div>
          </div>
          <p className="mt-5 text-[13px] leading-relaxed text-muted">
            Free shipping over {money(cfg.freeShippingOverCents)}.
          </p>
          <div className="mt-6 border-t border-line pt-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Accepted here</p>
            <div className="mt-3">
              <PayMarks label={null} />
            </div>
          </div>
        </aside>
      </div>
    </Shell>
  );
}
