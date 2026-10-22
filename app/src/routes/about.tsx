import { createFileRoute } from "@tanstack/react-router";

import { SiteShell } from "../components/site/chrome";
import { QuoteCta } from "../components/site/cta";
import { Eyebrow, Shell, Stat } from "../components/site/section";
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
      <Shell className="py-14">
        <Eyebrow>About</Eyebrow>
        <h1 className="mt-5 max-w-[16ch] text-4xl font-semibold leading-[0.99] tracking-tighter text-ink md:text-6xl">
          A counter in Rego Park, and a warehouse behind it.
        </h1>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16">
          <div className="max-w-[62ch] space-y-5 text-base leading-relaxed text-muted">
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

          <aside className="border border-line bg-surface p-6 sm:p-8">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">How we work</h2>
            <dl className="mt-5 space-y-4 text-sm leading-relaxed">
              <div>
                <dt className="font-medium text-ink">Talk to a person</dt>
                <dd className="mt-1 text-muted">
                  {SITE.phone} &middot; {SITE.hours.plain}, {SITE.hours.closed.toLowerCase()}.
                </dd>
              </div>
              <div>
                <dt className="font-medium text-ink">Authorized dealer</dt>
                <dd className="mt-1 text-muted">
                  Genuine USA stock, sealed, with the full manufacturer warranty.
                </dd>
              </div>
              <div>
                <dt className="font-medium text-ink">Ships nationwide</dt>
                <dd className="mt-1 text-muted">United States and Canada, two business days to dispatch.</dd>
              </div>
              <div>
                <dt className="font-medium text-ink">Installed locally</dt>
                <dd className="mt-1 text-muted">Across New York City, by arrangement.</dd>
              </div>
            </dl>
          </aside>
        </div>

        <section className="mt-14 grid gap-8 border-t border-line pt-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14">
          <figure className="flex items-center justify-center border border-line bg-surface p-8">
            <img
              src="/assets/logo-stacked.webp"
              alt="Affordable Home Electronics"
              width={880}
              height={590}
              className="h-auto w-full max-w-[440px]"
            />
          </figure>
          <div>
            <h2 className="max-w-[20ch] text-2xl font-semibold leading-[1.06] tracking-tighter text-ink md:text-3xl">
              The same cart, redrawn.
            </h2>
            <p className="mt-4 max-w-[56ch] text-base leading-relaxed text-muted">
              The mark has been on the vans, the invoices and the shopfront since the beginning, so it was rebuilt rather
              than replaced. Same cart, same three stacked words, same blues. The basket keeps its grid, which now doubles
              as a wall of camera feeds.
            </p>
          </div>
        </section>

        <div className="mt-14 grid gap-10 border-t border-line pt-10 sm:grid-cols-3">
          <Stat value={`${years}yr`} label={`Trading from the same address since ${SITE.since}`} />
          <Stat value="22k" label="Line items across the full catalog" />
          <Stat value="150+" label="Manufacturers, from Hikvision and Dahua to Anviz and Ring" />
        </div>
      </Shell>
    </SiteShell>
  );
}
