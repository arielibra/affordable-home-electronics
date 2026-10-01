import { useEffect, useMemo, useState } from "react";

import { money } from "../../lib/site";
import { input, label } from "./ui";

export type AdminProduct = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  price_cents: number;
  msrp_cents: number | null;
  image: string;
  stock: number;
  stock_tracked: number;
  active: number;
};

const dollars = (cents: number | null) => (cents === null ? "" : (cents / 100).toFixed(2));
const toCents = (v: string) => Math.round(Number(v.replace(/[^0-9.]/g, "")) * 100);

function Row({ p, onSaved }: { p: AdminProduct; onSaved: (next: AdminProduct) => void }) {
  const [price, setPrice] = useState(dollars(p.price_cents));
  const [msrp, setMsrp] = useState(dollars(p.msrp_cents));
  const [stock, setStock] = useState(String(p.stock));
  const [tracked, setTracked] = useState(p.stock_tracked === 1);
  const [active, setActive] = useState(p.active === 1);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  const dirty =
    price !== dollars(p.price_cents) ||
    msrp !== dollars(p.msrp_cents) ||
    stock !== String(p.stock) ||
    tracked !== (p.stock_tracked === 1) ||
    active !== (p.active === 1);

  async function save() {
    setState("saving");
    setMessage("");
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: p.slug,
          price_cents: toCents(price),
          msrp_cents: msrp.trim() === "" ? null : toCents(msrp),
          stock: Number(stock) || 0,
          stock_tracked: tracked,
          active,
        }),
      });
      const data = (await res.json()) as { ok: boolean; product?: AdminProduct; error?: string };
      if (!data.ok || !data.product) {
        setState("error");
        setMessage(data.error ?? "Could not save.");
        return;
      }
      onSaved(data.product);
      setState("saved");
      window.setTimeout(() => setState("idle"), 1600);
    } catch {
      setState("error");
      setMessage("Could not save. Check the connection and try again.");
    }
  }

  const input =
    "h-9 w-full border border-[color:var(--admin-hairline)] bg-surface px-2 text-sm text-ink focus:border-ink focus:outline-none";
  const soldOut = tracked && Number(stock) <= 0;

  return (
    <tr className={`border-b border-[color:var(--admin-hairline)] align-middle ${active ? "" : "opacity-55"}`}>
      <td className="py-3 pr-3">
        <div className="flex items-center gap-3">
          <img src={p.image} alt="" className="h-14 w-14 shrink-0 rounded-[12px] border border-[color:var(--admin-hairline)] bg-white object-contain p-1.5" />
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-muted">{p.brand}</p>
            <p className="mt-0.5 max-w-[34ch] truncate text-sm text-ink" title={p.name}>
              {p.name}
            </p>
          </div>
        </div>
      </td>
      <td className="px-2 py-3">
        <label className="sr-only" htmlFor={`price-${p.slug}`}>
          Price
        </label>
        <input id={`price-${p.slug}`} value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" className={`${input} font-mono`} />
      </td>
      <td className="px-2 py-3">
        <label className="sr-only" htmlFor={`msrp-${p.slug}`}>
          List price
        </label>
        <input id={`msrp-${p.slug}`} value={msrp} onChange={(e) => setMsrp(e.target.value)} inputMode="decimal" placeholder="none" className={`${input} font-mono`} />
      </td>
      <td className="px-2 py-3">
        <label className="sr-only" htmlFor={`stock-${p.slug}`}>
          Quantity in stock
        </label>
        <input
          id={`stock-${p.slug}`}
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          inputMode="numeric"
          disabled={!tracked}
          className={`${input} font-mono ${soldOut ? "border-signal text-signal" : ""} disabled:bg-ground disabled:text-muted`}
        />
      </td>
      <td className="px-2 py-3 text-center">
        <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-muted">
          <input type="checkbox" checked={tracked} onChange={(e) => setTracked(e.target.checked)} className="h-4 w-4 accent-[#1f66b8]" />
          <span className="sr-only sm:not-sr-only">count</span>
        </label>
      </td>
      <td className="px-2 py-3 text-center">
        <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-muted">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-[#1f66b8]" />
          <span className="sr-only sm:not-sr-only">listed</span>
        </label>
      </td>
      <td className="py-3 pl-2 text-right">
        {state === "saved" ? (
          <span className="font-mono text-[13px] uppercase tracking-[0.14em] text-signal">Saved</span>
        ) : (
          <button
            type="button"
            onClick={() => void save()}
            disabled={!dirty || state === "saving"}
            className="h-9 border border-ink px-4 text-[13px] font-medium text-ink transition-colors hover:bg-ink hover:text-surface disabled:border-line disabled:text-muted disabled:hover:bg-transparent disabled:hover:text-muted"
          >
            {state === "saving" ? "Saving" : "Save"}
          </button>
        )}
        {message ? <p className="mt-1 text-[13px] text-signal">{message}</p> : null}
      </td>
    </tr>
  );
}

export function StockPanel() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch("/api/admin/products")
      .then((r) => r.json() as Promise<{ ok: boolean; products?: AdminProduct[]; error?: string }>)
      .then((d) => {
        if (!alive) return;
        if (d.ok && d.products) setProducts(d.products);
        else setError(d.error ?? "Could not load the catalog.");
      })
      .catch(() => alive && setError("Could not load the catalog."))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return products;
    return products.filter((p) => `${p.name} ${p.brand} ${p.slug}`.toLowerCase().includes(needle));
  }, [products, q]);

  const counted = products.filter((p) => p.stock_tracked === 1);
  const out = counted.filter((p) => p.stock <= 0);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[color:var(--admin-hairline)] pb-4">
        <div>
          <label htmlFor="admin-search" className="mb-1.5 block font-mono text-[13px] uppercase tracking-[0.14em] text-muted">
            Find a product
          </label>
          <input
            id="admin-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, brand or part number"
            className="h-10 w-[300px] max-w-full border border-[color:var(--admin-hairline)] bg-surface px-3 text-sm text-ink focus:border-ink focus:outline-none"
          />
        </div>
        <p className="text-[13px] font-medium text-muted">
          {products.length} products · {counted.length} counted · {out.length} sold out
        </p>
      </div>

      <div className="mt-4 border-l-2 border-teal py-2 pl-3 text-[15px] leading-[1.55] text-muted">
        Tick <b className="font-medium text-ink">count</b> to have the website keep a running number that drops with every
        sale and hides the product at zero. Leave it unticked and the product is simply always available, which is how
        every product behaves today. Untick <b className="font-medium text-ink">listed</b> to take something off the site
        without deleting it.
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-muted">Loading the catalog.</p>
      ) : error ? (
        <p className="mt-8 border-l-2 border-signal py-2 pl-3 text-sm text-signal">{error}</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[color:var(--admin-hairline)]">
                {["Product", "Price", "List price", "In stock", "Count", "Listed", ""].map((h) => (
                  <th key={h} className="pb-3 text-[13px] font-medium text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => (
                <Row
                  key={p.slug}
                  p={p}
                  onSaved={(next) => setProducts((all) => all.map((x) => (x.slug === next.slug ? next : x)))}
                />
              ))}
            </tbody>
          </table>
          {shown.length === 0 ? <p className="py-8 text-sm text-muted">Nothing matches that search.</p> : null}
        </div>
      )}
    </div>
  );
}

export { money };
