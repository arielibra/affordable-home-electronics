-- A second body of text on a product, kept apart from the description.
-- The description is the sales copy; this is the table of numbers the
-- manufacturer publishes. Both get pasted, both are long, and putting them in
-- one box was making the description unreadable.
ALTER TABLE products ADD COLUMN specs TEXT NOT NULL DEFAULT '';
