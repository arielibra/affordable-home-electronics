-- Stop the admin password being guessed.
--
-- The login route already waited 700ms after a wrong password, with a comment
-- claiming that stopped fast guessing. It did not. Workers serve requests
-- concurrently, so the delay slows one request and not the attacker: 200
-- parallel connections still yield hundreds of guesses a second. Nothing
-- counted failures, nothing locked out, and nothing recorded who was trying.

CREATE TABLE IF NOT EXISTS login_attempts (
  ip TEXT PRIMARY KEY,
  fails INTEGER NOT NULL DEFAULT 0,
  first_fail_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_fail_at TEXT NOT NULL DEFAULT (datetime('now')),
  locked_until TEXT,
  country TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_login_attempts_last ON login_attempts(last_fail_at);

-- Session tokens are now stored as a SHA-256 hash, never in the clear. The
-- cookie still carries the real token; only its hash is written down, so a
-- leaked copy of this database cannot be used to walk into the back office.
-- Existing plaintext rows can no longer match and are cleared, which costs a
-- single re-login.
DELETE FROM admin_sessions;
