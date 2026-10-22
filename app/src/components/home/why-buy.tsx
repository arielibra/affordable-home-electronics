import { IconShield, IconTruck } from "../site/icons";
import { Eyebrow, Shell } from "../site/section";

export function WhyBuy() {
  return (
    <section className="border-y border-line bg-surface py-16 lg:py-20">
      <Shell>
        <Eyebrow>Why buy here</Eyebrow>
        <h2 className="mt-5 max-w-[20ch] text-3xl font-semibold leading-[1.02] tracking-tighter text-ink md:text-4xl">
          Sealed boxes, real warranties, no follow up sales call.
        </h2>

        <div className="mt-10 grid gap-px border border-line bg-line lg:grid-cols-3 lg:grid-rows-2">
          <figure className="bg-white lg:row-span-2">
            <img
              src="/assets/sealed-cartons.webp"
              alt="Three sealed manufacturer cartons with the factory tape intact"
              width={1168}
              height={880}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </figure>

          <div className="bg-band p-7 text-surface lg:col-span-2">
            <h3 className="text-xl font-semibold tracking-tight">Authorized dealer for everything we list</h3>
            <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-white/65">
              Genuine USA retail product with the full manufacturer warranty. Not grey market, not open box, not
              repackaged, with every accessory the factory put in the carton.
            </p>
          </div>

          <div className="bg-surface p-7">
            <p className="font-mono text-5xl leading-none tracking-tighter text-signal">0</p>
            <h3 className="mt-4 text-base font-medium leading-snug text-ink">Upsell calls after you order</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              We do not phone you to push accessories or extended warranties. The order ships as you placed it.
            </p>
          </div>

          <div className="bg-surface p-7">
            <IconTruck className="h-7 w-7 text-ink" />
            <h3 className="mt-4 text-base font-medium leading-snug text-ink">Shipping priced like shipping</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              You see the total before you commit, and we ship to Canada and overseas when other dealers will not.
            </p>
          </div>
        </div>

        <div className="mt-px grid gap-px border-x border-b border-line bg-line sm:grid-cols-2">
          <div className="bg-surface p-7">
            <IconShield className="h-7 w-7 text-ink" />
            <h3 className="mt-4 text-base font-medium leading-snug text-ink">Trained on the gear we sell</h3>
            <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-muted">
              Authorized dealers buy direct, get manufacturer training and can actually get a warranty honored. That is
              the part you feel two years later, not on the day you buy.
            </p>
          </div>
          <div className="bg-surface p-7">
            <p className="font-mono text-5xl leading-none tracking-tighter text-ink">22k</p>
            <h3 className="mt-4 text-base font-medium leading-snug text-ink">Parts behind the counter</h3>
            <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-muted">
              If the part number exists we can usually get it, including the power supply the manufacturer told you was
              discontinued.
            </p>
          </div>
        </div>
      </Shell>
    </section>
  );
}
