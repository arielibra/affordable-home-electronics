-- Where a brand's orders ship from. Suppliers drop-ship on the shop's own
-- UPS / FedEx / USPS accounts, so live shipping quotes must start at the
-- supplier's warehouse, not in Queens. Blank = the shop's own ZIP (11374).
ALTER TABLE brands ADD COLUMN ship_from_zip TEXT NOT NULL DEFAULT '';
