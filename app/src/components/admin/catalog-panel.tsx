import { useEffect, useMemo, useState } from "react";

import { money } from "../../lib/site";
import { GalleryField } from "./gallery-field";

export type CatalogProduct = {
  slug: string;
  name: string;
  brand: string;
  brand_slug: string;
  category: string;
  price_cents: number;
  msrp_cents: number | null;
  cost_cents: number | null;
  blurb: string;
  image: string;
  images?: string[];
  featured: number;
  stock: number;
  stock_tracked: number;
  active: number;
};

type Option = { slug: string; name: string };

/** What the editor is open for: a fresh product, one being changed, or a copy
 *  of an existing one. */
type EditTarget =
  | { kind: "new" }
  | { kind: "edit"; product: CatalogProduct }
  | { kind: "clone"; product: CatalogProduct };

const input = "h-9 w-full border border-line bg-surface px-2 text-sm text-ink focus:border-ink focus:outline-none";
const dollars = (cents: number | null) => (cents === null ? "" : (cents / 100).toFixed(2));
const toCents = (v: string) => Math.round(Number(v.replace(/[^0-9.]/g, "")) * 100);

/** Worked out as he types, so the number he is choosing has its consequence
 *  next to it rather than in a spreadsheet afterwards. */
function Margin({ price, cost }: { price: string; cost: string }) {
  if (!cost.trim() || !price.trim()) {
    return (
      <p className="mt-2 text-[11px] leading-relaxed text-muted">
        Used only for your own margin figures. It is never sent to the shop pages, never in the page source, and never
        in anything a customer can open.
      </p>
    );
  }
  const p = toCents(price);
  const c = toCents(cost);
  if (!Number.isFinite(p) || !Number.isFinite(c) || p <= 0) return null;
  const profit = p - c;
  const pct = c > 0 ? Math.round((profit / c) * 100) : null;
  const thin = profit <= 0;
  return (
    <p className={`mt-2 text-xs ${thin ? "text-[color:var(--color-signal)]" : "text-ink"}`}>
      {thin ? (
        <>
          That sells at <b>{money(Math.abs(profit))} {profit === 0 ? "break-even" : "below cost"}</b>.
        </>
      ) : (
        <>
          You make <b>{money(profit)}</b> on it{pct !== null ? <> — a {pct}% markup</> : null}.
        </>
      )}
    </p>
  );
}

