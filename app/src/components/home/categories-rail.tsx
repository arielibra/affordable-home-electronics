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
import { MoreLink, SectionHead, Shell } from "../site/section";

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

/**
 * Shop by department: one even row of white tiles, an icon and a count each.
 * Departments with nothing in them are left off so no tile leads nowhere.
 */
export function CategoriesRail({
  categories,
  counts,
}: {
  categories: { slug: string; name: string; blurb: string }[];
  counts: Record<string, number>;
}) {
  const stocked = categories.filter((c) => (counts[c.slug] ?? 0) > 0).slice(0, 6);
  return (
    <section className="bg-ground pb-4 pt-12 md:pt-16">
      <Shell>
        <SectionHead
          title="Shop by department"
          aside={
            <Link to="/shop">
              <MoreLink>All departments</MoreLink>
            </Link>
          }
        />
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {stocked.map((c) => {
            const Glyph = GLYPH[c.slug] ?? IconShield;
            return (
              <li key={c.slug}>
                <Link
                  to="/shop/$category"
                  params={{ category: c.slug }}
                  className="group flex h-full flex-col gap-6 rounded-[14px] border border-[#dbe7f3] bg-surface p-4 transition-[border-color,box-shadow] duration-200 hover:border-[#9db6cf] hover:shadow-[0_14px_30px_-22px_rgba(27,58,92,0.55)]"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-[10px] bg-[#e6f1fb] text-signal transition-colors group-hover:bg-signal group-hover:text-white">
                    <Glyph className="h-6 w-6" />
                  </span>
                  <span className="mt-auto">
                    <span className="block text-[16px] font-bold leading-snug text-ink">{c.name}</span>
                    <span className="ahe-live">{counts[c.slug]} products</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Shell>
    </section>
  );
}
