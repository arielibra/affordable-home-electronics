-- Manufacturers as real records, not free text typed onto each product.
--
-- Before this, `products.brand` was a loose string, so "Hikvision" and
-- "Hikvsion" were two different brands as far as the site was concerned, and
-- nobody could fix it without editing rows by hand. Now there is a list the
-- shop controls, and products point at it.

CREATE TABLE IF NOT EXISTS brands (
  slug       TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  blurb      TEXT NOT NULL DEFAULT '',
  logo       TEXT NOT NULL DEFAULT '',
  position   INTEGER NOT NULL DEFAULT 100,
  active     INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed from what the 127 products already claim, so nothing disappears on the
-- day this lands. The shop can rename, merge and reorder afterwards.
INSERT OR IGNORE INTO brands (slug, name)
SELECT
  lower(replace(replace(replace(replace(trim(brand), ' ', '-'), '.', ''), ',', ''), '/', '-')),
  trim(brand)
FROM products
WHERE trim(brand) <> ''
GROUP BY lower(trim(brand));

ALTER TABLE products ADD COLUMN brand_slug TEXT NOT NULL DEFAULT '';

UPDATE products
SET brand_slug = lower(replace(replace(replace(replace(trim(brand), ' ', '-'), '.', ''), ',', ''), '/', '-'))
WHERE trim(brand) <> '';

CREATE INDEX IF NOT EXISTS idx_products_brand_slug ON products(brand_slug);
CREATE INDEX IF NOT EXISTS idx_brands_position ON brands(position, name);
