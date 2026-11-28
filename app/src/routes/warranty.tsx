import { createFileRoute } from "@tanstack/react-router";

import { Clause, PolicyPage } from "../components/site/policy";
import { ORIGIN, SITE } from "../lib/site";

export const Route = createFileRoute("/warranty")({
  head: () => ({
    meta: [
      { title: "Warranty | Affordable Home Electronics" },
      {
        name: "description",
        content:
          "Authorized dealer, genuine USA stock, full manufacturer warranty — and we take the claim to the manufacturer for you.",
      },
    ],
    links: [{ rel: "canonical", href: `${ORIGIN}/warranty` }],
  }),
  component: Warranty,
});

function Warranty() {
  return (
    <PolicyPage
      path="/warranty"
      eyebrow="Store policy"
      title="Warranty."
      lead="We are an authorized dealer for every line we sell. That matters more than it sounds, and it is the difference between the price we quote and the suspiciously cheap one somewhere else."
    >
      <Clause title="What you are actually buying">
        <p>
          Genuine USA retail stock, carrying the <b>full manufacturer warranty</b> — not grey-market product with an
          import warranty that turns out to be worthless on the day you need it.
        </p>
      </Clause>

      <Clause title="If something fails, call us">
        <p>
          Whatever the age of the equipment, call the shop first on{" "}
          <a href={SITE.phoneHref} className="font-mono">
            {SITE.phone}
          </a>
          .
        </p>
        <p>
          <b>We take the claim to the manufacturer ourselves</b> and get it replaced. You do not sit on hold with a
          manufacturer explaining a fault to somebody who has never seen your system. That is the part of this trade
          that a box-shifter cannot do, and it is why people have bought from us since {SITE.since}.
        </p>
      </Clause>

      <Clause title="How long the cover runs">
        <p>
          The manufacturer sets the term and it varies by brand and product. CCTV equipment we sell generally carries a{" "}
          <b>one or two year</b> warranty.
        </p>
        <p>
          Time-lapse recorders are the exception: <b>six months</b> on the heads and capstan motor, and{" "}
          <b>one year</b> on the rest of the equipment. We still supply and service tape-based systems, which is
          increasingly rare — if you have one running in an older building, we can help with it.
        </p>
      </Clause>

      <Clause title="What is not covered">
        <ul>
          <li>Physical damage, and water where the equipment was not rated for it.</li>
          <li>Power surges and lightning, where no protection was fitted.</li>
          <li>Repairs or modifications carried out by somebody else.</li>
          <li>Installation faults, where the equipment itself is sound.</li>
        </ul>
      </Clause>

      <Clause title="The limit of what we owe">
        <p>
          Our maximum liability arising from any product sold on this site is the price of the product ordered. We are
          not liable for special, indirect, consequential or punitive damages relating to a product sold.
        </p>
      </Clause>

      <Clause title="Which law applies">
        <p>
          These terms are governed by the laws of the State of New York, with venue in the appropriate federal or state
          courts in New York.
        </p>
      </Clause>
    </PolicyPage>
  );
}
