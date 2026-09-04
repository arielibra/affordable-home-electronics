import { createFileRoute } from "@tanstack/react-router";

import { InstallBand } from "../components/home/install-band";
import { SiteShell } from "../components/site/chrome";
import { Eyebrow, Shell, Stat } from "../components/site/section";
import { ORIGIN, SITE } from "../lib/site";

export const Route = createFileRoute("/installation")({
  head: () => ({
    meta: [
      { title: "Security camera installation in NYC | Affordable Home Electronics" },
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

function Installation() {
  return (
    <SiteShell>
      <section className="relative border-b border-line">
        <img
          src="/assets/install-ladder.png"
          alt="An installer on a step ladder mounting a camera under the eave of a New York row house"
          width={1344}
          height={752}
          className="h-[320px] w-full object-cover md:h-[460px]"
        />
      </section>

      <Shell className="py-14">
        <Eyebrow>Installation across the city</Eyebrow>
        <h1 className="mt-5 max-w-[17ch] text-4xl font-semibold leading-[0.99] tracking-tighter text-ink md:text-6xl">
          We do not just ship the box.
        </h1>
        <p className="mt-6 max-w-[60ch] text-base leading-relaxed text-muted md:text-lg">
          Plenty of places will sell you eight cameras. Fewer will climb the ladder, run the cable through a
          hundred year old wall, and still pick up the phone when the drive fills up in {new Date().getFullYear() + 2}.
        </p>

        <div className="mt-12 grid gap-10 border-t border-line pt-10 sm:grid-cols-3">
          <Stat value={`${new Date().getFullYear() - SITE.since}yr`} label="Selling and installing this gear out of Rego Park" />
          <Stat value="5" label="Boroughs covered, plus Nassau and Westchester on request" />
          <Stat value="0" label="Monthly subscription. The system is yours outright" />
        </div>
      </Shell>

      <section className="border-y border-line bg-surface py-16">
        <Shell>
          <h2 className="max-w-[20ch] text-3xl font-semibold leading-[1.04] tracking-tighter text-ink md:text-4xl">
            How an install runs.
          </h2>
          <ol className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.n} className="bg-surface p-7">
                <span className="font-mono text-[13px] text-signal">{s.n}</span>
                <h3 className="mt-4 text-lg font-medium leading-snug text-ink">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.b}</p>
              </li>
            ))}
          </ol>
        </Shell>
      </section>

      <InstallBand />
    </SiteShell>
  );
}
