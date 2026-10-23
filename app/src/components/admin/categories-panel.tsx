import { useCallback, useEffect, useState } from "react";
import { btnLink, btnPrimary, btnQuiet, card, input, label } from "./ui";

type Category = { slug: string; name: string; blurb: string; position: number; products: number };

function Editor({
  category,
  onDone,
  onCancel,
}: {
  category: Category | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [blurb, setBlurb] = useState(category?.blurb ?? "");
  const [position, setPosition] = useState(String(category?.position ?? 100));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!name.trim()) return setError("A category needs a name.");
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: category?.slug,
          name,
          blurb,
          position: Number(position) || 100,
        }),
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
      setBusy(false);
    }
  }

  return (
    <div className={card}>
      <h3 className="text-sm font-semibold text-ink">
        {category ? `Editing ${category.name}` : "New category"}
      </h3>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_110px]">
        <label>
          <span className={label}>Name</span>
          <input value={name} onChange={(e) => setName(e.currentTarget.value)} className={`mt-1.5 ${input}`} />
        </label>
        <label>
          <span className={label}>Order</span>
          <input
            value={position}
            inputMode="numeric"
            onChange={(e) => setPosition(e.currentTarget.value)}
            className={`mt-1.5 ${input}`}
          />
        </label>
      </div>

      <label className="mt-3 block">
        <span className={label}>One line about it</span>
        <input
          value={blurb}
          placeholder=""
          onChange={(e) => setBlurb(e.currentTarget.value)}
          className={`mt-1.5 ${input}`}
        />
      </label>

      {category ? (
        <p className="mt-3 text-[13px] leading-[1.55] text-muted">
          Its web address stays <span className="font-mono text-ink">/shop/{category.slug}</span> whatever you rename it
          to. That is deliberate &mdash; changing it would break every link to this page and lose its place in search
          results.
        </p>
      ) : (
        <p className="mt-3 text-[13px] leading-[1.55] text-muted">
          The web address is made from the name, and then never changes. Pick the name you want to keep.
        </p>
      )}

      {error ? <p className="mt-3 text-sm text-[color:var(--color-signal)]">{error}</p> : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className={btnPrimary}
        >
          {busy ? "Saving" : category ? "Save changes" : "Add category"}
        </button>
        <button type="button" onClick={onCancel} className={`${btnLink} text-muted`}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export function CategoriesPanel() {
  const [rows, setRows] = useState<Category[] | null>(null);
  const [editing, setEditing] = useState<Category | null | "new">(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = (await res.json()) as { ok: boolean; categories?: Category[]; error?: string };
      setRows(data.categories ?? []);
      setError(data.ok ? "" : (data.error ?? ""));
    } catch {
      setRows([]);
      setError("Could not load the categories. Reload the page.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(c: Category) {
    setError("");
    try {
      const res = await fetch(`/api/admin/categories?slug=${encodeURIComponent(c.slug)}`, { method: "DELETE" });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setError(data.error ?? "Could not remove that.");
        return;
      }
      void load();
    } catch {
      setError("Could not reach the site.");
    }
  }

  if (!rows) return <p className="text-sm text-muted">Loading.</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-[70ch] text-[15px] leading-[1.55] text-muted">
          The sections customers browse by. Each one is a page on the shop, and every product sits in exactly one.
        </p>
        {editing === null ? (
          <button
            type="button"
            onClick={() => setEditing("new")}
            className={`${btnQuiet} shrink-0`}
          >
            Add a category
          </button>
        ) : null}
      </div>

      {editing !== null ? (
        <div className="mt-5">
          <Editor
            key={editing === "new" ? "new" : editing.slug}
            category={editing === "new" ? null : editing}
            onCancel={() => setEditing(null)}
            onDone={() => {
              setEditing(null);
              void load();
            }}
          />
        </div>
      ) : null}

      {error ? (
        <p className="mt-5 border border-[color:var(--admin-hairline)] bg-ground p-3 text-sm text-[color:var(--color-signal)]">{error}</p>
      ) : null}

      <div className="mt-6 space-y-1">
        {rows.map((c) => (
          <div key={c.slug} className="ahe-row flex flex-wrap items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ink">{c.name}</p>
            </div>
            <p className="shrink-0 font-mono text-[13px] text-muted">
              {c.products} product{c.products === 1 ? "" : "s"}
            </p>
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setEditing(c)}
                className={btnLink}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => void remove(c)}
                title={c.products > 0 ? "Move its products somewhere else first" : "Remove this category"}
                className="text-[13px] text-muted underline underline-offset-4 hover:text-ink disabled:opacity-40"
                disabled={c.products > 0}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 max-w-[70ch] text-[13px] leading-[1.55] text-muted">
        A category with products in it cannot be removed &mdash; a product whose category no longer exists disappears
        from the shop without saying so. Move its products to another category first. Order decides where it sits in the
        list; lower numbers come first.
      </p>
    </div>
  );
}
