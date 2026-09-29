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
