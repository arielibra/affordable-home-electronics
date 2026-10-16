import { useEffect, useMemo, useState } from "react";

import { gtinProblem } from "../../lib/gtin";
import { DESCRIPTION_SHOWN, TITLE_SHOWN, autoDescription, autoTitle } from "../../lib/seo";
import { ORIGIN, money } from "../../lib/site";
import { slugify } from "../../lib/slug";
import { GalleryField } from "./gallery-field";
import { RichTextArea } from "./rich-textarea";
import { btnLink, card, cardQuiet, input, label } from "./ui";

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
  specs: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  gtin?: string;
  mpn?: string;
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


const dollars = (cents: number | null) => (cents === null ? "" : (cents / 100).toFixed(2));
const toCents = (v: string) => Math.round(Number(v.replace(/[^0-9.]/g, "")) * 100);

/** Worked out as he types, so the consequence of a price sits next to the
 *  price rather than in a spreadsheet afterwards. Renders nothing at all when
 *  there is nothing to say. */
function Margin({ price, cost }: { price: string; cost: string }) {
  if (!cost.trim() || !price.trim()) return null;
  const p = toCents(price);
  const c = toCents(cost);
  if (!Number.isFinite(p) || !Number.isFinite(c) || p <= 0) return null;
  const profit = p - c;
  const pct = c > 0 ? Math.round((profit / c) * 100) : null;
  const thin = profit <= 0;
  return (
    <span className={`text-sm ${thin ? "text-[color:var(--color-signal)]" : "text-ink"}`}>
      {thin ? (
        <>
          Sells at <b>{profit === 0 ? "break-even" : `${money(Math.abs(profit))} below cost`}</b>
        </>
      ) : (
        <>
          You make <b>{money(profit)}</b>
          {pct !== null ? <span className="text-muted"> · {pct}% markup</span> : null}
        </>
      )}
    </span>
  );
}

/** "38 / 60", turning red past the length Google shows. */
function Count({ n, max }: { n: number; max: number }) {
  return (
    <span className={`font-mono text-[12px] ${n > max ? "text-[color:var(--color-signal)]" : "text-muted"}`}>
      {n} / {max}
    </span>
  );
}

/**
 * The three search-engine fields, plus a mock of the Google result they make.
 *
 * Each box shows the automatic text as its placeholder, so blank is never a
 * mystery: what he sees greyed out is exactly what the page uses until he
 * types something better. The preview runs the same functions as the real
 * product page (lib/seo.ts), so it cannot disagree with it.
 */
