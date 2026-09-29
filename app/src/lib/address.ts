/**
 * Addresses UPS cannot deliver to.
 *
 * The shop ships by UPS, and UPS does not deliver to a PO box, to a military
 * APO/FPO/DPO address, or to most hotels. The old store policy has said so for
 * twenty years — but the checkout would happily take the order, charge the
 * card, and leave somebody phoning the customer back for a street address.
 *
 * Deliberately conservative. A legitimate address that happens to contain the
 * word "box" — a rural route, a unit number, a road actually called Boxwood —
 * must go through. Turning away a real customer is a worse failure than
 * catching one bad address late, so every pattern here requires the PO part as
 * well as the box part.
 */

// `box(?![a-z])` rather than `box\b`, so "PO BOX2231" with no space is caught
// while "Boxwood Lane" is not. The PO prefix is required either way, so a road
// genuinely named after a box never reaches this test.
const PO_BOX = /\b(?:p[.\s]*o[.\s]*|post(?:al)?\s+office\s+)box(?![a-z])/i;
const BARE_POB = /\bp\.?\s?o\.?\s?b\.?\s?\d/i;
const MILITARY = /\b(?:apo|fpo|dpo)\b/i;

export type AddressParts = {
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
};

/**
 * Returns a sentence to show the customer, or null when the address is fine.
 * The message says what to do, not just what is wrong.
 */
export function undeliverableReason(a: AddressParts): string | null {
  const street = `${a.address1 ?? ""} ${a.address2 ?? ""}`.trim();
  const city = (a.city ?? "").trim();
  const state = (a.state ?? "").trim();

  if (PO_BOX.test(street) || BARE_POB.test(street)) {
    return "We ship by UPS, which cannot deliver to a PO box. Please give a street address.";
  }
  // Military mail is addressed with APO/FPO/DPO in the city line and AA, AE or
  // AP as the state, which is why both are checked.
  if (MILITARY.test(city) || MILITARY.test(street) || /^(AA|AE|AP)$/i.test(state)) {
    return "We ship by UPS, which cannot deliver to APO, FPO or DPO addresses. Please give a street address.";
  }
  return null;
}
