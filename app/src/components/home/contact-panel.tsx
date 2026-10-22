import { SITE } from "../../lib/site";
import { QuoteCta } from "../site/cta";
import { IconMail, IconPhone, IconPin } from "../site/icons";
import { Eyebrow, Shell } from "../site/section";

/** Talk to the shop: three contact cards and the quote button. */
export function ContactPanel() {
  const card = "rounded-[14px] border border-[#dbe7f3] bg-surface p-5";
  const label = "flex items-center gap-2 text-[14px] font-semibold text-muted";
  return (
    <section className="bg-ground py-12 md:py-16">
      <Shell>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>Talk to the shop</Eyebrow>
            <h2 className="mt-2 max-w-[22ch] text-[32px] text-ink md:text-[40px]">A real counter, a real phone number.</h2>
          </div>
          <QuoteCta>Ask for a quote</QuoteCta>
        </div>

        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className={card}>
            <dt className={label}>
              <IconPhone className="h-[18px] w-[18px] text-signal" /> Phone and WhatsApp
            </dt>
            <dd className="mt-2">
              <a href={SITE.phoneHref} className="ahe-price block text-[28px] text-ink hover:text-signal">
                {SITE.phone}
              </a>
              <a href={SITE.whatsappHref} className="mt-1 inline-block text-[15px] text-muted hover:text-signal">
                WhatsApp {SITE.whatsapp}
              </a>
            </dd>
          </div>
          <div className={card}>
            <dt className={label}>
              <IconMail className="h-[18px] w-[18px] text-signal" /> Email and fax
            </dt>
            <dd className="mt-2">
              <a href={SITE.emailHref} className="block break-all text-[16px] font-semibold text-ink hover:text-signal">
                {SITE.email}
              </a>
              <span className="mt-1 block text-[15px] text-muted">Fax {SITE.fax}</span>
            </dd>
          </div>
          <div className={card}>
            <dt className={label}>
              <IconPin className="h-[18px] w-[18px] text-signal" /> The counter
            </dt>
            <dd className="mt-2 text-[16px] leading-relaxed text-ink">
              {SITE.street}
              <br />
              {SITE.cityLine}
              <br />
              <span className="text-[15px] text-muted">{SITE.hours.plain}</span>
            </dd>
          </div>
        </dl>
      </Shell>
    </section>
  );
}
