import { createFileRoute } from "@tanstack/react-router";

import { Clause, PolicyPage } from "../components/site/policy";
import { ORIGIN, SITE } from "../lib/site";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "Shipping | Affordable Home Electronics" },
      {
        name: "description",
        content:
          "How and when orders ship from our Rego Park shop, what delivery costs, and where we can and cannot deliver.",
      },
    ],
    links: [{ rel: "canonical", href: `${ORIGIN}/shipping` }],
  }),
  component: Shipping,
});

function Shipping() {
  return (
    <PolicyPage
      eyebrow="Store policy"
      title="Shipping."
      lead="We ship from the shop in Rego Park, Queens, to anywhere in the United States and Canada. You are also welcome to collect from the counter, which costs nothing and is usually quicker."
    >
      <Clause title="When your order leaves us">
        <p>
          Most orders ship within <b>two business days</b>. We do not process orders at weekends or on public
          holidays.
        </p>
        <p>
          If something on your order turns out to be on backorder, we will tell you and give you the choice: stay on
          backorder, substitute a different item, or cancel. We do not leave you waiting without a word.
        </p>
      </Clause>

      <Clause title="What delivery costs">
        <ul>
          <li>
            <b>$14.95</b> flat to anywhere in the contiguous United States.
          </li>
          <li>
            <b>Free</b> on orders over $199.
          </li>
          <li>
            <b>Free</b> to collect from the shop at {SITE.street}, {SITE.cityLine}.
          </li>
        </ul>
        <p>
          Oversized or overweight items — larger recorders, monitors and some enclosures — may carry additional
          shipping. Where that applies we tell you before you pay. Rush delivery and special handling are available
          and charged at cost; call the shop to arrange it.
        </p>
        <p>Shipping charges are not refundable.</p>
      </Clause>

      <Clause title="How it travels">
        <p>
          We ship by UPS, with tracking. Standard delivery normally takes three to seven business days once the parcel
          leaves us.
        </p>
      </Clause>

      <Clause title="Where we cannot deliver">
        <p>
          UPS cannot deliver to a <b>PO box</b>, to <b>APO, FPO or DPO</b> military addresses, or to most{" "}
          <b>hotels</b>. Please give a street address where somebody can receive the parcel. Our checkout will tell you
          if the address you have entered is one we cannot ship to.
        </p>
      </Clause>

      <Clause title="Orders to Canada">
        <p>
          Canadian orders may be charged <b>duty, taxes and a carrier brokerage fee</b> when they arrive. These are set
          by Canadian customs and by the carrier, not by us. They are payable by you, and we have no way to know the
          amount in advance.
        </p>
      </Clause>

      <Clause title="If it arrives damaged, or does not arrive">
        <p>
          Tell us as soon as you can, and keep the box and the packing material — carriers ask to see them. Call the
          shop on{" "}
          <a href={SITE.phoneHref} className="font-mono">
            {SITE.phone}
          </a>{" "}
          and we will take it from there.
        </p>
      </Clause>

      <Clause title="Paying for your order">
        <p>
          Online we take <b>Visa, Mastercard, American Express and Discover</b>, and <b>PayPal</b>. Card details are
          handled by Stripe and never touch this website.
        </p>
        <p>
          For larger commercial and government orders we also accept <b>wire transfer</b> by arrangement. Call the shop
          to set that up.
        </p>
        <p>Sales tax is calculated at checkout from the delivery address.</p>
      </Clause>
    </PolicyPage>
  );
}
