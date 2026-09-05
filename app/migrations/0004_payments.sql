-- Stripe payment support. Additive only.
ALTER TABLE orders ADD COLUMN stripe_session_id TEXT;
ALTER TABLE orders ADD COLUMN stripe_payment_intent TEXT;
ALTER TABLE orders ADD COLUMN amount_total_cents INTEGER;
ALTER TABLE orders ADD COLUMN shipping_cents INTEGER;
ALTER TABLE orders ADD COLUMN tax_cents INTEGER;
ALTER TABLE orders ADD COLUMN paid_at TEXT;
CREATE INDEX IF NOT EXISTS idx_orders_session ON orders(stripe_session_id);
