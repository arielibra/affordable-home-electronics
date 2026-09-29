-- Getting orders out of the door, and finding them again at tax time.
--
-- Until now an order was either pending_payment or paid and that was the whole
-- story. The shop needs the rest of the journey: what is packed, what has a
-- tracking number on it, what the carrier has actually taken, and what is
-- stuck waiting on something.

ALTER TABLE orders ADD COLUMN carrier TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN tracking_number TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN shipped_at TEXT;
ALTER TABLE orders ADD COLUMN hold_reason TEXT NOT NULL DEFAULT '';

-- The admin filters by state and the yearly report groups by date, so both
-- get an index rather than scanning the table as the order count grows.
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_paid_at ON orders(paid_at);
