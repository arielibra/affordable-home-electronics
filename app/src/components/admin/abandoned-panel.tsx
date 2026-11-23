import { useCallback, useEffect, useMemo, useState } from "react";

import { SITE, money } from "../../lib/site";
import { btnLink, btnTiny, card, noticeBad, pill, pillQuiet, small } from "./ui";

type Item = { name: string; qty: number; price_cents: number };

type Checkout = {
  reference: string;
  provider: "card" | "paypal";
  created_at: string;
  name: string;
  email: string;
  phone: string;
  place: string;
  value_cents: number;
  items: Item[];
  stripe_status: "open" | "expired" | "complete" | "" | null;
  resume_url: string | null;
};

const RANGES: [number, string][] = [
  [7, "7 days"],
  [30, "30 days"],
  [90, "90 days"],
  [0, "All time"],
];

function when(value: string): string {
  const d = new Date(value.replace(" ", "T") + "Z");
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function ago(value: string): string {
  const t = new Date(value.replace(" ", "T") + "Z").getTime();
  if (Number.isNaN(t)) return "";
  const mins = Math.round((Date.now() - t) / 60000);
  if (mins < 60) return `${Math.max(mins, 1)} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `${hrs} hr ago`;
  return `${Math.round(hrs / 24)} days ago`;
}

/** What happened, in one short label. */
function stage(c: Checkout): { label: string; tone: "quiet" | "live" | "bad" } {
  if (c.stripe_status === "complete")
    return { label: "Paid on Stripe — order missing", tone: "bad" };
  if (c.stripe_status === "open") return { label: "Still on the payment page", tone: "live" };
  if (c.provider === "paypal") return { label: "Left at PayPal", tone: "quiet" };
  if (c.stripe_status === "expired") return { label: "Left at card payment", tone: "quiet" };
  return { label: "Card payment — not checked yet", tone: "quiet" };
}

function mailto(c: Checkout): string {
  const first = c.name.split(" ")[0] || "there";
  const lines = c.items.map((i) => `  • ${i.qty} × ${i.name}`).join("\n");
  const body =
    `Hi ${first},\n\n` +
    `I noticed you started an order on our site but it didn't go through.` +
    (lines ? ` You had:\n\n${lines}\n\n` : "\n\n") +
    (c.resume_url ? `You can pick up where you left off here:\n${c.resume_url}\n\n` : "") +
    `If something went wrong at checkout, or you have a question about any of it, just reply to this email and I'll help.\n\n` +
    `Thanks,\n${SITE.name}`;
  const subject = `Your order at ${SITE.name}`;
  return `mailto:${encodeURIComponent(c.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function AbandonedPanel() {
  const [days, setDays] = useState(30);
  const [rows, setRows] = useState<Checkout[] | null>(null);
  const [unchecked, setUnchecked] = useState(0);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setError("");
    fetch(`/api/admin/abandoned?days=${days}`)
      .then(
        (r) =>
          r.json() as Promise<{
            ok: boolean;
            checkouts?: Checkout[];
            unchecked?: number;
            error?: string;
          }>,
      )
      .then((d) => {
        if (d.ok && d.checkouts) {
          setRows(d.checkouts);
          setUnchecked(d.unchecked ?? 0);
        } else {
          setError(d.error ?? "Could not load abandoned checkouts.");
        }
      })
      .catch(() => setError("Could not reach the site. Check the connection."));
  }, [days]);

  useEffect(() => {
    setRows(null);
    load();
  }, [load]);

  const stats = useMemo(() => {
    const list = rows ?? [];
    return {
      count: list.length,
      value: list.reduce((s, c) => s + (c.value_cents || 0), 0),
      reachable: list.filter((c) => c.email).length,
      missing: list.filter((c) => c.stripe_status === "complete"),
    };
  }, [rows]);

  return (
    <div className="space-y-6">
      {/* Range */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Time range"
          className="inline-flex rounded-full bg-[color:var(--admin-sunken)] p-1"
        >
          {RANGES.map(([d, label]) => (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={days === d}
              onClick={() => setDays(d)}
              className={`rounded-full px-4 py-2 text-[14px] font-medium transition-colors ${
                days === d ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button type="button" onClick={load} className={btnTiny}>
          Refresh
        </button>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <Stat label="Not finished" value={rows ? String(stats.count) : "—"} />
        <Stat label="Left behind" value={rows ? money(stats.value) : "—"} />
        <Stat
          label="Can email"
          value={rows ? String(stats.reachable) : "—"}
          note={rows && stats.count ? `of ${stats.count}` : undefined}
        />
      </div>

      {stats.missing.length > 0 ? (
        <div className={noticeBad}>
          <p className="font-semibold">
            {stats.missing.length === 1
              ? "One customer paid by card but no order arrived."
              : `${stats.missing.length} customers paid by card but no order arrived.`}
          </p>
          <p className="mt-1">
            Stripe says {stats.missing.map((m) => m.reference).join(", ")}{" "}
            {stats.missing.length === 1 ? "was" : "were"} paid, but the message that turns a payment
            into an order never reached the site. Check the payment in Stripe before shipping
            anything — the Stripe webhook needs looking at.
          </p>
        </div>
      ) : null}

      {error ? <p className={noticeBad}>{error}</p> : null}

      {rows === null && !error ? <p className={small}>Loading.</p> : null}

      {rows && rows.length === 0 ? (
        <div className={`${card} text-center`}>
          <p className="text-[17px] font-medium text-ink">Nobody left a checkout unfinished.</p>
          <p className={`mt-2 ${small}`}>
            When someone starts paying and stops, it shows up here with what was in their basket.
          </p>
        </div>
      ) : null}

      {rows && rows.length > 0 ? (
        <ul className="space-y-3">
          {rows.map((c) => (
            <Row
              key={c.reference}
              c={c}
              onGone={() =>
                setRows((all) => (all ?? []).filter((x) => x.reference !== c.reference))
              }
            />
          ))}
        </ul>
      ) : null}

      {unchecked > 0 ? (
        <p className={small}>
          {unchecked} older card {unchecked === 1 ? "checkout has" : "checkouts have"} not been
          looked up on Stripe yet — press Refresh to fetch the next batch.
        </p>
      ) : null}

      {rows && rows.length > 0 ? (
        <p className={`${small} max-w-[78ch]`}>
          Card checkouts happen on Stripe's page, so a name and email only appear here if the
          customer typed them in before leaving. PayPal checkouts always have them, because they are
          filled in on this site first. Removing one takes it off this list; a copy is kept, as with
          any deleted order.
        </p>
      ) : null}
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="ahe-card rounded-[18px] bg-surface px-3.5 py-4 sm:p-7">
      <p className="text-[12px] font-medium leading-tight text-muted sm:text-[13px]">{label}</p>
      <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
        <span className="text-[18px] font-semibold leading-none tracking-[-0.02em] text-ink sm:text-[30px]">
          {value}
        </span>
        {note ? <span className="text-[13px] text-muted sm:text-[14px]">{note}</span> : null}
      </p>
    </div>
  );
}

function Row({ c, onGone }: { c: Checkout; onGone: () => void }) {
  const s = stage(c);
  const tone =
    s.tone === "bad"
      ? `${pill} bg-[color:var(--admin-bad-bg)] text-[color:var(--admin-bad)]`
      : s.tone === "live"
        ? `${pill} bg-[#e8f1fb] text-[#1668c1]`
        : pillQuiet;

  return (
    <li className="ahe-order rounded-[16px] border border-[color:var(--admin-hairline)] bg-surface px-5 py-5">
      <div className="grid gap-5 md:grid-cols-[minmax(0,240px)_minmax(0,1fr)_auto]">
        {/* Who and when */}
        <div className="min-w-0">
          <p className="truncate text-[16px] font-semibold text-ink">
            {c.name || "Unknown shopper"}
          </p>
          {c.email ? (
            <a
              href={`mailto:${c.email}`}
              className="mt-0.5 block break-all text-[14px] text-ink underline underline-offset-4"
            >
              {c.email}
            </a>
          ) : (
            <p className="mt-0.5 text-[14px] text-muted">No email given</p>
          )}
          {c.phone ? <p className="mt-0.5 font-mono text-[13px] text-muted">{c.phone}</p> : null}
          {c.place ? <p className="mt-0.5 text-[13px] text-muted">{c.place}</p> : null}
          <p className="mt-3 text-[13px] text-muted" title={when(c.created_at)}>
            {when(c.created_at)} · {ago(c.created_at)}
          </p>
          <p className="mt-0.5 font-mono text-[12px] text-[color:var(--admin-faint)]">
            {c.reference}
          </p>
        </div>

        {/* What was in the basket */}
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span className={tone}>{s.label}</span>
          </div>
          {c.items.length ? (
            <ul className="mt-3 space-y-1.5">
              {c.items.map((it, i) => (
                <li key={i} className="flex justify-between gap-4 text-[14px]">
                  <span className="min-w-0 text-ink">
                    <span className="text-muted">{it.qty} ×</span> {it.name}
                  </span>
                  <span className="shrink-0 font-mono text-muted">
                    {money(it.price_cents * it.qty)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={`mt-3 ${small}`}>
              {c.provider === "card" && !c.stripe_status
                ? "Basket not fetched from Stripe yet."
                : "Basket no longer available."}
            </p>
          )}
        </div>

        {/* Value and actions */}
        <div className="flex flex-row items-center justify-between gap-4 md:flex-col md:items-end md:justify-start">
          <p className="font-mono text-[18px] font-semibold text-ink">{money(c.value_cents)}</p>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            {c.email && c.stripe_status !== "complete" ? (
              <a href={mailto(c)} className={btnTiny}>
                Email them
              </a>
            ) : null}
            <Remove reference={c.reference} onGone={onGone} />
          </div>
        </div>
      </div>
    </li>
  );
}

/** Two clicks, same as deleting any order. A copy is kept by the orders API. */
function Remove({ reference, onGone }: { reference: string; onGone: () => void }) {
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function go() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders?reference=${encodeURIComponent(reference)}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok || res.status === 404) onGone();
      else setError(data.error ?? "Could not remove it.");
    } catch {
      setError("Could not reach the site.");
    } finally {
      setBusy(false);
    }
  }

  if (!armed)
    return (
      <button type="button" onClick={() => setArmed(true)} className={btnLink}>
        Remove
      </button>
    );

  return (
    <span className="flex flex-wrap items-center gap-2 text-[13px]">
      <button
        type="button"
        disabled={busy}
        onClick={() => void go()}
        className="font-medium text-[color:var(--admin-bad)] underline underline-offset-4 disabled:opacity-60"
      >
        {busy ? "Removing." : "Yes, remove"}
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        className="text-muted underline underline-offset-4"
      >
        Keep
      </button>
      {error ? <span className="text-[color:var(--admin-bad)]">{error}</span> : null}
    </span>
  );
}
