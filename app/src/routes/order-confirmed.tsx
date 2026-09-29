import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { useCart } from "../components/site/cart-context";
import { SiteShell } from "../components/site/chrome";
import { Shell } from "../components/site/section";
import { getPaidOrder } from "../lib/api/store.functions";
import { ORIGIN, SITE, money } from "../lib/site";

export const Route = createFileRoute("/order-confirmed")({
  validateSearch: (s: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof s.session_id === "string" ? s.session_id.slice(0, 120) : undefined,
  }),
  head: () => ({
    meta: [{ title: "Order confirmed | Affordable Home Electronics" }, { name: "robots", content: "noindex" }],
    links: [{ rel: "canonical", href: `${ORIGIN}/order-confirmed` }],
  }),
  component: () => (
    <SiteShell>
      <Confirmed />
    </SiteShell>
  ),
});

type Order = {
  reference: string;
  status: string;
  amount_total_cents: number | null;
  shipping_cents: number | null;
  tax_cents: number | null;
  subtotal_cents: number | null;
  email: string;
};

function Confirmed() {
  const { session_id: sessionId } = Route.useSearch();
  const { refresh } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "pending">("loading");

  useEffect(() => {
    if (!sessionId) {
      setState("pending");
      return;
    }
    let alive = true;
    let tries = 0;

    // The webhook usually lands before the browser does, but not always, so
    // poll briefly rather than telling the customer their order is missing.
    const tick = async () => {
      tries += 1;
      try {
        const r = await getPaidOrder({ data: { sessionId } });
        if (!alive) return;
        if (r.found && r.status === "paid") {
          setOrder(r as Order);
          setState("ready");
          void refresh();
          return;
        }
      } catch {
        // fall through to the retry
      }
      if (!alive) return;
      if (tries >= 6) {
        setState("pending");
        void refresh();
        return;
      }
      window.setTimeout(tick, 1200);
    };
    void tick();
    return () => {
      alive = false;
    };
  }, [sessionId, refresh]);

  return (
    <Shell className="py-16">
      <div className="max-w-[640px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-signal">
          {state === "ready" ? "Payment received" : "Thank you"}
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-[1.02] tracking-tighter text-ink md:text-5xl">
          {state === "ready" ? `Paid. Reference ${order?.reference}.` : "Your order is going through."}
        </h1>

        {state === "loading" ? (
          <p className="mt-5 text-base leading-relaxed text-muted">Confirming the payment with our card processor.</p>
        ) : state === "ready" ? (
          <>
            <p className="mt-5 text-base leading-relaxed text-muted">
              A receipt is on its way to {order?.email || "your email"}. We pick, pack and confirm the ship date from the
              counter, and you will hear from us if anything on the order needs a word first.
            </p>
            <dl className="mt-8 border-y border-line text-sm">
              <Row label="Reference" value={order?.reference ?? ""} mono />
              <Row label="Items" value={money(order?.subtotal_cents ?? 0)} mono />
              <Row label="Shipping" value={(order?.shipping_cents ?? 0) === 0 ? "Free" : money(order?.shipping_cents ?? 0)} mono />
              <Row label="Tax" value={money(order?.tax_cents ?? 0)} mono />
              <Row label="Paid" value={money(order?.amount_total_cents ?? 0)} mono strong />
            </dl>
          </>
        ) : (
          <p className="mt-5 text-base leading-relaxed text-muted">
            The payment went through, and the confirmation is taking a moment to reach us. Nothing is lost. If you do not
            see a receipt by email shortly, email us at{" "}
            <a href={SITE.emailHref} className="font-mono text-ink underline underline-offset-4">
              {SITE.email}
            </a>{" "}
            and we will find it.
          </p>
        )}

        <img
          src="/assets/empty-box.png"
          alt=""
          width={1168}
          height={880}
          className="mt-10 h-44 w-auto object-contain"
        />

        <p className="mt-8 max-w-[58ch] text-sm leading-relaxed text-muted">
          You can check this order any time at{" "}
          <Link to="/orders" className="text-ink underline underline-offset-4 hover:text-signal">
            the order tracker
          </Link>
          , using the reference above and your email. No account needed.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/shop" className="inline-flex h-11 items-center bg-ink px-6 text-sm font-medium text-surface active:scale-[0.98]">
            Keep browsing
          </Link>
          <a href={SITE.emailHref} className="inline-flex h-11 items-center border border-line px-6 text-sm font-medium text-ink hover:bg-surface">
            Email the shop
          </a>
        </div>
      </div>
    </Shell>
  );
}

function Row({ label, value, mono, strong }: { label: string; value: string; mono?: boolean; strong?: boolean }) {
  return (
    <div className={`flex justify-between border-b border-line py-3 last:border-b-0 ${strong ? "font-medium" : ""}`}>
      <dt className="text-muted">{label}</dt>
      <dd className={`text-ink ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}
