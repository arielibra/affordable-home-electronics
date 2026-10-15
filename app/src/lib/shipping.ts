/** Flat rate shipping, free above the threshold. Change these two numbers and
 *  the checkout, the cart copy, the shipping page and the product data Google
 *  reads all follow. Kept outside stripe.server so product pages can use it. */
export const SHIPPING_FLAT_CENTS = 1495;
export const FREE_SHIPPING_THRESHOLD_CENTS = 19900;
