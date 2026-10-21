import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { SiteShell } from "../components/site/chrome";
import { SendCta } from "../components/site/cta";
import { Field, Notice, Select, TextArea, TextInput } from "../components/site/form";
import { IconClock, IconMail, IconPhone, IconPin } from "../components/site/icons";
import { Eyebrow, Shell } from "../components/site/section";
import { submitQuote } from "../lib/api/store.functions";
import { ORIGIN, SITE } from "../lib/site";
import { JsonLd } from "../components/JsonLd";
import { STORE_ID, pageJsonLd } from "../lib/structured-data";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact the shop | Affordable Home Electronics" },
      {
        name: "description",
        content:
          "Call 718.275.9343, message us on WhatsApp or email the shop. Affordable Home Electronics, 62-65 Saunders Street, Rego Park, NY 11374.",
      },
    ],
    links: [{ rel: "canonical", href: `${ORIGIN}/contact` }],
  }),
  component: Contact,
});

/** Answers to what people most often write in about, so a question can be
 *  settled without waiting for a reply. Every line restates a policy page. */
const HELP: { q: string; a: React.ReactNode }[] = [
  {
    q: "Where is my order?",
    a: (
      <>
        Look it up on the{" "}
        <Link to="/orders" className="text-ink underline underline-offset-4 hover:text-signal">order tracking page</Link>{" "}
        with your order reference and email. Orders leave within two business days, and the tracking number appears
        there as soon as it ships.
      </>
    ),
  },
  {
    q: "Sending something back",
    a: (
      <>
        Ask for a return authorization number first, by phone, email or the form here. The return address comes with it.
        Returns without a number cannot be accepted. The full rules are on the{" "}
        <Link to="/returns" className="text-ink underline underline-offset-4 hover:text-signal">returns page</Link>.
      </>
    ),
  },
  {
    q: "Something stopped working",
    a: (
      <>
        Everything we sell is genuine USA stock with the full manufacturer warranty, and we take the claim to the
        manufacturer for you. Email the order reference, the model number and what it is doing. See the{" "}
        <Link to="/warranty" className="text-ink underline underline-offset-4 hover:text-signal">warranty page</Link>.
      </>
    ),
  },
  {
    q: "Installation in New York City",
    a: (
      <>
        We install camera systems, recorders and access control across the five boroughs. Tell us the property type and
        roughly how many cameras and we will come back with a quote. More on the{" "}
        <Link to="/installation" className="text-ink underline underline-offset-4 hover:text-signal">installation page</Link>.
      </>
    ),
  },
  {
    q: "Shipping questions",
    a: (
      <>
        We ship across the United States and to Canada by UPS, which cannot deliver to PO boxes or APO/FPO addresses.
        Oversized items and Canadian orders are covered on the{" "}
        <Link to="/shipping" className="text-ink underline underline-offset-4 hover:text-signal">shipping page</Link>.
      </>
    ),
  },
  {
    q: "A part number you cannot find",
    a: (
      <>
        The website shows part of what we can supply. Send the make and model, or a photo of the label, and we will check
        whether we can get it and what it costs.
      </>
    ),
  },
];

const TOPICS = [
  "A quote for cameras",
  "Installation in NYC",
  "A question about an order",
  "A return or warranty claim",
  "Wholesale or government",
  "Something else",
];

