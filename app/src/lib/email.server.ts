import { bindings } from "./bindings.server";
import {
  STATE_LABEL,
  carrierName,
  channelName,
  marketplaceRemitsTax,
  trackingUrl,
  type OrderState,
} from "./orders";
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
    `Any questions, email us at ${SITE.email} and we will come straight back to you.`,
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
<p>Any questions, email us at <a href="${SITE.emailHref}" style="color:#1668c1">${esc(SITE.email)}</a> and we will come straight back to you.</p>
<p style="color:#5b7696;font-size:13px">${esc(SITE.name)}<br><a href="${esc(ORIGIN)}" style="color:#1668c1">${esc(ORIGIN)}</a></p>
</div>`;

  return { subject: `Your order ${order.reference} has shipped`, text, html };
}

export type NewOrder = {
  reference: string;
  name: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  amount_total_cents: number;
  provider: string;
  hold_reason: string;
};

export function newOrderMessage(
  order: NewOrder,
  items: { name: string; qty: number; price_cents: number }[],
): { subject: string; text: string; html: string } {
  const address = [
    order.address1,
    order.address2,
    [order.city, order.state, order.zip].filter(Boolean).join(" "),
  ].filter(Boolean);
  const held = (order.hold_reason ?? "").trim();

  const totals: [string, string][] = [
    ["Items", money(order.subtotal_cents)],
    ["Shipping", order.shipping_cents > 0 ? money(order.shipping_cents) : "Free"],
    ...((order.tax_cents > 0 ? [["Sales tax", money(order.tax_cents)]] : []) as [string, string][]),
    ["Total", money(order.amount_total_cents)],
  ];

  const text = [
    `${order.reference} — ${money(order.amount_total_cents)}`,
    ``,
    `WHAT SOLD`,
    ...(items.length
      ? items.map((i) => `  ${i.qty} x ${i.name} — ${money(i.price_cents * i.qty)}`)
      : ["  (no line items recorded)"]),
    ``,
    ...totals.map(([k, v]) => `${k}: ${v}`),
    ``,
    `SHIP TO`,
    `  ${order.name}`,
    ...address.map((l) => `  ${l}`),
    ...(order.phone ? [`  ${order.phone}`] : []),
    `  ${order.email}`,
    ``,
    `Paid by ${order.provider || "card"}.`,
    ...(held ? [``, `ON HOLD: ${held}`] : []),
    ``,
    `Open it: ${ORIGIN}/admin`,
  ].join("\n");

  const row = (k: string, v: string, strong = false) =>
    `<tr><td style="padding:3px 24px 3px 0;color:#5b7696;white-space:nowrap">${esc(k)}</td><td style="padding:3px 0;${strong ? "font-weight:650" : ""}">${esc(v)}</td></tr>`;

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#14304e;max-width:580px">
<p style="font-size:21px;margin:0 0 2px"><strong>${esc(order.reference)}</strong></p>
<p style="font-size:21px;margin:0 0 18px;color:#1668c1"><strong>${esc(money(order.amount_total_cents))}</strong></p>
${held ? `<p style="margin:0 0 16px;padding:10px 14px;background:#fdecea;border-radius:10px;color:#b4332b;font-size:14px"><strong>On hold:</strong> ${esc(held)}</p>` : ""}
<p style="margin:0 0 6px;font-size:11.5px;font-weight:700;letter-spacing:.09em;color:#93a9c2">WHAT SOLD</p>
${
    items.length
      ? `<table style="border-collapse:collapse;width:100%;margin:0 0 18px">${items
          .map(
            (i) =>
              `<tr><td style="padding:6px 0;border-bottom:1px solid #e8f0f8">${esc(String(i.qty))} &times; ${esc(i.name)}</td><td style="padding:6px 0;border-bottom:1px solid #e8f0f8;text-align:right;white-space:nowrap">${esc(money(i.price_cents * i.qty))}</td></tr>`,
          )
          .join("")}</table>`
      : `<p style="margin:0 0 18px;color:#5b7696">No line items recorded.</p>`
  }
<table style="border-collapse:collapse;margin:0 0 20px">${totals.map(([k, v], i) => row(k, v, i === totals.length - 1)).join("")}</table>
<p style="margin:0 0 6px;font-size:11.5px;font-weight:700;letter-spacing:.09em;color:#93a9c2">SHIP TO</p>
<p style="margin:0 0 18px;line-height:1.5">${esc(order.name)}<br>${address.map(esc).join("<br>")}${order.phone ? `<br>${esc(order.phone)}` : ""}<br><span style="color:#5b7696">${esc(order.email)}</span></p>
<p style="color:#5b7696;font-size:13px;margin:0 0 16px">Paid by ${esc(order.provider || "card")}.</p>
<p style="margin:0"><a href="${esc(ORIGIN)}/admin" style="display:inline-block;background:#1668c1;color:#fff;text-decoration:none;padding:10px 18px;border-radius:9px;font-size:14px;font-weight:600">Open it in the back office</a></p>
</div>`;

  return { subject: `New order ${order.reference} — ${money(order.amount_total_cents)}`, text, html };
}

