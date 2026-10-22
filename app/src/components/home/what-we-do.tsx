import { Eyebrow, Shell } from "../site/section";

const STEPS = [
  {
    title: "Specify the system",
    body: "Tell us the building. We pick the cameras, the recorder, the drive size and the cable run before anyone spends a dollar.",
  },
  {
    title: "Sell it as an authorized dealer",
    body: "Genuine USA stock, sealed by the manufacturer, with every accessory in the box and the full factory warranty behind it.",
  },
  {
    title: "Install it across the boroughs",
    body: "Mounted, aimed, wired and labelled, with the recorder set up and your phone showing the cameras before we leave.",
  },
  {
    title: "Answer the phone afterwards",
    body: "Same number, same people, whether a drive fills up two years later or a camera drifts after a storm.",
  },
];

/** How the shop works: a real sequence, so the steps are numbered. */
export function WhatWeDo() {
  return (
    <section className="bg-ground py-12 md:py-16">
      <Shell className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
        <div className="overflow-hidden rounded-2xl bg-ink p-2.5 shadow-[0_26px_50px_-30px_rgba(27,58,92,0.7)]">
          <img
            src="/assets/monitor-wall.webp"
            alt="A wall mounted pair of monitors above a network video recorder with neatly dressed cabling"
            width={1344}
            height={752}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-lg object-cover"
          />
        </div>

        <div>
          <Eyebrow>How the shop works</Eyebrow>
          <h2 className="mt-2 text-[32px] text-ink md:text-[40px]">Four things, done properly.</h2>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-[14px] border border-[#dbe7f3] bg-surface p-5">
                <span className="ahe-display grid h-8 w-8 place-items-center rounded-lg bg-ink text-[19px] text-white">
                  {i + 1}
                </span>
                <h3 className="mt-3 text-[17px] font-bold leading-snug text-ink">{s.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Shell>
    </section>
  );
}
