import { Link } from "@tanstack/react-router";
import type { ComponentType, SVGProps } from "react";

import {
  IconBullet,
  IconCable,
  IconDome,
  IconDoorbell,
  IconFinger,
  IconMonitor,
  IconRecorder,
  IconShield,
} from "../site/icons";
import { Shell } from "../site/section";

const GLYPH: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  cameras: IconDome,
  systems: IconBullet,
  recorders: IconRecorder,
  "access-control": IconFinger,
  "doorbells-locks": IconDoorbell,
  monitors: IconMonitor,
  "power-cable": IconCable,
  detection: IconShield,
  tools: IconCable,
  other: IconShield,
};

export function CategoriesRail({
  categories,
  counts,
}: {
  categories: { slug: string; name: string; blurb: string }[];
  counts: Record<string, number>;
}) {
  return (
    <section className="border-b border-line bg-surface py-14">
      <Shell>
        <div className="flex items-end justify-between gap-6">
          <h2 className="text-3xl font-semibold leading-none tracking-tighter text-ink md:text-4xl">Browse the shelves</h2>
          <Link to="/shop" className="shrink-0 border-b border-signal pb-0.5 text-sm text-ink hover:text-signal">
            All categories
          </Link>
        </div>
      </Shell>

      <div className="mt-8 overflow-x-auto pb-2">
        <ul className="mx-auto flex w-max max-w-none gap-4 px-5 lg:px-[max(1.25rem,calc((100vw-1240px)/2+1.25rem))]">
          {categories.map((c) => {
            const Glyph = GLYPH[c.slug] ?? IconShield;
            return (
              <li key={c.slug} className="w-[248px] shrink-0">
                <Link
                  to="/shop/$category"
                  params={{ category: c.slug }}
                  className="group flex h-full flex-col justify-between border border-line bg-ground p-5 transition-colors hover:border-ink hover:bg-surface"
                >
                  <Glyph className="h-7 w-7 text-ink transition-colors group-hover:text-signal" />
                  <div className="mt-10">
                    <p className="text-base font-medium leading-snug text-ink">{c.name}</p>
                    <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                      {counts[c.slug] ?? 0} items
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
