import { Link, createFileRoute } from "@tanstack/react-router";

import { JsonLd } from "../components/JsonLd";
import { SiteShell } from "../components/site/chrome";
import { CallCta, ShopCta } from "../components/site/cta";
import { ProductCard } from "../components/site/product-card";
import { Eyebrow, SectionHead, Shell } from "../components/site/section";
import { getProductsBySlugs } from "../lib/api/store.functions";
import { ORIGIN, SITE, money } from "../lib/site";
import { pageJsonLd } from "../lib/structured-data";

/**
 * Buying guide: "affordable security cameras and surveillance equipment".
 *
 * Google's first page for "affordable security cameras" (9,900 searches a
 * month, Nov 2026) is all buying guides, no shops, so a category page cannot
 * rank for it however it is tuned. This page answers the question the
 * searcher is asking, with the shop's own products.
 *
 * Every price on the page comes from the live catalog (productsBySlugs), so it
 * can never disagree with the product page. A product that is hidden or
 * deleted drops out of its section and out of any build that needs it; the
 * build is then not shown at all rather than shown with a wrong total.
 */

const PATH = "/affordable-security-cameras";
const TITLE = "Affordable Security Cameras: What a Good System Costs";
const DESCRIPTION =
  "What a good security camera system really costs, from a single add-on camera to a full 8-camera setup. Real prices, no monthly fees, from an authorized dealer selling since 2003.";

/** Cameras that add to a recorder someone already has. */
const ADD_ON = ["ali-ab22-ua-d", "ens-hcc3120r-irl-z-2mp-hdcvi-ir-bullet-camera-200-ft-range", "ali-fb41-a-d", "ali-ab81-ua-d"];

/** Step-up and serious-property picks. */
const STEP_UP = [
  "ali-hr163f-2-d",
  "ali-pz41-vuzai-d",
  "ali-xb40-vuzai-anpr-d",
  "lts-ltn8932d-n-platinum-nvr-32ch-256mbps-up-to-the-32mp-recording-4-sa",
];

/** `via`: an add-on bought from another product's page (a drive fitted to its recorder). */
type Part = { slug: string; qty: number; via?: string };
type Build = { id: string; name: string; who: string; why: string; parts: Part[] };

/** Starter systems. Each pairs a recorder with cameras of the same brand and
 *  signal type, so there is no compatibility guesswork. */
const BUILDS: Build[] = [
  {
    id: "network",
    name: "New network system, 4 cameras",
    who: "A house or small shop wiring from scratch.",
    why: "One network cable per camera carries power and video. The recorder has eight power-over-ethernet ports and a 2TB drive already fitted, so four more cameras can go on later without a new box.",
    parts: [
      { slug: "ens-ed9308h5nv-8p-3-2tb-8channels-8poe-titanium-high-definition-nvr-2t", qty: 1 },
      { slug: "ens-ip-5ird4s4c4-28-titanium-ipc-4mp-dome-turret-camera-2-8mm-fixed", qty: 4 },
    ],
  },
  {
    id: "coax",
    name: "Replace an old system, keep the coax",
    who: "A building that already has camera cable in the walls.",
    why: "Old analog cameras ran on coax. A 4-in-1 camera and a hybrid recorder reuse that cable, which is usually the most expensive part of an install. The recorder comes without a drive: pick the 2TB drive on its page and it arrives fitted.",
    parts: [
      { slug: "ali-hr043f-1-d", qty: 1 },
      { slug: "alibi-addon-hdd-2tb-preinstalled", qty: 1, via: "ali-hr043f-1-d" },
      { slug: "ali-ab22-ua-d", qty: 4 },
    ],
  },
];

const ALL = [...new Set([...ADD_ON, ...STEP_UP, ...BUILDS.flatMap((b) => b.parts.map((p) => p.slug))])];

const FAQ: { q: string; a: string }[] = [
  {
    q: "How much does a decent security camera system cost?",
    a: "For a house or a small shop, a recorder and four good wired cameras usually comes to between $700 and $900 in equipment, with nothing to pay monthly. A single extra camera for a system you already have starts at about $60. Larger buildings with 8 to 16 cameras, zoom cameras or plate reading run from about $1,500 up.",
  },
  {
    q: "Do I need a monthly subscription?",
    a: "Not with a recorder system. The cameras record to a hard drive in the recorder, on your property, and the free phone app shows live video and recordings. Many budget Wi-Fi cameras sold for $30 to $50 save video to the maker's cloud, which is where the monthly fee comes from.",
  },
  {
    q: "Is a cheap Wi-Fi camera good enough?",
    a: "For one apartment door, often yes. For a whole house or a business, wired cameras are more reliable: they do not drop off when the Wi-Fi is busy, they do not need batteries charged, and the recorder keeps everything even if the internet goes down. A Wi-Fi camera still needs a power outlet nearby unless it runs on batteries.",
  },
  {
    q: "Can I reuse the coax cable from an old camera system?",
    a: "Usually, yes. 4-in-1 cameras (HD-TVI, AHD, CVI and analog) work over standard coax with a hybrid DVR, so you can replace old cameras and the recorder without pulling new cable. If the cable is damaged or very long, a network system is the better choice.",
  },
  {
    q: "What resolution do I need?",
    a: "2MP (1080p) is enough to recognise a face at a door or across a counter. 4MP is a good all-round choice for yards and driveways. 8MP (4K) is worth it for wide areas where you want to zoom into a recording later, and for reading licence plates you need a dedicated plate camera.",
  },
  {
    q: "How many days of video will the hard drive hold?",
    a: "Roughly three weeks of continuous recording from four 4MP cameras on a 2TB drive with H.265 compression. Recording on motion only, which most people use, stretches that a long way. More cameras, higher resolution or a busy scene shortens it.",
  },
  {
    q: "Do you install, or do I do it myself?",
    a: "Either. Everything ships nationwide for you or your installer to fit. In New York City we arrange installation, with a written quote before any work starts.",
  },
];

