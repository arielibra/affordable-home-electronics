// The cart itself lives in D1. The browser holds only its key, in a cookie, so
// the same basket survives a reload and follows the visitor between pages.
const KEY = "ahe_cart";

export function readCartId(): string {
  if (typeof document === "undefined") return "";
  const hit = document.cookie.split("; ").find((c) => c.startsWith(KEY + "="));
  return hit ? decodeURIComponent(hit.slice(KEY.length + 1)) : "";
}

export function ensureCartId(): string {
  if (typeof document === "undefined") return "";
  const existing = readCartId();
  if (existing) return existing;
  const fresh = crypto.randomUUID();
  document.cookie = `${KEY}=${fresh}; path=/; max-age=${60 * 60 * 24 * 120}; samesite=lax`;
  return fresh;
}
