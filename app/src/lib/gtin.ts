/**
 * Barcode numbers (UPC, EAN, GTIN), checked the way Google checks them.
 *
 * Shared by the admin form, which warns as he types, and the API, which
 * refuses a bad one. Merchant Center disapproves a product whose GTIN fails
 * the check digit, which would take it out of Shopping entirely — worse than
 * leaving the box blank — so a typo has to be caught before it is saved.
 */

/** Digits only: spaces and dashes copied off a box or a listing are dropped. */
export function normaliseGtin(raw: string): string {
  return raw.replace(/[\s-]/g, "");
}

/** "" when valid or blank, otherwise a sentence saying what is wrong. */
export function gtinProblem(raw: string): string {
  const g = normaliseGtin(raw);
  if (!g) return "";
  if (!/^\d+$/.test(g)) return "A UPC is numbers only.";
  if (![8, 12, 13, 14].includes(g.length)) {
    return `That is ${g.length} digits. A UPC is 12 (or 8, 13 or 14 for other barcode types).`;
  }
  // GS1 check digit: from the right, excluding the check digit itself,
  // alternate weights of 3 and 1.
  const digits = g.split("").map(Number);
  const check = digits.pop() as number;
  let sum = 0;
  for (let i = digits.length - 1, w = 3; i >= 0; i -= 1, w = w === 3 ? 1 : 3) sum += digits[i] * w;
  if ((10 - (sum % 10)) % 10 !== check) return "That number does not pass the barcode check — one digit is probably mistyped.";
  return "";
}
