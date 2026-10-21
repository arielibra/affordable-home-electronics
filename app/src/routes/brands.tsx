import { Link, createFileRoute } from "@tanstack/react-router";

import { SiteShell } from "../components/site/chrome";
import { Eyebrow, Shell } from "../components/site/section";
import { getBrandIndex } from "../lib/api/store.functions";
import { ORIGIN } from "../lib/site";
import { JsonLd } from "../components/JsonLd";
import { STORE_ID, pageJsonLd } from "../lib/structured-data";

export const Route = createFileRoute("/brands")({
  loader: () => getBrandIndex(),
  head: () => ({
    meta: [
      { title: "Brands we carry | Affordable Home Electronics" },
      {
        name: "description",
        content:
          "Authorized dealer for Hikvision, Dahua, ALIBI, LTS, ENS, Lorex, Anviz, Speco, Ring and more than 150 other manufacturers.",
      },
    ],
    links: [{ rel: "canonical", href: `${ORIGIN}/brands` }],
  }),
  component: Brands,
});

const ALSO = [
  "Hikvision", "Dahua", "Speco Technology", "Q-See", "SuperCircuits", "Luxor", "IC Realtime", "Virdi",
  "Ultraloq", "Hugolog", "Samsung", "Canon", "Casio", "JVC", "JBL", "Jabra", "Fender", "AudioSource",
  "Belkin", "Monster", "Califone", "HamiltonBuhl", "Acesonic", "Garmin", "SanDisk", "Lenmar",
];

function Brands() {
  const { brands } = Route.useLoaderData();
  return (
    <SiteShell>
      <JsonLd json={pageJsonLd({ type: "CollectionPage", path: "/brands", name: "Brands we carry", description: "Authorized dealer for the security and electronics brands we stock.", mainEntity: { "@type": "ItemList", numberOfItems: brands.length, itemListElement: brands.map((b, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "Brand", name: b.brand } })) } })} />
      <Shell className="py-14">
        <Eyebrow>Lines we carry</Eyebrow>
        <h1 className="mt-5 max-w-[18ch] text-4xl font-semibold leading-[0.99] tracking-tighter text-ink md:text-6xl">
          Authorized on every line we list.
        </h1>
        <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-muted">
          Genuine USA retail product with the full manufacturer warranty. Below is what is on the shelf right now. The full
          book runs past 150 manufacturers, so if you do not see the part number, call and ask.
        </p>

        <h2 className="mt-12 border-b border-line pb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          In stock now
        </h2>
        <ul className="grid gap-px border-b border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b) => (
            <li key={b.slug} className="bg-ground">
              <Link
                to="/search"
                search={{ q: b.brand }}
                className="flex items-center justify-between gap-4 px-1 py-5 transition-colors hover:bg-surface"
              >
                <span className="flex min-w-0 items-center gap-3">
                  {b.logo ? (
                    <img src={b.logo} alt="" loading="lazy" className="h-8 w-8 shrink-0 object-contain" />
                  ) : null}
                  <span className="min-w-0">
                    <span className="block text-base font-medium text-ink">{b.brand}</span>
                    {b.blurb ? <span className="mt-0.5 block truncate text-xs text-muted">{b.blurb}</span> : null}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                  {b.n} {b.n === 1 ? "item" : "items"}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="mt-14 border-b border-line pb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          Also available to order
        </h2>
        <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted">
          {ALSO.map((b) => (
            <li key={b} className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 bg-line" aria-hidden="true" />
              {b}
            </li>
          ))}
        </ul>

        <section className="mt-20" aria-labelledby="why-heading">
          <h2 id="why-heading" className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            Why buying from an authorized dealer matters
          </h2>
          <div className="mt-8 grid gap-px border-y border-line bg-line md:grid-cols-3">
            <div className="bg-ground p-6">
              <h3 className="text-base font-medium text-ink">The warranty actually applies</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Manufacturers honor their warranty on product sold through their own dealer network. Grey-market imports
                and units from unlisted sellers are often refused, and you only find out when something fails.
              </p>
            </div>
            <div className="bg-ground p-6">
              <h3 className="text-base font-medium text-ink">Genuine USA retail stock</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Everything we sell is the US model, with US firmware, the correct power supply and the manufacturer's own
                packaging and documentation. That matters for recorders and cameras that have to talk to each other and to
                the manufacturer's app.
              </p>
            </div>
            <div className="bg-ground p-6">
              <h3 className="text-base font-medium text-ink">We handle the claim</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                If something stops working inside its warranty, email us and we take it to the manufacturer for you. You
                deal with one shop instead of a support queue. Details on the{" "}
                <Link to="/warranty" className="text-ink underline underline-offset-4 hover:text-signal">warranty page</Link>.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16 max-w-[62ch]" aria-labelledby="find-heading">
          <h2 id="find-heading" className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            Looking for a brand or model that is not listed?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            We have been supplying security and electronics since 2003, and the lines above are only what is listed on the
            website today. Search by part number first, since most of our listings include it. If nothing comes up, send us
            the make and model through the{" "}
            <Link to="/contact" className="text-ink underline underline-offset-4 hover:text-signal">contact page</Link> and
            we will tell you whether we can supply it and at what price.
          </p>
        </section>
      </Shell>
    </SiteShell>
  );
}
