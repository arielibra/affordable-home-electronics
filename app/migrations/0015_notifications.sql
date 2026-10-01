-- Telling people things.
--
-- Two messages: the customer hears when their order is handed to the carrier,
-- and the shop hears when an order is paid. Until now nothing told either
-- side anything, and his dad found out about a sale by opening the admin.

-- Stamped the moment the shipped notice is accepted by the mail provider.
-- Its real job is to make a second send impossible: every field on an order
-- is editable now, so a shipped order can be saved any number of times, and
-- without this each save would be another email to the customer.
ALTER TABLE orders ADD COLUMN shipped_notified_at TEXT;

-- Every attempt, including the ones that failed. An email that silently did
-- not arrive is worse than no email feature at all, because the shop believes
-- the customer has been told.
CREATE TABLE IF NOT EXISTS email_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_reference TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL,
  recipient TEXT NOT NULL DEFAULT '',
  outcome TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_email_log_order ON email_log(order_reference, created_at);
