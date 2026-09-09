import { useEffect, useState } from "react";

import { money } from "../../lib/site";

type Item = { name: string; qty: number; price_cents: number };
type Order = {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
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
  created_at: string;
  paid_at: string | null;
  items: Item[];
};

function when(value: string | null): string {
  if (!value) return "";
  const d = new Date(value.replace(" ", "T") + "Z");
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function Badge({ status }: { status: string }) {
  const paid = status === "paid";
  return (
    <span
      className={`inline-block px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${
        paid ? "bg-ink text-surface" : "border border-line text-muted"
      }`}
    >
      {paid ? "Paid" : status === "pending_payment" ? "Not paid" : status}
    </span>
  );
}

export function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/orders")
      .then((r) => r.json() as Promise<{ ok: boolean; orders?: Order[]; error?: string }>)
      .then((d) => {
        if (!alive) return;
        if (d.ok && d.orders) setOrders(d.orders);
        else setError(d.error ?? "Could not load orders.");
      })
      .catch(() => alive && setError("Could not load orders."))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <p className="text-sm text-muted">Loading orders.</p>;
  if (error) return <p className="border-l-2 border-signal py-2 pl-3 text-sm text-signal">{error}</p>;
  if (orders.length === 0)
    return (
      <div className="border border-line bg-surface p-10 text-center">
        <p className="text-base text-ink">No orders yet.</p>
        <p className="mt-2 text-sm text-muted">Everything that comes through the website will appear here.</p>
      </div>
    );

  const paid = orders.filter((o) => o.status === "paid");
  const takings = paid.reduce((s, o) => s + (o.amount_total_cents ?? 0), 0);

  return (
    <div>
      <p className="border-b border-line pb-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        {orders.length} orders · {paid.length} paid · {money(takings)} taken
      </p>

      <ul className="mt-2">
        {orders.map((o) => {
          const isOpen = open === o.id;
          return (
            <li key={o.id} className="border-b border-line">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : o.id)}
                aria-expanded={isOpen}
                className="flex w-full flex-wrap items-center justify-between gap-4 py-4 text-left"
              >
                <span className="flex items-center gap-4">
                  <span className="font-mono text-sm text-ink">{o.reference}</span>
                  <Badge status={o.status} />
                </span>
                <span className="flex items-center gap-6 text-sm">
                  <span className="text-ink">{o.name || "Awaiting details"}</span>
                  <span className="font-mono text-ink">{money(o.amount_total_cents ?? o.subtotal_cents ?? 0)}</span>
                  <span className="hidden font-mono text-[11px] text-muted sm:inline">{when(o.paid_at ?? o.created_at)}</span>
                </span>
              </button>

              {isOpen ? (
                <div className="grid gap-8 pb-6 lg:grid-cols-[1.3fr_1fr]">
                  <div>
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Items</h3>
                    <ul className="mt-3 border-t border-line">
                      {o.items.length === 0 ? (
                        <li className="py-3 text-sm text-muted">No line items recorded.</li>
                      ) : (
                        o.items.map((it, i) => (
                          <li key={`${it.name}-${i}`} className="flex justify-between gap-6 border-b border-line py-2.5 text-sm">
                            <span className="text-ink">
                              {it.name}
                              <span className="ml-2 font-mono text-[11px] text-muted">x{it.qty}</span>
                            </span>
                            <span className="shrink-0 font-mono text-ink">{money(it.price_cents * it.qty)}</span>
                          </li>
                        ))
                      )}
                    </ul>
                    <dl className="mt-4 space-y-1.5 text-sm">
                      {[
                        ["Items", o.subtotal_cents],
                        ["Shipping", o.shipping_cents],
                        ["Tax", o.tax_cents],
                        ["Total", o.amount_total_cents],
                      ].map(([label, v]) => (
                        <div key={String(label)} className="flex justify-between">
                          <dt className="text-muted">{label}</dt>
                          <dd className="font-mono text-ink">{money((v as number | null) ?? 0)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <div>
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Ship to</h3>
                    <address className="mt-3 text-sm not-italic leading-relaxed text-ink">
                      {o.name || "—"}
                      <br />
                      {o.address1}
                      {o.address2 ? (
                        <>
                          <br />
                          {o.address2}
                        </>
                      ) : null}
                      <br />
                      {[o.city, o.state, o.zip].filter(Boolean).join(", ")}
                    </address>
                    <div className="mt-4 space-y-1 text-sm">
                      {o.email ? (
                        <a href={`mailto:${o.email}`} className="block break-all text-ink underline underline-offset-4">
                          {o.email}
                        </a>
                      ) : null}
                      {o.phone ? (
                        <a href={`tel:${o.phone}`} className="block font-mono text-ink underline underline-offset-4">
                          {o.phone}
                        </a>
                      ) : null}
                    </div>
                    {o.notes ? (
                      <>
                        <h3 className="mt-6 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Notes</h3>
                        <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-ink">{o.notes}</p>
                      </>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
