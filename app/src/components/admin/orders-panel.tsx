import { useCallback, useEffect, useState } from "react";

import { CARRIERS, CHANNELS, STATE_LABEL, carrierName, channelName, shopMayEmailBuyer, trackingUrl, type OrderState } from "../../lib/orders";
import { AddOrder } from "./add-order";
import { OrderEditor } from "./order-editor";
import { money } from "../../lib/site";
import { btnLink, btnPrimary, card, input, label, orderCard, pillInk, pillQuiet } from "./ui";

type Item = { name: string; qty: number; price_cents: number };

export type AdminOrder = {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  company: string;
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
  provider: string;
  carrier: string;
  tracking_number: string;
  hold_reason: string;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  shipped_notified_at: string | null;
  channel: string;
  channel_ref: string;
  cancel_reason?: string;
  cancelled_at?: string | null;
  cancel_notified_at?: string | null;
  items: Item[];
};

type Tab = OrderState | "all" | "year";

const TABS: { key: Tab; label: string }[] = [
  { key: "paid", label: "Paid" },
  { key: "ready_to_ship", label: "Ready to ship" },
  { key: "shipped", label: "Shipped" },
  { key: "on_hold", label: "On hold" },
  { key: "cancelled", label: "Cancelled" },
  { key: "all", label: "Everything" },
  { key: "year", label: "By year" },
];


const when = (s: string | null) => (s ? s.replace("T", " ").slice(0, 16) : "");

