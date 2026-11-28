import { Link, createFileRoute } from "@tanstack/react-router";

import { SiteShell } from "../components/site/chrome";
import { ShopCta } from "../components/site/cta";
import { FaqList, faqJsonLd, type Faq } from "../components/site/faq";
import { Eyebrow, Shell } from "../components/site/section";
import { JsonLd } from "../components/JsonLd";
import { ORIGIN, SITE } from "../lib/site";
import { STORE_ID, pageJsonLd } from "../lib/structured-data";

const PATH = "/authorized-dealer";
const TITLE = "Authorized Security Camera Dealer, Full US Warranty | AHE";
const DESCRIPTION = `Where to buy security cameras that carry the full US manufacturer warranty. Authorized dealer for every brand we sell since ${SITE.since}, including Alibi, LTS, Anviz and ENS, shipping anywhere in the USA.`;

/** Featured lines. The shop is an authorized dealer for every brand it sells (owner, 2026-11-28). */
const BRANDS = [
  { slug: "alibi", name: "Alibi", what: "IP and HD-TVI cameras, PTZ cameras, NVR and DVR recorders" },
  { slug: "lts", name: "LTS", what: "Platinum series cameras and recorders" },
  { slug: "anviz", name: "Anviz", what: "Access control, fingerprint and face readers, time clocks" },
  { slug: "ens", name: "ENS", what: "Cameras, DVRs and NVRs" },
];

const SIGNS = [
  { t: "\"No USA warranty\" or \"international version\"", b: "Some listings say it in small print. It means the US distributor will not repair or replace it." },
  { t: "A price far below everyone else's", b: "Authorized dealers buy at similar cost, so a price 30 or 40 percent under the rest usually has a reason." },
  { t: "A marketplace seller you cannot reach", b: "If the seller is a name on Amazon, eBay or Walmart with no phone number, there is nobody to take a warranty claim to." },
  { t: "Missing or scratched-off serial label", b: "Manufacturers check the serial number on a claim. A missing label usually ends the claim." },
  { t: "Firmware or app in another language", b: "A sign the unit was built for another country's market, where the warranty and the updates are handled differently." },
];

const FAQ: Faq[] = [
  {
    q: "Where can I buy security cameras with a full manufacturer warranty?",
    a: `From the manufacturer or from one of its authorized dealers. Affordable Home Electronics has been an authorized dealer since ${SITE.since} for every brand it sells, including Alibi, LTS, Anviz and ENS, and sells genuine USA stock that carries the full manufacturer warranty. We ship anywhere in the United States.`,
  },
  {
    q: "What does \"authorized dealer\" mean?",
    a: "The manufacturer or its US distributor has approved the dealer to sell its products. The stock comes through the official US channel, so the manufacturer recognises the warranty and supports the product.",
  },
  {
    q: "Are your products new and US-market stock?",
    a: "Yes. Everything we sell is new, genuine USA stock in the manufacturer's packaging. We do not sell grey-market or imported units.",
  },
  {
    q: "How long is the warranty?",
    a: "The manufacturer sets it, and it varies by brand and product. Security cameras and recorders we sell generally carry one or two years. The product page and the maker's warranty statement give the exact term.",
  },
  {
    q: "What happens if something fails under warranty?",
    a: "Contact us first. We take the claim to the manufacturer ourselves and get the item repaired or replaced, so you do not have to deal with the manufacturer on your own.",
  },
  {
    q: "Do you ship outside New York?",
    a: "Yes. We ship to homes and businesses anywhere in the USA, and to Canada. Installation is arranged only in the New York City area; everywhere else the equipment ships for you or your own installer to fit.",
  },
];

export const Route = createFileRoute("/authorized-dealer")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: `${ORIGIN}${PATH}` }],
  }),
  component: AuthorizedDealer,
});

