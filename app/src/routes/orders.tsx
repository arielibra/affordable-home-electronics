import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { SiteShell } from "../components/site/chrome";
import { Field, Notice, TextInput } from "../components/site/form";
import { Mark } from "../components/site/mark";
import { Eyebrow, Shell } from "../components/site/section";
import { carrierName, trackingUrl } from "../lib/orders";
import { ORIGIN, SITE, money } from "../lib/site";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Track your order | Affordable Home Electronics" },
      {
        name: "description",
        content: "Enter your order number and the email you used to see the status of an order from Affordable Home Electronics.",
      },
    ],
    links: [{ rel: "canonical", href: `${ORIGIN}/orders` }],
  }),
  component: () => (
    <SiteShell>
      <TrackOrder />
    </SiteShell>
  ),
});

type Item = { name: string; qty: number; price_cents: number };
type Order = {
  reference: string;
  name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
  subtotal_cents: number | null;
  shipping_cents: number | null;
  tax_cents: number | null;
  amount_total_cents: number | null;
  status: string;
  carrier: string;
  tracking_number: string;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  items: Item[];
};

function when(value: string | null): string {
  if (!value) return "";
  const d = new Date(value.replace(" ", "T") + "Z");
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("en-US", { dateStyle: "long" });
}

/** Plain language, because "pending_payment" means nothing to a customer. */
function describe(status: string): { label: string; body: string } {
  if (status === "paid")
    return {
      label: "Paid",
      body: "We have your payment and the order is with the counter. You will hear from us if anything on it needs a word before it ships.",
    };
  if (status === "ready_to_ship")
    return {
      label: "Packed",
      body: "It is boxed with a label on it, waiting for the carrier's next pickup. The tracking number below will start moving once they have it.",
    };
  if (status === "shipped")
    return {
      label: "Shipped",
      body: "It is with the carrier. Track it below for where it has got to.",
    };
  if (status === "on_hold")
    return {
      label: "On hold",
      body: "Something on this order needs sorting before it can ship. The shop will have called or emailed; if not, call us and we will tell you where it stands.",
    };
  if (status === "pending_payment")
    return {
      label: "Not paid yet",
      body: "This order was started but no payment has come through. If you think that is wrong, call the shop and we will look at it with you.",
    };
  if (status === "cancelled")
    return { label: "Cancelled", body: "This order was cancelled. Call the shop if that is a surprise." };
  return { label: status, body: "Call the shop if you need the detail on this one." };
}

