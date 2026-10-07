-- The contact form never notified anyone, so nothing minded what arrived:
-- four of the first six submissions were agency cold-pitches. Now that it
-- emails, the score rides along on the row so Messages can mark one and the
-- reasons are inspectable rather than a black box.
--
-- Existing rows default to 0 (clean). They were never scored and backfilling
-- a guess would be worse than saying nothing.
ALTER TABLE quote_requests ADD COLUMN spam_score INTEGER NOT NULL DEFAULT 0;
ALTER TABLE quote_requests ADD COLUMN spam_reasons TEXT NOT NULL DEFAULT '';
