import { Shell } from "../site/section";

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

export function Testimonials() {
  return (
    <section className="border-t border-line bg-surface py-16">
      <Shell>
        <h2 className="text-2xl font-semibold leading-none tracking-tighter text-ink">In their words</h2>
        <div className="mt-10 grid gap-px bg-line lg:grid-cols-3">
          {QUOTES.map((q) => (
            <figure key={q.name} className="bg-surface lg:px-8 lg:first:pl-0 lg:last:pr-0">
              <span className="block h-2 w-2 bg-signal" aria-hidden="true" />
              <blockquote className="mt-5 max-w-[40ch] text-lg leading-snug tracking-tight text-ink">
                &ldquo;{q.body}&rdquo;
              </blockquote>
              <figcaption className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                {q.name}
                <span className="mx-2 text-line">/</span>
                {q.role}
              </figcaption>
            </figure>
          ))}
        </div>
      </Shell>
    </section>
  );
}
