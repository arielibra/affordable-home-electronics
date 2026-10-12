import { useState } from "react";

import { submitQuote } from "../../lib/api/store.functions";
import { SITE } from "../../lib/site";
import { SendCta } from "../site/cta";
import { Field, Notice, Select, TextArea, TextInput } from "../site/form";
import { Shell } from "../site/section";

const BOROUGHS = ["Queens", "Brooklyn", "Manhattan", "The Bronx", "Staten Island", "Nassau or Westchester"];
const PROPERTIES = ["House", "Apartment building", "Store or restaurant", "Warehouse or garage", "Office"];
const COUNTS = ["2 to 4", "5 to 8", "9 to 16", "More than 16", "Not sure yet"];

export function InstallBand() {
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
          borough: String(f.get("borough") ?? ""),
          property_type: String(f.get("property_type") ?? ""),
          cameras: String(f.get("cameras") ?? ""),
          message: String(f.get("message") ?? ""),
        },
      });
      setDone(true);
    } catch {
      setError(`That did not send. Call the shop on ${SITE.phone} and we will take the details by phone.`);
    } finally {
      setPending(false);
    }
  }

  return (
    <section id="quote" className="bg-band py-16 text-surface lg:py-20">
      <Shell className="grid gap-12 lg:grid-cols-[1fr_460px] lg:gap-16">
        <div>
          <h2 className="max-w-[17ch] text-3xl font-semibold leading-[1.02] tracking-tighter md:text-4xl">
            We come out and install it ourselves.
          </h2>
          <p className="mt-5 max-w-[54ch] text-base leading-relaxed text-white/65">
            Cable run, mounting, aiming, the recorder configured and your phone showing the cameras before we pack up.
            One trip, one bill, no subscription.
          </p>

          <div className="mt-10 border-t border-line-dark pt-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">Where we work</p>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
              {SITE.areas.map((a) => (
                <li key={a} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-signal" aria-hidden="true" />
                  {a}
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-[48ch] text-sm leading-relaxed text-white/55">
              Outside the city we ship the same gear anywhere in the United States, and we answer install questions on the
              phone at no charge.
            </p>
          </div>
        </div>

        <div className="border border-line-dark bg-surface p-6 text-ink sm:p-8">
          {done ? (
            <div>
              <h3 className="text-xl font-semibold tracking-tight">We have it. Expect a call.</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Someone from the shop will call you back to walk through the building and give you a number. If you would
                rather talk now, the shop line is{" "}
                <a href={SITE.phoneHref} className="font-mono text-ink underline underline-offset-4">
                  {SITE.phone}
                </a>
                .
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <h3 className="text-xl font-semibold tracking-tight">Ask for a quote</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Your name" name="name">
                  <TextInput id="name" name="name" required minLength={2} maxLength={120} autoComplete="name" />
                </Field>
                <Field label="Phone" name="phone">
                  <TextInput id="phone" name="phone" required minLength={7} maxLength={40} inputMode="tel" autoComplete="tel" />
                </Field>
              </div>
              <Field label="Email" name="email" hint="Optional. We call first.">
                <TextInput id="email" name="email" type="email" maxLength={160} autoComplete="email" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Borough" name="borough">
                  <Select id="borough" name="borough" defaultValue={BOROUGHS[0]}>
                    {BOROUGHS.map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Cameras" name="cameras">
                  <Select id="cameras" name="cameras" defaultValue={COUNTS[0]}>
                    {COUNTS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Property" name="property_type">
                <Select id="property_type" name="property_type" defaultValue={PROPERTIES[0]}>
                  {PROPERTIES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Anything we should know" name="message">
                <TextArea id="message" name="message" rows={3} maxLength={1200} />
              </Field>
              {error ? <Notice tone="bad">{error}</Notice> : null}
              <SendCta label="Send it over" pending={pending} />
            </form>
          )}
        </div>
      </Shell>
    </section>
  );
}
