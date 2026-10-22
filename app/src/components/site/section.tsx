import type { ReactNode } from "react";

/**
 * The shared building blocks every storefront page is made of. Keeping them
 * here is what makes the site read as one design: one heading style, one
 * label style, one panel, one spacing rhythm.
 */

export function Shell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1240px] px-5 ${className}`}>{children}</div>;
}

/** Small label above a heading: plain words with the green "live" dot. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 text-[14px] font-semibold text-ink-soft before:h-2 before:w-2 before:shrink-0 before:rounded-full before:bg-[#19a974] before:shadow-[0_0_0_4px_rgba(25,169,116,0.16)] before:content-['']">
      {children}
    </p>
  );
}

/** Section heading row: title (logo lettering), optional lead, optional link on the right. */
export function SectionHead({ title, lead, aside }: { title: string; lead?: string; aside?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="max-w-[22ch] text-[32px] text-ink md:text-[40px]">{title}</h2>
        {lead ? <p className="mt-2 max-w-[60ch] text-[16px] leading-relaxed text-muted">{lead}</p> : null}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  );
}

/** "See all" style link used beside section headings. */
export function MoreLink({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-signal hover:text-ink">
      {children} <span aria-hidden="true">→</span>
    </span>
  );
}

/** A white panel on the light blue page: the site's one card style. */
export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[14px] border border-[#dbe7f3] bg-surface ${className}`}>{children}</div>;
}

/** Standard vertical rhythm for a page section. */
export function Section({
  children,
  className = "",
  tone = "ground",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "ground" | "white";
  id?: string;
}) {
  return (
    <section id={id} className={`py-12 md:py-16 ${tone === "white" ? "bg-surface" : "bg-ground"} ${className}`}>
      {children}
    </section>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="ahe-display text-[40px] leading-none text-ink md:text-[48px]">{value}</p>
      <p className="mt-1.5 text-[15px] leading-snug text-muted">{label}</p>
    </div>
  );
}
