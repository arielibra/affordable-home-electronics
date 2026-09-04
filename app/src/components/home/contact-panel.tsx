import { SITE } from "../../lib/site";
import { QuoteCta } from "../site/cta";
import { IconMail, IconPhone, IconPin } from "../site/icons";
import { Eyebrow, Shell } from "../site/section";

export function ContactPanel() {
  return (
    <section className="bg-ground pt-16">
      <Shell>
        <Eyebrow>Talk to the shop</Eyebrow>
        <div className="mt-6 flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-[19ch] text-3xl font-semibold leading-[1.02] tracking-tighter text-ink md:text-4xl">
            A real counter, a real phone number.
          </h2>
          <QuoteCta>Ask for a quote</QuoteCta>
        </div>

        <dl className="grid gap-px border-b border-line bg-line sm:grid-cols-3">
          <div className="bg-ground py-8 sm:pr-8">
            <dt className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              <IconPhone className="h-4 w-4" /> Phone and WhatsApp
            </dt>
            <dd className="mt-4 space-y-1.5">
              <a href={SITE.phoneHref} className="block font-mono text-xl tracking-tight text-ink hover:text-signal">
                {SITE.phone}
              </a>
              <a href={SITE.whatsappHref} className="block font-mono text-sm text-muted hover:text-signal">
                {SITE.whatsapp}
              </a>
            </dd>
          </div>
          <div className="bg-ground py-8 sm:px-8">
            <dt className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              <IconMail className="h-4 w-4" /> Email and fax
            </dt>
            <dd className="mt-4 space-y-1.5">
              <a href={SITE.emailHref} className="block break-all text-base text-ink hover:text-signal">
                {SITE.email}
              </a>
              <span className="block font-mono text-sm text-muted">Fax {SITE.fax}</span>
            </dd>
          </div>
          <div className="bg-ground py-8 sm:pl-8">
            <dt className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              <IconPin className="h-4 w-4" /> The counter
            </dt>
            <dd className="mt-4 text-base leading-relaxed text-ink">
              {SITE.street}
              <br />
              {SITE.cityLine}
            </dd>
          </div>
        </dl>
      </Shell>

      <figure className="mt-10">
        <img
          src="/assets/counter-shop.png"
          alt="The shop counter with a desk phone, a binder of spec sheets, a boxed camera and a coil of coaxial cable"
          width={1344}
          height={752}
          loading="lazy"
          className="h-[280px] w-full object-cover md:h-[420px]"
        />
      </figure>
    </section>
  );
}
