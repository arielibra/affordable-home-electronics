-- Close a trap left by 0015.
--
-- 119 orders were already marked shipped before notifications existed: the
-- 2026 history imported from the old cart, whose customers were told at the
-- time by the old system. Their shipped_notified_at is NULL, which to the new
-- code means "not told yet".
--
-- Nothing happens while they sit there, because the notice only fires when an
-- order moves INTO shipped. But moving one out of shipped and back in — a
-- single mis-click while correcting an old record — would send a customer a
-- "your order has shipped" email about a purchase from months ago. 22 of them
-- carry a real address.
--
-- Marking them as already notified is simply true, and it makes that
-- impossible rather than unlikely.
UPDATE orders
   SET shipped_notified_at = COALESCE(shipped_at, paid_at, created_at)
 WHERE status = 'shipped'
   AND shipped_notified_at IS NULL;
