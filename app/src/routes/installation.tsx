import { createFileRoute } from "@tanstack/react-router";

import { InstallBand } from "../components/home/install-band";
import { CallCta } from "../components/site/cta";
import { SiteShell } from "../components/site/chrome";
import { Eyebrow, Shell } from "../components/site/section";
import { ORIGIN, SITE } from "../lib/site";
import { JsonLd } from "../components/JsonLd";
import { STORE_ID, pageJsonLd } from "../lib/structured-data";

export const Route = createFileRoute("/installation")({
  head: () => ({
    meta: [
      { title: "Camera Installation NYC | Affordable Home Electronics" },
      {
        name: "description",
        content:
          "Camera and access control installation across Queens, Brooklyn, Manhattan and the Bronx. One trip, one bill, no monthly subscription.",
      },
    ],
    links: [{ rel: "canonical", href: `${ORIGIN}/installation` }],
  }),
  component: Installation,
});

const STEPS = [
  { n: "01", t: "A call and a look", b: "You describe the building, or we come by. We work out the coverage, the cable routes and where the recorder lives." },
  { n: "02", t: "A written number", b: "Equipment, labour and materials, itemised. You keep the gear either way, so there is nothing locked to us." },
  { n: "03", t: "The install", b: "Cable pulled, cameras mounted and aimed, recorder configured, drive sized for the retention you asked for." },
  { n: "04", t: "Handover", b: "Your phone shows the cameras before we leave, and you know how to pull a clip when someone asks for one." },
];

const INSTALL_JSON = pageJsonLd({
  path: "/installation",
  name: "Security camera installation in NYC",
  description:
    "Camera and access control installation across Queens, Brooklyn, Manhattan and the Bronx. One trip, one bill, no monthly subscription.",
  mainEntity: { "@id": `${ORIGIN}/installation#service` },
  extra: [
    {
      "@type": "Service",
      "@id": `${ORIGIN}/installation#service`,
      name: "Security camera and access control installation",
      serviceType: "Security camera installation",
      url: `${ORIGIN}/installation`,
      provider: { "@id": STORE_ID },
      description:
        "Site survey, a written itemised quote, cable runs, camera mounting and aiming, recorder setup, and a phone-app handover. No monthly subscription; the system is yours outright.",
      areaServed: [
        ...["Queens", "Brooklyn", "Manhattan", "The Bronx", "Staten Island", "Nassau County", "Westchester County"].map(
          (name) => ({ "@type": "Place", name }),
        ),
      ],
    },
  ],
});

function Installation() {
  return (
    <SiteShell>
      <JsonLd json={INSTALL_JSON} />
      <section className="bg-ground">
        <Shell className="grid items-center gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12 lg:py-14">
          <div>
            <Eyebrow>Installation across the city</Eyebrow>
            <h1 className="mt-2 max-w-[17ch] text-[40px] text-ink md:text-[56px]">We do not just ship the box.</h1>
            <p className="mt-3 max-w-[56ch] text-[17px] leading-relaxed text-muted">
              Plenty of places will sell you eight cameras. Fewer will climb the ladder, run the cable through a
              hundred year old wall, and still pick up the phone when the drive fills up in {new Date().getFullYear() + 2}.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#quote"
                className="inline-flex h-12 items-center rounded-[10px] bg-ink px-7 text-[15px] font-semibold text-white hover:bg-ink-soft"
              >
                Ask for a quote
              </a>
              <CallCta phone={SITE.phone} href={SITE.phoneHref} />
            </div>
          </div>
          <figure className="overflow-hidden rounded-2xl bg-ink p-2.5 shadow-[0_26px_50px_-30px_rgba(27,58,92,0.7)]">
            <img
              src="/assets/install-ladder.webp"
              alt="An installer on a step ladder mounting a camera under the eave of a New York row house"
              width={1344}
              height={752}
              className="aspect-[16/10] w-full rounded-lg object-cover"
            />
          </figure>
        </Shell>
        <Shell className="pb-10">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              [`${new Date().getFullYear() - SITE.since} years`, "Selling and installing this gear out of Rego Park"],
              ["5 boroughs", "Plus Nassau and Westchester on request"],
              ["$0 a month", "No subscription. The system is yours outright"],
            ].map(([v, l]) => (
              <div key={v} className="rounded-[14px] border border-[#dbe7f3] bg-surface p-5">
                <p className="ahe-display text-[32px] leading-none text-ink">{v}</p>
                <p className="mt-1.5 text-[15px] text-muted">{l}</p>
              </div>
            ))}
          </div>
        </Shell>
      </section>

      <section className="bg-surface py-12 md:py-16">
        <Shell>
          <h2 className="max-w-[20ch] text-[32px] text-ink md:text-[40px]">How an install runs</h2>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.n} className="rounded-[14px] border border-[#dbe7f3] bg-ground p-5">
                <span className="ahe-display grid h-8 w-8 place-items-center rounded-lg bg-ink text-[19px] text-white">{i + 1}</span>
                <h3 className="mt-3 text-[17px] font-bold leading-snug text-ink">{s.t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.b}</p>
              </li>
            ))}
          </ol>
        </Shell>
      </section>

      <Shell className="py-12 md:py-16">
        <div className="max-w-[760px] rounded-[14px] border border-[#dbe7f3] bg-surface p-6 md:p-8">
          <Eyebrow>Older systems</Eyebrow>
          <h2 className="mt-2 text-[32px] text-ink md:text-[40px]">We still work on tape.</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-muted">
            Time-lapse recorders, VCR-based systems, the multiplexers that sat beside them. Plenty of buildings in
            Queens still have one running in a closet, and most installers stopped touching them years ago.
          </p>
          <p className="mt-4 text-[16px] leading-relaxed text-muted">
            We supply and service them, and we carry a warranty on the parts that actually fail: six months on heads
            and capstan motors, a year on the rest. If you would rather keep a system that works than replace one that
            does, call the shop on{" "}
            <a href={SITE.phoneHref} className="font-semibold text-ink underline underline-offset-4 hover:text-signal">
              {SITE.phone}
            </a>
            .
          </p>
          <p className="mt-4 text-[16px] leading-relaxed text-muted">
            And when the tape system finally does have to go, we can tell you honestly what it takes to move that
            building to digital — including which cable runs you already have that can be reused.
          </p>
        </div>
      </Shell>

      <InstallBand />
    </SiteShell>
  );
}