export const Route = createFileRoute("/affordable-security-cameras")({
  loader: () => getProductsBySlugs({ data: { slugs: ALL } }),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: `${ORIGIN}${PATH}` }],
  }),
  component: Guide,
});

function Guide() {
  const { products } = Route.useLoaderData();
  const by = new Map(products.map((p) => [p.slug, p]));
  const pick = (slugs: string[]) => slugs.map((s) => by.get(s)).filter((p): p is NonNullable<typeof p> => Boolean(p));

  // A build is only shown when every part is live, so a total is never wrong.
  const builds = BUILDS.map((b) => {
    const lines = b.parts.map((pt) => ({ ...pt, p: by.get(pt.slug) }));
    if (lines.some((l) => !l.p)) return null;
    const total = lines.reduce((s, l) => s + (l.p?.price_cents ?? 0) * l.qty, 0);
    const list = lines.reduce((s, l) => s + (l.p?.msrp_cents ?? l.p?.price_cents ?? 0) * l.qty, 0);
    return { ...b, lines, total, list };
  }).filter((b): b is NonNullable<typeof b> => Boolean(b));

  const json = pageJsonLd({
    type: "WebPage",
    path: PATH,
    name: "Affordable security cameras: what a good system really costs",
    description: DESCRIPTION,
    extra: [
      {
        "@type": "FAQPage",
        "@id": `${ORIGIN}${PATH}#faq`,
        mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  });

  return (
    <SiteShell>
      <JsonLd json={json} />

      <section className="bg-ground">
        <Shell className="py-10 lg:py-14">
          <Eyebrow>Buying guide · security cameras and surveillance equipment</Eyebrow>
          <h1 className="mt-2 max-w-[22ch] text-[38px] text-ink md:text-[54px]">
            Affordable security cameras: what a good system really costs
          </h1>
          <p className="mt-4 max-w-[62ch] text-[17px] leading-relaxed text-muted">
            What each budget buys, what you can skip, and where cheap cameras end up costing more. Every price on
            this page is our live price, and none of it comes with a monthly fee. We have sold and installed CCTV in New York
            since {SITE.since}.
          </p>
          <nav aria-label="On this page" className="mt-6 flex flex-wrap gap-2 text-[14px]">
            {[
              ["#budgets", "What each budget gets you"],
              ["#builds", "Starter systems, priced"],
              ["#wifi", "Wi-Fi or wired?"],
              ["#faq", "Questions"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="rounded-full bg-surface px-4 py-2 font-medium text-ink shadow-[inset_0_0_0_1px_#dbe7f3] hover:shadow-[inset_0_0_0_1.5px_#9db6cf]"
              >
                {label}
              </a>
            ))}
          </nav>
        </Shell>
      </section>

      <section id="budgets" className="scroll-mt-24 bg-surface py-12 md:py-16">
        <Shell>
          <h2 className="max-w-[24ch] text-[30px] text-ink md:text-[38px]">What each budget actually gets you</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              {
                t: "Under $150",
                b: "One more camera for a recorder you already have. Good 2MP and 4MP cameras start around $60, and a 4-in-1 camera works with most HD DVRs from the last ten years.",
              },
              {
                t: "$700 to $900",
                b: "A complete system for a house or small shop: a recorder with a hard drive and four wired cameras. Phone viewing included, no subscription.",
              },
              {
                t: "$1,500 and up",
                b: "8 to 32 cameras, 4K, zoom cameras that follow movement, and licence plate reading. This is where a site visit pays for itself.",
              },
            ].map((x) => (
              <div key={x.t} className="rounded-[14px] border border-[#dbe7f3] bg-ground p-5">
                <h3 className="text-[22px] font-bold text-ink">{x.t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{x.b}</p>
              </div>
            ))}
          </div>

          {pick(ADD_ON).length ? (
            <>
              <h3 className="mt-10 text-[20px] font-bold text-ink">Add-on cameras that start around $60</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                {pick(ADD_ON).map((p) => (
                  <ProductCard key={p.slug} p={p} />
                ))}
              </div>
            </>
          ) : null}
        </Shell>
      </section>

      {builds.length ? (
        <section id="builds" className="scroll-mt-24 bg-ground py-12 md:py-16">
          <Shell>
            <SectionHead
              title="Starter systems, priced"
              lead="Each one pairs a recorder with cameras of the same brand and signal type, so everything works together out of the box."
            />
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {builds.map((b) => (
                <article key={b.id} className="flex flex-col rounded-[16px] border border-[#dbe7f3] bg-surface p-5 md:p-6">
                  <h3 className="text-[22px] font-bold text-ink">{b.name}</h3>
                  <p className="mt-1 text-[15px] font-medium text-ink-soft">{b.who}</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted">{b.why}</p>
                  <ul className="mt-4 divide-y divide-[#e6eef7] border-y border-[#e6eef7]">
                    {b.lines.map((l) => (
                      <li key={l.slug} className="flex items-baseline justify-between gap-4 py-2.5 text-[15px]">
                        <Link to="/p/$slug" params={{ slug: l.via ?? l.slug }} className="min-w-0 text-ink hover:text-signal">
                          <span className="text-muted">{l.qty} ×</span> {l.p?.name}
                        </Link>
                        <span className="shrink-0 tabular-nums text-ink">{money((l.p?.price_cents ?? 0) * l.qty)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex items-baseline justify-between gap-4">
                    <span className="text-[15px] text-muted">Equipment total</span>
                    <span className="text-right">
                      <span className="ahe-price block text-[28px] text-ink">{money(b.total)}</span>
                      {b.list > b.total ? (
                        <span className="text-[14px] text-muted">
                          {money(b.list)} at list price · you save {money(b.list - b.total)}
                        </span>
                      ) : null}
                    </span>
                  </div>
                </article>
              ))}
            </div>
            <p className="mt-4 max-w-[70ch] text-[14px] leading-relaxed text-muted">
              Totals are equipment only, before shipping and tax. Network cable, connectors and power for the coax build are
              extra if you do not already have them.
            </p>
          </Shell>
        </section>
      ) : null}

      <section id="wifi" className="scroll-mt-24 bg-surface py-12 md:py-16">
        <Shell className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="max-w-[20ch] text-[30px] text-ink md:text-[38px]">Wi-Fi camera or a wired system?</h2>
            <p className="mt-3 max-w-[56ch] text-[16px] leading-relaxed text-muted">
              The $30 to $50 Wi-Fi cameras in big-box stores are a fair choice for one apartment door. Past that, the cheap
              option tends to cost more.
            </p>
          </div>
          <div className="grid gap-3">
            {[
              ["The monthly fee", "Many budget Wi-Fi cameras keep your video in the maker's cloud, and keeping more than a short clip history usually means a subscription, per camera or per home. A recorder keeps it on your own hard drive for free."],
              ["Dropped video", "Wi-Fi cameras share the signal with everything else in the house. Wired cameras do not stutter when someone starts streaming."],
              ["Batteries and outlets", "A Wi-Fi camera still needs an outlet or a battery you recharge. A network camera gets power down the same cable as the video."],
              ["When the internet goes down", "A recorder keeps recording. A cloud camera usually does not."],
            ].map(([t, b]) => (
              <div key={t} className="rounded-[14px] border border-[#dbe7f3] bg-ground p-5">
                <h3 className="text-[17px] font-bold text-ink">{t}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{b}</p>
              </div>
            ))}
          </div>
        </Shell>
      </section>

      {pick(STEP_UP).length ? (
        <section className="bg-ground py-12 md:py-16">
          <Shell>
            <SectionHead
              title="For bigger buildings"
              lead="More channels, zoom cameras that follow a person across a lot, and cameras that read licence plates."
              aside={
                <Link to="/security-cameras" className="text-[15px] font-semibold text-signal hover:text-ink">
                  All security cameras
                </Link>
              }
            />
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {pick(STEP_UP).map((p) => (
                <ProductCard key={p.slug} p={p} />
              ))}
            </div>
          </Shell>
        </section>
      ) : null}

      <section id="faq" className="scroll-mt-24 bg-surface py-12 md:py-16">
        <Shell>
          <h2 className="text-[30px] text-ink md:text-[38px]">Questions people ask before they buy</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-[14px] border border-[#dbe7f3] bg-ground p-5 open:bg-surface">
                <summary className="cursor-pointer list-none text-[17px] font-bold text-ink marker:hidden">
                  <span className="flex items-start justify-between gap-4">
                    {f.q}
                    <span aria-hidden className="mt-0.5 shrink-0 text-signal transition-transform group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </Shell>
      </section>

      <section className="bg-ground py-12 md:py-16">
        <Shell className="flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="max-w-[24ch] text-[28px] text-ink md:text-[34px]">Not sure what your building needs?</h2>
            <p className="mt-2 max-w-[56ch] text-[16px] leading-relaxed text-muted">
              Tell us the property and how many doors and areas you want covered. We will price it, and in New York City we
              can <Link to="/installation" className="font-semibold text-ink underline underline-offset-4">arrange the install</Link>.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ShopCta category="cameras">Shop cameras</ShopCta>
            <CallCta phone={SITE.phone} href={SITE.phoneHref} />
          </div>
        </Shell>
      </section>
    </SiteShell>
  );
}
