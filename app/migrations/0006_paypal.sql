-- A second way to pay. Additive only: every existing row is a Stripe order,
-- which is what the default records, so nothing already in the table changes.
ALTER TABLE orders ADD COLUMN provider TEXT NOT NULL DEFAULT 'stripe';
ALTER TABLE orders ADD COLUMN paypal_order_id TEXT;
ALTER TABLE orders ADD COLUMN tax_calculation_id TEXT;
CREATE INDEX IF NOT EXISTS idx_orders_paypal ON orders(paypal_order_id);

-- Which basket a PayPal order came from. Kept beside the order rather than
-- inside it because the cart is emptied on success and the mapping is only
-- needed for the few minutes between approval and capture.
CREATE TABLE IF NOT EXISTS paypal_carts (
  paypal_order_id TEXT PRIMARY KEY,
  cart_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