function Editor({
  product,
  cloneOf,
  categories,
  brands,
  onDone,
  onCancel,
}: {
  /** The product being changed. Null when making a new one. */
  product: CatalogProduct | null;
  /** When making a new one, the product to copy the details from. */
  cloneOf?: CatalogProduct | null;
  categories: Option[];
  brands: Option[];
  onDone: () => void;
  onCancel: () => void;
}) {
  // Where the starting values come from: the product itself when editing, the
  // original when copying, nothing at all when starting fresh.
  const src = product ?? cloneOf ?? null;

  const [name, setName] = useState(
    product ? product.name : cloneOf ? `${cloneOf.name} (copy)` : "",
  );
  const [slug, setSlug] = useState("");
  const [brand, setBrand] = useState(src?.brand_slug ?? "");
  const [category, setCategory] = useState(src?.category ?? categories[0]?.slug ?? "");
  const [price, setPrice] = useState(dollars(src?.price_cents ?? null));
  const [msrp, setMsrp] = useState(dollars(src?.msrp_cents ?? null));
  // What he paid. Never leaves the back office — the storefront queries name
  // their columns and this is not one of them.
  const [cost, setCost] = useState(dollars(src?.cost_cents ?? null));
  const [blurb, setBlurb] = useState(src?.blurb ?? "");
  // A copy takes the original's whole gallery, not just its main photo.
  const [images, setImages] = useState<string[]>(
    src?.images && src.images.length > 0 ? [...src.images] : src?.image ? [src.image] : [],
  );
  // Three things are deliberately NOT copied. Featured would put two of the
  // same thing on the front page. Stock belongs to the original, not to a
  // product that does not exist yet. And a copy starts unlisted, so a
  // half-finished duplicate never appears in the shop while he is still
  // deciding what to change about it.
  const [featured, setFeatured] = useState(product ? product.featured === 1 : false);
  const [stock, setStock] = useState(String(product?.stock ?? 0));
  const [tracked, setTracked] = useState(src ? src.stock_tracked === 1 : false);
  const [active, setActive] = useState(product ? product.active === 1 : cloneOf ? false : true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!name.trim()) return setError("A product needs a name.");
    if (!price.trim()) return setError("A product needs a price.");
    setSaving(true);
    setError("");

    const payload: Record<string, unknown> = {
      name,
      brand_slug: brand,
      category,
      price_cents: toCents(price),
      msrp_cents: msrp.trim() === "" ? null : toCents(msrp),
      cost_cents: cost.trim() === "" ? null : toCents(cost),
      blurb,
      images,
      featured,
      stock: Number(stock) || 0,
      stock_tracked: tracked,
      active,
    };
    if (product) payload.slug = product.slug;
    else if (slug.trim()) payload.slug = slug.trim();

    try {
      const res = await fetch("/api/admin/products", {
        method: product ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setError(data.error ?? "Could not save.");
        return;
      }
      onDone();
    } catch {
      setError("Could not reach the site.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-ink bg-surface p-5">
      <h3 className="text-sm font-semibold text-ink">
        {product ? `Editing ${product.name}` : cloneOf ? `Copy of ${cloneOf.name}` : "New product"}
      </h3>
      {cloneOf ? (
        <p className="mt-2 max-w-[70ch] text-xs leading-relaxed text-muted">
          Everything has been copied across except the stock count and the front-page flag. It is{" "}
          <b>not listed in the shop yet</b> &mdash; change what needs changing, give it its own part number, then tick
          Listed when it is ready. The original is untouched.
        </p>
      ) : null}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Name</span>
          <input value={name} onChange={(e) => setName(e.currentTarget.value)} className={`mt-1.5 ${input}`} autoFocus />
        </label>

        {!product ? (
          <label className="block sm:col-span-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              Web address <span className="normal-case tracking-normal">— optional, part number works well</span>
            </span>
            <input
              value={slug}
              placeholder="made from the name if you leave this blank"
              onChange={(e) => setSlug(e.currentTarget.value)}
              className={`mt-1.5 ${input}`}
            />
          </label>
        ) : null}

        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Brand</span>
          <select value={brand} onChange={(e) => setBrand(e.currentTarget.value)} className={`mt-1.5 ${input}`}>
            <option value="">No brand</option>
            {brands.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Category</span>
          <select value={category} onChange={(e) => setCategory(e.currentTarget.value)} className={`mt-1.5 ${input}`}>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Price</span>
          <input value={price} inputMode="decimal" onChange={(e) => setPrice(e.currentTarget.value)} className={`mt-1.5 ${input}`} />
        </label>

        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
            List price <span className="normal-case tracking-normal">— shown struck through</span>
          </span>
          <input value={msrp} inputMode="decimal" onChange={(e) => setMsrp(e.currentTarget.value)} className={`mt-1.5 ${input}`} />
        </label>
      </div>

      <div className="mt-4 border border-line bg-ground p-3">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
            What it cost you <span className="normal-case tracking-normal">— only you ever see this</span>
          </span>
          <input
            value={cost}
            inputMode="decimal"
            placeholder="leave blank if you would rather not record it"
            onChange={(e) => setCost(e.currentTarget.value)}
            className={`mt-1.5 max-w-[220px] ${input}`}
          />
        </label>
        <Margin price={price} cost={cost} />
      </div>

      <label className="mt-4 block">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Description</span>
        <textarea
          value={blurb}
          rows={3}
          maxLength={600}
          onChange={(e) => setBlurb(e.currentTarget.value)}
          className="mt-1.5 w-full border border-line bg-surface p-2 text-sm text-ink focus:border-ink focus:outline-none"
        />
      </label>

      <div className="mt-5">
        <GalleryField value={images} onChange={setImages} />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">How many in stock</span>
          <input value={stock} inputMode="numeric" onChange={(e) => setStock(e.currentTarget.value)} className={`mt-1.5 ${input}`} />
        </label>
        <div className="space-y-2 pt-6">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={tracked} onChange={(e) => setTracked(e.currentTarget.checked)} className="h-4 w-4" />
            Count the stock down as it sells
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.currentTarget.checked)} className="h-4 w-4" />
            Show on the front page
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.currentTarget.checked)} className="h-4 w-4" />
            Listed on the site
          </label>
        </div>
      </div>

      {!tracked ? (
        <p className="mt-3 text-xs leading-relaxed text-muted">
          With counting off, this stays buyable no matter what the number says. Turn it on for anything you can actually
          run out of.
        </p>
      ) : null}

      {error ? <p className="mt-4 text-sm text-[color:var(--color-signal)]">{error}</p> : null}

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="h-10 bg-ink px-5 text-sm font-medium text-surface active:scale-[0.98] disabled:bg-line disabled:text-muted"
        >
          {saving ? "Saving" : product ? "Save changes" : "Add product"}
        </button>
        <button type="button" onClick={onCancel} className="h-10 border border-line px-5 text-sm text-ink hover:border-ink">
          Cancel
        </button>
      </div>
    </div>
  );
}

