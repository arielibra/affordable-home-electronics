import { useEffect, useRef, useState } from "react";

import { CARRIERS, MANUAL_CHANNELS, channelName, marketplaceRemitsTax, shopMayEmailBuyer } from "../../lib/orders";
import { money } from "../../lib/site";
import { btnLink, btnPrimary, btnQuiet, card, input, label, textarea } from "./ui";

type Line = { key: string; slug: string; name: string; qty: number; price: string };
type Hit = { slug: string; name: string; price_cents: number };

const blank = (): Line => ({ key: crypto.randomUUID(), slug: "", name: "", qty: 1, price: "" });

/** Dollars typed by a person -> integer cents. "1,299.00", "$1299", "1299." */
function cents(v: string): number {
  const n = Number(String(v).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

/** Search the catalogue, or leave the row as free text. */
function ItemRow({
  line,
  onChange,
  onRemove,
  canRemove,
}: {
  line: Line;
  onChange: (l: Line) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function search(term: string) {
    if (timer.current) clearTimeout(timer.current);
    if (term.trim().length < 2) {
      setHits([]);
      return;
    }
    timer.current = setTimeout(() => {
      void fetch(`/api/admin/products?q=${encodeURIComponent(term)}`)
        .then((r) => r.json())
        .then((d) => setHits(d.ok ? (d.products ?? []).slice(0, 6) : []))
        .catch(() => setHits([]));
    }, 250);
  }

  return (
    <div className="relative grid grid-cols-[1fr_64px_100px_32px] items-start gap-2">
      <div>
        <input
          value={line.name}
          placeholder="Search the catalogue, or just type what it was"
          onChange={(e) => {
            const v = e.currentTarget.value;
            onChange({ ...line, name: v, slug: "" });
            search(v);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className={input}
        />
        {line.slug ? (
          <p className="mt-1 font-mono text-[10px] text-muted">From the catalogue &middot; {line.slug}</p>
        ) : null}
        {open && hits.length > 0 ? (
          <ul className="absolute left-0 right-0 z-20 mt-1 max-h-56 overflow-auto border border-ink bg-surface shadow-lg">
            {hits.map((h) => (
              <li key={h.slug}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange({ ...line, slug: h.slug, name: h.name, price: (h.price_cents / 100).toFixed(2) });
                    setHits([]);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-3 px-2 py-2 text-left text-[13px] hover:bg-ground"
                >
                  <span className="min-w-0 flex-1 truncate text-ink">{h.name}</span>
                  <span className="shrink-0 font-mono text-muted">{money(h.price_cents)}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <input
        value={line.qty}
        inputMode="numeric"
        onChange={(e) => onChange({ ...line, qty: Math.max(1, Math.trunc(Number(e.currentTarget.value)) || 1) })}
        className={`${input} text-center`}
      />
      <input
        value={line.price}
        inputMode="decimal"
        placeholder="0.00"
        onChange={(e) => onChange({ ...line, price: e.currentTarget.value })}
        className={`${input} text-right font-mono`}
      />
      <button
        type="button"
        disabled={!canRemove}
        onClick={onRemove}
        aria-label="Remove this line"
        className="h-9 border border-[color:var(--admin-hairline)] text-[13px] text-muted hover:border-ink hover:text-ink disabled:opacity-30"
      >
        &times;
      </button>
    </div>
  );
}

export function AddOrder({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState(MANUAL_CHANNELS[0].id);
  const [ref, setRef] = useState("");
  const [paidOn, setPaidOn] = useState(new Date().toISOString().slice(0, 10));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [zip, setZip] = useState("");
  const [lines, setLines] = useState<Line[]>([blank()]);
  const [shipping, setShipping] = useState("");
  const [status, setStatus] = useState("paid");
  const [carrier, setCarrier] = useState("ups");
  const [tracking, setTracking] = useState("");
  const [notes, setNotes] = useState("");
  const tellsBuyerItself = !shopMayEmailBuyer(channel);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  const subtotal = lines.reduce((a, l) => a + cents(l.price) * l.qty, 0);
  const total = subtotal + cents(shipping);
  const chanName = MANUAL_CHANNELS.find((c) => c.id === channel)?.name ?? "";

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(""), 6000);
    return () => clearTimeout(t);
  }, [done]);

  function reset() {
    setRef("");
    setName("");
    setLines([blank()]);
    setShipping("");
    setStatus("paid");
    setTracking("");
    setNotes("");
  }

  async function save() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          channel_ref: ref,
          paid_on: paidOn,
          name,
          email,
          phone,
          address1,
          address2,
          city,
          state: stateCode,
          zip,
          notes,
          status,
          carrier: status === "shipped" ? carrier : "",
          tracking_number: status === "shipped" ? tracking : "",
          shipping_cents: cents(shipping),
          items: lines
            .filter((l) => l.name.trim())
            .map((l) => ({ product_slug: l.slug, name: l.name.trim(), qty: l.qty, price_cents: cents(l.price) })),
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string; order?: { reference: string } };
      if (!data.ok) {
        setError(data.error ?? "Could not save that.");
        return;
      }
      setDone(`Saved as ${data.order?.reference ?? "a new order"}.`);
      reset();
      onAdded();
    } catch {
      setError("Could not reach the site.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={btnQuiet}
        >
          Add an order from somewhere else
        </button>
        {done ? <span className="text-[13px] text-muted">{done}</span> : null}
      </div>
    );
  }

  return (
    <div className={`${card} mb-7`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-ink">Add an order from somewhere else</h3>
          <p className="mt-1 max-w-[68ch] text-[13px] leading-[1.55] text-muted">
            For sales made on Amazon, eBay and the rest. Once it is in, it moves through Paid, Ready to ship and Shipped
            exactly like an order from this site, and appears in the year report.
          </p>
        </div>
        <button type="button" onClick={() => setOpen(false)} className={`${btnLink} text-muted`}>
          Close
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <p className={label}>Where it sold</p>
          <select value={channel} onChange={(e) => setChannel(e.currentTarget.value as typeof channel)} className={`mt-1.5 ${input}`}>
            {MANUAL_CHANNELS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className={label}>Their order number</p>
          <input
            value={ref}
            placeholder={channel === "amazon" ? "111-1234567-1234567" : "12-34567-89012"}
            onChange={(e) => setRef(e.currentTarget.value)}
            className={`mt-1.5 ${input} font-mono`}
          />
        </div>
        <div>
          <p className={label}>Date of the sale</p>
          <input type="date" value={paidOn} onChange={(e) => setPaidOn(e.currentTarget.value)} className={`mt-1.5 ${input}`} />
        </div>
      </div>

      <div className="mt-4">
        <p className={label}>Buyer</p>
        <input
          value={name}
          placeholder="Name, or whatever the marketplace shows"
          onChange={(e) => setName(e.currentTarget.value)}
          className={`mt-1.5 ${input}`}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Their email</span>
          <input
            value={email}
            inputMode="email"
            onChange={(e) => setEmail(e.currentTarget.value)}
            className={`mt-1.5 ${input}`}
          />
        </label>
        <label className="block">
          <span className={label}>Their phone</span>
          <input value={phone} onChange={(e) => setPhone(e.currentTarget.value)} className={`mt-1.5 ${input}`} />
        </label>
      </div>

      {/* Why the email box is here, and when it does anything. */}
      <p className="mt-2 max-w-[68ch] text-[12px] leading-[1.5] text-muted">
        {tellsBuyerItself
          ? `${channelName(channel)} emails the buyer its own shipping notice, and contacting them directly breaks their rules — so nothing is sent from here whatever you put above. Record it for your own files if you like.`
          : "If you put a real email here, the buyer is emailed the tracking number when you mark this order shipped. Leave it blank and nothing is sent."}
      </p>

      <div className="mt-4">
        <p className={label}>Where it is going</p>
        <input
          value={address1}
          placeholder="Street address"
          onChange={(e) => setAddress1(e.currentTarget.value)}
          className={`mt-1.5 ${input}`}
        />
        <input
          value={address2}
          placeholder="Apartment, suite (optional)"
          onChange={(e) => setAddress2(e.currentTarget.value)}
          className={`mt-2 ${input}`}
        />
        <div className="mt-2 grid grid-cols-[1fr_80px_110px] gap-2">
          <input value={city} placeholder="City" onChange={(e) => setCity(e.currentTarget.value)} className={input} />
          <input
            value={stateCode}
            placeholder="State"
            onChange={(e) => setStateCode(e.currentTarget.value.toUpperCase().slice(0, 2))}
            className={input}
          />
          <input value={zip} placeholder="ZIP" inputMode="numeric" onChange={(e) => setZip(e.currentTarget.value)} className={input} />
        </div>
      </div>

      <div className="mt-5">
        <div className="grid grid-cols-[1fr_64px_100px_32px] gap-2">
          <p className={label}>What sold</p>
          <p className={`${label} text-center`}>Qty</p>
          <p className={`${label} text-right`}>Each</p>
          <span />
        </div>
        <div className="mt-1.5 space-y-2">
          {lines.map((l, i) => (
            <ItemRow
              key={l.key}
              line={l}
              canRemove={lines.length > 1}
              onChange={(next) => setLines(lines.map((x, j) => (j === i ? next : x)))}
              onRemove={() => setLines(lines.filter((_, j) => j !== i))}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setLines([...lines, blank()])}
          className={`${btnLink} mt-3 inline-block`}
        >
          Add another line
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-[160px_1fr]">
        <div>
          <p className={label}>Shipping charged</p>
          <input
            value={shipping}
            inputMode="decimal"
            placeholder="0.00"
            onChange={(e) => setShipping(e.currentTarget.value)}
            className={`mt-1.5 ${input} text-right font-mono`}
          />
        </div>
        <div className="flex items-end">
          <dl className="w-full space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Goods</dt>
              <dd className="font-mono text-ink">{money(subtotal)}</dd>
            </div>
            <div className="flex justify-between border-t border-[color:var(--admin-hairline)] pt-1">
              <dt className="text-ink">Order total</dt>
              <dd className="font-mono text-ink">{money(total)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {marketplaceRemitsTax(channel) ? (
        <p className="mt-3 max-w-[70ch] border-l-2 border-line pl-3 text-[13px] leading-[1.55] text-muted">
          No sales tax box, on purpose. {chanName} collects and remits the sales tax on this sale itself, so it is not
          yours to file &mdash; and counting it here would mean New York gets paid twice. The year report keeps these
          separate from your own orders for exactly that reason.
        </p>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <p className={label}>Where it is up to</p>
          <select value={status} onChange={(e) => setStatus(e.currentTarget.value)} className={`mt-1.5 ${input}`}>
            <option value="paid">Paid, still to pack</option>
            <option value="ready_to_ship">Ready to ship</option>
            <option value="shipped">Already shipped</option>
            <option value="on_hold">On hold</option>
          </select>
        </div>
        {status === "shipped" ? (
          <>
            <div>
              <p className={label}>Carrier</p>
              <select value={carrier} onChange={(e) => setCarrier(e.currentTarget.value)} className={`mt-1.5 ${input}`}>
                {CARRIERS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className={label}>Tracking number</p>
              <input value={tracking} onChange={(e) => setTracking(e.currentTarget.value)} className={`mt-1.5 ${input} font-mono`} />
            </div>
          </>
        ) : null}
      </div>

      <div className="mt-4">
        <p className={label}>Notes</p>
        <textarea
          value={notes}
          rows={2}
          placeholder="Anything worth remembering about this one"
          onChange={(e) => setNotes(e.currentTarget.value)}
          className="mt-1.5 w-full border border-[color:var(--admin-hairline)] bg-surface px-2 py-1.5 text-sm text-ink focus:border-ink focus:outline-none"
        />
      </div>

      {error ? <p className="mt-4 text-sm text-[color:var(--color-signal)]">{error}</p> : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className={btnPrimary}
        >
          {busy ? "Saving" : "Save this order"}
        </button>
        <button type="button" onClick={reset} className={`${btnLink} text-muted`}>
          Clear the form
        </button>
        {done ? <span className="text-[13px] text-muted">{done}</span> : null}
      </div>
    </div>
  );
}