function Card({ order, onChanged }: { order: AdminOrder; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [carrier, setCarrier] = useState(order.carrier || "ups");
  const [tracking, setTracking] = useState(order.tracking_number);
  const [hold, setHold] = useState(order.hold_reason);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [mailProblem, setMailProblem] = useState<{ text: string; bad: boolean } | null>(null);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: order.reference, ...body }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        notified?: { ok: boolean; error: string; expected: boolean } | null;
      };
      if (!data.ok) {
        setError(data.error ?? "Could not save.");
        return;
      }
      // The order saved either way. If the customer's email did not go, say so
      // here rather than leaving him believing they have been told.
      if (data.notified && !data.notified.ok) {
        // "expected" covers the cases that are correct rather than broken: a
        // marketplace that tells its own buyers, or an order with no address
        // on it. Those are stated plainly instead of alarmingly.
        setMailProblem({ text: data.notified.error, bad: !data.notified.expected });
      } else if (data.notified?.ok) {
        setMailProblem(null);
      }
      onChanged();
    } catch {
      setError("Could not reach the site.");
    } finally {
      setBusy(false);
    }
  }

  const link = trackingUrl(order.carrier, order.tracking_number);

  return (
    <div className={`${orderCard} ${open ? "ahe-order-open" : ""}`}>
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center gap-4 text-left">
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-ink">{order.reference}</span>
            <span className={pillQuiet}>
              {STATE_LABEL[order.status as OrderState] ?? order.status}
            </span>
            {order.channel && order.channel !== "site" ? (
              <span className={pillInk}>
                {channelName(order.channel)}
              </span>
            ) : null}
          </span>
          <span className="mt-1 block truncate text-sm text-muted">
            {order.name || "No name"} · {when(order.paid_at ?? order.created_at)}
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block font-mono text-sm text-ink">{money(order.amount_total_cents ?? 0)}</span>
          {order.tracking_number ? (
            <span className="block font-mono text-[10px] text-muted">{carrierName(order.carrier)}</span>
          ) : null}
        </span>
      </button>

      {open ? (
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="text-[13px] font-medium text-muted">In this order</p>
            <ul className="mt-3 space-y-1">
              {order.items.length === 0 ? (
                <li className="py-2 text-sm text-muted">No line items recorded.</li>
              ) : (
                order.items.map((it, i) => (
                  <li key={i} className="flex justify-between gap-4 py-2 text-sm">
                    <span className="text-ink">
                      {it.name}
                      <span className="ml-2 font-mono text-[13px] text-muted">x{it.qty}</span>
                    </span>
                    <span className="shrink-0 font-mono text-ink">{money(it.price_cents * it.qty)}</span>
                  </li>
                ))
              )}
            </ul>

            <dl className="mt-3 space-y-1 text-sm">
              {[
                ["Subtotal", order.subtotal_cents],
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

            {order.channel && order.channel !== "site" ? (
              <p className="mt-3 text-sm text-muted">
                {channelName(order.channel)} order{" "}
                <span className="font-mono text-ink">{order.channel_ref}</span>
              </p>
            ) : null}

            <p className="mt-5 text-[15px] font-semibold tracking-[-0.01em] text-ink">Ships to</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink">
              {order.name}
              {order.address1 ? (
                <>
                  <br />
                  {order.address1}
                  {order.address2 ? `, ${order.address2}` : ""}
                  <br />
                  {order.city}, {order.state} {order.zip}
                </>
              ) : null}
            </p>
            <p className="mt-2 text-sm text-muted">
              {order.email}
              {order.phone ? ` · ${order.phone}` : ""}
            </p>
            {order.notes ? (
              <p className="mt-3 border-l-2 border-line pl-3 text-[15px] leading-[1.55] text-muted">{order.notes}</p>
            ) : null}
          </div>

          <div className={card}>
            <p className="text-[13px] font-medium text-muted">Tracking</p>
            <div className="mt-2 space-y-2">
              <select value={carrier} onChange={(e) => setCarrier(e.currentTarget.value)} className={input}>
                {CARRIERS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                value={tracking}
                placeholder="Tracking number"
                onChange={(e) => setTracking(e.currentTarget.value)}
                className={input}
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => patch({ carrier, tracking_number: tracking })}
                className="h-9 w-full border border-[color:var(--admin-hairline)] text-[13px] font-medium text-ink hover:border-ink disabled:text-muted"
              >
                Save tracking
              </button>
              {link ? (
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-[13px] text-ink underline underline-offset-4"
                >
                  Track this parcel
                </a>
              ) : null}
            </div>

            <p className="mt-5 text-[15px] font-semibold tracking-[-0.01em] text-ink">Move to</p>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {(["paid", "ready_to_ship", "shipped", "on_hold"] as OrderState[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={busy || order.status === s}
                  onClick={() => patch(s === "shipped" ? { status: s, carrier, tracking_number: tracking } : { status: s })}
                  className={`h-9 border px-2 text-[13px] ${
                    order.status === s ? "border-ink bg-ground text-muted" : "border-line text-ink hover:border-ink"
                  }`}
                >
                  {STATE_LABEL[s]}
                </button>
              ))}
            </div>

            {order.status === "on_hold" || hold ? (
              <div className="mt-4">
                <p className="text-[13px] font-medium text-muted">Why it is on hold</p>
                <input
                  value={hold}
                  placeholder="Waiting on stock, customer to confirm…"
                  onChange={(e) => setHold(e.currentTarget.value)}
                  onBlur={() => hold !== order.hold_reason && patch({ hold_reason: hold })}
                  className={`mt-2 ${input}`}
                />
              </div>
            ) : null}

            {mailProblem ? (
              <p
                className={`mt-4 text-[13px] ${
                  mailProblem.bad ? "text-[color:var(--admin-bad)]" : "text-muted"
                }`}
              >
                {mailProblem.bad ? `Saved, but the customer was not emailed: ${mailProblem.text}` : mailProblem.text}
              </p>
            ) : null}
            {order.shipped_notified_at ? (
              <p className="mt-4 text-[13px] text-muted">Customer emailed {when(order.shipped_notified_at)}.</p>
            ) : null}
            {order.shipped_at ? (
              <p className="mt-4 text-[13px] text-muted">Handed to the carrier {when(order.shipped_at)}.</p>
            ) : null}

            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="mt-5 h-9 w-full border border-[color:var(--admin-hairline)] text-[13px] font-medium text-ink hover:border-ink"
            >
              {editing ? "Close the editor" : "Edit everything on this order"}
            </button>

            {order.status === "cancelled" ? (
              <CancelledNote order={order} />
            ) : (
              <CancelOrder order={order} onDone={onChanged} />
            )}

            <div className="mt-3 flex justify-end">
              <DeleteOrder order={order} onDone={onChanged} />
            </div>

            {error ? <p className="mt-3 text-[13px] text-[color:var(--color-signal)]">{error}</p> : null}
          </div>
        </div>
      ) : null}

      {open && editing ? (
        <OrderEditor
          order={order}
          onCancel={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            onChanged();
          }}
        />
      ) : null}
    </div>
  );
}

