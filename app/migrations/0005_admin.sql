-- Stock control and the shop's own back office. Additive only.
--
-- stock_tracked defaults to 0 so switching this on changes nothing for the 127
-- products already listed: they behave exactly as they do today until someone
-- actually counts them and enters a number.
ALTER TABLE products ADD COLUMN stock INTEGER NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN stock_tracked INTEGER NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN active INTEGER NOT NULL DEFAULT 1;
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

-- An audit line for every change made in the back office, so a wrong number can
-- always be traced back and explained.
CREATE TABLE IF NOT EXISTS admin_log (
  id TEXT PRIMARY KEY,
  at TEXT NOT NULL DEFAULT (datetime('now')),
  action TEXT NOT NULL,
  target TEXT NOT NULL DEFAULT '',
  detail TEXT NOT NULL DEFAULT ''
);
