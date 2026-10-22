/**
 * Product photos are shrunk in the admin's browser before they are stored.
 *
 * Workers cannot decode or re-encode images, so the shrinking happens where
 * there is an image engine: the browser of whoever is adding the photo. The
 * aim is under 100 KB per photo, which is what SEO audits flag and what keeps
 * a shop grid of thirty products from costing a phone several megabytes.
 *
 * 1200px on the long side is plenty: the product page shows a photo at most
 * 440px tall, so that is better than 2x for sharp screens, and well above
 * Google Merchant Center's minimum.
 */

export const TARGET_BYTES = 100 * 1024;
const MAX_EDGE = 1200;
const QUALITIES = [0.86, 0.8, 0.74, 0.68, 0.62, 0.56];

export type Shrunk = { blob: Blob; changed: boolean };

function canvasFor(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
}

/**
 * Returns a WebP no larger than needed, or the original untouched when it is
 * already small enough, is an animated GIF (a canvas keeps only the first
 * frame), or the browser cannot encode WebP. Never throws: a photo that could
 * not be shrunk is still a photo, and refusing it would be worse.
 */
export async function shrinkImage(input: Blob): Promise<Shrunk> {
  const keep: Shrunk = { blob: input, changed: false };
  if (input.type === "image/gif") return keep;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(input);
  } catch {
    return keep;
  }

  try {
    const longEdge = Math.max(bitmap.width, bitmap.height);
    if (input.size <= TARGET_BYTES && longEdge <= MAX_EDGE) return keep;

    let scale = Math.min(1, MAX_EDGE / longEdge);
    let best: Blob | null = null;

    // Lower the quality first, then the size, and stop at the first result
    // under the target. Six steps of quality at three sizes is the worst case.
    for (let round = 0; round < 3; round++) {
      const w = Math.max(1, Math.round(bitmap.width * scale));
      const h = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = canvasFor(w, h);
      const ctx = canvas.getContext("2d");
      if (!ctx) return keep;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bitmap, 0, 0, w, h);

      for (const q of QUALITIES) {
        const out = await toBlob(canvas, q);
        // Some browsers silently hand back PNG when WebP is not supported.
        if (!out || out.type !== "image/webp") return keep;
        if (!best || out.size < best.size) best = out;
        if (out.size <= TARGET_BYTES) return { blob: out, changed: true };
      }
      scale *= 0.8;
    }

    // Could not reach the target; still use the smallest version if it beats
    // the original, which it almost always does by a wide margin.
    return best && best.size < input.size ? { blob: best, changed: true } : keep;
  } finally {
    bitmap.close();
  }
}

/** Shrinks a picked file and returns it ready for a multipart upload. */
export async function shrinkFile(file: File): Promise<File> {
  const { blob, changed } = await shrinkImage(file);
  if (!changed) return file;
  const base = file.name.replace(/\.[a-z0-9]+$/i, "") || "photo";
  return new File([blob], `${base}.webp`, { type: "image/webp" });
}

type UploadResult = { ok: boolean; url?: string; error?: string };

async function post(init: RequestInit): Promise<string> {
  const res = await fetch("/api/admin/upload", { method: "POST", ...init });
  const data = (await res.json()) as UploadResult;
  if (!data.ok || !data.url) throw new Error(data.error ?? "That image could not be saved.");
  return data.url;
}

/** A file off the shop's computer: shrink, then store. */
export async function uploadFile(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", await shrinkFile(file));
  return post({ body });
}

/**
 * A manufacturer's image address. The site fetches it (a browser could not,
 * because of cross-origin rules), hands the bytes back unstored, the browser
 * shrinks them, and only the small version is kept. If the fetch-through is
 * unavailable for any reason, fall back to storing the original as before.
 */
export async function uploadFromLink(address: string): Promise<string> {
  let fetched: Response | null = null;
  try {
    fetched = await fetch(`/api/admin/upload?url=${encodeURIComponent(address)}`);
  } catch {
    fetched = null;
  }
  if (fetched && !fetched.ok) {
    const data = (await fetched.json().catch(() => ({}))) as UploadResult;
    throw new Error(data.error ?? "That image could not be fetched.");
  }
  if (!fetched) {
    return post({ headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: address }) });
  }
  const blob = await fetched.blob();
  const name = (address.split("/").pop() ?? "photo").split("?")[0] || "photo";
  return uploadFile(new File([blob], name, { type: blob.type }));
}
