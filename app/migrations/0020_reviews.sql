-- Product reviews from verified buyers.
--
-- Google asks for a rating on every product, and the only honest source is
-- the people who bought one. A review is accepted only against a real shipped
-- order, held until the shop approves it, and only approved reviews are shown
-- or sent to Google.

CREATE TABLE IF NOT EXISTS reviews (
  id           TEXT PRIMARY KEY,
  product_slug TEXT NOT NULL,
  order_id     TEXT NOT NULL,
  rating       INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title        TEXT NOT NULL DEFAULT '',
  body         TEXT NOT NULL DEFAULT '',
  author       TEXT NOT NULL DEFAULT '',
  -- pending until the shop decides; approved is public; hidden never shows.
  status       TEXT NOT NULL DEFAULT 'pending',
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  decided_at   TEXT,
  -- One review per product per order. Writing again replaces it.
  UNIQUE (order_id, product_slug)
);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_slug, status, created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status, created_at);

-- The follow-up email. The token is the key in the review link, so the buyer
-- does not have to type the order number; the stamp makes a second send
-- impossible.
ALTER TABLE orders ADD COLUMN review_token TEXT;
ALTER TABLE orders ADD COLUMN review_requested_at TEXT;
CREATE INDEX IF NOT EXISTS idx_orders_review_token ON orders(review_token);
