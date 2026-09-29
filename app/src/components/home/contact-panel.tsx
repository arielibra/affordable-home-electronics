import { Link } from "@tanstack/react-router";

import { SITE } from "../../lib/site";
import { QuoteCta } from "../site/cta";
import { IconClock, IconMail, IconPin } from "../site/icons";
import { Eyebrow, Shell } from "../site/section";

export function ContactPanel() {
  return (
    <section className="bg-ground pt-16">
      <Shell>
        <Eyebrow>Talk to the shop</Eyebrow>
        <div className="mt-6 flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-[21ch] text-3xl font-semibold leading-[1.02] tracking-tighter text-ink md:text-4xl">
            Ask before you buy. We would rather you got the right one.
          </h2>
          <QuoteCta>Ask for a quote</QuoteCta>
        </div>

        <dl className="grid gap-px border-b border-line bg-line sm:grid-cols-3">
          <div className="bg-ground py-8 sm:pr-8">
            <dt className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              <IconMail className="h-4 w-4" /> Email
            </dt>
            <dd className="mt-4">
              <a href={SITE.emailHref} className="block break-all text-base text-ink hover:text-signal">
                {SITE.email}
              </a>
            </dd>
          </div>
          <div className="bg-ground py-8 sm:px-8">
            <dt className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              <IconClock className="h-4 w-4" /> Reply time
            </dt>
            <dd className="mt-4 text-base leading-relaxed text-ink">
              Within {SITE.replyTime}
              <br />
              <span className="text-muted">Quotes usually sooner</span>
            </dd>
          </div>
          <div className="bg-ground py-8 sm:pl-8">
            <dt className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              <IconPin className="h-4 w-4" /> Where we are
            </dt>
            <dd className="mt-4 text-base leading-relaxed text-ink">
              {SITE.city}
              <br />
              <span className="text-muted">Online only. Ships nationwide.</span>
            </dd>
          </div>
        </dl>

        <p className="mt-8 max-w-[62ch] text-sm leading-relaxed text-muted">
          Everything is handled online. Send the details of the property or the model you are after and we will come back
          with a straight answer &mdash; or{" "}
          <Link to="/contact" className="text-ink underline underline-offset-4 hover:text-signal">
            use the contact form
          </Link>
          .
        </p>
      </Shell>
    </section>
  );
}
