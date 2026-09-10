import { bindings } from "./bindings.server";
import { cartLines, clearCart, decrementStock } from "./store.server";
import { recordTaxTransaction } from "./stripe.server";

export type PaypalAddress = {
  name: string;
  email: string;
  phone: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
};

export function newReference(): string {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  return (
    "AHE-" +
    Array.from(bytes, (b) => b.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

/**
 * Write the order down before sending the customer to PayPal, so a payment
 * that succeeds while the browser dies is still attached to something.
 */
export async function parkPaypalOrder(opts: {
  paypalOrderId: string;
  cartId: string;
  who: PaypalAddress;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  taxCalculationId: string | null;
}): Promise<string> {
  const DB = bindings().DB;
  if (!DB) throw new Error("The store is unavailable.");
  const reference = newReference();
  await DB.prepare(
    `INSERT INTO orders (id,reference,name,email,phone,company,address1,address2,city,state,zip,notes,
       subtotal_cents,shipping_cents,tax_cents,amount_total_cents,status,provider,paypal_order_id,tax_calculation_id)
     VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,'pending_payment','paypal',?17,?18)`,
  )
    .bind(
      crypto.randomUUID(),
      reference,
      opts.who.name,
      opts.who.email,
      opts.who.phone,
      opts.who.company,
      opts.who.address1,
      opts.who.address2,
      opts.who.city,
      opts.who.state,
      opts.who.zip,
      opts.who.notes,
      opts.subtotalCents,
      opts.shippingCents,
      opts.taxCents,
      opts.totalCents,
      opts.paypalOrderId,
      opts.taxCalculationId,
    )
    .run();
  return reference;
}

/**
 * Turn a captured PayPal order into a paid order, exactly once.
 *
 * Both the browser (straight after the buyer approves) and the webhook (a
 * moment later, or minutes later if the browser never came back) call this.
 * Whichever arrives first does the work; the second sees status='paid' and
 * returns the same reference rather than charging stock twice.
 */
export async function finalizePaypalOrder(paypalOrderId: string): Promise<{ reference: string } | null> {
  const DB = bindings().DB;
  if (!DB) return null;

  const row = await DB.prepare(
    "SELECT id, reference, status, notes, tax_calculation_id FROM orders WHERE paypal_order_id = ?1",
  )
    .bind(paypalOrderId)
    .first<{ id: string; reference: string; status: string; notes: string; tax_calculation_id: string | null }>();
  if (!row) return null;
  if (row.status === "paid") return { reference: row.reference };

  // cart_id was parked in the PayPal order's custom_id; the cart still holds
  // the lines until this point, which is what makes the snapshot possible.
  const cartId = await DB.prepare("SELECT cart_id FROM paypal_carts WHERE paypal_order_id = ?1")
    .bind(paypalOrderId)
    .first<{ cart_id: string }>()
    .then((r) => r?.cart_id ?? "")
    .catch(() => "");

  await DB.prepare("UPDATE orders SET status='paid', paid_at=datetime('now') WHERE id=?1").bind(row.id).run();

  if (cartId) {
    const lines = await cartLines(cartId);
    if (lines.length > 0) {
      const stmt = DB.prepare(
        "INSERT INTO order_items (order_id,product_slug,name,qty,price_cents) VALUES (?1,?2,?3,?4,?5)",
      );
      await DB.batch(lines.map((l) => stmt.bind(row.id, l.slug, l.name, l.qty, l.price_cents)));
      await decrementStock(lines.map((l) => ({ slug: l.slug, qty: l.qty })));
    }
    await clearCart(cartId);
  }

  if (row.tax_calculation_id) await recordTaxTransaction(row.tax_calculation_id, row.reference);

  return { reference: row.reference };
}
