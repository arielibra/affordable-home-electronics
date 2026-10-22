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
      <Shell className="py-10 md:py-12">
        <Eyebrow>Lines we carry</Eyebrow>
        <h1 className="mt-2 max-w-[18ch] text-[40px] text-ink md:text-[56px]">
          Authorized on every line we list.
        </h1>
        <p className="mt-3 max-w-[62ch] text-[17px] leading-relaxed text-muted">
          Genuine USA retail product with the full manufacturer warranty. Below is what is on the shelf right now. The full
          book runs past 150 manufacturers, so if you do not see the part number, call and ask.
        </p>

        <h2 className="mt-8 text-[26px] text-ink">In stock now</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b) => (
            <li key={b.slug}>
              <Link
                to="/search"
                search={{ q: b.brand }}
                className="flex h-full items-center justify-between gap-4 rounded-[14px] border border-[#dbe7f3] bg-surface p-4 transition-[border-color,box-shadow] hover:border-[#9db6cf] hover:shadow-[0_14px_30px_-22px_rgba(27,58,92,0.55)]"
              >
                <span className="flex min-w-0 items-center gap-3">
                  {b.logo ? (
                    <img src={b.logo} alt="" loading="lazy" className="h-8 w-8 shrink-0 object-contain" />
                  ) : null}
                  <span className="min-w-0">
                    <span className="ahe-display block text-[22px] leading-tight text-ink">{b.brand}</span>
                    {b.blurb ? <span className="mt-0.5 block truncate text-[14px] text-muted">{b.blurb}</span> : null}
                  </span>
                </span>
                <span className="ahe-live shrink-0">
                  {b.n} {b.n === 1 ? "item" : "items"}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="mt-10 text-[26px] text-ink">
          Also available to order
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {ALSO.map((b) => (
            <li key={b} className="rounded-full border border-[#dbe7f3] bg-surface px-3.5 py-1.5 text-[14px] font-medium text-ink-soft">
              {b}
            </li>
          ))}
        </ul>

        <section className="mt-12" aria-labelledby="why-heading">
          <h2 id="why-heading" className="text-[32px] text-ink md:text-[40px]">
            Why buying from an authorized dealer matters
          </h2>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-[14px] border border-[#dbe7f3] bg-surface p-5">
              <h3 className="text-[17px] font-bold text-ink">The warranty actually applies</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                Manufacturers honor their warranty on product sold through their own dealer network. Grey-market imports
                and units from unlisted sellers are often refused, and you only find out when something fails.
              </p>
            </div>
            <div className="rounded-[14px] border border-[#dbe7f3] bg-surface p-5">
              <h3 className="text-[17px] font-bold text-ink">Genuine USA retail stock</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                Everything we sell is the US model, with US firmware, the correct power supply and the manufacturer's own
                packaging and documentation. That matters for recorders and cameras that have to talk to each other and to
                the manufacturer's app.
              </p>
            </div>
            <div className="rounded-[14px] border border-[#dbe7f3] bg-surface p-5">
              <h3 className="text-[17px] font-bold text-ink">We handle the claim</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                If something stops working inside its warranty, email us and we take it to the manufacturer for you. You
                deal with one shop instead of a support queue. Details on the{" "}
                <Link to="/warranty" className="font-semibold text-signal underline underline-offset-4 hover:text-ink">warranty page</Link>.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12 max-w-[760px] rounded-[14px] bg-ink p-6 text-white md:p-8 [&_a]:text-[#9cd8ff] [&_h2]:!text-white [&_p]:!text-[#dcebfa]" aria-labelledby="find-heading">
          <h2 id="find-heading" className="text-[32px] text-ink md:text-[40px]">
            Looking for a brand or model that is not listed?
          </h2>
          <p className="mt-2 text-[16px] leading-relaxed text-muted">
            We have been supplying security and electronics since 2003, and the lines above are only what is listed on the
            website today. Search by part number first, since most of our listings include it. If nothing comes up, send us
            the make and model through the{" "}
            <Link to="/contact" className="font-semibold text-signal underline underline-offset-4 hover:text-ink">contact page</Link> and
            we will tell you whether we can supply it and at what price.
          </p>
        </section>
      </Shell>
    </SiteShell>
  );
}
