import { useEffect, useState } from "react";

import { TARGET_BYTES, shrinkImage } from "../../lib/shrink-image";
import { btnQuiet, cardQuiet } from "./ui";

type Photo = { url: string; bytes: number | null; contentType: string };

const kb = (n: number) => `${Math.round(n / 1024)} KB`;
const mb = (n: number) => `${(n / 1048576).toFixed(1)} MB`;

async function listAll(): Promise<Photo[]> {
  const out: Photo[] = [];
  let offset: number | null = 0;
  while (offset !== null) {
    const res = await fetch(`/api/admin/media?offset=${offset}`);
    const data = (await res.json()) as { ok: boolean; photos?: Photo[]; next?: number | null; error?: string };
    if (!data.ok) throw new Error(data.error ?? "Could not list the photos.");
    out.push(...(data.photos ?? []));
    offset = data.next ?? null;
  }
  return out;
}

/**
 * One button that shrinks every stored photo over 100 KB.
 *
 * Each photo is downloaded into this browser, re-saved as a smaller WebP,
 * uploaded as a new file, and then swapped in wherever it was used. Done one
 * at a time so the count shown is the count that actually happened, and safe
 * to stop half way or run twice: a photo already small enough is skipped, and
 * the original file stays in storage.
 *
 * Only shows itself when there is something to do.
 */
export function ShrinkPhotos({ onDone }: { onDone: () => void }) {
  const [large, setLarge] = useState<Photo[] | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState("");

  async function check() {
    try {
      const all = await listAll();
      setLarge(all.filter((p) => p.bytes !== null && p.bytes > TARGET_BYTES && p.contentType !== "image/gif"));
    } catch {
      setLarge([]);
    }
  }

  useEffect(() => {
    void check();
  }, []);

  async function run() {
    if (!large?.length) return;
    setRunning(true);
    setResult("");
    let done = 0;
    let failed = 0;
    let before = 0;
    let after = 0;

    for (const [i, photo] of large.entries()) {
      setProgress(`Shrinking ${i + 1} of ${large.length}…`);
      try {
        const original = await (await fetch(photo.url)).blob();
        const { blob, changed } = await shrinkImage(original);
        if (!changed) continue;

        const body = new FormData();
        body.append("file", new File([blob], "photo.webp", { type: "image/webp" }));
        const up = (await (await fetch("/api/admin/upload", { method: "POST", body })).json()) as {
          ok: boolean;
          url?: string;
        };
        if (!up.ok || !up.url) throw new Error("upload failed");

        const swap = (await (
          await fetch("/api/admin/media", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ from: photo.url, to: up.url }),
          })
        ).json()) as { ok: boolean };
        if (!swap.ok) throw new Error("swap failed");

        done += 1;
        before += original.size;
        after += blob.size;
      } catch {
        failed += 1;
      }
    }

    setProgress("");
    setResult(
      `Shrank ${done} photo${done === 1 ? "" : "s"}` +
        (done ? `, from ${mb(before)} to ${mb(after)}` : "") +
        (failed ? `. ${failed} could not be done — run it again to retry those.` : "."),
    );
    setRunning(false);
    await check();
    onDone();
  }

  if (!large || (!large.length && !result)) return null;

  const total = large.reduce((n, p) => n + (p.bytes ?? 0), 0);

  return (
    <div className={`${cardQuiet} mt-5`}>
      {large.length ? (
        <>
          <p className="text-[15px] font-semibold text-ink">
            {large.length} photo{large.length === 1 ? " is" : "s are"} larger than 100 KB ({mb(total)} in all)
          </p>
          <p className="mt-1 text-[13px] leading-[1.5] text-muted">
            Large photos slow the shop down on phones and are flagged by search engines. This re-saves each one as a
            smaller copy that looks the same on screen. The largest is {kb(Math.max(...large.map((p) => p.bytes ?? 0)))}.
            Keep this page open while it runs.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button type="button" disabled={running} onClick={() => void run()} className={btnQuiet}>
              {running ? "Working…" : "Shrink them now"}
            </button>
            {progress ? <span className="text-[13px] text-muted">{progress}</span> : null}
          </div>
        </>
      ) : null}
      {result ? <p className="mt-3 text-[13px] text-ink">{result}</p> : null}
    </div>
  );
}
