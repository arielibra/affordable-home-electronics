import { SectionHead, Shell } from "../site/section";

const QUOTES = [
  {
    body: "Affordable Home Electronics was able to provide me with a Q See power supply that even Q See was not able to provide.",
    name: "Ariel Ibra",
    role: "Customer",
  },
  {
    body: "When I would email my questions I received an answer within an hour of my inquiry. Sometimes immediately. Even on Sunday.",
    name: "Richard W.",
    role: "Parker, Arizona",
  },
  {
    body: "You are the only one to accept to ship to Canada and offer a very low price on all.",
    name: "Serge G.",
    role: "Canada",
  },
];

/** Customer words, three even quote cards. */
export function Testimonials() {
  return (
    <section className="bg-surface py-12 md:py-16">
      <Shell>
        <SectionHead title="In their words" />
        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {QUOTES.map((q) => (
            <figure key={q.name} className="flex flex-col rounded-[14px] border border-[#dbe7f3] bg-ground p-6">
              <span className="ahe-display text-[48px] leading-[0.6] text-signal" aria-hidden="true">
                &ldquo;
              </span>
              <blockquote className="mt-3 text-[18px] leading-snug text-ink">{q.body}</blockquote>
              <figcaption className="mt-auto pt-5 text-[14px] text-muted">
                <b className="font-semibold text-ink">{q.name}</b> · {q.role}
              </figcaption>
            </figure>
          ))}
        </div>
      </Shell>
    </section>
  );
}
