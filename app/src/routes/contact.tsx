import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { SiteShell } from "../components/site/chrome";
import { SendCta } from "../components/site/cta";
import { Field, Notice, Select, TextArea, TextInput } from "../components/site/form";
import { IconClock, IconMail, IconPin } from "../components/site/icons";
import { Eyebrow, Shell } from "../components/site/section";
import { submitQuote } from "../lib/api/store.functions";
import { ORIGIN, SITE } from "../lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact the shop | Affordable Home Electronics" },
      {
        name: "description",
        content:
          "Email info@AffordableHomeElectronics.com or send a message. An online security camera dealer in Rego Park, Queens, shipping nationwide since 2003.",
      },
    ],
    links: [{ rel: "canonical", href: `${ORIGIN}/contact` }],
  }),
  component: Contact,
});

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
      setError(`That did not send. Email ${SITE.email} directly and we will pick it up from there.`);
    } finally {
      setPending(false);
    }
  }

  return (
    <SiteShell>
      <Shell className="py-14">
        <Eyebrow>Contact</Eyebrow>
        <h1 className="mt-5 max-w-[16ch] text-4xl font-semibold leading-[0.99] tracking-tighter text-ink md:text-6xl">
          Send a message. A person reads it.
        </h1>
        <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-muted">
          We sell and support online only, so everything comes through email or the form below. Tell us the property, the
          model or the order number and you will get a straight answer &mdash; not a ticket number.
        </p>

        <div className="mt-12 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <dl className="border-t border-line">
              <div className="flex gap-4 border-b border-line py-6">
                <IconMail className="mt-1 h-5 w-5 shrink-0 text-ink" />
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Email</dt>
                  <dd className="mt-2">
                    <a href={SITE.emailHref} className="block break-all text-lg text-ink hover:text-signal">
                      {SITE.email}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex gap-4 border-b border-line py-6">
                <IconClock className="mt-1 h-5 w-5 shrink-0 text-ink" />
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Reply time</dt>
                  <dd className="mt-2 text-base leading-relaxed text-ink">
                    Within {SITE.replyTime}
                    <br />
                    <span className="text-muted">Quotes and stock checks usually sooner</span>
                  </dd>
                </div>
              </div>
              <div className="flex gap-4 border-b border-line py-6">
                <IconPin className="mt-1 h-5 w-5 shrink-0 text-ink" />
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Where we are</dt>
                  <dd className="mt-2 text-base leading-relaxed text-ink">
                    {SITE.city}
                    <br />
                    <span className="text-muted">
                      Online only &mdash; no counter or walk-in. Orders ship nationwide, and we install across New York
                      City.
                    </span>
                  </dd>
                </div>
              </div>
            </dl>

            <p className="mt-8 max-w-[52ch] text-sm leading-relaxed text-muted">
              Returning something? Ask for an authorization number first and we will send it back with the address to
              post it to.
            </p>
          </div>

          <div className="border border-line bg-surface p-6 sm:p-8">
            {done ? (
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-ink">Message received.</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  We will come back to you within {SITE.replyTime}. If it is urgent, email{" "}
                  <a href={SITE.emailHref} className="break-all text-ink underline underline-offset-4">
                    {SITE.email}
                  </a>{" "}
                  and put the order number in the subject line.
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
      </Shell>
    </SiteShell>
  );
}
