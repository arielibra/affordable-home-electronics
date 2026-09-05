import { createFileRoute } from "@tanstack/react-router";

import { SiteShell } from "../components/site/chrome";
import { QuoteCta } from "../components/site/cta";
import { Eyebrow, Shell, Stat } from "../components/site/section";
import { ORIGIN, SITE } from "../lib/site";

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
      <Shell className="py-14">
        <Eyebrow>About</Eyebrow>
        <h1 className="mt-5 max-w-[16ch] text-4xl font-semibold leading-[0.99] tracking-tighter text-ink md:text-6xl">
          A counter in Rego Park, and a warehouse behind it.
        </h1>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
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
              We ship anywhere in the United States, and to Canada and overseas when other dealers will not bother. Locally
              we install: Queens, Brooklyn, Manhattan, the Bronx, out to Nassau and Westchester when it makes sense. Retail,
              wholesale and government orders all go through the same counter.
            </p>
            <p>
              The website changed. The phone number did not.
            </p>
            <div className="pt-2">
              <QuoteCta>Ask for a quote</QuoteCta>
            </div>
          </div>

          <figure className="border border-line bg-surface p-2.5">
            <img
              src="/assets/counter-shop.png"
              alt="The shop counter with a desk phone, a binder of spec sheets and a coil of coaxial cable"
              width={1344}
              height={752}
              className="block w-full object-cover"
            />
            <figcaption className="px-1 pb-0.5 pt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
              {SITE.street}, {SITE.cityLine}
            </figcaption>
          </figure>
        </div>

        <section className="mt-14 grid gap-8 border-t border-line pt-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14">
          <figure className="flex items-center justify-center border border-line bg-surface p-8">
            <img
              src="/assets/logo-stacked.png"
              alt="Affordable Home Electronics"
              width={1200}
              height={805}
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
