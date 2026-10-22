import { IconShield, IconTruck } from "../site/icons";
import { Eyebrow, Shell } from "../site/section";

const POINTS = [
  {
    big: "0",
    title: "Upsell calls after you order",
    body: "We do not phone you to push accessories or extended warranties. The order ships as you placed it.",
  },
  {
    icon: IconTruck,
    title: "Shipping priced like shipping",
    body: "You see the total before you commit, and we ship to Canada and overseas when other dealers will not.",
  },
  {
    icon: IconShield,
    title: "Trained on the gear we sell",
    body: "Authorized dealers buy direct, get manufacturer training and can actually get a warranty honored.",
  },
  {
    big: "22k",
    title: "Parts behind the counter",
    body: "If the part number exists we can usually get it, including the power supply the manufacturer told you was discontinued.",
  },
] as const;

/** Why buy here: one photo, one headline promise, four short reasons. */
export function WhyBuy() {
  return (
    <section className="bg-surface py-12 md:py-16">
      <Shell>
        <Eyebrow>Why buy here</Eyebrow>
        <h2 className="mt-2 max-w-[24ch] text-[32px] text-ink md:text-[40px]">
          Sealed boxes, real warranties, no follow-up sales call.
        </h2>

        <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="overflow-hidden rounded-[14px] border border-[#dbe7f3] bg-ground">
            <img
              src="/assets/sealed-cartons.webp"
              alt="Three sealed manufacturer cartons with the factory tape intact"
              width={1168}
              height={880}
              loading="lazy"
              className="aspect-[4/3] h-full w-full object-cover"
            />
          </div>

          <div className="grid gap-3">
            <div className="rounded-[14px] bg-ink p-6 text-white">
              <h3 className="ahe-display text-[26px] leading-tight">Authorized dealer for everything we list</h3>
              <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-[#cfe1ef]">
                Genuine USA retail product with the full manufacturer warranty. Not grey market, not open box, not
                repackaged, with every accessory the factory put in the carton.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {POINTS.map((pt) => (
                <div key={pt.title} className="rounded-[14px] border border-[#dbe7f3] bg-ground p-5">
                  {"big" in pt ? (
                    <p className="ahe-display text-[40px] leading-none text-signal">{pt.big}</p>
                  ) : (
                    <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#e6f1fb] text-signal">
                      <pt.icon className="h-6 w-6" />
                    </span>
                  )}
                  <h3 className="mt-3 text-[16px] font-bold leading-snug text-ink">{pt.title}</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-muted">{pt.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Shell>
    </section>
  );
}
