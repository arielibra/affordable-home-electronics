-- When a discontinued product is deleted, its /p/<slug> address is still in
-- Google, in old emails and in customers' bookmarks. This table sends each one
-- to its replacement (or to the category it belonged to) with a 301, so the
-- link keeps its value instead of turning into a 404.
CREATE TABLE IF NOT EXISTS product_redirects (
  old_slug   TEXT PRIMARY KEY,
  to_path    TEXT NOT NULL,
  reason     TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
