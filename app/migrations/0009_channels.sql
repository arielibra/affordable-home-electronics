-- Orders that did not come through this site.
--
-- His dad also sells on Amazon and eBay and wants one place to look, so the
-- back office can now take an order typed in by hand. Two columns are enough:
-- where it came from, and that marketplace's own order number.
--
-- `channel` defaults to 'site', so every order already in the table is
-- correctly labelled without a backfill.
ALTER TABLE orders ADD COLUMN channel TEXT NOT NULL DEFAULT 'site';

-- Amazon's 111-1234567-1234567, eBay's 12-34567-89012. Kept so a row in the
-- year report can be traced back to the marketplace it came from.
ALTER TABLE orders ADD COLUMN channel_ref TEXT NOT NULL DEFAULT '';

-- The year report groups by channel, because marketplace sales have to be
-- reported separately from the shop's own: Amazon and eBay collect and remit
-- the sales tax themselves under the marketplace facilitator rules, so that
-- tax is not his to file.
CREATE INDEX IF NOT EXISTS idx_orders_channel ON orders(channel, paid_at);