function SeoFields({
  name,
  blurb,
  slug,
  title,
  setTitle,
  description,
  setDescription,
  keywords,
  setKeywords,
}: {
  name: string;
  blurb: string;
  slug: string;
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  keywords: string;
  setKeywords: (v: string) => void;
}) {
  const autoT = autoTitle(name.trim() || "Product name");
  const autoD = autoDescription(blurb, name.trim() || "The description will appear here.");
  const shownTitle = title.trim() || autoT;
  const shownDesc = description.trim() || autoD;
  const cut = (t: string, n: number) => (t.length > n ? `${t.slice(0, n).trimEnd()}\u2026` : t);
  const host = ORIGIN.replace(/^https?:\/\//, "");

  return (
    <div className={`${cardQuiet} mt-5`}>
      <p className="text-[15px] font-semibold text-ink">Search engines</p>
      <p className="mt-1 max-w-[70ch] text-[13px] leading-[1.55] text-muted">
        How this product appears on Google. Leave any box empty and the site fills it in for you &mdash; the grey text is
        what it will use.
      </p>

      <div className="mt-4 rounded-[14px] border border-[color:var(--admin-hairline)] bg-white p-4" aria-label="Google preview">
        <p className="text-[12px] text-[#4d5156]">
          {host} &rsaquo; p &rsaquo; {slug || "web-address"}
        </p>
        <p className="mt-1 text-[19px] leading-[1.3] text-[#1a0dab]">{cut(shownTitle, TITLE_SHOWN)}</p>
        <p className="mt-1 text-[14px] leading-[1.5] text-[#4d5156]">{cut(shownDesc, DESCRIPTION_SHOWN)}</p>
      </div>

      <label className="mt-4 block">
        <span className="flex items-baseline justify-between gap-3">
          <span className="text-[13px] font-medium text-muted">Page title</span>
          <Count n={title.trim().length} max={TITLE_SHOWN} />
        </span>
        <input
          value={title}
          placeholder={autoT}
          onChange={(e) => setTitle(e.currentTarget.value)}
          className={`mt-1.5 ${input}`}
        />
        <span className="mt-1 block text-[12px] leading-[1.5] text-muted">
          The blue headline in Google and the text on the browser tab. Used exactly as typed. About 60 characters show.
        </span>
      </label>

      <label className="mt-4 block">
        <span className="flex items-baseline justify-between gap-3">
          <span className="text-[13px] font-medium text-muted">Meta description</span>
          <Count n={description.trim().length} max={DESCRIPTION_SHOWN} />
        </span>
        <textarea
          value={description}
          placeholder={autoD}
          rows={3}
          onChange={(e) => setDescription(e.currentTarget.value)}
          className={`mt-1.5 ${input.replace("h-12", "min-h-[96px]")} py-3 leading-[1.5]`}
        />
        <span className="mt-1 block text-[12px] leading-[1.5] text-muted">
          The grey lines under the headline. One or two sentences that make someone click. About 160 characters show.
        </span>
      </label>

      <label className="mt-4 block">
        <span className="text-[13px] font-medium text-muted">Keywords</span>
        <input
          value={keywords}
          placeholder="e.g. 4k security camera, poe camera, outdoor cctv"
          onChange={(e) => setKeywords(e.currentTarget.value)}
          className={`mt-1.5 ${input}`}
        />
        <span className="mt-1 block text-[12px] leading-[1.5] text-muted">
          Separate with commas. Put in the words customers actually type, including old or alternative part numbers.
          These also help people find it with this site&rsquo;s own search box.
        </span>
      </label>
    </div>
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
  const [specs, setSpecs] = useState(src?.specs ?? "");
  // A copy keeps the keywords (same kind of product, same searches) but not
  // the title or description: two pages with one headline compete with each
  // other on Google. Left blank, the copy's own name fills them in.
  const [metaTitle, setMetaTitle] = useState(product?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(product?.meta_description ?? "");
  const [metaKeywords, setMetaKeywords] = useState(src?.meta_keywords ?? "");
  // Barcode and part number identify one exact item, so a copy (by definition
  // a different item) starts with both blank.
  const [gtin, setGtin] = useState(product?.gtin ?? "");
  const [mpn, setMpn] = useState(product?.mpn ?? "");
  const gtinError = gtinProblem(gtin);
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
    if (gtinError) return setError(`UPC: ${gtinError}`);
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
      specs,
      meta_title: metaTitle,
      meta_description: metaDescription,
      meta_keywords: metaKeywords,
      gtin,
      mpn,
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
    <div className={card}>
      <h3 className="text-sm font-semibold text-ink">
        {product ? `Editing ${product.name}` : cloneOf ? `Copy of ${cloneOf.name}` : "New product"}
      </h3>
      {cloneOf ? (
        <p className="mt-2 max-w-[70ch] text-[13px] leading-[1.55] text-muted">
          Everything has been copied across except the stock count and the front-page flag. It is{" "}
          <b>not listed in the shop yet</b> &mdash; change what needs changing, give it its own part number, then tick
          Listed when it is ready. The original is untouched.
        </p>
      ) : null}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-[13px] font-medium text-muted">Name</span>
          <input value={name} onChange={(e) => setName(e.currentTarget.value)} className={`mt-1.5 ${input}`} autoFocus />
        </label>

        {!product ? (
          <label className="block sm:col-span-2">
            <span className="text-[13px] font-medium text-muted">
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
          <span className="text-[13px] font-medium text-muted">Brand</span>
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
          <span className="text-[13px] font-medium text-muted">Category</span>
          <select value={category} onChange={(e) => setCategory(e.currentTarget.value)} className={`mt-1.5 ${input}`}>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[13px] font-medium text-muted">Price</span>
          <input value={price} inputMode="decimal" onChange={(e) => setPrice(e.currentTarget.value)} className={`mt-1.5 ${input}`} />
        </label>

        <label className="block">
          <span className="text-[13px] font-medium text-muted">
            List price <span className="normal-case tracking-normal">— shown struck through</span>
          </span>
          <input value={msrp} inputMode="decimal" onChange={(e) => setMsrp(e.currentTarget.value)} className={`mt-1.5 ${input}`} />
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-[13px] font-medium text-muted">
            UPC <span className="normal-case tracking-normal">— the barcode number on the box</span>
          </span>
          <input
            value={gtin}
            inputMode="numeric"
            placeholder="e.g. 012345678905"
            onChange={(e) => setGtin(e.currentTarget.value)}
            className={`mt-1.5 ${input}`}
          />
          <span className={`mt-1 block text-[12px] leading-[1.5] ${gtinError ? "text-[color:var(--color-signal)]" : "text-muted"}`}>
            {gtinError ||
              "Lets Google show your price next to other shops selling the same item. Copy it from the box, or from your Amazon or Walmart listing."}
          </span>
        </label>
        <label className="block">
          <span className="text-[13px] font-medium text-muted">
            Part number <span className="normal-case tracking-normal">— the maker&rsquo;s model code</span>
          </span>
          <input
            value={mpn}
            placeholder="e.g. VF30 PRO"
            onChange={(e) => setMpn(e.currentTarget.value)}
            className={`mt-1.5 ${input}`}
          />
          <span className="mt-1 block text-[12px] leading-[1.5] text-muted">
            Exactly as the manufacturer writes it. Google uses it with the brand when there is no UPC.
          </span>
        </label>
      </div>

      <div className={`${cardQuiet} mt-5`}>
        <label className="block">
          <span className="text-[13px] font-medium text-muted">What it cost you</span>
          <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
            <input
              value={cost}
              inputMode="decimal"
              onChange={(e) => setCost(e.currentTarget.value)}
              className={`${input} block w-[150px] shrink-0`}
            />
            <Margin price={price} cost={cost} />
          </span>
        </label>
        <p className="mt-2.5 max-w-[68ch] text-[13px] leading-[1.55] text-muted">
          Only you ever see this. It is never sent to the shop pages, never in the page source, and never in anything a
          customer can open. Leave it blank if you would rather not record it.
        </p>
      </div>

      <label className="mt-4 block">
        <span className="text-[13px] font-medium text-muted">Description</span>
        <RichTextArea value={blurb} onChange={setBlurb} />
      </label>

      <label className="mt-4 block">
        <span className="text-[13px] font-medium text-muted">Specifications</span>
        <p className="mt-1 text-[12px] leading-[1.5] text-muted">
          The manufacturer&rsquo;s numbers. Paste the specification table straight off their site &mdash; the two columns are kept.
        </p>
        <RichTextArea value={specs} onChange={setSpecs} mode="specs" />
      </label>

      <div className="mt-5">
        <GalleryField value={images} onChange={setImages} />
      </div>

      <SeoFields
        name={name}
        blurb={blurb}
        slug={product ? product.slug : slugify(slug.trim() || name)}
        title={metaTitle}
        setTitle={setMetaTitle}
        description={metaDescription}
        setDescription={setMetaDescription}
        keywords={metaKeywords}
        setKeywords={setMetaKeywords}
      />

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-[13px] font-medium text-muted">How many in stock</span>
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
        <p className="mt-3 text-[13px] leading-[1.55] text-muted">
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
        <button type="button" onClick={onCancel} className="h-10 border border-[color:var(--admin-hairline)] px-5 text-sm text-ink hover:border-ink">
          Cancel
        </button>
      </div>
    </div>
  );
}

/**
 * Two clicks, because this cannot be undone and it sits next to Edit. The
 * second click is also where the server gets to object: a product with sales
 * behind it comes back with a count and asks once more rather than going
 * quietly.
 */
function DeleteProduct({ product, onDone }: { product: { slug: string; name: string }; onDone: () => void }) {
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [warning, setWarning] = useState("");

  async function go(force: boolean) {
    setBusy(true);
    try {
      const res = await fetch(
        `/api/admin/products?slug=${encodeURIComponent(product.slug)}${force ? "&force=1" : ""}`,
        { method: "DELETE" },
      );
      const data = (await res.json()) as { ok: boolean; error?: string; needsConfirm?: boolean };
      if (!data.ok) {
        if (data.needsConfirm) setWarning(data.error ?? "This product has sales behind it.");
        else {
          setWarning(data.error ?? "Could not remove that.");
          setArmed(false);
        }
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
      <span className="flex items-center gap-2 text-right">
        <span className="max-w-[26ch] text-[12px] leading-[1.4] text-[color:var(--admin-bad)]">{warning}</span>
        <button type="button" disabled={busy} onClick={() => void go(true)} className={`${btnLink} text-[color:var(--admin-bad)]`}>
          Delete anyway
        </button>
        <button
          type="button"
          onClick={() => {
            setWarning("");
            setArmed(false);
          }}
          className={`${btnLink} text-muted`}
        >
          Keep
        </button>
      </span>
    );
  }

  if (!armed) {
    return (
      <button type="button" onClick={() => setArmed(true)} title={`Delete ${product.name}`} className={`${btnLink} text-muted`}>
        Delete
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <button type="button" disabled={busy} onClick={() => void go(false)} className={`${btnLink} text-[color:var(--admin-bad)]`}>
        {busy ? "Deleting." : "Really delete?"}
      </button>
      <button type="button" onClick={() => setArmed(false)} className={`${btnLink} text-muted`}>
        No
      </button>
    </span>
  );
}

export function CatalogPanel() {
  const [products, setProducts] = useState<CatalogProduct[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [categories, setCategories] = useState<Option[]>([]);
  const [brands, setBrands] = useState<Option[]>([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<EditTarget | null>(null);

  // Without this, a failing request left the tab saying "Loading." for ever,
  // which looks identical to a slow connection and tells him nothing.
  async function load() {
    try {
      const res = await fetch("/api/admin/products");
      const data = (await res.json()) as { ok: boolean; products?: CatalogProduct[]; error?: string };
      if (!data.ok && data.error) setLoadError(data.error);
      else setLoadError("");
      setProducts(data.products ?? []);
    } catch {
      setLoadError("Could not load the catalogue. Reload the page; if it keeps happening the site needs a look.");
      setProducts([]);
    }
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
          className="h-10 w-full max-w-[340px] border border-[color:var(--admin-hairline)] bg-surface px-3 text-sm text-ink focus:border-ink focus:outline-none"
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

      {loadError ? (
        <p className="mt-5 border border-[color:var(--admin-hairline)] bg-ground p-3 text-sm text-[color:var(--color-signal)]">{loadError}</p>
      ) : null}

      <p className="mt-6 font-mono text-[13px] uppercase tracking-[0.14em] text-muted">
        {shown.length} of {products.length} products
      </p>

      <div className="mt-4 space-y-1">
        {shown.map((p) => (
          <div key={p.slug} className={`ahe-row flex items-center gap-4 ${p.active ? "" : "opacity-55"}`}>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] border border-[color:var(--admin-hairline)] bg-white">
              {(p.images?.[0] ?? p.image) ? (
                <img src={p.images?.[0] ?? p.image} alt="" className="h-full w-full object-contain p-1" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-muted">{p.brand || "No brand"}</p>
              <p className="mt-0.5 truncate text-sm text-ink" title={p.name}>
                {p.name}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-mono text-sm text-ink">{money(p.price_cents)}</p>
              <p className="font-mono text-[13px] text-muted">
                {p.stock_tracked ? `${p.stock} in stock` : "always available"}
              </p>
            </div>
            <div className="ml-2 flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setEditing({ kind: "edit", product: p })}
                className={btnLink}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setEditing({ kind: "clone", product: p })}
                title={`Start a new product from ${p.name}`}
                className={`${btnLink} text-muted`}
              >
                Copy
              </button>
              <DeleteProduct product={p} onDone={load} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
