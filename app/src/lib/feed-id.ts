/** Merchant Center ids are at most 50 characters and must never change for a
 *  product, or Google treats it as a new item and loses its history. Short
 *  slugs are used as they are; long ones are cut and given a stable hash of
 *  the full slug so two products with a long shared prefix cannot collide.
 *
 *  Shared by the feed and by the Google checkout link (/cart?add={id}), which
 *  has to turn an id back into a slug. */
export function feedId(slug: string): string {
  if (slug.length <= 50) return slug;
  let h = 0x811c9dc5;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `${slug.slice(0, 41).replace(/-+$/, "")}-${h.toString(16).padStart(8, "0")}`;
}

/** The slug prefix a hashed id was cut from, for a LIKE lookup. Null for an
 *  id that is not in the hashed form (it is then the slug itself). */
export function feedIdPrefix(id: string): string | null {
  const m = /^(.+)-[0-9a-f]{8}$/.exec(id);
  return m && id.length <= 50 ? m[1] : null;
}
