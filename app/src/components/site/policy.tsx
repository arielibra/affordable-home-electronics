import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { SITE } from "../../lib/site";
import { SiteShell } from "./chrome";
import { Eyebrow, Shell } from "./section";

/** The three policy pages share a shape, so they share a frame. */
export function PolicyPage({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <SiteShell>
      <Shell className="py-14">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-5 max-w-[20ch] text-4xl font-semibold leading-[0.99] tracking-tighter text-ink md:text-5xl">
          {title}
        </h1>
        <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-muted">{lead}</p>

        <div className="mt-12 max-w-[68ch]">{children}</div>

        <div className="mt-16 border-t border-line pt-8">
          <p className="max-w-[62ch] text-sm leading-relaxed text-muted">
            Anything here you want explained, call the shop on{" "}
            <a href={SITE.phoneHref} className="font-mono text-ink underline underline-offset-4">
              {SITE.phone}
            </a>
            . A person answers.
          </p>
          <nav className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link to="/shipping" className="text-ink underline underline-offset-4 hover:text-signal">
              Shipping
            </Link>
            <Link to="/returns" className="text-ink underline underline-offset-4 hover:text-signal">
              Returns and refunds
            </Link>
            <Link to="/warranty" className="text-ink underline underline-offset-4 hover:text-signal">
              Warranty
            </Link>
          </nav>
        </div>
      </Shell>
    </SiteShell>
  );
}

export function Clause({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line py-7 first:border-t-0 first:pt-0">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{title}</h2>
      <div className="mt-3 space-y-3 text-base leading-relaxed text-ink [&_a]:underline [&_a]:underline-offset-4 [&_li]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
