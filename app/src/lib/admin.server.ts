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

export async function createSession(): Promise<string> {
  const token = randomToken();
  await db()
    .prepare("INSERT INTO admin_sessions (token, expires_at) VALUES (?1, datetime('now', ?2))")
    .bind(token, `+${SESSION_HOURS} hours`)
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
    .bind(token)
    .first<{ token: string }>();
  return Boolean(row);
}

export async function destroySession(request: Request): Promise<void> {
  const token = readCookie(request, COOKIE);
  if (token) await db().prepare("DELETE FROM admin_sessions WHERE token = ?1").bind(token).run();
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
