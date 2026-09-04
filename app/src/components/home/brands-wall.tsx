import { Link } from "@tanstack/react-router";

import { Shell } from "../site/section";

const BRANDS = ["Hikvision", "Dahua", "ALIBI", "LTS", "ENS", "Lorex", "Anviz", "Speco", "Ring", "Q-See", "FingerTec", "ZMODO"];

export function BrandsWall() {
  return (
    <section className="bg-ground py-14">
      <Shell>
        <div className="flex items-end justify-between gap-6 border-b border-line pb-5">
          <h2 className="text-2xl font-semibold leading-none tracking-tighter text-ink">Lines we carry</h2>
          <Link to="/brands" className="shrink-0 border-b border-signal pb-0.5 text-sm text-ink hover:text-signal">
            Full list
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-px border-b border-line bg-line sm:grid-cols-4 lg:grid-cols-6">
          {BRANDS.map((b) => (
            <li
              key={b}
              className="flex h-20 items-center justify-center bg-ground px-3 text-center font-mono text-[13px] uppercase tracking-[0.12em] text-muted transition-colors hover:bg-surface hover:text-ink"
            >
              {b}
            </li>
          ))}
        </ul>
      </Shell>
    </section>
  );
}
