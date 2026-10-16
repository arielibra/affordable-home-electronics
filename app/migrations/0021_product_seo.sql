-- Search-engine text a product's page carries in its <head>, set by hand.
--
-- Empty means "work it out automatically", exactly as every page did before
-- this column existed: the title from the product name, the description from
-- the first 160 characters of the sales copy. So the 94 existing products
-- change nothing until somebody fills one in.
ALTER TABLE products ADD COLUMN meta_title TEXT NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN meta_description TEXT NOT NULL DEFAULT '';
-- Comma-separated. Rendered as <meta name="keywords"> and also searched by the
-- site's own search box, which is where they actually earn their keep: Google
-- ignores the keywords tag entirely.
ALTER TABLE products ADD COLUMN meta_keywords TEXT NOT NULL DEFAULT '';
