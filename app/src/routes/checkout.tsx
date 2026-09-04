import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { useCart } from "../components/site/cart-context";
import { SiteShell } from "../components/site/chrome";
import { Field, Notice, TextArea, TextInput } from "../components/site/form";
import { Shell } from "../components/site/section";
import { placeOrder } from "../lib/api/store.functions";
import { ORIGIN, SITE, money } from "../lib/site";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [{ title: "Place your order | Affordable Home Electronics" }, { name: "robots", content: "noindex" }],
    links: [{ rel: "canonical", href: `${ORIGIN}/checkout` }],
  }),
  component: CheckoutPage,
});

type Done = { reference: string; subtotal: number } | null;

function CheckoutPage() {
  return (
    <SiteShell>
      <CheckoutBody />
    </SiteShell>
  );
}

function CheckoutBody() {
  const { lines, subtotal, cartId, ready, refresh } = useCart();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<Done>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setPending(true);
    setError("");
    try {
      const r = await placeOrder({
        data: {
          cartId,
          name: String(f.get("name") ?? ""),
          email: String(f.get("email") ?? ""),
          phone: String(f.get("phone") ?? ""),
          company: String(f.get("company") ?? ""),
          address1: String(f.get("address1") ?? ""),
          address2: String(f.get("address2") ?? ""),
          city: String(f.get("city") ?? ""),
          state: String(f.get("state") ?? ""),
          zip: String(f.get("zip") ?? ""),
          notes: String(f.get("notes") ?? ""),
        },
      });
      if (!r.ok) {
        setError("The cart emptied before the order went through. Add the items again, or call the shop.");
        return;
      }
      setDone({ reference: r.reference, subtotal: r.subtotal });
      await refresh();
    } catch {
      setError(`That did not go through. Call ${SITE.phone} and we will take the order on the phone.`);
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <>
        <Shell className="py-16">
          <div className="max-w-[620px]">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-signal">Order received</p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.02] tracking-tighter text-ink md:text-5xl">
              We have it. Reference {done.reference}.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted">
              Someone from the shop will call to confirm stock, shipping and the final total. Nothing has been charged to
              you, and nothing ships until you say go.
            </p>
            <dl className="mt-8 border-y border-line py-5 text-sm">
              <div className="flex justify-between py-1.5">
                <dt className="text-muted">Reference</dt>
                <dd className="font-mono text-ink">{done.reference}</dd>
              </div>
              <div className="flex justify-between py-1.5">
                <dt className="text-muted">Items subtotal</dt>
                <dd className="font-mono text-ink">{money(done.subtotal)}</dd>
              </div>
            </dl>
            <img
              src="/assets/empty-box.png"
              alt=""
              width={1168}
              height={880}
              className="mt-10 h-48 w-auto object-contain"
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="inline-flex h-11 items-center bg-ink px-6 text-sm font-medium text-surface active:scale-[0.98]">
                Keep browsing
              </Link>
              <a href={SITE.phoneHref} className="inline-flex h-11 items-center border border-line px-6 text-sm font-medium text-ink hover:bg-surface">
                Call {SITE.phone}
              </a>
            </div>
          </div>
        </Shell>
      </>
    );
  }

  return (
    <>
      <Shell className="py-12">
        <h1 className="text-4xl font-semibold leading-none tracking-tighter text-ink md:text-5xl">Place your order</h1>
        <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-muted">
          Send the order through and the shop calls you back to confirm stock, shipping and the total. No card details are
          taken on this page and nothing is charged here.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-14">
          <form onSubmit={onSubmit} className="space-y-5">
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
              <legend className="sr-only">Where it ships</legend>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Where it ships</h2>
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
              <Field label="Notes for the shop" name="notes" hint="Install request, delivery window, PO number, anything else.">
                <TextArea id="notes" name="notes" rows={3} maxLength={1000} />
              </Field>
            </fieldset>

            {error ? <Notice tone="bad">{error}</Notice> : null}

            <button
              type="submit"
              disabled={pending || lines.length === 0}
              className="group inline-flex h-12 items-center gap-3 bg-ink px-8 text-sm font-medium text-surface transition-transform duration-150 active:scale-[0.98] disabled:bg-line disabled:text-muted"
            >
              <span className="h-2 w-2 bg-muted transition-colors duration-200 group-hover:bg-signal" />
              {pending ? "Sending the order" : "Send the order"}
            </button>
          </form>

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
            <div className="mt-5 flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="font-mono text-ink">{money(subtotal)}</span>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-muted">
              Shipping is quoted once we see the address and the box count. Pickup in Rego Park is free.
            </p>
          </aside>
        </div>
      </Shell>
    </>
  );
}
