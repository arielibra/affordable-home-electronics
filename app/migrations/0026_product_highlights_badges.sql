-- Key features and feature badges on a product page.
--
-- highlights: the short "key features" list a manufacturer puts beside the
--   price (one feature per line). Shown near the top of the product page.
-- badges: feature icons such as NDAA, Starlight, IP67, as a JSON array of
--   {"label","detail","icon"}; icon is our own copy under /media/.
--
-- Both default to empty, so every existing product is unchanged.
ALTER TABLE products ADD COLUMN highlights TEXT NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN badges TEXT NOT NULL DEFAULT '';
