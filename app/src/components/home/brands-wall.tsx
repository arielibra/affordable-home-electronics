import { Link } from "@tanstack/react-router";

import { MoreLink, SectionHead, Shell } from "../site/section";

const BRANDS = ["Hikvision", "Dahua", "ALIBI", "LTS", "ENS", "Lorex", "Anviz", "Speco", "Ring", "Q-See", "FingerTec", "ZMODO"];

/** The lines the shop carries, as a calm grid of name tiles. */
export function BrandsWall() {
  return (
    <section className="bg-ground py-12 md:py-16">
      <Shell>
        <SectionHead
          title="Brands we carry"
          aside={
            <Link to="/brands">
              <MoreLink>Full list</MoreLink>
            </Link>
          }
        />
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {BRANDS.map((b) => (
            <li
              key={b}
              className="ahe-display flex h-16 items-center justify-center rounded-[14px] border border-[#dbe7f3] bg-surface px-3 text-center text-[22px] tracking-[0.02em] text-ink-soft"
            >
              {b}
            </li>
          ))}
        </ul>
      </Shell>
    </section>
  );
}
