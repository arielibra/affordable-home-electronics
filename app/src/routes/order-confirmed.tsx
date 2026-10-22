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
    <Shell className="py-10 md:py-12">
      <div className="max-w-[640px]">
        <p className="text-[14px] font-semibold text-signal">
          {state === "ready" ? "Payment received" : "Thank you"}
        </p>
        <h1 className="mt-4 text-[40px] text-ink md:text-[56px]">
          {state === "ready" ? `Paid. Reference ${order?.reference}.` : "Your order is going through."}
        </h1>

        {state === "loading" ? (
          <p className="mt-5 text-[16px] leading-relaxed text-muted">Confirming the payment with our card processor.</p>
        ) : state === "ready" ? (
          <>
            <p className="mt-5 text-[16px] leading-relaxed text-muted">
              A receipt is on its way to {order?.email || "your email"}. We pick, pack and confirm the ship date from the
              counter, and you will hear from us if anything on the order needs a word first.
            </p>
            <dl className="mt-6 rounded-[14px] border border-[#dbe7f3] bg-surface px-5 py-2 text-[15px]">
              <Row label="Reference" value={order?.reference ?? ""} mono />
              <Row label="Items" value={money(order?.subtotal_cents ?? 0)} mono />
              <Row label="Shipping" value={(order?.shipping_cents ?? 0) === 0 ? "Free" : money(order?.shipping_cents ?? 0)} mono />
              <Row label="Tax" value={money(order?.tax_cents ?? 0)} mono />
              <Row label="Paid" value={money(order?.amount_total_cents ?? 0)} mono strong />
            </dl>
          </>
        ) : (
          <p className="mt-5 text-[16px] leading-relaxed text-muted">
            The payment went through, and the confirmation is taking a moment to reach us. Nothing is lost. If you do not
            see a receipt by email shortly, call the shop on{" "}
            <a href={SITE.phoneHref} className="font-semibold text-ink underline underline-offset-4">
              {SITE.phone}
            </a>{" "}
            and we will find it.
          </p>
        )}

        <img
          src="/assets/empty-box.webp"
          alt=""
          width={1168}
          height={880}
          className="mt-10 h-44 w-auto object-contain"
        />

        <p className="mt-8 max-w-[58ch] text-[15px] leading-relaxed text-muted">
          You can check this order any time at{" "}
          <Link to="/orders" className="text-ink underline underline-offset-4 hover:text-signal">
            the order tracker
          </Link>
          , using the reference above and your email. No account needed.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/shop" className="inline-flex h-12 items-center rounded-[10px] bg-ink px-6 text-[15px] font-semibold text-surface active:scale-[0.98]">
            Keep browsing
          </Link>
          <a href={SITE.phoneHref} className="inline-flex h-12 items-center rounded-[10px] px-6 text-[15px] font-semibold text-ink shadow-[inset_0_0_0_1.5px_#9db6cf] hover:bg-surface">
            Call {SITE.phone}
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
      <dd className={`text-ink ${mono ? "font-semibold tabular-nums" : ""}`}>{value}</dd>
    </div>
  );
}
