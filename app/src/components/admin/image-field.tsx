import { useRef, useState } from "react";

/**
 * A picture, got two ways.
 *
 * Either the shop picks a file off their computer, or they paste the address
 * of an image on a manufacturer's site. Both go to the same endpoint and both
 * come back as our own copy, so a product photo never depends on somebody
 * else's server still being arranged the way it was the day it was added.
 */
export function ImageField({
  value,
  onChange,
  label = "Photo",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [busy, setBusy] = useState<"" | "file" | "link">("");
  const [error, setError] = useState("");
  const [link, setLink] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function send(init: RequestInit, which: "file" | "link") {
    setBusy(which);
    setError("");
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", ...init });
      const data = (await res.json()) as { ok: boolean; url?: string; error?: string };
      if (!data.ok || !data.url) {
        setError(data.error ?? "That image could not be saved.");
        return;
      }
      onChange(data.url);
      setLink("");
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      setError("Could not reach the site. Check the connection.");
    } finally {
      setBusy("");
    }
  }

  const input = "h-9 w-full border border-line bg-surface px-2 text-sm text-ink focus:border-ink focus:outline-none";

  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{label}</p>

      <div className="mt-3 flex items-start gap-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center border border-line bg-white">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-contain p-1.5" />
          ) : (
            <span className="px-2 text-center font-mono text-[10px] leading-tight text-muted">No photo</span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2.5">
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              disabled={busy !== ""}
              onChange={(e) => {
                const file = e.currentTarget.files?.[0];
                if (!file) return;
                const body = new FormData();
                body.append("file", file);
                void send({ body }, "file");
              }}
              className="block w-full text-xs text-muted file:mr-3 file:h-8 file:border file:border-line file:bg-surface file:px-3 file:text-xs file:text-ink hover:file:border-ink"
            />
          </div>

          <div className="flex gap-2">
            <input
              type="url"
              value={link}
              placeholder="or paste an image address from the manufacturer"
              disabled={busy !== ""}
              onChange={(e) => setLink(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter" || !link.trim()) return;
                e.preventDefault();
                void send(
                  { headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: link.trim() }) },
                  "link",
                );
              }}
              className={input}
            />
            <button
              type="button"
              disabled={busy !== "" || !link.trim()}
              onClick={() =>
                void send(
                  { headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: link.trim() }) },
                  "link",
                )
              }
              className="h-9 shrink-0 border border-line px-3 text-xs font-medium text-ink hover:border-ink disabled:text-muted"
            >
              {busy === "link" ? "Saving" : "Save copy"}
            </button>
          </div>

          {busy === "file" ? <p className="text-xs text-muted">Uploading.</p> : null}
          {error ? <p className="text-xs text-[color:var(--color-signal)]">{error}</p> : null}
          {value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs text-muted underline underline-offset-4 hover:text-ink"
            >
              Remove photo
            </button>
          ) : (
            <p className="text-[11px] leading-snug text-muted">
              Pasting a link saves our own copy, so it keeps working if the manufacturer moves theirs.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
