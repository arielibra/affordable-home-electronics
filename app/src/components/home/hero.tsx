import { Link } from "@tanstack/react-router";

import { SITE } from "../../lib/site";
import { HalloweenSky } from "../site/halloween";
import { ShopCta } from "../site/cta";
import { Shell } from "../site/section";

type Feed = { src: string; label: string; contain?: boolean; tint?: string };

/**
 * The monitor wall: four screens the way a recorder shows them, each with a
 * live label and a running clock. Two are photos of real installs, two are
 * products from the shop. The clock is a fixed reading on purpose; a ticking
 * one would be motion for its own sake.
 */
const FEEDS: Feed[] = [
  { src: "/assets/monitor-wall.webp", label: "Storefront" },
  { src: "/media/p_7417980f-0115-480a-997a-2683a9d6b02d.webp", label: "LTS 4MP turret", contain: true },
  { src: "/media/p_bf84a8d7-e2c5-4033-b6a2-e8cb5776b454.webp", label: "Anviz VF30 Pro", contain: true, tint: "#cfe1ef" },
  { src: "/assets/hero-storefront.webp", label: "Back office" },
];

function Screen({ f }: { f: Feed }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-white" style={f.tint ? { background: f.tint } : undefined}>
      <img
        src={f.src}
        alt=""
        loading="eager"
        className={`absolute inset-0 h-full w-full ${f.contain ? "object-contain p-2" : "object-cover"}`}
      />
      <span className="ahe-feed-time absolute right-2 top-2 rounded bg-white/85 px-1.5 py-0.5 font-[family-name:var(--font-display)] text-[13px] font-semibold tabular-nums text-ink">
        02:14:07
      </span>
      <span className="ahe-feed-tag absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-md bg-ink/80 px-2 py-1 text-[12px] font-semibold text-white before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#3fe0a0] before:content-['']">
        {f.label}
      </span>
    </div>
  );
}

export function Hero() {
  return (
    <section className="ahe-hero border-b border-line bg-ground">
      <Shell className="grid items-start gap-10 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14 lg:py-16">
        <div className="ahe-rise lg:pt-6">
          <p className="ahe-kicker inline-flex items-center gap-2 text-[14px] font-semibold text-ink-soft before:h-2 before:w-2 before:rounded-full before:bg-[#19a974] before:shadow-[0_0_0_4px_rgba(25,169,116,0.18)] before:content-['']">
            Rego Park, Queens · since {SITE.since}
          </p>
          <h1 className="mt-3 max-w-[14ch] text-[44px] text-ink md:text-[66px]">
            Eyes on every <span className="text-signal ahe-hero-accent">door</span>, day and night.
          </h1>
          <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-muted">
            Cameras, recorders and access control from the brands installers trust. Genuine USA stock, full
            manufacturer warranty, shipped nationwide or installed across New York City.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <ShopCta />
            <Link
              to="/installation"
              className="inline-flex h-12 items-center rounded-[10px] px-6 text-[15px] font-semibold text-ink shadow-[inset_0_0_0_1.5px_#9db6cf] transition-colors hover:bg-surface"
            >
              Book an install
            </Link>
          </div>
        </div>

        <div className="ahe-wall-wrap relative mt-6 lg:mt-0">
          <HalloweenSky />
          <div className="ahe-wall relative z-[1] grid grid-cols-2 gap-2.5 rounded-2xl bg-ink p-2.5 shadow-[0_26px_50px_-30px_rgba(27,58,92,0.7)]">
            {FEEDS.map((f) => (
              <Screen key={f.label} f={f} />
            ))}
          </div>
        </div>
      </Shell>

      <div className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-[1240px] grid-cols-2 md:grid-cols-4">
        {[
          ["Since " + SITE.since, "Over 20 years in Queens"],
          ["Full warranty", "Authorized dealer stock"],
          ["Free shipping", "On orders over $199"],
          ["NYC installs", "By our own technicians"],
        ].map(([title, sub]) => (
          <div key={title} className="border-line px-5 py-4 max-md:[&:nth-child(-n+2)]:border-b md:border-l md:first:border-l-0 md:px-6 [&:nth-child(even)]:border-l">
            <p className="ahe-display text-[24px] leading-none text-ink md:text-[26px]">{title}</p>
            <p className="mt-1 text-[14px] text-muted">{sub}</p>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}
