import { useState } from "react";

import { submitQuote } from "../../lib/api/store.functions";
import { SITE } from "../../lib/site";
import { SendCta } from "../site/cta";
import { Field, Notice, Select, TextArea, TextInput } from "../site/form";
import { Eyebrow, Shell } from "../site/section";

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
    <section id="quote" className="bg-surface py-12 md:py-16">
      <Shell className="grid items-start gap-8 lg:grid-cols-[1fr_460px] lg:gap-12">
        <div className="rounded-2xl bg-band p-6 text-white md:p-8">
          <p className="text-[14px] font-semibold text-[#cfe1ef]">Installation in New York City</p>
          <h2 className="mt-2 max-w-[17ch] text-[32px] md:text-[44px]">We come out and install it ourselves.</h2>
          <p className="mt-3 max-w-[54ch] text-[16px] leading-relaxed text-[#dcebfa]">
            Cable run, mounting, aiming, the recorder configured and your phone showing the cameras before we pack up.
            One trip, one bill, no subscription.
          </p>

          <div className="mt-6 border-t border-white/20 pt-5">
            <p className="text-[14px] font-semibold text-[#cfe1ef]">Where we work</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {SITE.areas.map((a) => (
                <li key={a} className="rounded-full bg-white/12 px-3 py-1.5 text-[14px] font-medium text-white">
                  {a}
                </li>
              ))}
            </ul>
            <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-[#dcebfa]">
              Outside the city we ship the same gear anywhere in the United States, and we answer install questions on the
              phone at no charge.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#dbe7f3] bg-surface p-6 text-ink shadow-[0_18px_34px_-26px_rgba(27,58,92,0.4)] sm:p-7">
          {done ? (
            <div>
              <h3 className="ahe-display text-[28px] text-ink">We have it. Expect a call.</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                Someone from the shop will call you back to walk through the building and give you a number. If you would
                rather talk now, the shop line is{" "}
                <a href={SITE.phoneHref} className="font-semibold text-ink underline underline-offset-4">
                  {SITE.phone}
                </a>
                .
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <h3 className="ahe-display text-[28px] text-ink">Ask for a quote</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Your name" name="name">
                  <TextInput id="name" name="name" required minLength={2} maxLength={120} autoComplete="name" />
                </Field>
                <Field label="Phone" name="phone">
                  <TextInput id="phone" name="phone" required minLength={7} maxLength={40} inputMode="tel" autoComplete="tel" />
                </Field>
              </div>
              <Field label="Email" name="email" hint="Optional">
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
