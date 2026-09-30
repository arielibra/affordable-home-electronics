-- Postcodes he has already looked up.
--
-- The back office fills in city and state when a ZIP is typed. The lookup goes
-- through this site rather than straight from his browser to somebody else's
-- API, for two reasons: a customer's postcode never leaves his own server, and
-- every answer can be kept.
--
-- Keeping them matters more than it sounds. After a few months of orders this
-- table IS his postcode database, so the feature keeps working on the ZIPs he
-- actually ships to even if the upstream service disappears — which, being
-- free and run by volunteers, it eventually might.
CREATE TABLE IF NOT EXISTS zip_lookup (
  zip TEXT PRIMARY KEY,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  looked_up_at TEXT NOT NULL DEFAULT (datetime('now'))
);
