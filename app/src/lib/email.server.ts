import { bindings } from "./bindings.server";
import { trackingUrl } from "./orders";
import { ORIGIN, SITE } from "./site";

/**
 * Sending mail from a Cloudflare Worker.
 *
 * Workers cannot open an SMTP connection, so this goes over Resend's HTTP API.
 * Nothing here ever sees the key: it is read from the Worker's secrets, which
 * are write-only once set.
 *
 * The whole module is dormant until that secret exists, the same way the
 * payment methods on this site are. A shop with no mail provider configured
 * behaves exactly as it did before, rather than erroring on every order.
 */

const ENDPOINT = "https://api.resend.com/emails";

type Env = { RESEND_API_KEY?: string; MAIL_FROM?: string; OWNER_EMAIL?: string };

function cfg(): Env {
  return bindings() as unknown as Env;
}

export function mailReady(): boolean {
  const e = cfg();
  return Boolean(e.RESEND_API_KEY && e.MAIL_FROM);
}

/** An address worth trying. Blank and obvious placeholders are not. */
export function deliverableAddress(email: string | null | undefined): string {
  const v = (email ?? "").trim();
  if (!v || v.length > 254) return "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "";
  return v;
}

type LogOutcome = "sent" | "failed" | "skipped";

async function record(reference: string, kind: string, to: string, outcome: LogOutcome, detail: string) {
  const DB = bindings().DB;
  if (!DB) return;
  try {
    await DB.prepare(
      "INSERT INTO email_log (order_reference,kind,recipient,outcome,detail) VALUES (?1,?2,?3,?4,?5)",
    )
      .bind(reference.slice(0, 60), kind.slice(0, 40), to.slice(0, 254), outcome, detail.slice(0, 400))
      .run();
  } catch {
    // Logging must never be the reason an order fails to save.
  }
}

type Message = { to: string; subject: string; text: string; html: string; replyTo?: string };

/**
 * Returns rather than throws. A mail provider having a bad afternoon must not
 * stop his dad marking an order shipped, and must not roll back a payment.
 */
export async function sendMail(
  reference: string,
  kind: string,
  msg: Message,
): Promise<{ ok: boolean; error: string }> {
  const to = deliverableAddress(msg.to);
  if (!to) {
    await record(reference, kind, msg.to ?? "", "skipped", "no usable email address");
    return { ok: false, error: "No email address on this order." };
  }
  const e = cfg();
  if (!e.RESEND_API_KEY || !e.MAIL_FROM) {
    await record(reference, kind, to, "skipped", "mail provider not configured");
    return { ok: false, error: "Email is not switched on yet." };
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${e.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: e.MAIL_FROM,
        to: [to],
        subject: msg.subject,
        text: msg.text,
        html: msg.html,
        reply_to: msg.replyTo ?? SITE.email,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      const body = (await res.text().catch(() => "")).slice(0, 300);
      await record(reference, kind, to, "failed", `${res.status} ${body}`);
      return { ok: false, error: `The mail provider refused it (${res.status}).` };
    }
    await record(reference, kind, to, "sent", "");
    return { ok: true, error: "" };
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    await record(reference, kind, to, "failed", detail);
    return { ok: false, error: "Could not reach the mail provider." };
  }
}

/* ------------------------------------------------------------------ *
 * The messages themselves
 * ------------------------------------------------------------------ */

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const money = (c: number) => `$${(c / 100).toFixed(2)}`;

const CARRIER_NAMES: Record<string, string> = {
  ups: "UPS",
  fedex: "FedEx",
  usps: "USPS",
  dhl: "DHL",
};

export type ShippedOrder = {
  reference: string;
  name: string;
  email: string;
  carrier: string;
  tracking_number: string;
};

