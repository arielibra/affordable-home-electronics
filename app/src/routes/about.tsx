import { createFileRoute } from "@tanstack/react-router";

import { SiteShell } from "../components/site/chrome";
import { QuoteCta } from "../components/site/cta";
import { Eyebrow, Shell } from "../components/site/section";
import { ORIGIN, SITE } from "../lib/site";
import { JsonLd } from "../components/JsonLd";
import { STORE_ID, pageJsonLd } from "../lib/structured-data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the shop | Affordable Home Electronics" },
      {
        name: "description",
        content:
          "An independent electronics dealer in Rego Park, Queens, selling security cameras, recorders and access control since 2003.",
      },
    ],
    links: [{ rel: "canonical", href: `${ORIGIN}/about` }],
  }),
  component: About,
});

function About() {
  const years = new Date().getFullYear() - SITE.since;
  return (
    <SiteShell>
      <JsonLd json={pageJsonLd({ type: "AboutPage", path: "/about", name: "About Affordable Home Electronics", description: "A family-run security camera and electronics shop in Rego Park, Queens, selling and installing since 2003.", about: { "@id": STORE_ID } })} />
      <Shell className="py-10 md:py-12">
        <Eyebrow>About</Eyebrow>
        <h1 className="mt-2 max-w-[18ch] text-[40px] text-ink md:text-[56px]">
          A counter in Rego Park, and a warehouse behind it.
        </h1>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start lg:gap-8">
          <div className="space-y-4 rounded-[14px] border border-[#dbe7f3] bg-surface p-6 text-[16px] leading-relaxed text-ink-soft md:p-8">
            <p>
              Affordable Home Electronics started in {SITE.since} as a one stop shop for home and business electronics. Over
              {" "}{years} years the catalog grew past 22,000 line items, but the part that people actually come back for
              narrowed: cameras, recorders, access control, and someone who knows which of the three you got wrong.
            </p>
            <p>
              We are an authorized dealer for the lines we carry, which is a boring sentence with real consequences. It
              means the product is genuine USA retail stock, sealed, with every accessory the factory packed and a warranty
              the manufacturer will actually honour. It means we buy direct and get trained on the gear. It means that when
              something fails in year two, there is a path that does not end with a shrug.
            </p>
            <p>
              We ship anywhere in the United States, and to Canada. Locally we install: Queens, Brooklyn, Manhattan,
              the Bronx, out to Nassau and Westchester when it makes sense. Retail, wholesale and government orders are
              all handled the same way.
            </p>
            <p>
              The website changed. The phone number did not.
            </p>
            <div className="pt-2">
              <QuoteCta>Ask for a quote</QuoteCta>
            </div>
          </div>

          <aside className="rounded-[14px] border border-[#dbe7f3] bg-surface p-6 sm:p-8">
            <h2 className="text-[26px] text-ink">How we work</h2>
            <dl className="mt-4 space-y-4 text-[15px] leading-relaxed">
              <div>
                <dt className="font-bold text-ink">Talk to a person</dt>
                <dd className="mt-1 text-muted">
                  {SITE.phone} &middot; {SITE.hours.plain}, {SITE.hours.closed.toLowerCase()}.
                </dd>
              </div>
              <div>
                <dt className="font-bold text-ink">Authorized dealer</dt>
                <dd className="mt-1 text-muted">
                  Genuine USA stock, sealed, with the full manufacturer warranty.
                </dd>
              </div>
              <div>
                <dt className="font-bold text-ink">Ships nationwide</dt>
                <dd className="mt-1 text-muted">United States and Canada, two business days to dispatch.</dd>
              </div>
              <div>
                <dt className="font-bold text-ink">Installed locally</dt>
                <dd className="mt-1 text-muted">Across New York City, by arrangement.</dd>
              </div>
            </dl>
          </aside>
        </div>

        <section className="mt-6 grid gap-6 rounded-[14px] border border-[#dbe7f3] bg-surface p-6 md:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-10">
          <figure className="flex items-center justify-center rounded-xl bg-ground p-8">
            <img
              src="/assets/logo-stacked.webp"
              alt="Affordable Home Electronics"
              width={880}
              height={590}
              className="h-auto w-full max-w-[360px]"
            />
          </figure>
          <div>
            <h2 className="max-w-[20ch] text-[30px] text-ink md:text-[38px]">
              The same cart, redrawn.
            </h2>
            <p className="mt-2 max-w-[56ch] text-[16px] leading-relaxed text-muted">
              The mark has been on the vans, the invoices and the shopfront since the beginning, so it was rebuilt rather
              than replaced. Same cart, same three stacked words, same blues. The basket keeps its grid, which now doubles
              as a wall of camera feeds.
            </p>
          </div>
        </section>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            [`${years} years`, `Trading from the same address since ${SITE.since}`],
            ["22,000", "Line items across the full catalog"],
            ["150+", "Manufacturers, from Hikvision and Dahua to Anviz and Ring"],
          ].map(([v, l]) => (
            <div key={v} className="rounded-[14px] border border-[#dbe7f3] bg-surface p-5">
              <p className="ahe-display text-[36px] leading-none text-ink">{v}</p>
              <p className="mt-1.5 text-[15px] text-muted">{l}</p>
            </div>
          ))}
        </div>
      </Shell>
    </SiteShell>
  );
}
