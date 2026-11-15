-- Add-on drop-downs on a product page ("Add a Hard Drive", "UPS").
--
-- Each choice is its own product row with addon = 1. An add-on is kept
-- active = 0, so every storefront query (shop, search, sitemap, feeds,
-- llms.txt) skips it automatically, while the cart and checkout accept it.
-- Because a chosen add-on is an ordinary cart line, card checkout, PayPal,
-- tax, stock and order records need no special handling.
--
-- options on the parent product: JSON
--   [{"label":"Add a Hard Drive","help":"…","choices":["addon-slug", …]}]
ALTER TABLE products ADD COLUMN options TEXT NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN addon INTEGER NOT NULL DEFAULT 0;