function AuthorizedDealer() {
  const json = pageJsonLd({
    path: PATH,
    name: "Authorized security camera dealer with the full US manufacturer warranty",
    description: DESCRIPTION,
    about: { "@id": STORE_ID },
    extra: [faqJsonLd(PATH, FAQ)],
  });

  return (
    <SiteShell>
      <JsonLd json={json} />

      <section className="bg-ground">
        <Shell className="py-10 lg:py-14">
          <Eyebrow>Authorized dealer · since {SITE.since}</Eyebrow>
          <h1 className="mt-2 max-w-[22ch] text-[38px] text-ink md:text-[54px]">
            Security cameras with the full US manufacturer warranty
          </h1>
          <p className="mt-4 max-w-[64ch] text-[17px] leading-relaxed text-muted">
            The safest place to buy a security camera is from the manufacturer or one of its authorized dealers. We
            have been one since {SITE.since}. Everything we sell is new, genuine USA stock with the full manufacturer
            warranty, shipped to homes and businesses anywhere in the USA. If something fails, we take the claim to
            the manufacturer for you.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ShopCta>Shop the catalog</ShopCta>
            <Link
              to="/warranty"
              className="inline-flex h-12 items-center rounded-[10px] px-6 text-[15px] font-semibold text-ink shadow-[inset_0_0_0_1.5px_#9db6cf] hover:bg-surface"
            >
              Read the warranty policy
            </Link>
          </div>
        </Shell>
      </section>

      <section className="bg-surface py-12 md:py-16">
        <Shell>
          <h2 className="text-[30px] text-ink md:text-[38px]">Authorized for every brand we sell</h2>
          <p className="mt-3 max-w-[64ch] text-[16px] leading-relaxed text-muted">
            Every product on this site comes from an authorized dealer: us. Our main lines are below, and{" "}
            <Link to="/brands" className="font-semibold text-ink underline underline-offset-4">
              the full list of brands
            </Link>{" "}
            is on the brands page.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {BRANDS.map((b) => (
              <Link
                key={b.slug}
                to="/brands/$brand"
                params={{ brand: b.slug }}
                className="group rounded-[14px] border border-[#dbe7f3] bg-ground p-5 hover:border-[#9db6cf]"
              >
                <img src={`/assets/brands/${b.slug}.webp`} alt={`${b.name} logo`} className="h-9 w-auto" loading="lazy" />
                <p className="mt-4 text-[17px] font-bold text-ink">{b.name}</p>
                <p className="mt-1 text-[15px] leading-relaxed text-muted">{b.what}</p>
                <p className="mt-3 text-[14px] font-semibold text-signal group-hover:underline">Shop {b.name} →</p>
              </Link>
            ))}
          </div>
        </Shell>
      </section>

      <Shell className="py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <h2 className="text-[30px] text-ink md:text-[38px]">Why it matters</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-muted">
              A manufacturer's warranty only covers units sold through its own US channel. The same camera bought from
              an unauthorized seller can look identical and cost less, and then turn out to have no warranty on the
              day it stops recording.
            </p>
            <p className="mt-3 text-[16px] leading-relaxed text-muted">
              Before you buy anywhere, ask for written confirmation that the exact model is new, US-market stock and
              covered by the full manufacturer warranty. We will give you that for anything we sell.
            </p>
          </div>
          <div>
            <h2 className="text-[30px] text-ink md:text-[38px]">How to spot grey-market cameras</h2>
            <ul className="mt-4 space-y-3">
              {SIGNS.map((s) => (
                <li key={s.t} className="rounded-[14px] border border-[#dbe7f3] bg-surface p-4">
                  <p className="text-[16px] font-bold text-ink">{s.t}</p>
                  <p className="mt-1 text-[15px] leading-relaxed text-muted">{s.b}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Shell>

      <section id="faq" className="scroll-mt-24 bg-surface py-12 md:py-16">
        <Shell>
          <h2 className="text-[30px] text-ink md:text-[38px]">Questions about warranty and buying</h2>
          <FaqList faq={FAQ} />
        </Shell>
      </section>
    </SiteShell>
  );
}
