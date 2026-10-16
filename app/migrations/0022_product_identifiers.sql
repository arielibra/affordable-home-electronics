-- The identifiers Google uses to recognise that two shops sell the same item.
--
-- Without one, Merchant Center cannot put this shop's offer in the price
-- comparison beside other sellers of the same product, so a lower price never
-- gets seen there. The UPC is the barcode number on the box; the part number
-- is the manufacturer's model code ("VF30 PRO").
--
-- Blank means not recorded; the feed simply leaves the tag out.
ALTER TABLE products ADD COLUMN gtin TEXT NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN mpn TEXT NOT NULL DEFAULT '';
