-- Shipping weight (pounds, product in its box) and box length / width / height
-- (inches), for the back office: quoting shipping and buying labels. NULL means
-- "not recorded", never zero. Not part of the storefront's PUBLIC columns.
ALTER TABLE products ADD COLUMN ship_weight_lb REAL;
ALTER TABLE products ADD COLUMN ship_length_in REAL;
ALTER TABLE products ADD COLUMN ship_width_in REAL;
ALTER TABLE products ADD COLUMN ship_height_in REAL;
-- 1 = the four numbers above were estimated from the spec sheet (product
-- weight + packaging, product size + padding) and nobody has weighed a boxed
-- one yet. Saving the form with numbers he typed sets it back to 0.
ALTER TABLE products ADD COLUMN ship_estimated INTEGER NOT NULL DEFAULT 0;
