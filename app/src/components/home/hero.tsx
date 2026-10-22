import { SITE } from "../../lib/site";
import { CallCta, ShopCta } from "../site/cta";
import { Shell } from "../site/section";

export function Hero() {
  return (
    <section className="border-b border-line bg-ground">
      <Shell className="grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
        <div className="ahe-rise">
          <h1 className="max-w-[15ch] text-4xl font-semibold leading-[0.98] tracking-tighter text-ink md:text-6xl">
            Cameras, recorders, and someone who answers.
          </h1>
          <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-muted md:text-lg">
            An authorized dealer in Rego Park since {SITE.since}. Genuine USA stock with the full manufacturer warranty,
            shipped nationwide or installed across New York City.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <ShopCta />
            <CallCta phone={SITE.phone} href={SITE.phoneHref} />
          </div>
        </div>

        <figure className="relative">
          <div className="border border-line bg-surface p-2.5">
            <div className="relative">
              <span className="absolute left-0 top-0 z-10 h-3 w-3 bg-signal" />
              <img
                src="/assets/hero-storefront.webp"
                alt="A dome security camera mounted under the soffit of a brick row house in Queens"
                width={1024}
                height={688}
                className="block w-full object-cover"
              />
            </div>
            <figcaption className="flex items-center justify-between gap-4 px-1 pb-0.5 pt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
              <span>Rego Park, Queens</span>
              <span>Dome install</span>
            </figcaption>
          </div>
        </figure>
      </Shell>
    </section>
  );
}
