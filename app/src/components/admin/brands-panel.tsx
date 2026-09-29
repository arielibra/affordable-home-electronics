import { useEffect, useState } from "react";

import { ImageField } from "./image-field";

export type AdminBrand = {
  slug: string;
  name: string;
  blurb: string;
  logo: string;
  position: number;
  active: number;
  products: number;
};

const input = "h-9 w-full border border-line bg-surface px-2 text-sm text-ink focus:border-ink focus:outline-none";

function Editor({
  brand,
  onSaved,
  onCancel,
}: {
  brand: AdminBrand | null;
  onSaved: (b: AdminBrand) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(brand?.name ?? "");
  const [blurb, setBlurb] = useState(brand?.blurb ?? "");
  const [logo, setLogo] = useState(brand?.logo ?? "");
  const [position, setPosition] = useState(String(brand?.position ?? 100));
  const [active, setActive] = useState(brand ? brand.active === 1 : true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: brand?.slug,
          name,
          blurb,
          logo,
          position: Number(position) || 100,
          active,
        }),
      });
      const data = (await res.json()) as { ok: boolean; brand?: AdminBrand; error?: string };
      if (!data.ok || !data.brand) {
        setError(data.error ?? "Could not save.");
        return;
      }
      onSaved(data.brand);
    } catch {
      setError("Could not reach the site.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-ink bg-surface p-5">
      <h3 className="text-sm font-semibold text-ink">{brand ? `Editing ${brand.name}` : "New brand"}</h3>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Name</span>
          <input value={name} onChange={(e) => setName(e.currentTarget.value)} className={`mt-1.5 ${input}`} autoFocus />
        </label>
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Order on the page</span>
          <input
            value={position}
            inputMode="numeric"
            onChange={(e) => setPosition(e.currentTarget.value)}
            className={`mt-1.5 ${input}`}
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          One line customers read
        </span>
        <input
          value={blurb}
          placeholder="Cameras, recorders and access control."
          onChange={(e) => setBlurb(e.currentTarget.value)}
          className={`mt-1.5 ${input}`}
        />
      </label>

      <div className="mt-5">
        <ImageField value={logo} onChange={setLogo} label="Logo" />
      </div>

      <label className="mt-5 flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.currentTarget.checked)} className="h-4 w-4" />
        Show this brand to customers
      </label>

      {error ? <p className="mt-4 text-sm text-[color:var(--color-signal)]">{error}</p> : null}
      {brand ? (
        <p className="mt-4 text-xs leading-relaxed text-muted">
          Renaming updates all {brand.products} product{brand.products === 1 ? "" : "s"} using this brand. The web
          address stays <code className="font-mono">{brand.slug}</code>, so existing links keep working.
        </p>
      ) : null}

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving || !name.trim()}
          className="h-10 bg-ink px-5 text-sm font-medium text-surface active:scale-[0.98] disabled:bg-line disabled:text-muted"
        >
          {saving ? "Saving" : brand ? "Save changes" : "Add brand"}
        </button>
        <button type="button" onClick={onCancel} className="h-10 border border-line px-5 text-sm text-ink hover:border-ink">
          Cancel
        </button>
      </div>
    </div>
  );
}

export function BrandsPanel() {
  const [brands, setBrands] = useState<AdminBrand[] | null>(null);
  const [editing, setEditing] = useState<AdminBrand | null | "new">(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/brands");
    const data = (await res.json()) as { ok: boolean; brands?: AdminBrand[] };
    setBrands(data.brands ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function remove(b: AdminBrand) {
    setError("");
    const res = await fetch(`/api/admin/brands?slug=${encodeURIComponent(b.slug)}`, { method: "DELETE" });
    const data = (await res.json()) as { ok: boolean; error?: string };
    if (!data.ok) {
      setError(data.error ?? "Could not remove that brand.");
      return;
    }
    void load();
  }

  if (!brands) return <p className="text-sm text-muted">Loading.</p>;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">
            The manufacturers customers see and filter by. Products pick from this list, so a name only has to be
            spelled right once.
          </p>
        </div>
        {editing === null ? (
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="h-10 bg-ink px-5 text-sm font-medium text-surface active:scale-[0.98]"
          >
            Add a brand
          </button>
        ) : null}
      </div>

      {editing !== null ? (
        <div className="mt-5">
          <Editor
            brand={editing === "new" ? null : editing}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              void load();
            }}
          />
        </div>
      ) : null}

      {error ? <p className="mt-5 text-sm text-[color:var(--color-signal)]">{error}</p> : null}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[620px] text-left">
          <thead>
            <tr className="border-b border-line">
              {["Brand", "Products", "Order", "Shown", ""].map((h) => (
                <th key={h} className="pb-2.5 font-mono text-[10px] uppercase tracking-[0.14em] font-medium text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {brands.map((b) => (
              <tr key={b.slug} className={`border-b border-line ${b.active ? "" : "opacity-55"}`}>
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-line bg-white">
                      {b.logo ? <img src={b.logo} alt="" className="h-full w-full object-contain p-1" /> : null}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-ink">{b.name}</p>
                      {b.blurb ? <p className="max-w-[40ch] truncate text-xs text-muted">{b.blurb}</p> : null}
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-3 font-mono text-sm text-muted">{b.products}</td>
                <td className="py-3 pr-3 font-mono text-sm text-muted">{b.position}</td>
                <td className="py-3 pr-3 text-sm text-muted">{b.active ? "Yes" : "Hidden"}</td>
                <td className="py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setEditing(b)}
                    className="text-xs text-ink underline underline-offset-4"
                  >
                    Edit
                  </button>
                  {b.products === 0 ? (
                    <button
                      type="button"
                      onClick={() => remove(b)}
                      className="ml-4 text-xs text-muted underline underline-offset-4 hover:text-ink"
                    >
                      Remove
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