/** Where the shop's own copy goes. */
export function ownerAddress(): string {
  return deliverableAddress(cfg().OWNER_EMAIL) || deliverableAddress(SITE.email);
}

export type ConfirmationOrder = {
  reference: string;
  name: string;
  email: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  amount_total_cents: number;
  hold_reason: string;
};

/**
 * What the buyer gets the moment they pay.
 *
 * Until this existed they got nothing at all: Stripe Checkout is not
 * configured to send its own receipt, so a customer handed over card details
 * and then heard silence until the parcel moved. That is the point at which
 * people email asking whether the order went through.
 *
 * It carries the order number, because the order lookup on the site needs that
 * plus their email address, and they will not have written it down.
 */
export function orderConfirmationMessage(
  order: ConfirmationOrder,
  items: { name: string; qty: number; price_cents: number }[],
): { subject: string; text: string; html: string } {
  const first = (order.name ?? "").trim().split(/\s+/)[0] || "there";
  const held = Boolean((order.hold_reason ?? "").trim());
  const address = [
    order.address1,
    order.address2,
    [order.city, order.state, order.zip].filter(Boolean).join(" "),
  ].filter(Boolean);

  const lines = items.map((i) => `${i.qty} x ${i.name} — ${money(i.price_cents * i.qty)}`);
  const totals: [string, string][] = [
    ["Items", money(order.subtotal_cents)],
    ["Shipping", order.shipping_cents > 0 ? money(order.shipping_cents) : "Free"],
    ...((order.tax_cents > 0 ? [["Sales tax", money(order.tax_cents)]] : []) as [string, string][]),
    ["Total", money(order.amount_total_cents)],
  ];

  const next = held
    ? "Before we can ship this we need to check the delivery address with you — we will be in touch shortly."
    : "Most orders ship within two business days. You will get another email with the tracking number the moment it is handed to the carrier.";

  const text = [
    `Hi ${first},`,
    ``,
    `Thanks for your order. We have it, and payment went through.`,
    ``,
    `Order number: ${order.reference}`,
    ``,
    ...(lines.length ? [...lines, ``] : []),
    ...totals.map(([k, v]) => `${k}: ${v}`),
    ``,
    ...(address.length ? [`Shipping to:`, ...address, ``] : []),
    next,
    ``,
    `You can check this order any time at ${ORIGIN}/orders using the order number above and this email address.`,
    ``,
    `Any questions, email us at ${SITE.email} and we will come straight back to you.`,
    ``,
    SITE.name,
    ORIGIN,
  ].join("\n");

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#14304e;max-width:560px">
<p>Hi ${esc(first)},</p>
<p><strong>Thanks for your order. We have it, and payment went through.</strong></p>
<p style="margin:16px 0;padding:14px 16px;background:#eef4fb;border-radius:10px">Order number: <strong>${esc(order.reference)}</strong></p>
${lines.length ? `<ul style="padding-left:18px;margin:16px 0">${items.map((i) => `<li>${esc(String(i.qty))} &times; ${esc(i.name)} &mdash; ${esc(money(i.price_cents * i.qty))}</li>`).join("")}</ul>` : ""}
<table style="border-collapse:collapse;margin:16px 0">${totals
    .map(
      ([k, v], i) =>
        `<tr><td style="padding:3px 24px 3px 0;color:#5b7696">${esc(k)}</td><td style="padding:3px 0;${i === totals.length - 1 ? "font-weight:600" : ""}">${esc(v)}</td></tr>`,
    )
    .join("")}</table>
${address.length ? `<p style="color:#5b7696;font-size:13px">Shipping to<br>${address.map(esc).join("<br>")}</p>` : ""}
<p>${esc(next)}</p>
<p style="color:#5b7696;font-size:13px">You can check this order any time at <a href="${esc(ORIGIN)}/orders" style="color:#1668c1">${esc(ORIGIN)}/orders</a> using the order number above and this email address.</p>
<p>Any questions, email us at <a href="${esc(SITE.emailHref)}" style="color:#1668c1">${esc(SITE.email)}</a> and we will come straight back to you.</p>
<p style="color:#5b7696;font-size:13px">${esc(SITE.name)}<br><a href="${esc(ORIGIN)}" style="color:#1668c1">${esc(ORIGIN)}</a></p>
</div>`;

  return { subject: `Order ${order.reference} confirmed — ${SITE.name}`, text, html };
}

/* ------------------------------------------------------------------ *
 * The shop's own invoice, for an order typed in by hand
 * ------------------------------------------------------------------ */

export type InvoiceOrder = {
  reference: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
  status: string;
  channel: string;
  channel_ref: string;
  carrier: string;
  tracking_number: string;
  subtotal_cents: number | null;
  shipping_cents: number | null;
  tax_cents: number | null;
  amount_total_cents: number | null;
  paid_at: string | null;
  created_at: string;
};

export type InvoiceItem = {
  product_slug: string;
  name: string;
  qty: number;
  price_cents: number;
};

const INK = "#14304e";
const MUTED = "#5b7696";
const HAIR = "#e3ebf5";
const WASH = "#f3f6fa";
const TINT = "#eef4fb";
const BLUE = "#1668c1";
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

/**
 * Dates, defensively.
 *
 * This runs in a Worker, and `timeZone` depends on the runtime carrying a full
 * ICU build. If it ever does not, a RangeError here would take down the whole
 * order-creation request — the email is the least important thing happening on
 * that code path. So it falls back to the stored string rather than throwing.
 */
function stamp(value: string | null | undefined, withTime: boolean): string {
  const v = (value ?? "").trim();
  if (!v) return "";
  const d = new Date(v.replace(" ", "T") + "Z");
  if (Number.isNaN(d.getTime())) return v;
  try {
    return d.toLocaleString("en-US", {
      timeZone: "America/New_York",
      month: "short",
      day: "numeric",
      year: "numeric",
      ...(withTime ? { hour: "numeric" as const, minute: "2-digit" as const } : {}),
    });
  } catch {
    return v.slice(0, withTime ? 16 : 10);
  }
}

/**
 * What his dad gets the moment he records a sale made somewhere else.
 *
 * The old cart used to mail him an invoice like this and the replacement did
 * not: `newOrderMessage` fires from the Stripe webhook only, so an order typed
 * into the back office told him nothing at all.
 *
 * Three things the old invoice did that are deliberately not repeated. It
 * printed Ship To and Bill To as two identical columns — there is one address
 * on an order here, so the second column is the customer's contact details
 * instead. It carried a phone, a fax and a street address, none of which are
 * true since the shop went online-only. And its "How did you find our Store?"
 * line was a referral field, not where the sale happened; confusing those two
 * is what put $2,751.29 on the wrong side of the tax split during the import,
 * so this shows the real channel.
 *
 * Nothing here corrects a figure. If the money does not add up it says so and
 * leaves it alone, the same rule the order editor follows — silently rewriting
 * a number he typed is how a total ends up meaning something he never meant.
 */
export function ownerInvoiceMessage(
  order: InvoiceOrder,
  items: InvoiceItem[],
): { subject: string; text: string; html: string } {
  const goods = order.subtotal_cents ?? 0;
  const ship = order.shipping_cents ?? 0;
  const tax = order.tax_cents ?? 0;
  const total = order.amount_total_cents ?? 0;
  const lines = items.reduce((a, i) => a + i.price_cents * i.qty, 0);

  const where = channelName(order.channel);
  const remits = marketplaceRemitsTax(order.channel);
  const state = STATE_LABEL[order.status as OrderState] ?? order.status;
  const carrier = carrierName(order.carrier) || "Carrier";
  const tracking = (order.tracking_number ?? "").trim();
  const track = trackingUrl(order.carrier, tracking);

  const address = [
    order.name,
    order.company,
    order.address1,
    order.address2,
    [order.city, order.state].filter(Boolean).join(", ") + (order.zip ? ` ${order.zip}` : ""),
  ]
    .map((l) => (l ?? "").trim())
    .filter(Boolean);

  const expected = goods + ship + tax;
  const mismatch = total !== expected;
  const linesOff = !mismatch && lines !== goods;
  const mismatchNote = `These figures do not add up: ${money(goods)} + ${money(ship)} + ${money(tax)} comes to ${money(expected)}, but the order total says ${money(total)}. Nothing has been changed — open the order if you want to correct it.`;
  const linesNote = `The line items come to ${money(lines)} but the items figure on the order says ${money(goods)}.`;
  const taxNote = `${where} collects and remits the sales tax on this sale. It is counted separately in the year report and is not part of what you file.`;

  /* ---------------------------------------------------------- plain text */

  const text = [
    `ORDER ${order.reference}`,
    `${where}${order.channel_ref ? ` — ${order.channel_ref}` : ""}`,
    stamp(order.created_at, true),
    ``,
    `WHAT WAS BOUGHT`,
    ...(items.length
      ? items.flatMap((i) => [
          `  ${i.qty} x ${i.name}${i.product_slug ? ` [${i.product_slug}]` : ""}`,
          `      ${money(i.price_cents)} each — ${money(i.price_cents * i.qty)}`,
        ])
      : ["  (no line items recorded)"]),
    ``,
    `  Items                 ${money(goods)}`,
    `  Shipping and handling ${ship > 0 ? money(ship) : "Free"}`,
    ...(tax > 0 ? [`  Sales tax             ${money(tax)}`] : []),
    `  ORDER TOTAL           ${money(total)}`,
    ...(mismatch ? [`  !! ${mismatchNote}`] : []),
    ...(linesOff ? [`  !! ${linesNote}`] : []),
    ...(remits ? [``, `  ${taxNote}`] : []),
    ``,
    `SHIP TO`,
    ...address.map((l) => `  ${l}`),
    ...(order.email ? [`  ${order.email}`] : ["  (no email on this order)"]),
    ...(order.phone ? [`  ${order.phone}`] : []),
    ...(tracking
      ? [``, `TRACKING (${carrier})  ${tracking}`, ...(track ? [`  ${track}`] : [])]
      : []),
    ...((order.notes ?? "").trim() ? [``, `NOTES`, `  ${order.notes.trim()}`] : []),
    ``,
    `Paid ${stamp(order.paid_at, false) || "—"} · ${state}`,
    ``,
    `Open the back office: ${ORIGIN}/admin`,
  ].join("\n");

  /* ---------------------------------------------------------------- html */

  const facts: [string, string][] = [
    ...((order.channel_ref ? [["Their order number", order.channel_ref]] : []) as [
      string,
      string,
    ][]),
    ...((order.paid_at ? [["Paid", stamp(order.paid_at, false)]] : []) as [string, string][]),
    ["Status", state],
  ];
  const factCells = facts
    .map(
      ([k, v]) =>
        `<td width="${Math.floor(100 / facts.length)}%" valign="top" style="padding:0 16px 0 0"><div style="font:400 12px/1.3 ${FONT};color:${MUTED};padding-bottom:5px">${esc(k)}</div><div style="font:600 14px/1.4 ${FONT};color:${INK};word-break:break-word">${esc(v)}</div></td>`,
    )
    .join("");

  const th = (label: string, align: string) =>
    `<th align="${align}" style="font:600 12px/1 ${FONT};color:${MUTED};padding:0 0 10px ${align === "left" ? "0" : "14px"};border-bottom:1px solid ${HAIR};white-space:nowrap">${label}</th>`;

  const itemRows = items
    .map((i) => {
      const part = (i.product_slug ?? "").trim();
      return `<tr>
<td valign="top" style="padding:14px 0;border-bottom:1px solid ${HAIR}"><div style="font:600 15px/1.45 ${FONT};color:${INK}">${esc(i.name)}</div>${part ? `<div style="font:400 12px/1.4 ${FONT};color:${MUTED};padding-top:4px">Part no. ${esc(part)}</div>` : ""}</td>
<td valign="top" align="center" style="padding:14px 0 14px 14px;border-bottom:1px solid ${HAIR};font:400 15px/1.45 ${FONT};color:${INK}">${esc(String(i.qty))}</td>
<td valign="top" align="right" style="padding:14px 0 14px 14px;border-bottom:1px solid ${HAIR};font:400 15px/1.45 ${FONT};color:${MUTED};white-space:nowrap">${esc(money(i.price_cents))}</td>
<td valign="top" align="right" style="padding:14px 0 14px 14px;border-bottom:1px solid ${HAIR};font:600 15px/1.45 ${FONT};color:${INK};white-space:nowrap">${esc(money(i.price_cents * i.qty))}</td>
</tr>`;
    })
    .join("");

  const totalRow = (label: string, value: string, strong = false) =>
    `<tr><td align="right" style="padding:${strong ? "14px 14px 0 0" : "0 14px 9px 0"};font:${strong ? "700" : "400"} ${strong ? "16px" : "14px"}/1.3 ${FONT};color:${strong ? INK : MUTED}">${esc(label)}</td><td align="right" width="110" style="padding:${strong ? "14px 0 0" : "0 0 9px"};font:${strong ? "700" : "500"} ${strong ? "20px" : "14px"}/1.3 ${FONT};color:${INK};white-space:nowrap">${esc(value)}</td></tr>`;

  const warn = (t: string) =>
    `<tr><td style="padding:18px 28px 0"><div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:13px 15px;font:400 13px/1.55 ${FONT};color:#9a3412">${esc(t)}</div></td></tr>`;

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only"><title>${esc(order.reference)}</title></head>
<body style="margin:0;padding:0;background:${WASH}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px">${esc(where)} &middot; ${esc(money(total))} &middot; ${items.length} item${items.length === 1 ? "" : "s"}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WASH}"><tr><td align="center" style="padding:28px 12px 40px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%">

