import { Link } from "@tanstack/react-router";

import { SITE } from "../../lib/site";
import { HalloweenSky } from "../site/halloween";
import { ShopCta } from "../site/cta";
import { Shell } from "../site/section";
import { HeroSlides } from "./hero-slides";

export function Hero() {
  return (
    <section className="ahe-hero border-b border-line bg-ground">
      <Shell className="pt-10 pb-8 lg:pt-12 lg:pb-10">
        <div className="ahe-rise grid items-end gap-6 lg:grid-cols-[1fr_auto] lg:gap-10">
          <div>
            <p className="ahe-kicker inline-flex items-center gap-2 text-[14px] font-semibold text-ink-soft before:h-2 before:w-2 before:rounded-full before:bg-[#19a974] before:shadow-[0_0_0_4px_rgba(25,169,116,0.18)] before:content-['']">
              Rego Park, Queens · since {SITE.since}
            </p>
            <h1 className="mt-3 max-w-[22ch] text-[40px] text-ink md:text-[58px]">
              Eyes on every <span className="text-signal ahe-hero-accent">door</span>, day and night.
            </h1>
            <p className="mt-4 max-w-[62ch] text-[17px] leading-relaxed text-muted">
              Cameras, recorders and access control from the brands installers trust. Genuine USA stock, full
              manufacturer warranty, shipped nationwide or installed across New York City.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 lg:pb-1">
            <ShopCta />
            <Link
              to="/installation"
              className="inline-flex h-12 items-center rounded-[10px] px-6 text-[15px] font-semibold text-ink shadow-[inset_0_0_0_1.5px_#9db6cf] transition-colors hover:bg-surface"
            >
              Book an install
            </Link>
          </div>
        </div>

        <div className="ahe-wall-wrap relative mt-8">
          <HalloweenSky />
          <div className="relative z-[1]">
            <HeroSlides />
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
