import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { SITE } from "../../lib/site";
import { pageJsonLd } from "../../lib/structured-data";
import { JsonLd } from "../JsonLd";
import { SiteShell } from "./chrome";
import { Eyebrow, Shell } from "./section";

/** The three policy pages share a shape, so they share a frame. */
export function PolicyPage({
  eyebrow,
  title,
  lead,
  path,
  mainEntity,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  /** The page's own address, e.g. "/returns", for its structured data. */
  path?: string;
  mainEntity?: unknown;
  children: ReactNode;
}) {
  const name = title.replace(/\.$/, "");
  return (
    <SiteShell>
      {path ? <JsonLd json={pageJsonLd({ path, name, description: lead, mainEntity })} /> : null}
      <Shell className="py-10 md:py-12">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-2 max-w-[20ch] text-[40px] text-ink md:text-[56px]">{title}</h1>
        <p className="mt-3 max-w-[62ch] text-[17px] leading-relaxed text-muted">{lead}</p>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="rounded-[14px] border border-[#dbe7f3] bg-surface px-5 py-2 md:px-8">{children}</div>

          <aside className="grid gap-3 lg:sticky lg:top-[150px]">
            <nav aria-label="Policies" className="rounded-[14px] border border-[#dbe7f3] bg-surface p-3">
              {[
                ["/shipping", "Shipping"],
                ["/returns", "Returns and refunds"],
                ["/warranty", "Warranty"],
              ].map(([to, label]) => (
                <Link
                  key={to}
                  to={to}
                  className="block rounded-lg px-3 py-2.5 text-[15px] font-semibold text-ink-soft hover:bg-ground hover:text-ink"
                  activeProps={{ className: "bg-[#e6f1fb] text-ink" }}
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="rounded-[14px] bg-ink p-5 text-white">
              <p className="text-[15px] leading-relaxed text-[#dcebfa]">Anything here you want explained? A person answers.</p>
              <a href={SITE.phoneHref} className="ahe-price mt-2 block text-[28px] text-white hover:text-[#9cd8ff]">
                {SITE.phone}
              </a>
            </div>
          </aside>
        </div>
      </Shell>
    </SiteShell>
  );
}

export function Clause({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-[#e6eef6] py-6 first:border-t-0">
      <h2 className="text-[24px] text-ink">{title}</h2>
      <div className="mt-2 max-w-[68ch] space-y-3 text-[16px] leading-relaxed text-ink-soft [&_a]:font-semibold [&_a]:text-signal [&_a]:underline [&_a]:underline-offset-4 [&_li]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