export function CatalogPanel() {
  const [products, setProducts] = useState<CatalogProduct[] | null>(null);
  const [categories, setCategories] = useState<Option[]>([]);
  const [brands, setBrands] = useState<Option[]>([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<EditTarget | null>(null);

  async function load() {
    const res = await fetch("/api/admin/products");
    const data = (await res.json()) as { ok: boolean; products?: CatalogProduct[] };
    setProducts(data.products ?? []);
  }

  useEffect(() => {
    void load();
    void fetch("/api/admin/taxonomy")
      .then((r) => r.json() as Promise<{ categories?: Option[]; brands?: Option[] }>)
      .then((d) => {
        setCategories(d.categories ?? []);
        setBrands(d.brands ?? []);
      })
      .catch(() => undefined);
  }, []);

  const shown = useMemo(() => {
    if (!products) return [];
    const needle = q.trim().toLowerCase();
    if (!needle) return products;
    return products.filter((p) =>
      `${p.name} ${p.brand} ${p.slug}`.toLowerCase().includes(needle),
    );
  }, [products, q]);

  if (!products) return <p className="text-sm text-muted">Loading.</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          value={q}
          placeholder="Search by name, brand or part number"
          onChange={(e) => setQ(e.currentTarget.value)}
          className="h-10 w-full max-w-[340px] border border-line bg-surface px-3 text-sm text-ink focus:border-ink focus:outline-none"
        />
        {editing === null ? (
          <button
            type="button"
            onClick={() => setEditing({ kind: "new" })}
            className="h-10 bg-ink px-5 text-sm font-medium text-surface active:scale-[0.98]"
          >
            Add a product
          </button>
        ) : null}
      </div>

      {editing !== null ? (
        <div className="mt-5">
          <Editor
            key={editing.kind === "new" ? "new" : `${editing.kind}:${editing.product.slug}`}
            product={editing.kind === "edit" ? editing.product : null}
            cloneOf={editing.kind === "clone" ? editing.product : null}
            categories={categories}
            brands={brands}
            onCancel={() => setEditing(null)}
            onDone={() => {
              setEditing(null);
              void load();
            }}
          />
        </div>
      ) : null}

      <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        {shown.length} of {products.length} products
      </p>

      <div className="mt-3 divide-y divide-line border-y border-line">
        {shown.map((p) => (
          <div key={p.slug} className={`flex items-center gap-3 py-3 ${p.active ? "" : "opacity-55"}`}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-line bg-white">
              {(p.images?.[0] ?? p.image) ? (
                <img src={p.images?.[0] ?? p.image} alt="" className="h-full w-full object-contain p-1" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{p.brand || "No brand"}</p>
              <p className="mt-0.5 truncate text-sm text-ink" title={p.name}>
                {p.name}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-mono text-sm text-ink">{money(p.price_cents)}</p>
              <p className="font-mono text-[11px] text-muted">
                {p.stock_tracked ? `${p.stock} in stock` : "always available"}
              </p>
            </div>
            <div className="ml-2 flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setEditing({ kind: "edit", product: p })}
                className="text-xs text-ink underline underline-offset-4"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setEditing({ kind: "clone", product: p })}
                title={`Start a new product from ${p.name}`}
                className="text-xs text-muted underline underline-offset-4 hover:text-ink"
              >
                Copy
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
