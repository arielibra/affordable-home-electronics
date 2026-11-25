import { bindings } from "./bindings.server";

export type Place = { city: string; state: string };

/**
 * ZIP (or Canadian postal code) -> city and state/province.
 *
 * UPS refuses to quote without a state for both ends of the shipment, and the
 * checkout only asks the customer for a ZIP. Answers are kept in zip_lookup,
 * so the ZIPs the shop sees most never leave the database. Never throws.
 */
export async function zipPlace(zip: string, country = "US"): Promise<Place | null> {
  const DB = bindings().DB;
  const ca = country.toUpperCase() === "CA";
  const key = ca ? zip.replace(/\s+/g, "").toUpperCase().slice(0, 3) : zip.replace(/[^0-9]/g, "").slice(0, 5);
  if (ca ? key.length !== 3 : key.length !== 5) return null;
  const cacheKey = ca ? `CA-${key}` : key;
  try {
    const known = DB
      ? await DB.prepare("SELECT city, state FROM zip_lookup WHERE zip = ?1").bind(cacheKey).first<Place>()
      : null;
    if (known) return known;
    const res = await fetch(`https://api.zippopotam.us/${ca ? "ca" : "us"}/${key}`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const data = (await res.json()) as { places?: { "place name"?: string; "state abbreviation"?: string }[] };
    const first = data.places?.[0];
    const hit = {
      city: String(first?.["place name"] ?? "").slice(0, 120),
      state: String(first?.["state abbreviation"] ?? "").slice(0, 2),
    };
    if (!hit.state) return null;
    if (DB) {
      await DB.prepare("INSERT INTO zip_lookup (zip, city, state) VALUES (?1,?2,?3) ON CONFLICT(zip) DO NOTHING")
        .bind(cacheKey, hit.city, hit.state)
        .run();
    }
    return hit;
  } catch {
    return null;
  }
}