export function shippedMessage(
  order: ShippedOrder,
  items: { name: string; qty: number }[],
): { subject: string; text: string; html: string } {
  const first = (order.name ?? "").trim().split(/\s+/)[0] || "there";
  const carrier = CARRIER_NAMES[order.carrier] ?? "the carrier";
  const link = trackingUrl(order.carrier, order.tracking_number);
  const lines = items.map((i) => `${i.qty} x ${i.name}`);

  const text = [
    `Hi ${first},`,
    ``,
    `Your order ${order.reference} is on its way.`,
    ``,
    ...(lines.length ? [...lines, ``] : []),
    `Carrier: ${carrier}`,
    `Tracking number: ${order.tracking_number}`,
    ...(link ? [`Track it: ${link}`] : []),
    ``,
    `Tracking can take a few hours to show its first scan after the parcel is collected.`,
    ``,
    `Any questions, just reply to this email.`,
    ``,
    SITE.name,
    ORIGIN,
  ].join("\n");

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#14304e;max-width:560px">
<p>Hi ${esc(first)},</p>
<p><strong>Your order ${esc(order.reference)} is on its way.</strong></p>
${lines.length ? `<ul style="padding-left:18px;margin:16px 0">${items.map((i) => `<li>${esc(String(i.qty))} &times; ${esc(i.name)}</li>`).join("")}</ul>` : ""}
<p style="margin:16px 0;padding:14px 16px;background:#eef4fb;border-radius:10px">
Carrier: <strong>${esc(carrier)}</strong><br>
Tracking number: <strong>${esc(order.tracking_number)}</strong>
${link ? `<br><a href="${esc(link)}" style="color:#1668c1">Track your parcel</a>` : ""}
</p>
<p style="color:#5b7696;font-size:13px">Tracking can take a few hours to show its first scan after the parcel is collected.</p>
<p>Any questions, just reply to this email.</p>
<p style="color:#5b7696;font-size:13px">${esc(SITE.name)}<br><a href="${esc(ORIGIN)}" style="color:#1668c1">${esc(ORIGIN)}</a></p>
</div>`;

  return { subject: `Your order ${order.reference} has shipped`, text, html };
}

export type NewOrder = {
  reference: string;
  name: string;
  email: string;
  city: string;
  state: string;
  amount_total_cents: number;
  provider: string;
};

export function newOrderMessage(
  order: NewOrder,
  items: { name: string; qty: number }[],
): { subject: string; text: string; html: string } {
  const where = [order.city, order.state].filter(Boolean).join(", ");
  const lines = items.map((i) => `${i.qty} x ${i.name}`);
  const text = [
    `${order.reference} — ${money(order.amount_total_cents)}`,
    ``,
    `${order.name}${where ? ` (${where})` : ""}`,
    order.email,
    ``,
    ...(lines.length ? [...lines, ``] : []),
    `Paid by ${order.provider || "card"}.`,
    ``,
    `Open it: ${ORIGIN}/admin`,
  ].join("\n");

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#14304e;max-width:560px">
<p style="font-size:19px;margin:0 0 4px"><strong>${esc(order.reference)} — ${esc(money(order.amount_total_cents))}</strong></p>
<p style="margin:0 0 16px;color:#5b7696">${esc(order.name)}${where ? ` · ${esc(where)}` : ""}<br>${esc(order.email)}</p>
${lines.length ? `<ul style="padding-left:18px;margin:16px 0">${items.map((i) => `<li>${esc(String(i.qty))} &times; ${esc(i.name)}</li>`).join("")}</ul>` : ""}
<p style="color:#5b7696;font-size:13px">Paid by ${esc(order.provider || "card")}.</p>
<p><a href="${esc(ORIGIN)}/admin" style="color:#1668c1">Open it in the back office</a></p>
</div>`;

  return { subject: `New order ${order.reference} — ${money(order.amount_total_cents)}`, text, html };
}

/** Where the shop's own copy goes. */
export function ownerAddress(): string {
  return deliverableAddress(cfg().OWNER_EMAIL) || deliverableAddress(SITE.email);
}