function Contact() {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setPending(true);
    setError("");
    try {
      await submitQuote({
        data: {
          name: String(f.get("name") ?? ""),
          phone: String(f.get("phone") ?? ""),
          email: String(f.get("email") ?? ""),
          borough: "",
          property_type: String(f.get("topic") ?? ""),
          cameras: "",
          message: String(f.get("message") ?? ""),
        },
      });
      setDone(true);
    } catch {
      setError(`That did not send. Call ${SITE.phone} or email ${SITE.email} and we will pick it up from there.`);
    } finally {
      setPending(false);
    }
  }

  return (
    <SiteShell>
      <JsonLd json={pageJsonLd({ type: "ContactPage", path: "/contact", name: "Contact Affordable Home Electronics", description: "Phone, WhatsApp, email, fax, address and opening hours.", about: { "@id": STORE_ID } })} />
      <Shell className="py-14">
        <Eyebrow>Contact</Eyebrow>
        <h1 className="mt-5 max-w-[15ch] text-4xl font-semibold leading-[0.99] tracking-tighter text-ink md:text-6xl">
          Call the shop. Someone picks up.
        </h1>

        <div className="mt-12 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <dl className="border-t border-line">
              <div className="flex gap-4 border-b border-line py-6">
                <IconPhone className="mt-1 h-5 w-5 shrink-0 text-ink" />
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Phone</dt>
                  <dd className="mt-2">
                    <a href={SITE.phoneHref} className="font-mono text-2xl tracking-tight text-ink hover:text-signal">
                      {SITE.phone}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex gap-4 border-b border-line py-6">
                <IconPhone className="mt-1 h-5 w-5 shrink-0 text-ink" />
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">WhatsApp</dt>
                  <dd className="mt-2">
                    <a href={SITE.whatsappHref} className="font-mono text-lg tracking-tight text-ink hover:text-signal">
                      {SITE.whatsapp}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex gap-4 border-b border-line py-6">
                <IconMail className="mt-1 h-5 w-5 shrink-0 text-ink" />
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Email and fax</dt>
                  <dd className="mt-2 space-y-1">
                    <a href={SITE.emailHref} className="block break-all text-base text-ink hover:text-signal">
                      {SITE.email}
                    </a>
                    <span className="block font-mono text-sm text-muted">Fax {SITE.fax}</span>
                  </dd>
                </div>
              </div>
              <div className="flex gap-4 border-b border-line py-6">
                <IconPin className="mt-1 h-5 w-5 shrink-0 text-ink" />
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">The counter</dt>
                  <dd className="mt-2 text-base leading-relaxed text-ink">
                    {SITE.street}
                    <br />
                    {SITE.cityLine}
                  </dd>
                </div>
              </div>
              <div className="flex gap-4 border-b border-line py-6">
                <IconClock className="mt-1 h-5 w-5 shrink-0 text-ink" />
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Opening hours</dt>
                  <dd className="mt-2 text-base leading-relaxed text-ink">
                    {SITE.hours.plain}
                    <br />
                    <span className="text-muted">{SITE.hours.closed}</span>
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="border border-line bg-surface p-6 sm:p-8">
            {done ? (
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-ink">Message received.</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  We will get back to you. If it is urgent, the shop line is{" "}
                  <a href={SITE.phoneHref} className="font-mono text-ink underline underline-offset-4">
                    {SITE.phone}
                  </a>
                  .
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight text-ink">Send a message</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Your name" name="name">
                    <TextInput id="name" name="name" required minLength={2} maxLength={120} autoComplete="name" />
                  </Field>
                  <Field label="Email" name="email">
                    <TextInput
                      id="email"
                      name="email"
                      type="email"
                      required
                      maxLength={160}
                      autoComplete="email"
                    />
                  </Field>
                </div>
                <Field label="Phone" name="phone" hint="Optional, if you would rather we called you">
                  <TextInput id="phone" name="phone" maxLength={40} inputMode="tel" autoComplete="tel" />
                </Field>
                <Field label="What is it about" name="topic">
                  <Select id="topic" name="topic" defaultValue={TOPICS[0]}>
                    {TOPICS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Message" name="message">
                  <TextArea id="message" name="message" rows={5} required maxLength={1200} />
                </Field>
                {error ? <Notice tone="bad">{error}</Notice> : null}
                <SendCta label="Send message" pending={pending} />
              </form>
            )}
          </div>
        </div>

        <section className="mt-20" aria-labelledby="help-heading">
          <h2 id="help-heading" className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            Quicker answers to common questions
          </h2>
          <p className="mt-3 max-w-[62ch] text-base leading-relaxed text-muted">
            Most messages are about one of these. If yours is, the answer may already be here.
          </p>
          <dl className="mt-8 grid gap-px border-y border-line bg-line md:grid-cols-2 lg:grid-cols-3">
            {HELP.map((h) => (
              <div key={h.q} className="bg-ground p-6">
                <dt className="text-base font-medium text-ink">{h.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted">{h.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </Shell>
    </SiteShell>
  );
}
