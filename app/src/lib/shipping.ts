/** Shipping rules. Change these numbers and the checkout, the cart copy, the
 *  shipping page and the product data Google reads all follow. Kept outside
 *  stripe.server so product pages can use it.
 *
 *  With a Shippo key set (SHIPPO_API_KEY, a Cloudflare Secret) the price comes
 *  from live carrier rates — see rates.server.ts. Without one, the flat rate
 *  below applies, exactly as before. */
export const SHIPPING_FLAT_CENTS = 1495;
export const FREE_SHIPPING_THRESHOLD_CENTS = 19900;
/** Free shipping needs BOTH: the order is at or over the threshold AND the
 *  whole order weighs this much or less packed (pounds). Heavier orders pay
 *  the live carrier rate whatever they cost, because the owner is billed for
 *  NVRs, PTZs and other bulky boxes either way. (Owner's rule, 2026-11-24.) */
export const FREE_SHIPPING_MAX_LB = 5;
/** Where items ship from when their brand has no supplier ZIP set. */
export const SHOP_ZIP = "11374";
