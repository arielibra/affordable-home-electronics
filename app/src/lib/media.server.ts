import { bindings } from "./bindings.server";

/**
 * Product photography.
 *
 * Two ways in, one way out. The shop either picks a file off their computer or
 * pastes the address of a manufacturer's image — and in both cases the bytes
 * end up in our own bucket. Linking straight to a manufacturer's server looks
 * identical on the day you set it up and then rots: they reorganise their site,
 * or switch on hotlink protection, and the product page quietly shows a broken
 * box to customers while still looking fine to whoever added it.
 */

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/pjpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

const MAX_BYTES = 8 * 1024 * 1024;

export function mediaEnabled(): boolean {
  return Boolean(bindings().STORAGE);
}

function bucket() {
  const b = bindings().STORAGE;
  if (!b) throw new Error("Image storage is not switched on yet.");
  return b;
}

/** Keys deliberately carry no slash, so /media/<key> needs no splat route. */
function newKey(ext: string): string {
  return `p_${crypto.randomUUID()}.${ext}`;
}

export type Stored = { key: string; url: string; bytes: number; contentType: string };

export async function storeImage(data: ArrayBuffer, contentType: string): Promise<Stored> {
  const type = contentType.split(";")[0].trim().toLowerCase();
  const ext = ALLOWED[type];
  if (!ext) {
    throw new Error("That file is not an image we can use. JPEG, PNG, WebP, GIF or AVIF only.");
  }
  if (data.byteLength === 0) throw new Error("That file is empty.");
  if (data.byteLength > MAX_BYTES) {
    throw new Error(`That image is ${(data.byteLength / 1048576).toFixed(1)} MB. The limit is 8 MB.`);
  }

  const key = newKey(ext);
  await bucket().put(key, data, {
    httpMetadata: { contentType: type, cacheControl: "public, max-age=31536000, immutable" },
  });
  return { key, url: `/media/${key}`, bytes: data.byteLength, contentType: type };
}

/**
 * Copy an image the shop found on a manufacturer's site. Fetched once, stored
 * as ours, never linked. Rejects anything that is not actually an image, since
 * a mistyped address usually returns an HTML error page rather than a 404.
 */
export async function fetchImageFromUrl(raw: string): Promise<{ data: ArrayBuffer; type: string }> {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new Error("That does not look like a web address.");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("The address has to start with http:// or https://");
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      redirect: "follow",
      headers: {
        // Some manufacturer sites refuse anything that does not look like a
        // browser, and answer with a block page rather than the image.
        "User-Agent": "Mozilla/5.0 (compatible; AffordableHomeElectronics/1.0)",
        Accept: "image/*,*/*;q=0.8",
      },
    });
  } catch {
    throw new Error("Could not reach that address.");
  }
  if (!res.ok) throw new Error(`That address returned ${res.status}. Check the link and try again.`);

  const type = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (!ALLOWED[type]) {
    throw new Error(
      type.startsWith("text/")
        ? "That link returned a web page, not an image. Right-click the photo itself and copy the image address."
        : "That link is not an image we can use. JPEG, PNG, WebP, GIF or AVIF only.",
    );
  }

  const declared = Number(res.headers.get("content-length") ?? "0");
  if (declared > MAX_BYTES) {
    throw new Error(`That image is ${(declared / 1048576).toFixed(1)} MB. The limit is 8 MB.`);
  }

  const data = await res.arrayBuffer();
  if (data.byteLength > MAX_BYTES) {
    throw new Error(`That image is ${(data.byteLength / 1048576).toFixed(1)} MB. The limit is 8 MB.`);
  }
  return { data, type };
}

export async function storeImageFromUrl(raw: string): Promise<Stored> {
  const { data, type } = await fetchImageFromUrl(raw);
  return storeImage(data, type);
}

/** Size and type of a stored photo, or null if it is not ours or not there. */
export async function imageInfo(url: string): Promise<{ bytes: number; contentType: string } | null> {
  if (!url.startsWith("/media/")) return null;
  const key = url.slice("/media/".length);
  if (!/^p_[a-z0-9-]+\.[a-z0-9]+$/i.test(key)) return null;
  const head = await bucket().head(key);
  if (!head) return null;
  return { bytes: head.size, contentType: head.httpMetadata?.contentType ?? "" };
}

/** Only ours, and only if nothing else is still pointing at it. */
export async function deleteImage(url: string): Promise<void> {
  if (!url.startsWith("/media/")) return;
  const key = url.slice("/media/".length);
  if (!/^p_[a-z0-9-]+\.[a-z]+$/i.test(key)) return;
  try {
    await bucket().delete(key);
  } catch (error) {
    console.error("could not delete image", key, error);
  }
}
