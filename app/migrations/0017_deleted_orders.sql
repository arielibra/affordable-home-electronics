-- Deleting an order keeps a copy of it.
--
-- His dad asked to be able to remove any order. Most of the time that means a
-- test row or something typed in twice, which genuinely should go. But an
-- order is also a financial record: a paid one counts toward the year's
-- takings and the sales tax he files, and the card processor keeps its own
-- copy regardless of what this database says.
--
-- So "delete" removes it from the admin and from every report, and parks the
-- whole row plus its line items here as JSON. If an accountant ever asks what
-- happened to AHE-1234, the answer exists. The cost is a few kilobytes.
CREATE TABLE IF NOT EXISTS deleted_orders (
  reference TEXT PRIMARY KEY,
  deleted_at TEXT NOT NULL DEFAULT (datetime('now')),
  was_paid INTEGER NOT NULL DEFAULT 0,
  amount_total_cents INTEGER NOT NULL DEFAULT 0,
  record TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_deleted_orders_at ON deleted_orders(deleted_at);
