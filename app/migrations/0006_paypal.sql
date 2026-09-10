-- A second way to pay. Additive only: every existing row is a Stripe order,
-- which is what the default records, so nothing already in the table changes.
ALTER TABLE orders ADD COLUMN provider TEXT NOT NULL DEFAULT 'stripe';
ALTER TABLE orders ADD COLUMN paypal_order_id TEXT;
ALTER TABLE orders ADD COLUMN tax_calculation_id TEXT;
CREATE INDEX IF NOT EXISTS idx_orders_paypal ON orders(paypal_order_id);
