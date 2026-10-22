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
        <Link to="/orders" className="font-semibold text-signal underline underline-offset-4 hover:text-ink">order tracking page</Link>{" "}
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
        <Link to="/returns" className="font-semibold text-signal underline underline-offset-4 hover:text-ink">returns page</Link>.
      </>
    ),
  },
  {
    q: "Something stopped working",
    a: (
      <>
        Everything we sell is genuine USA stock with the full manufacturer warranty, and we take the claim to the
        manufacturer for you. Email the order reference, the model number and what it is doing. See the{" "}
        <Link to="/warranty" className="font-semibold text-signal underline underline-offset-4 hover:text-ink">warranty page</Link>.
      </>
    ),
  },
  {
    q: "Installation in New York City",
    a: (
      <>
        We install camera systems, recorders and access control across the five boroughs. Tell us the property type and
        roughly how many cameras and we will come back with a quote. More on the{" "}
        <Link to="/installation" className="font-semibold text-signal underline underline-offset-4 hover:text-ink">installation page</Link>.
      </>
    ),
  },
  {
    q: "Shipping questions",
    a: (
      <>
        We ship across the United States and to Canada by UPS, which cannot deliver to PO boxes or APO/FPO addresses.
        Oversized items and Canadian orders are covered on the{" "}
        <Link to="/shipping" className="font-semibold text-signal underline underline-offset-4 hover:text-ink">shipping page</Link>.
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
      <Shell className="py-10 md:py-12">
        <Eyebrow>Contact</Eyebrow>
        <h1 className="mt-2 max-w-[15ch] text-[40px] text-ink md:text-[56px]">
          Call the shop. Someone picks up.
        </h1>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
          <div>
            <dl className="rounded-[14px] border border-[#dbe7f3] bg-surface px-5">
              <div className="flex gap-4 border-b border-[#e6eef6] py-5 last:border-b-0">
                <IconPhone className="mt-0.5 h-5 w-5 shrink-0 text-signal" />
                <div>
                  <dt className="text-[14px] font-semibold text-muted">Phone</dt>
                  <dd className="mt-2">
                    <a href={SITE.phoneHref} className="ahe-price text-[30px] text-ink hover:text-signal">
                      {SITE.phone}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex gap-4 border-b border-[#e6eef6] py-5 last:border-b-0">
                <IconPhone className="mt-0.5 h-5 w-5 shrink-0 text-signal" />
                <div>
                  <dt className="text-[14px] font-semibold text-muted">WhatsApp</dt>
                  <dd className="mt-2">
                    <a href={SITE.whatsappHref} className="ahe-price text-[22px] text-ink hover:text-signal">
                      {SITE.whatsapp}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex gap-4 border-b border-[#e6eef6] py-5 last:border-b-0">
                <IconMail className="mt-0.5 h-5 w-5 shrink-0 text-signal" />
                <div>
                  <dt className="text-[14px] font-semibold text-muted">Email and fax</dt>
                  <dd className="mt-2 space-y-1">
                    <a href={SITE.emailHref} className="block break-all text-[16px] font-semibold text-ink hover:text-signal">
                      {SITE.email}
                    </a>
                    <span className="block text-[15px] text-muted">Fax {SITE.fax}</span>
                  </dd>
                </div>
              </div>
              <div className="flex gap-4 border-b border-[#e6eef6] py-5 last:border-b-0">
                <IconPin className="mt-0.5 h-5 w-5 shrink-0 text-signal" />
                <div>
                  <dt className="text-[14px] font-semibold text-muted">The counter</dt>
                  <dd className="mt-2 text-[16px] leading-relaxed text-ink">
                    {SITE.street}
                    <br />
                    {SITE.cityLine}
                  </dd>
                </div>
              </div>
              <div className="flex gap-4 border-b border-[#e6eef6] py-5 last:border-b-0">
                <IconClock className="mt-0.5 h-5 w-5 shrink-0 text-signal" />
                <div>
                  <dt className="text-[14px] font-semibold text-muted">Opening hours</dt>
                  <dd className="mt-2 text-[16px] leading-relaxed text-ink">
                    {SITE.hours.plain}
                    <br />
                    <span className="text-muted">{SITE.hours.closed}</span>
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="rounded-[14px] border border-[#dbe7f3] bg-surface p-6 sm:p-8">
            {done ? (
              <div>
                <h2 className="ahe-display text-[26px] text-ink">Message received.</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  We will get back to you. If it is urgent, the shop line is{" "}
                  <a href={SITE.phoneHref} className="font-semibold text-ink underline underline-offset-4">
                    {SITE.phone}
                  </a>
                  .
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <h2 className="ahe-display text-[26px] text-ink">Send a message</h2>
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

        <section className="mt-12" aria-labelledby="help-heading">
          <h2 id="help-heading" className="text-[32px] text-ink md:text-[40px]">
            Quicker answers to common questions
          </h2>
          <p className="mt-2 max-w-[62ch] text-[16px] leading-relaxed text-muted">
            Most messages are about one of these. If yours is, the answer may already be here.
          </p>
          <dl className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {HELP.map((h) => (
              <div key={h.q} className="rounded-[14px] border border-[#dbe7f3] bg-surface p-5">
                <dt className="text-[17px] font-bold text-ink">{h.q}</dt>
                <dd className="mt-2 text-[15px] leading-relaxed text-muted">{h.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </Shell>
    </SiteShell>
  );
}
