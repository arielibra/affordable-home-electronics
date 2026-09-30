import { useEffect, useRef, useState } from "react";

import { CHANNELS } from "../../lib/orders";
import { money as fmt } from "../../lib/site";
import type { AdminOrder } from "./orders-panel";

type Line = { key: string; slug: string; name: string; qty: number; price: string };

const input = "h-9 w-full border border-line bg-surface px-2 text-sm text-ink focus:border-ink focus:outline-none";
const label = "font-mono text-[10px] uppercase tracking-[0.14em] text-muted";

const dollars = (c: number | null | undefined) => ((c ?? 0) / 100).toFixed(2);
const cents = (v: string) => {
  const n = Number(String(v).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};

function Text({
  label: l,
  value,
  onChange,
  placeholder,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className={label}>{l}</p>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.currentTarget.value)}
        className={`mt-1.5 ${input} ${mono ? "font-mono" : ""}`}
      />
    </div>
  );
}

export function OrderEditor({
  order,
  onSaved,
  onCancel,
}: {
  order: AdminOrder;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(order.name);
  const [email, setEmail] = useState(order.email);
  const [phone, setPhone] = useState(order.phone);
  const [company, setCompany] = useState((order as { company?: string }).company ?? "");
  const [a1, setA1] = useState(order.address1);
  const [a2, setA2] = useState(order.address2);
  const [city, setCity] = useState(order.city);
  const [state, setState] = useState(order.state);
  const [zip, setZip] = useState(order.zip);
  const [channel, setChannel] = useState(order.channel || "site");
  const [channelRef, setChannelRef] = useState(order.channel_ref ?? "");
  const [paidOn, setPaidOn] = useState((order.paid_at ?? "").slice(0, 10));
  const [sub, setSub] = useState(dollars(order.subtotal_cents));
  const [ship, setShip] = useState(dollars(order.shipping_cents));
  const [tax, setTax] = useState(dollars(order.tax_cents));
  const [total, setTotal] = useState(dollars(order.amount_total_cents));
  const [notes, setNotes] = useState(order.notes ?? "");
  const [lines, setLines] = useState<Line[]>(
    order.items.map((it) => ({
      key: crypto.randomUUID(),
      slug: "",
      name: it.name,
      qty: it.qty,
      price: dollars(it.price_cents),
    })),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  /* ---- ZIP fills in the city and state ----------------------------------
   * Only ever fires when he types in the ZIP box himself. Looking it up on
   * open, or whenever the value merely differs, would let it quietly rewrite
   * a city on an order he opened to change something else entirely. Editing
   * the postcode is the one unambiguous signal that the address moved.
   */
  const [zipTouched, setZipTouched] = useState(false);
  const [zipNote, setZipNote] = useState("");
  const lastLooked = useRef("");

  useEffect(() => {
    if (!zipTouched) return;
    const five = zip.replace(/[^0-9]/g, "").slice(0, 5);
    if (five.length !== 5 || five === lastLooked.current) return;

    let alive = true;
    const t = setTimeout(() => {
      setZipNote("Looking up…");
      void fetch(`/api/admin/zip?zip=${five}`)
        .then((r) => r.json() as Promise<{ ok: boolean; city?: string; state?: string }>)
        .then((d) => {
          if (!alive) return;
          lastLooked.current = five;
          if (d.ok && d.city && d.state) {
            setCity(d.city);
            setState(d.state);
            setZipNote(`${five} is ${d.city}, ${d.state}`);
          } else {
            setZipNote("No match for that ZIP — type the city yourself.");
          }
        })
        .catch(() => alive && setZipNote("Could not look that up — type the city yourself."));
    }, 450);

    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [zip, zipTouched]);

  const lineSum = lines.reduce((a, l) => a + cents(l.price) * l.qty, 0);
  const computedTotal = cents(sub) + cents(ship) + cents(tax);
  const outOfStep = Math.abs(computedTotal - cents(total)) > 2;
  const linesOutOfStep = Math.abs(lineSum - cents(sub)) > 2;
  const fromProcessor = order.provider === "stripe" || order.provider === "paypal";

  async function save() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: order.reference,
          name,
          email,
          phone,
          company,
          address1: a1,
          address2: a2,
          city,
          state,
          zip,
          channel,
          channel_ref: channelRef,
          paid_on: paidOn,
          notes,
          subtotal_cents: cents(sub),
          shipping_cents: cents(ship),
          tax_cents: cents(tax),
          amount_total_cents: cents(total),
          items: lines
            .filter((l) => l.name.trim())
            .map((l) => ({ name: l.name.trim(), qty: l.qty, price_cents: cents(l.price) })),
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setError(data.error ?? "Could not save.");
        return;
      }
      onSaved();
    } catch {
      setError("Could not reach the site.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 border border-ink bg-surface p-5">
      <h4 className="text-sm font-semibold text-ink">Editing {order.reference}</h4>

      {fromProcessor ? (
        <p className="mt-2 max-w-[74ch] border-l-2 border-[color:var(--color-signal)] pl-3 text-xs leading-relaxed text-muted">
          This one was paid by {order.provider === "paypal" ? "PayPal" : "card through Stripe"}. Changing the amounts
          here changes <b>your records only</b> &mdash; it does not move any money, and it will no longer agree with what
          the processor actually charged. Fine for fixing an address or a product name; for the money, correct it in{" "}
          {order.provider === "paypal" ? "PayPal" : "Stripe"} first and make this match.
        </p>
      ) : null}

      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Customer</p>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        <Text label="Name" value={name} onChange={setName} />
        <Text label="Company" value={company} onChange={setCompany} />
        <Text label="Email" value={email} onChange={setEmail} />
        <Text label="Phone" value={phone} onChange={setPhone} />
      </div>

      <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Ships to</p>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        <Text label="Address" value={a1} onChange={setA1} />
        <Text label="Address line 2" value={a2} onChange={setA2} />
        <Text label="City" value={city} onChange={setCity} />
        <div>
          <div className="grid grid-cols-2 gap-3">
            <Text label="State" value={state} onChange={setState} />
            <div>
              <p className={label}>ZIP</p>
              <input
                value={zip}
                inputMode="numeric"
                placeholder="33166"
                onChange={(e) => {
                  setZip(e.currentTarget.value);
                  setZipTouched(true);
                }}
                className={`mt-1.5 ${input} font-mono`}
              />
            </div>
          </div>
          {zipNote ? <p className="mt-1.5 text-[11px] leading-relaxed text-muted">{zipNote}</p> : null}
        </div>
      </div>

      <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Where it came from</p>
      <div className="mt-2 grid gap-3 sm:grid-cols-3">
        <div>
          <p className={label}>Sold on</p>
          <select value={channel} onChange={(e) => setChannel(e.currentTarget.value)} className={`mt-1.5 ${input}`}>
            {CHANNELS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <Text label="Their order number" value={channelRef} onChange={setChannelRef} mono />
        <div>
          <p className={label}>Date paid</p>
          <input type="date" value={paidOn} onChange={(e) => setPaidOn(e.currentTarget.value)} className={`mt-1.5 ${input}`} />
          <p className="mt-1 text-[11px] leading-relaxed text-muted">Decides which year it counts in.</p>
        </div>
      </div>

      <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">What was on it</p>
      <div className="mt-2 grid grid-cols-[1fr_60px_96px_32px] gap-2">
        <p className={label}>Item</p>
        <p className={`${label} text-center`}>Qty</p>
        <p className={`${label} text-right`}>Each</p>
        <span />
      </div>
      <div className="mt-1.5 space-y-2">
        {lines.map((l, i) => (
          <div key={l.key} className="grid grid-cols-[1fr_60px_96px_32px] gap-2">
            <input
              value={l.name}
              onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, name: e.currentTarget.value } : x)))}
              className={input}
            />
            <input
              value={l.qty}
              inputMode="numeric"
              onChange={(e) =>
                setLines(
                  lines.map((x, j) =>
                    j === i ? { ...x, qty: Math.max(1, Math.trunc(Number(e.currentTarget.value)) || 1) } : x,
                  ),
                )
              }
              className={`${input} text-center`}
            />
            <input
              value={l.price}
              inputMode="decimal"
              onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, price: e.currentTarget.value } : x)))}
              className={`${input} text-right font-mono`}
            />
            <button
              type="button"
              disabled={lines.length <= 1}
              onClick={() => setLines(lines.filter((_, j) => j !== i))}
              aria-label="Remove this line"
              className="h-9 border border-line text-xs text-muted hover:border-ink hover:text-ink disabled:opacity-30"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() =>
          setLines([...lines, { key: crypto.randomUUID(), slug: "", name: "", qty: 1, price: "" }])
        }
        className="mt-2 text-xs text-ink underline underline-offset-4"
      >
        Add a line
      </button>

      <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">The money</p>
      <div className="mt-2 grid gap-3 sm:grid-cols-4">
        <Text label="Goods" value={sub} onChange={setSub} mono />
        <Text label="Shipping" value={ship} onChange={setShip} mono />
        <Text label="Tax" value={tax} onChange={setTax} mono />
        <Text label="Total" value={total} onChange={setTotal} mono />
      </div>

      {/* Nothing is auto-corrected. Silently rewriting a number he typed is
          how a total ends up different from what he meant; saying it does not
          add up and offering to fix it keeps him in charge. */}
      {linesOutOfStep || outOfStep ? (
        <div className="mt-3 border border-line bg-ground p-3">
          <p className="text-xs leading-relaxed text-ink">
            {linesOutOfStep ? (
              <>
                The lines come to <b>{fmt(lineSum)}</b> but goods says <b>{fmt(cents(sub))}</b>.{" "}
              </>
            ) : null}
            {outOfStep ? (
              <>
                Goods plus shipping plus tax is <b>{fmt(computedTotal)}</b> but the total says{" "}
                <b>{fmt(cents(total))}</b>.
              </>
            ) : null}
          </p>
          <button
            type="button"
            onClick={() => {
              const s = linesOutOfStep ? lineSum : cents(sub);
              setSub((s / 100).toFixed(2));
              setTotal(((s + cents(ship) + cents(tax)) / 100).toFixed(2));
            }}
            className="mt-2 h-8 border border-line px-3 text-xs text-ink hover:border-ink"
          >
            Add it up for me
          </button>
          <p className="mt-2 text-[11px] leading-relaxed text-muted">
            Leave it alone if the order really was like that &mdash; some of the imported ones do not add up either.
          </p>
        </div>
      ) : null}

      <div className="mt-5">
        <p className={label}>Notes</p>
        <textarea
          value={notes}
          rows={2}
          onChange={(e) => setNotes(e.currentTarget.value)}
          className="mt-1.5 w-full border border-line bg-surface px-2 py-1.5 text-sm text-ink focus:border-ink focus:outline-none"
        />
      </div>

      {error ? <p className="mt-4 text-sm text-[color:var(--color-signal)]">{error}</p> : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className="inline-flex h-10 items-center bg-ink px-5 text-sm font-medium text-surface disabled:opacity-50"
        >
          {busy ? "Saving" : "Save changes"}
        </button>
        <button type="button" onClick={onCancel} className="text-xs text-muted hover:text-ink">
          Cancel
        </button>
        <span className="text-[11px] text-muted">Every change is written to the admin log.</span>
      </div>
    </div>
  );
}
