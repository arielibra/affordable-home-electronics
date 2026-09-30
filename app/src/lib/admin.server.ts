import { bindings } from "./bindings.server";
import type { D1Database } from "@cloudflare/workers-types";

const COOKIE = "ahe_admin";
const SESSION_HOURS = 12;

function db(): D1Database {
  const d = bindings().DB;
  if (!d) throw new Error("The database is unavailable.");
  return d;
}

function configuredPassword(): string | null {
  return (bindings() as unknown as Record<string, string | undefined>).ADMIN_PASSWORD ?? null;
}

export function adminConfigured(): boolean {
  const p = configuredPassword();
  return Boolean(p && p.length >= 8);
}

/** Compare without leaking length or position through timing. */
function sameSecret(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  let diff = x.length ^ y.length;
  const n = Math.max(x.length, y.length);
  for (let i = 0; i < n; i += 1) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

export function checkPassword(candidate: string): boolean {
  const real = configuredPassword();
  if (!real || real.length < 8) return false;
  return sameSecret(candidate, real);
}

function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** SHA-256, hex. Used so session tokens are never written down in the clear. */
async function sha256hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createSession(): Promise<string> {
  const token = randomToken();
  await db()
    .prepare("INSERT INTO admin_sessions (token, expires_at) VALUES (?1, datetime('now', ?2))")
    .bind(await sha256hex(token), `+${SESSION_HOURS} hours`)
    .run();
  await db().prepare("DELETE FROM admin_sessions WHERE expires_at < datetime('now')").run();
  return token;
}

export function readCookie(request: Request, name: string): string {
  const raw = request.headers.get("cookie") ?? "";
  const hit = raw.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : "";
}

export async function isSignedIn(request: Request): Promise<boolean> {
  const token = readCookie(request, COOKIE);
  if (!token || token.length !== 64) return false;
  const row = await db()
    .prepare("SELECT token FROM admin_sessions WHERE token = ?1 AND expires_at > datetime('now')")
    .bind(await sha256hex(token))
    .first<{ token: string }>();
  return Boolean(row);
}

export async function destroySession(request: Request): Promise<void> {
  const token = readCookie(request, COOKIE);
  if (token) {
    await db().prepare("DELETE FROM admin_sessions WHERE token = ?1").bind(await sha256hex(token)).run();
  }
}

export function sessionCookie(token: string): string {
  return `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_HOURS * 3600}`;
}

export function clearedCookie(): string {
  return `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export async function logAdmin(action: string, target: string, detail: string): Promise<void> {
  try {
    await db()
      .prepare("INSERT INTO admin_log (id, action, target, detail) VALUES (?1,?2,?3,?4)")
      .bind(crypto.randomUUID(), action, target.slice(0, 200), detail.slice(0, 500))
      .run();
  } catch {
    // Never let the audit trail break the action it is recording.
  }
}

export function denied(): Response {
  return Response.json({ ok: false, error: "Not signed in." }, { status: 401 });
}

/* ------------------------------------------------------------------ *
 * Guarding the login
 * ------------------------------------------------------------------ */

/** Wrong passwords allowed from one address before it is shut out. */
const MAX_FAILS = 5;
/** How long that address is then refused, in minutes. */
const LOCKOUT_MINUTES = 15;
/** A run of failures older than this is forgiven, so an honest mistype
 *  last month does not count against him today. */
const WINDOW_MINUTES = 60;

/**
 * Who is asking.
 *
 * `CF-Connecting-IP` is written by Cloudflare itself and cannot be forged by
 * the client, because every request to this Worker arrives through Cloudflare.
 * A header the visitor controls, like X-Forwarded-For, would let an attacker
 * mint a fresh identity per guess and walk straight through the lockout.
 */
export function clientIp(request: Request): string {
  return (request.headers.get("CF-Connecting-IP") ?? "").slice(0, 45) || "unknown";
}

export function clientCountry(request: Request): string {
  return (request.headers.get("CF-IPCountry") ?? "").slice(0, 8);
}

export type Lockout = { locked: boolean; minutesLeft: number };

/** Checked BEFORE the password is compared, so a locked-out address gets no
 *  information at all about whether its guess was right. */
export async function lockoutFor(ip: string): Promise<Lockout> {
  const row = await db()
    .prepare(
      `SELECT locked_until,
              CAST((julianday(locked_until) - julianday('now')) * 1440 AS INTEGER) AS mins
         FROM login_attempts
        WHERE ip = ?1 AND locked_until IS NOT NULL AND locked_until > datetime('now')`,
    )
    .bind(ip)
    .first<{ locked_until: string; mins: number }>();
  if (!row) return { locked: false, minutesLeft: 0 };
  return { locked: true, minutesLeft: Math.max(1, row.mins ?? 1) };
}

/**
 * Record a wrong password and lock the address once it has had enough goes.
 *
 * The count and the lock decision happen in ONE statement, on purpose. Doing
 * the increment and then reading the total back in a second query looks
 * equivalent and is not: D1 serves reads from replicas, so a parallel burst of
 * guesses can read a stale count and skip setting the lock. The increments are
 * never lost, so the lock still lands — but a few guesses later than it should,
 * which is exactly the margin an attacker is trying to buy. RETURNING gives the
 * post-write value from the write itself, so there is no window.
 */
export async function recordFailure(ip: string, country: string): Promise<Lockout> {
  // Repeated in both branches because SQLite has no way to name the new value
  // mid-statement. `login_attempts.fails` is the pre-update value.
  const nextFails =
    `CASE WHEN login_attempts.first_fail_at < datetime('now', ?3) THEN 1 ELSE login_attempts.fails + 1 END`;

  const row = await db()
    .prepare(
      `INSERT INTO login_attempts (ip, fails, first_fail_at, last_fail_at, country)
       VALUES (?1, 1, datetime('now'), datetime('now'), ?2)
       ON CONFLICT(ip) DO UPDATE SET
         fails = ${nextFails},
         first_fail_at = CASE
                           WHEN login_attempts.first_fail_at < datetime('now', ?3) THEN datetime('now')
                           ELSE login_attempts.first_fail_at
                         END,
         last_fail_at = datetime('now'),
         country = ?2,
         locked_until = CASE
                          WHEN ${nextFails} >= ?4 THEN datetime('now', ?5)
                          ELSE login_attempts.locked_until
                        END
       RETURNING fails, locked_until`,
    )
    .bind(ip, country, `-${WINDOW_MINUTES} minutes`, MAX_FAILS, `+${LOCKOUT_MINUTES} minutes`)
    .first<{ fails: number; locked_until: string | null }>();

  const locked = Boolean(row?.locked_until) && (row?.fails ?? 0) >= MAX_FAILS;
  return { locked, minutesLeft: locked ? LOCKOUT_MINUTES : 0 };
}

/** A correct password wipes that address's record clean. */
export async function clearFailures(ip: string): Promise<void> {
  await db().prepare("DELETE FROM login_attempts WHERE ip = ?1").bind(ip).run();
}

export type IntrusionSummary = {
  fails24h: number;
  addresses24h: number;
  lockedNow: number;
  lastAt: string | null;
  countries: string[];
};

/**
 * What to show him on the admin page. Deliberately counts distinct addresses
 * as well as attempts: one address failing twelve times is a forgotten
 * password, twelve addresses failing once each is somebody working through a
 * list.
 */
export async function intrusionSummary(): Promise<IntrusionSummary> {
  const row = await db()
    .prepare(
      `SELECT COALESCE(SUM(fails),0) AS fails,
              COUNT(*) AS addrs,
              SUM(CASE WHEN locked_until > datetime('now') THEN 1 ELSE 0 END) AS locked,
              MAX(last_fail_at) AS last
         FROM login_attempts
        WHERE last_fail_at > datetime('now','-24 hours')`,
    )
    .first<{ fails: number; addrs: number; locked: number; last: string | null }>();

  const cc = await db()
    .prepare(
      `SELECT DISTINCT country FROM login_attempts
        WHERE last_fail_at > datetime('now','-24 hours') AND country <> ''
        ORDER BY country LIMIT 6`,
    )
    .all<{ country: string }>();

  return {
    fails24h: row?.fails ?? 0,
    addresses24h: row?.addrs ?? 0,
    lockedNow: row?.locked ?? 0,
    lastAt: row?.last ?? null,
    countries: (cc.results ?? []).map((r) => r.country),
  };
}

/** Housekeeping: forget addresses that have behaved for a week. */
export async function pruneAttempts(): Promise<void> {
  await db()
    .prepare("DELETE FROM login_attempts WHERE last_fail_at < datetime('now','-7 days')")
    .run();
}
