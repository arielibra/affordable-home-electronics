-- What an abandoned card checkout contained, remembered once Stripe is done with it.
--
-- A card checkout is parked as a pending order with no name and no items: the
-- basket and the customer's details live on Stripe's page, not ours. The
-- Abandoned checkouts screen asks Stripe for them. Once a session has expired
-- it can never change again, so the answer is kept here and Stripe is not
-- asked twice. Sessions still open, or completed (a missed webhook), are not
-- kept: those can still change and are worth asking about fresh.
CREATE TABLE IF NOT EXISTS abandoned_snapshot (
  order_id TEXT PRIMARY KEY,
  stripe_status TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  items TEXT NOT NULL DEFAULT '[]',
  checked_at TEXT NOT NULL DEFAULT (datetime('now'))
);