<tr><td style="background:${BLUE};border-radius:14px 14px 0 0;padding:22px 28px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="font:600 16px/1.2 ${FONT};color:#ffffff;letter-spacing:.2px">${esc(SITE.name)}</td>
<td align="right" style="font:400 13px/1.2 ${FONT};color:#cfe0f6">${esc(ORIGIN.replace(/^https?:\/\//, ""))}</td>
</tr></table></td></tr>

<tr><td style="background:#ffffff;border:1px solid ${HAIR};border-top:0;border-radius:0 0 14px 14px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

<tr><td style="padding:30px 28px 22px;border-bottom:1px solid ${HAIR}">
<div style="font:600 13px/1 ${FONT};color:${MUTED};padding-bottom:10px">Order recorded in the back office</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="font:700 30px/1.15 ${FONT};color:${INK};letter-spacing:-.4px">${esc(order.reference)}</td>
<td align="right" valign="middle"><span style="display:inline-block;background:${TINT};color:${BLUE};font:600 12px/1 ${FONT};padding:8px 12px;border-radius:999px;white-space:nowrap">${esc(where)}</span></td>
</tr></table>
<div style="font:400 14px/1.5 ${FONT};color:${MUTED};padding-top:10px">${esc(stamp(order.created_at, true))}</div>
</td></tr>

<tr><td style="padding:20px 28px;background:#fbfcfe;border-bottom:1px solid ${HAIR}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${factCells}</tr></table></td></tr>

<tr><td style="padding:26px 28px 0">
<div style="font:600 15px/1 ${FONT};color:${INK};padding-bottom:14px">What was bought</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>${th("Item", "left")}${th("Qty", "center")}${th("Each", "right")}${th("Total", "right")}</tr>
${items.length ? itemRows : `<tr><td colspan="4" style="padding:18px 0;border-bottom:1px solid ${HAIR};font:400 15px/1.45 ${FONT};color:${MUTED}">No line items were recorded on this order.</td></tr>`}
</table></td></tr>

<tr><td style="padding:22px 28px 4px">
<table role="presentation" align="right" cellpadding="0" cellspacing="0" border="0" style="width:290px;max-width:100%">
${totalRow("Items", money(goods))}
${totalRow("Shipping and handling", ship > 0 ? money(ship) : "Free")}
${tax > 0 ? totalRow("Sales tax", money(tax)) : ""}
<tr><td colspan="2" style="padding:4px 0 0"><div style="border-top:1px solid ${HAIR};font-size:0;line-height:0">&nbsp;</div></td></tr>
${totalRow("Order total", money(total), true)}
</table>
<div style="clear:both;font-size:0;line-height:0">&nbsp;</div>
</td></tr>
${mismatch ? warn(mismatchNote) : ""}
${linesOff ? warn(linesNote) : ""}

${remits ? `<tr><td style="padding:18px 28px 0"><div style="background:${TINT};border-radius:10px;padding:13px 15px;font:400 13px/1.55 ${FONT};color:#1e4a80"><strong style="font-weight:600">${esc(where)} collects and remits the sales tax on this sale.</strong> It is counted separately in the year report and is not part of what you file.</div></td></tr>` : ""}

<tr><td style="padding:26px 28px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="50%" valign="top" style="padding-right:12px">
<div style="font:600 15px/1 ${FONT};color:${INK};padding-bottom:10px">Ship to</div>
<div style="font:400 15px/1.6 ${FONT};color:${INK}">${address.length ? address.map(esc).join("<br>") : `<span style="color:${MUTED}">No address on this order</span>`}</div></td>
<td width="50%" valign="top" style="padding-left:12px">
<div style="font:600 15px/1 ${FONT};color:${INK};padding-bottom:10px">Contact</div>
<div style="font:400 15px/1.6 ${FONT};color:${INK}">${order.email ? `<a href="mailto:${esc(order.email)}" style="color:${BLUE};text-decoration:none;word-break:break-word">${esc(order.email)}</a>` : `<span style="color:${MUTED}">No email on this order</span>`}${order.phone ? `<br>${esc(order.phone)}` : ""}</div></td>
</tr></table></td></tr>

${tracking ? `<tr><td style="padding:24px 28px 0"><div style="border:1px solid ${HAIR};border-radius:12px;padding:15px 17px"><div style="font:400 12px/1.3 ${FONT};color:${MUTED};padding-bottom:5px">${esc(carrier)} tracking</div><div style="font:600 16px/1.4 ${FONT};color:${INK};word-break:break-all">${track ? `<a href="${esc(track)}" style="color:${BLUE};text-decoration:none">${esc(tracking)}</a>` : esc(tracking)}</div></div></td></tr>` : ""}

${(order.notes ?? "").trim() ? `<tr><td style="padding:24px 28px 0"><div style="font:600 15px/1 ${FONT};color:${INK};padding-bottom:9px">Notes</div><div style="font:400 14px/1.6 ${FONT};color:${MUTED};white-space:pre-wrap">${esc(order.notes.trim())}</div></td></tr>` : ""}

<tr><td style="padding:28px 28px 30px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background:${BLUE};border-radius:10px"><a href="${esc(ORIGIN)}/admin" style="display:inline-block;padding:14px 24px;font:600 15px/1 ${FONT};color:#ffffff;text-decoration:none">Open the back office</a></td></tr></table></td></tr>

</table></td></tr>

<tr><td style="padding:20px 28px 0;text-align:center;font:400 12px/1.6 ${FONT};color:#8b95a3">${esc(SITE.name)} &middot; <a href="${esc(ORIGIN)}" style="color:#8b95a3;text-decoration:underline">${esc(ORIGIN.replace(/^https?:\/\//, ""))}</a><br>You are getting this because an order was recorded in your back office.</td></tr>

</table></td></tr></table></body></html>`;

  return {
    subject: `${order.reference} — ${money(total)} — ${order.name || "no name"} (${where})`,
    text,
    html,
  };
}

/* ------------------------------------------------------------------ *
 * Somebody wrote in through the contact form
 * ------------------------------------------------------------------ */

export type Enquiry = {
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
  spamScore: number;
  spamReasons: string[];
};

/**
 * The contact form used to write to the database and tell nobody, so a
 * customer asking a question heard nothing back until his dad happened to open
 * the Messages tab.
 *
 * Reply-to is set to whoever wrote in, so answering is one button and the
 * answer goes to them rather than to the shop's own address.
 */
export function enquiryMessage(e: Enquiry): { subject: string; text: string; html: string } {
  const suspect = e.spamScore >= 2;
  const who = e.name.trim() || "Someone";
  const topic = e.topic.trim();
  const reply = deliverableAddress(e.email);

  const subject = suspect
    ? `[likely spam] ${who}${topic ? ` — ${topic}` : ""}`
    : `${who} wrote in${topic ? ` — ${topic}` : ""}`;

  const text = [
    suspect ? `LOOKS LIKE SPAM (${e.spamReasons.join("; ")})` : "",
    suspect ? "" : "",
    `${who}${topic ? ` — ${topic}` : ""}`,
    ``,
    e.message.trim() || "(no message)",
    ``,
    reply ? `Reply to: ${reply}` : "No email address given.",
    ...(e.phone.trim() ? [`Phone: ${e.phone.trim()}`] : []),
    ``,
    `All messages: ${ORIGIN}/admin`,
  ]
    .filter((l, i, a) => !(l === "" && a[i - 1] === ""))
    .join("\n");

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only"><title>${esc(who)}</title></head>
<body style="margin:0;padding:0;background:${WASH}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px">${esc((e.message.trim() || "no message").slice(0, 110))}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WASH}"><tr><td align="center" style="padding:28px 12px 40px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%">

<tr><td style="background:${BLUE};border-radius:14px 14px 0 0;padding:22px 28px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="font:600 16px/1.2 ${FONT};color:#ffffff;letter-spacing:.2px">${esc(SITE.name)}</td>
<td align="right" style="font:400 13px/1.2 ${FONT};color:#cfe0f6">Contact form</td>
</tr></table></td></tr>

<tr><td style="background:#ffffff;border:1px solid ${HAIR};border-top:0;border-radius:0 0 14px 14px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

<tr><td style="padding:30px 28px 20px;border-bottom:1px solid ${HAIR}">
<div style="font:600 13px/1 ${FONT};color:${MUTED};padding-bottom:10px">Somebody wrote in</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="font:700 26px/1.2 ${FONT};color:${INK};letter-spacing:-.3px">${esc(who)}</td>
${topic ? `<td align="right" valign="middle"><span style="display:inline-block;background:${TINT};color:${BLUE};font:600 12px/1 ${FONT};padding:8px 12px;border-radius:999px;white-space:nowrap">${esc(topic)}</span></td>` : ""}
</tr></table></td></tr>

${
  suspect
    ? `<tr><td style="padding:18px 28px 0"><div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:13px 15px;font:400 13px/1.55 ${FONT};color:#9a3412"><strong style="font-weight:600">This one looks like a sales pitch.</strong> ${esc(e.spamReasons.join("; "))}. It is saved in Messages either way &mdash; have a look if this seems wrong.</div></td></tr>`
    : ""
}

<tr><td style="padding:24px 28px 0">
<div style="font:400 16px/1.65 ${FONT};color:${INK};white-space:pre-wrap">${esc(e.message.trim() || "(no message)")}</div>
</td></tr>

<tr><td style="padding:26px 28px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="50%" valign="top" style="padding-right:12px">
<div style="font:400 12px/1.3 ${FONT};color:${MUTED};padding-bottom:5px">Email</div>
<div style="font:600 14px/1.5 ${FONT};color:${INK};word-break:break-word">${reply ? `<a href="mailto:${esc(reply)}" style="color:${BLUE};text-decoration:none">${esc(reply)}</a>` : `<span style="color:${MUTED};font-weight:400">None given</span>`}</div></td>
<td width="50%" valign="top" style="padding-left:12px">
<div style="font:400 12px/1.3 ${FONT};color:${MUTED};padding-bottom:5px">Phone</div>
<div style="font:600 14px/1.5 ${FONT};color:${INK}">${e.phone.trim() ? esc(e.phone.trim()) : `<span style="color:${MUTED};font-weight:400">None given</span>`}</div></td>
</tr></table></td></tr>

<tr><td style="padding:28px 28px 30px">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
${reply ? `<td style="background:${BLUE};border-radius:10px"><a href="mailto:${esc(reply)}?subject=${encodeURIComponent(`Re: your message to ${SITE.name}`)}" style="display:inline-block;padding:14px 24px;font:600 15px/1 ${FONT};color:#ffffff;text-decoration:none">Reply to ${esc(who.split(/\s+/)[0] || "them")}</a></td><td style="width:10px"></td>` : ""}
<td style="border:1px solid ${HAIR};border-radius:10px"><a href="${esc(ORIGIN)}/admin" style="display:inline-block;padding:14px 22px;font:600 15px/1 ${FONT};color:${INK};text-decoration:none">All messages</a></td>
</tr></table></td></tr>

</table></td></tr>

<tr><td style="padding:20px 28px 0;text-align:center;font:400 12px/1.6 ${FONT};color:#8b95a3">${esc(SITE.name)} &middot; <a href="${esc(ORIGIN)}" style="color:#8b95a3;text-decoration:underline">${esc(ORIGIN.replace(/^https?:\/\//, ""))}</a><br>Sent because someone filled in the contact form.</td></tr>

</table></td></tr></table></body></html>`;

  return { subject, text, html };
}
