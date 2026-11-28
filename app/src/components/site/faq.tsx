import { ORIGIN } from "../../lib/site";

export type Faq = { q: string; a: string };

/** schema.org FAQPage node for a page's pageJsonLd `extra`. */
export function faqJsonLd(path: string, faq: Faq[]) {
  return {
    "@type": "FAQPage",
    "@id": `${ORIGIN}${path}#faq`,
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

/** Open/close question cards, same look as the buying guide's. */
export function FaqList({ faq }: { faq: Faq[] }) {
  return (
    <div className="mt-6 grid gap-3 md:grid-cols-2">
      {faq.map((f) => (
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
  );
}