function YearView({ years }: { years: string[] }) {
  const [year, setYear] = useState(years[0] ?? String(new Date().getFullYear()));
  type Sums = { orders: number; subtotal: number; shipping: number; tax: number; total: number };
  const [data, setData] = useState<{
    totals: Sums;
    own: Sums;
    marketplace: Sums;
    byChannel: (Sums & { id: string; name: string })[];
    unpaid: number;
  } | null>(null);

  useEffect(() => {
    setData(null);
    void fetch(`/api/admin/report?year=${year}`)
      .then((r) => r.json())
      .then((d) => setData(d.ok ? d : null))
      .catch(() => setData(null));
  }, [year]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={year}
          onChange={(e) => setYear(e.currentTarget.value)}
          className="h-10 border border-[color:var(--admin-hairline)] bg-surface px-3 text-sm text-ink focus:border-ink focus:outline-none"
        >
          {(years.length ? years : [year]).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <a
          href={`/api/admin/report?year=${year}&format=csv`}
          className={btnPrimary}
        >
          Download {year} as a spreadsheet
        </a>
      </div>

      {!data ? (
        <p className="mt-6 text-sm text-muted">Adding it up.</p>
      ) : (
        <>
          <div className="mt-6 grid gap-px border border-[color:var(--admin-hairline)] bg-line sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Orders paid", String(data.totals.orders)],
              ["Goods", money(data.totals.subtotal)],
              ["Shipping", money(data.totals.shipping)],
              ["Sales tax", money(data.totals.tax)],
              ["Taken in total", money(data.totals.total)],
            ].map(([label, value]) => (
              <div key={label} className="bg-surface p-4">
                <p className="font-mono text-[26px] leading-none tracking-tight text-ink">{value}</p>
                <p className="mt-2 text-[13px] text-muted">{label}</p>
              </div>
            ))}
          </div>

          {data.marketplace.orders > 0 ? (
            <div className="mt-6 grid gap-px border border-[color:var(--admin-hairline)] bg-line sm:grid-cols-2">
              <div className="bg-surface p-4">
                <p className="text-[13px] font-medium text-muted">
                  Your own sales — the tax you file
                </p>
                <p className="mt-3 font-mono text-[22px] leading-none tracking-tight text-ink">
                  {money(data.own.total)}
                </p>
                <p className="mt-2 text-[13px] text-muted">
                  {data.own.orders} order{data.own.orders === 1 ? "" : "s"} · {money(data.own.tax)} sales tax collected
                </p>
              </div>
              <div className="bg-surface p-4">
                <p className="text-[13px] font-medium text-muted">
                  Marketplace sales — tax already remitted
                </p>
                <p className="mt-3 font-mono text-[22px] leading-none tracking-tight text-ink">
                  {money(data.marketplace.total)}
                </p>
                <p className="mt-2 text-[13px] text-muted">
                  {data.marketplace.orders} order{data.marketplace.orders === 1 ? "" : "s"} ·{" "}
                  {data.byChannel
                    .filter((c) => c.id !== "site" && c.orders > 0)
                    .map((c) => `${c.name} ${money(c.total)}`)
                    .join(" · ")}
                </p>
              </div>
            </div>
          ) : null}

          <p className="mt-4 max-w-[70ch] text-[13px] leading-[1.55] text-muted">
            Counts money actually taken, by the date it was paid — so an order placed in December and paid in January
            lands in January. {data.unpaid > 0
              ? `${data.unpaid} order${data.unpaid === 1 ? " was" : "s were"} raised in ${year} and never paid; ${data.unpaid === 1 ? "it is" : "they are"} not in these figures.`
              : "Every order raised this year was paid."}
          </p>

          {data.marketplace.orders > 0 ? (
            <p className="mt-3 max-w-[70ch] border-l-2 border-line pl-3 text-[13px] leading-[1.55] text-muted">
              The two boxes above are split because they are filed differently. Amazon, Walmart and Facebook Marketplace are
              required to collect sales tax on your behalf and pay it to the state themselves, so the only sales tax
              you owe New York is the amount on the left. Give your accountant the spreadsheet rather than the headline
              figure — it labels every row with where it sold and who remitted the tax.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

/**
 * Checking that email works should not require involving a customer. This
 * sends one message to the shop's own address and says exactly what came
 * back, so a wrong key or an unverified domain shows up here.
 */
/** What a cancelled order shows: the reason given, and whether the customer was told. */
function CancelledNote({ order }: { order: AdminOrder }) {
  return (
    <div className="mt-4 rounded-[12px] bg-[color:var(--admin-sunken)] px-4 py-3 text-[13px] leading-[1.5]">
      <p className="font-medium text-ink">Cancelled{order.cancelled_at ? ` ${when(order.cancelled_at)}` : ""}</p>
      {order.cancel_reason ? <p className="mt-1 whitespace-pre-wrap text-ink">{order.cancel_reason}</p> : null}
      <p className="mt-1 text-muted">
        {order.cancel_notified_at
          ? `Customer emailed ${when(order.cancel_notified_at)}.`
          : order.cancel_reason
            ? "The customer was not emailed."
            : ""}
      </p>
    </div>
  );
}

/**
 * Cancel an order with a written reason, which is emailed to the customer.
 * Nothing goes until he presses the button, and the reason is required.
 */
function CancelOrder({ order, onDone }: { order: AdminOrder; onDone: () => void }) {
  const canEmail = shopMayEmailBuyer(order.channel) && /@/.test(order.email ?? "");
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [refund, setRefund] = useState(Boolean(order.paid_at) && order.channel === "site");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ text: string; bad: boolean } | null>(null);

  async function submit() {
    if (reason.trim().length < 3) {
      setError("Write the reason first. It goes in the email to the customer.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/order-cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: order.reference, reason: reason.trim(), mention_refund: refund }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        emailedTo?: string;
        notified?: { ok: boolean; error: string; expected: boolean };
      };
      if (!data.ok) {
        setError(data.error ?? "Could not cancel the order.");
        return;
      }
      if (data.notified && !data.notified.ok) {
        setResult({
          text: data.notified.expected
            ? `Order cancelled. ${data.notified.error}`
            : `Order cancelled, but the email did not go: ${data.notified.error}`,
          bad: !data.notified.expected,
        });
      } else {
        setResult({ text: `Order cancelled. ${data.emailedTo || "The customer"} has been emailed.`, bad: false });
      }
      setTimeout(onDone, 2500);
    } catch {
      setError("Could not reach the site.");
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <p className={`mt-4 text-[13px] ${result.bad ? "text-[color:var(--admin-bad)]" : "text-ink"}`}>{result.text}</p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 h-9 w-full border border-[color:var(--admin-hairline)] text-[13px] font-medium text-[color:var(--admin-bad)] hover:border-[color:var(--admin-bad)]"
      >
        Cancel this order
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-[12px] bg-[color:var(--admin-sunken)] px-4 py-4">
      <p className="text-[15px] font-semibold tracking-[-0.01em] text-ink">Cancel {order.reference}</p>
      <label htmlFor={`cancel-${order.reference}`} className="mt-3 block text-[13px] font-medium text-muted">
        Reason for cancelling{canEmail ? " (the customer will see this)" : ""}
      </label>
      <textarea
        id={`cancel-${order.reference}`}
        value={reason}
        rows={4}
        maxLength={2000}
        placeholder="For example: This item is no longer available from the manufacturer."
        onChange={(e) => setReason(e.currentTarget.value)}
        className={`mt-2 ${input} h-auto py-2 leading-[1.5]`}
      />
      {canEmail ? (
        <>
          <label className="mt-3 flex items-start gap-2 text-[13px] text-ink">
            <input
              type="checkbox"
              checked={refund}
              onChange={(e) => setRefund(e.currentTarget.checked)}
              className="mt-0.5"
            />
            <span>Tell them they will be refunded in full</span>
          </label>
          <p className="mt-1.5 text-[12px] leading-[1.5] text-muted">
            This does not move any money. Refund the payment in {order.provider === "paypal" ? "PayPal" : "Stripe or PayPal"} as well.
          </p>
          <p className="mt-2 text-[12px] leading-[1.5] text-muted">
            The email goes to {order.email}: your reason, an apology, and that we hope to do business with them again.
          </p>
        </>
      ) : (
        <p className="mt-2 text-[12px] leading-[1.5] text-muted">
          {shopMayEmailBuyer(order.channel)
            ? "There is no email address on this order, so the customer will not be emailed."
            : `${channelName(order.channel)} orders are not emailed from here. Cancel it on ${channelName(order.channel)} too.`}
        </p>
      )}
      {error ? <p className="mt-2 text-[13px] text-[color:var(--admin-bad)]">{error}</p> : null}
      <div className="mt-3 flex items-center gap-3">
        <button type="button" disabled={busy} onClick={() => void submit()} className={btnPrimary}>
          {busy ? "Cancelling." : canEmail ? "Submit and email the customer" : "Submit"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError("");
          }}
          className={`${btnLink} text-muted`}
        >
          Keep the order
        </button>
      </div>
    </div>
  );
}

/**
 * Removing an order. Two clicks always, and a paid one answers the first with
 * what it is worth and which year it counts toward before it will go — that is
 * the number his accountant sees, and nothing else in the admin can move it by
 * this much in one click.
 */
function DeleteOrder({ order, onDone }: { order: { reference: string }; onDone: () => void }) {
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [warning, setWarning] = useState("");

  async function go(force: boolean) {
    setBusy(true);
    try {
      const res = await fetch(
        `/api/admin/orders?reference=${encodeURIComponent(order.reference)}${force ? "&force=1" : ""}`,
        { method: "DELETE" },
      );
      const data = (await res.json()) as { ok: boolean; error?: string; needsConfirm?: boolean };
      if (!data.ok) {
        setWarning(data.error ?? "Could not remove that.");
        if (!data.needsConfirm) setArmed(false);
        return;
      }
      onDone();
    } catch {
      setWarning("Could not reach the site.");
    } finally {
      setBusy(false);
    }
  }

  if (warning) {
    return (
      <div className="w-full rounded-[12px] bg-[color:var(--admin-sunken)] px-4 py-3">
        <p className="text-[13px] leading-[1.5] text-[color:var(--admin-bad)]">{warning}</p>
        <p className="mt-1.5 text-[12px] leading-[1.5] text-muted">
          A copy of the whole order is kept either way, so it can be looked up again if anyone asks.
        </p>
        <div className="mt-2.5 flex items-center gap-3">
          <button type="button" disabled={busy} onClick={() => void go(true)} className={`${btnLink} text-[color:var(--admin-bad)]`}>
            {busy ? "Deleting." : "Delete it anyway"}
          </button>
          <button
            type="button"
            onClick={() => {
              setWarning("");
              setArmed(false);
            }}
            className={`${btnLink} text-muted`}
          >
            Keep it
          </button>
        </div>
      </div>
    );
  }

  if (!armed) {
    return (
      <button type="button" onClick={() => setArmed(true)} className={`${btnLink} text-muted`}>
        Delete this order
      </button>
    );
  }

  return (
    <span className="flex items-center gap-3">
      <button type="button" disabled={busy} onClick={() => void go(false)} className={`${btnLink} text-[color:var(--admin-bad)]`}>
        {busy ? "Deleting." : "Really delete it?"}
      </button>
      <button type="button" onClick={() => setArmed(false)} className={`${btnLink} text-muted`}>
        No
      </button>
    </span>
  );
}

function EmailCheck() {
  const [state, setState] = useState<{ kind: "idle" | "busy" | "ok" | "bad"; detail: string }>({
    kind: "idle",
    detail: "",
  });

  async function run() {
    setState({ kind: "busy", detail: "" });
    try {
      const res = await fetch("/api/admin/test-email", { method: "POST" });
      const data = (await res.json()) as { ok: boolean; error?: string; sent_to?: string };
      setState(
        data.ok
          ? { kind: "ok", detail: data.sent_to ?? "" }
          : { kind: "bad", detail: data.error ?? "It did not go." },
      );
    } catch {
      setState({ kind: "bad", detail: "Could not reach the site." });
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <button type="button" onClick={() => void run()} disabled={state.kind === "busy"} className={btnLink}>
        {state.kind === "busy" ? "Sending." : "Send me a test email"}
      </button>
      {state.kind === "ok" ? (
        <span className="text-[13px] text-muted">Sent to {state.detail}. Check that inbox.</span>
      ) : null}
      {state.kind === "bad" ? (
        <span className="text-[13px] text-[color:var(--admin-bad)]">{state.detail}</span>
      ) : null}
    </div>
  );
}

export function OrdersPanel() {
  const [tab, setTab] = useState<Tab>("paid");
  const [channel, setChannel] = useState("all");
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [chanCounts, setChanCounts] = useState<Record<string, number>>({});
  const [years, setYears] = useState<string[]>([]);

  const load = useCallback(async () => {
    const qs = new URLSearchParams();
    if (tab !== "all" && tab !== "year") qs.set("status", tab);
    if (channel !== "all") qs.set("channel", channel);
    const res = await fetch(`/api/admin/orders${qs.toString() ? `?${qs}` : ""}`);
    const data = (await res.json()) as {
      orders?: AdminOrder[];
      counts?: Record<string, number>;
      channels?: Record<string, number>;
      years?: string[];
    };
    setOrders(data.orders ?? []);
    setCounts(data.counts ?? {});
    setChanCounts(data.channels ?? {});
    setYears(data.years ?? []);
  }, [tab, channel]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <EmailCheck />
      <div className="mt-4 flex flex-wrap gap-1 border-b border-[color:var(--admin-hairline)]">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-3.5 py-2 text-sm transition-colors ${
              tab === t.key ? "border-signal text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
            {t.key !== "all" && t.key !== "year" && counts[t.key] ? (
              <span className="ml-1.5 font-mono text-[13px] text-muted">{counts[t.key]}</span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="pt-6">
        {tab !== "year" ? (
          <>
            <AddOrder onAdded={() => void load()} />
            {Object.keys(chanCounts).filter((c) => c !== "site").length > 0 ? (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-medium text-muted">Where from</span>
                {["all", ...CHANNELS.map((c) => c.id).filter((c) => chanCounts[c])].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChannel(c)}
                    className={`border px-2 py-1 text-[13px] ${
                      channel === c ? "border-ink text-ink" : "border-line text-muted hover:border-ink hover:text-ink"
                    }`}
                  >
                    {c === "all" ? "Everywhere" : channelName(c)}
                    {c !== "all" ? <span className="ml-1.5 font-mono text-[10px] text-muted">{chanCounts[c]}</span> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </>
        ) : null}

        {tab === "year" ? (
          <YearView years={years} />
        ) : !orders ? (
          <p className="text-sm text-muted">Loading.</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-muted">
            {tab === "paid"
              ? "Nothing waiting to be packed."
              : tab === "ready_to_ship"
                ? "Nothing boxed and waiting for a carrier."
                : tab === "shipped"
                  ? "Nothing shipped yet."
                  : tab === "on_hold"
                    ? "Nothing on hold. Good."
                    : "No orders yet."}
          </p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <Card key={o.id} order={o} onChanged={load} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
