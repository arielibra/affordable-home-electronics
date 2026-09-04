import { Eyebrow } from "../site/section";

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

export function WhatWeDo() {
  return (
    <section className="grid border-b border-line lg:grid-cols-2">
      <div className="relative min-h-[320px] bg-ink lg:min-h-[560px]">
        <img
          src="/assets/monitor-wall.png"
          alt="A wall mounted pair of monitors above a network video recorder with neatly dressed cabling"
          width={1344}
          height={752}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      <div className="bg-ground px-5 py-14 sm:px-10 lg:py-20">
        <div className="mx-auto max-w-[560px] lg:mx-0">
          <Eyebrow>How the shop works</Eyebrow>
          <h2 className="mt-5 max-w-[16ch] text-3xl font-semibold leading-[1.02] tracking-tighter text-ink md:text-4xl">
            Four things, done properly.
          </h2>
          <ul className="mt-10">
            {STEPS.map((s, i) => (
              <li key={s.title} className="border-t border-line py-6 last:border-b">
                <div className="flex gap-5">
                  <span className="mt-[7px] h-2 w-2 shrink-0 bg-signal" aria-hidden="true" />
                  <div>
                    <h3 className="text-base font-medium leading-snug text-ink">
                      <span className="mr-3 font-mono text-[13px] text-muted">{String(i + 1).padStart(2, "0")}</span>
                      {s.title}
                    </h3>
                    <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-muted">{s.body}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
