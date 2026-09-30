-- More than one photo per product.
--
-- `products.image` stays exactly as it is and keeps meaning "the main photo".
-- Eight places read it — the shop grid, the cart, the checkout line items sent
-- to Stripe, the social card, the two admin panels — and none of them want a
-- gallery. Leaving it alone means none of them change and none of them break.
--
-- This table is the gallery. Position 0 is the same picture as
-- products.image; the API keeps the two in step whenever a product is saved.
CREATE TABLE IF NOT EXISTS product_images (
  product_slug TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (product_slug, url)
);
CREATE INDEX IF NOT EXISTS idx_product_images ON product_images(product_slug, position);

-- Every product that already has a photo starts with a gallery of one, so the
-- editor opens showing what is actually on the site rather than an empty box.
INSERT OR IGNORE INTO product_images (product_slug, url, position)
  SELECT slug, image, 0 FROM products WHERE image IS NOT NULL AND image <> '';
