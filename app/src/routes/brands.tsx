import { Link, createFileRoute } from "@tanstack/react-router";

import { SiteShell } from "../components/site/chrome";
import { Eyebrow, Shell } from "../components/site/section";
import { getBrandIndex } from "../lib/api/store.functions";
import { ORIGIN } from "../lib/site";

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
            <li key={b.brand} className="bg-ground">
              <Link
                to="/search"
                search={{ q: b.brand }}
                className="flex items-center justify-between gap-4 px-1 py-5 transition-colors hover:bg-surface"
              >
                <span className="text-base font-medium text-ink">{b.brand}</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
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
      </Shell>
    </SiteShell>
  );
}
