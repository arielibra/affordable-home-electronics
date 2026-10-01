/** Shared between the back office and the customer's order lookup. */

export type OrderState =
  | "pending_payment"
  | "paid"
  | "ready_to_ship"
  | "shipped"
  | "on_hold"
  | "received"
  | "cancelled";

/** The states the shop can move an order into by hand. `paid` and
 *  `pending_payment` are set by the payment providers, not by a person. */
export const MANUAL_STATES: OrderState[] = ["paid", "ready_to_ship", "shipped", "on_hold", "cancelled"];

export const STATE_LABEL: Record<OrderState, string> = {
  pending_payment: "Awaiting payment",
  paid: "Paid",
  ready_to_ship: "Ready to ship",
  shipped: "Shipped",
  on_hold: "On hold",
  received: "Phone order",
  cancelled: "Cancelled",
};

export type CarrierId = "ups" | "fedex" | "usps" | "dhl" | "other";

export const CARRIERS: { id: CarrierId; name: string }[] = [
  { id: "ups", name: "UPS" },
  { id: "fedex", name: "FedEx" },
  { id: "usps", name: "USPS" },
  { id: "dhl", name: "DHL" },
  { id: "other", name: "Other" },
];

export function carrierName(id: string): string {
  return CARRIERS.find((c) => c.id === id)?.name ?? "";
}

/**
 * A clickable link to the carrier's own tracking page. "Other" gets no link,
 * which is the honest answer — better an un-clickable number than one that
 * lands the customer on a 404.
 */
export function trackingUrl(carrier: string, tracking: string): string {
  const n = encodeURIComponent(tracking.trim());
  if (!n) return "";
  switch (carrier) {
    case "ups":
      return `https://www.ups.com/track?tracknum=${n}`;
    case "fedex":
      return `https://www.fedex.com/fedextrack/?trknbr=${n}`;
    case "usps":
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}`;
    case "dhl":
      return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${n}`;
    default:
      return "";
  }
}

/* ------------------------------------------------------------------ *
 * Sales channels
 * ------------------------------------------------------------------ */

export type ChannelId = "site" | "amazon" | "ebay" | "walmart" | "etsy" | "facebook" | "other";

export const CHANNELS: { id: ChannelId; name: string; remitsTax: boolean }[] = [
  { id: "site", name: "This site", remitsTax: false },
  { id: "amazon", name: "Amazon", remitsTax: true },
  { id: "ebay", name: "eBay", remitsTax: true },
  { id: "walmart", name: "Walmart", remitsTax: true },
  { id: "etsy", name: "Etsy", remitsTax: true },
  { id: "facebook", name: "Facebook Marketplace", remitsTax: true },
  { id: "other", name: "Somewhere else", remitsTax: false },
];

/** The channels an order can be typed in against. Orders on this site arrive
 *  through checkout and are never entered by hand. */
/**
 * Marketplaces that tell the buyer themselves.
 *
 * Amazon, eBay, Walmart and Etsy all send their own shipping notice and treat
 * contacting a buyer directly as a policy breach; the address on the order is
 * usually a relay anyway. Emailing those buyers risks his seller account, so
 * the shop never does it regardless of what is typed in the email box.
 *
 * Facebook Marketplace and "Somewhere else" are different: there he IS the
 * seller of record and the buyer expects to hear from him, so those notify
 * whenever a real email address is on the order.
 */
export const MARKETPLACE_TELLS_BUYER = ["amazon", "ebay", "walmart", "etsy"];

export function shopMayEmailBuyer(channel: string): boolean {
  return !MARKETPLACE_TELLS_BUYER.includes(channel);
}

export const MANUAL_CHANNELS = CHANNELS.filter((c) => c.id !== "site");

export function channelName(id: string): string {
  return CHANNELS.find((c) => c.id === id)?.name ?? id;
}

/**
 * Whether the marketplace collected and remitted the sales tax itself.
 *
 * Under the marketplace facilitator laws every US state now has, Amazon, eBay,
 * Walmart and Etsy are required to collect sales tax on a seller’s behalf and
 * pay it to the state directly. That tax is not his to file, and including it
 * in his own New York return would mean the state is paid twice for the same
 * sale. So those orders are recorded with no tax against them and reported in
 * a separate column.
 */
export function marketplaceRemitsTax(channel: string): boolean {
  return CHANNELS.find((c) => c.id === channel)?.remitsTax ?? false;
}
