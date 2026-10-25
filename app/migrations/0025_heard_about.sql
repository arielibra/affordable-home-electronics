-- "How did you hear about us?" asked on the confirmation page after an order.
--
-- heard_about  one of the ids in src/lib/heard-about.ts; '' = not answered.
--
-- Deliberately separate from `channel`. channel is where the sale happened
-- (and decides who files the tax); heard_about is only how the buyer found the
-- shop. The old cart mixed the two and put $2,751.29 on the wrong side of the
-- tax split during the 2026 import.
ALTER TABLE orders ADD COLUMN heard_about TEXT NOT NULL DEFAULT '';