function TrackOrder() {
  const [order, setOrder] = useState<Order | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setPending(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch("/api/order-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: String(f.get("reference") ?? ""), email: String(f.get("email") ?? "") }),
      });
      const data = (await res.json()) as { ok: boolean; order?: Order; error?: string };
      if (data.ok && data.order) setOrder(data.order);
      else setError(data.error ?? "Could not find that order.");
    } catch {
      setError(`Could not reach the shop just now. Call ${SITE.phone} and we will look it up for you.`);
    } finally {
      setPending(false);
    }
  }

  const state = order ? describe(order.status) : null;

  return (
    <Shell className="py-14">
      <Eyebrow>Order status</Eyebrow>
      <h1 className="mt-5 max-w-[16ch] text-4xl font-semibold leading-[0.99] tracking-tighter text-ink md:text-6xl">
        Find your order.
      </h1>
      <p className="mt-5 max-w-[58ch] text-base leading-relaxed text-muted">
        Your order number is on the confirmation screen and in the receipt email. It looks like{" "}
        <span className="font-mono text-ink">AHE-1A2B3C</span>. No account needed.
      </p>

      <div className="mt-10 grid gap-12 lg:grid-cols-[380px_1fr] lg:gap-16">
        <form onSubmit={onSubmit} className="h-fit space-y-4 border border-line bg-surface p-6">
          <Field label="Order number" name="reference">
            <TextInput id="reference" name="reference" required placeholder="AHE-1A2B3C" maxLength={40} className="font-mono" />
          </Field>
          <Field label="Email used on the order" name="email">
            <TextInput id="email" name="email" type="email" required maxLength={160} autoComplete="email" />
          </Field>
          {error ? <Notice tone="bad">{error}</Notice> : null}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 w-full items-center justify-center bg-ink px-6 text-sm font-medium text-surface active:scale-[0.98] disabled:bg-line disabled:text-muted"
          >
            {pending ? "Looking" : "Find my order"}
          </button>
          <p className="text-xs leading-relaxed text-muted">
            Cannot find the number? Call{" "}
            <a href={SITE.phoneHref} className="font-mono text-ink underline underline-offset-4">
              {SITE.phone}
            </a>{" "}
            and we will look it up from your name.
          </p>
        </form>

        <div>
          {!order ? (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center border border-line bg-surface p-10 text-center">
              <Mark empty className="h-16 w-[91px] text-ink" />
              <p className="mt-6 max-w-[36ch] text-sm leading-relaxed text-muted">
                Enter the order number and email and the full order will appear here.
              </p>
            </div>
          ) : (
            <article>
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
                <div>
                  <p className="font-mono text-lg tracking-tight text-ink">{order.reference}</p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                    Placed {when(order.created_at)}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] ${
                    order.status === "paid" ? "bg-ink text-surface" : "border border-line text-muted"
                  }`}
                >
                  {state?.label}
                </span>
              </div>

              <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-muted">{state?.body}</p>

              {order.tracking_number ? (
                <div className="mt-6 max-w-[460px] border border-line bg-surface p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                    {carrierName(order.carrier) || "Tracking"}
                  </p>
                  <p className="mt-2 break-all font-mono text-sm text-ink">{order.tracking_number}</p>
                  {trackingUrl(order.carrier, order.tracking_number) ? (
                    <a
                      href={trackingUrl(order.carrier, order.tracking_number)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex h-10 items-center bg-ink px-5 text-sm font-medium text-surface"
                    >
                      Track it with {carrierName(order.carrier)}
                    </a>
                  ) : null}
                  {order.shipped_at ? (
                    <p className="mt-3 text-xs text-muted">Handed over {when(order.shipped_at)}.</p>
                  ) : null}
                </div>
              ) : null}

              {order.items.length > 0 ? (
                <>
                  <h2 className="mt-10 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">What is on it</h2>
                  <ul className="mt-3 border-t border-line">
                    {order.items.map((it, i) => (
                      <li key={`${it.name}-${i}`} className="flex justify-between gap-6 border-b border-line py-3 text-sm">
                        <span className="max-w-[46ch] leading-snug text-ink">
                          {it.name}
                          <span className="ml-2 font-mono text-[11px] text-muted">x{it.qty}</span>
                        </span>
                        <span className="shrink-0 font-mono text-ink">{money(it.price_cents * it.qty)}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              <dl className="mt-6 max-w-[380px] space-y-2 text-sm">
                {[
                  ["Items", order.subtotal_cents],
                  ["Shipping", order.shipping_cents],
                  ["Tax", order.tax_cents],
                  ["Total", order.amount_total_cents],
                ].map(([label, v]) => (
                  <div key={String(label)} className="flex justify-between">
                    <dt className="text-muted">{label}</dt>
                    <dd className="font-mono text-ink">{money((v as number | null) ?? 0)}</dd>
                  </div>
                ))}
              </dl>

              {order.address1 ? (
                <>
                  <h2 className="mt-10 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Going to</h2>
                  <address className="mt-3 text-sm not-italic leading-relaxed text-ink">
                    {order.name}
                    <br />
                    {order.address1}
                    {order.address2 ? (
                      <>
                        <br />
                        {order.address2}
                      </>
                    ) : null}
                    <br />
                    {[order.city, order.state, order.zip].filter(Boolean).join(", ")}
                  </address>
                </>
              ) : null}

              <p className="mt-10 max-w-[58ch] text-sm leading-relaxed text-muted">
                Need to change or cancel this order? Call{" "}
                <a href={SITE.phoneHref} className="font-mono text-ink underline underline-offset-4">
                  {SITE.phone}
                </a>{" "}
                with the order number. If it has not shipped, we can usually sort it on the phone.
              </p>
            </article>
          )}
        </div>
      </div>
    </Shell>
  );
}
