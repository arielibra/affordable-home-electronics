import { useRef, useState } from "react";

const MAX = 20;

/**
 * Up to twenty photos for one product.
 *
 * Pictures arrive two ways — files off the shop's computer, or the address of
 * an image on a manufacturer's site — and both are stored as our own copy, so
 * a product photo never depends on somebody else's server still being
 * arranged the way it was the day it was added.
 *
 * The first one is the main photo. That is the one the shop grid, the cart,
 * the checkout page and the link preview all use, so reordering is not
 * decoration: it decides what a customer sees before they ever open the
 * product.
 */
export function GalleryField({
  value,
  onChange,
  label = "Photos",
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
}) {
  const [busy, setBusy] = useState<"" | "file" | "link">("");
  const [done, setDone] = useState("");
  const [error, setError] = useState("");
  const [link, setLink] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const room = MAX - value.length;

  function add(urls: string[]) {
    const merged = [...value];
    for (const u of urls) {
      if (!u || merged.includes(u) || merged.length >= MAX) continue;
      merged.push(u);
    }
    onChange(merged);
  }

  async function upload(init: RequestInit): Promise<string | null> {
    const res = await fetch("/api/admin/upload", { method: "POST", ...init });
    const data = (await res.json()) as { ok: boolean; url?: string; error?: string };
    if (!data.ok || !data.url) throw new Error(data.error ?? "That image could not be saved.");
    return data.url;
  }

  /** Files go up one at a time on purpose: twenty at once would be twenty
   *  parallel writes, and one failure in the middle would leave him guessing
   *  which ones landed. This way the count is honest. */
  async function sendFiles(files: File[]) {
    setBusy("file");
    setError("");
    setDone("");
    const got: string[] = [];
    let failed = 0;
    for (const f of files.slice(0, room)) {
      try {
        const body = new FormData();
        body.append("file", f);
        const url = await upload({ body });
        if (url) got.push(url);
      } catch {
        failed += 1;
      }
    }
    if (got.length) add(got);
    if (failed) setError(`${failed} of ${files.length} could not be saved.`);
    else if (got.length) setDone(`Added ${got.length} photo${got.length === 1 ? "" : "s"}.`);
    if (fileRef.current) fileRef.current.value = "";
    setBusy("");
  }

  async function sendLink() {
    const u = link.trim();
    if (!u) return;
    setBusy("link");
    setError("");
    setDone("");
    try {
      const url = await upload({
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: u }),
      });
      if (url) add([url]);
      setLink("");
      setDone("Saved our own copy.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "That image could not be saved.");
    } finally {
      setBusy("");
    }
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  const input = "h-9 w-full border border-line bg-surface px-2 text-sm text-ink focus:border-ink focus:outline-none";

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{label}</p>
        <p className="font-mono text-[11px] text-muted">
          {value.length} of {MAX}
        </p>
      </div>

      {value.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {value.map((src, i) => (
            <li key={src} className="w-[88px]">
              <div
                className={`relative flex h-[88px] w-[88px] items-center justify-center border bg-white ${
                  i === 0 ? "border-ink" : "border-line"
                }`}
              >
                <img src={src} alt="" className="h-full w-full object-contain p-1.5" />
                {i === 0 ? (
                  <span className="absolute left-0 top-0 bg-ink px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-surface">
                    Main
                  </span>
                ) : null}
              </div>
              <div className="mt-1 flex items-center justify-between gap-1">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => move(i, i - 1)}
                  aria-label="Move earlier"
                  className="h-6 w-6 border border-line text-[11px] text-ink hover:border-ink disabled:opacity-25"
                >
                  &larr;
                </button>
                <button
                  type="button"
                  disabled={i === value.length - 1}
                  onClick={() => move(i, i + 1)}
                  aria-label="Move later"
                  className="h-6 w-6 border border-line text-[11px] text-ink hover:border-ink disabled:opacity-25"
                >
                  &rarr;
                </button>
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                  aria-label="Remove this photo"
                  className="h-6 w-6 border border-line text-[11px] text-muted hover:border-ink hover:text-ink"
                >
                  &times;
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 border border-line bg-ground px-3 py-6 text-center text-xs text-muted">
          No photos yet. The first one you add becomes the main one.
        </p>
      )}

      <div className="mt-3 space-y-2.5">
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          disabled={busy !== "" || room <= 0}
          onChange={(e) => {
            const files = Array.from(e.currentTarget.files ?? []);
            if (files.length) void sendFiles(files);
          }}
          className="block w-full text-xs text-muted file:mr-3 file:h-8 file:border file:border-line file:bg-surface file:px-3 file:text-xs file:text-ink hover:file:border-ink disabled:opacity-50"
        />

        <div className="flex gap-2">
          <input
            type="url"
            value={link}
            placeholder="or paste an image address from the manufacturer"
            disabled={busy !== "" || room <= 0}
            onChange={(e) => setLink(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter" || !link.trim()) return;
              e.preventDefault();
              void sendLink();
            }}
            className={input}
          />
          <button
            type="button"
            disabled={busy !== "" || !link.trim() || room <= 0}
            onClick={() => void sendLink()}
            className="h-9 shrink-0 border border-line px-3 text-xs font-medium text-ink hover:border-ink disabled:text-muted"
          >
            {busy === "link" ? "Saving" : "Save copy"}
          </button>
        </div>

        {busy === "file" ? <p className="text-xs text-muted">Uploading. Leave this open until it finishes.</p> : null}
        {room <= 0 ? (
          <p className="text-xs text-muted">That is twenty. Remove one to add another.</p>
        ) : null}
        {done ? <p className="text-xs text-muted">{done}</p> : null}
        {error ? <p className="text-xs text-[color:var(--color-signal)]">{error}</p> : null}
        <p className="text-[11px] leading-snug text-muted">
          You can pick several files at once. Pasting a link saves our own copy, so it keeps working if the
          manufacturer moves theirs. The first photo is the one shown in the shop, the cart and on social links &mdash;
          use the arrows to change which that is.
        </p>
      </div>
    </div>
  );
}
