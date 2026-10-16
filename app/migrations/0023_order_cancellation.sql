-- Cancelling an order from the back office, with the reason the customer is told.
--
-- cancel_reason      what the shop wrote, exactly as emailed to the customer
-- cancelled_at       when it was cancelled (UTC)
-- cancel_notified_at when the cancellation email went out; NULL = not emailed
ALTER TABLE orders ADD COLUMN cancel_reason TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN cancelled_at TEXT;
ALTER TABLE orders ADD COLUMN cancel_notified_at TEXT;
