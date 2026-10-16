import { createFileRoute } from "@tanstack/react-router";

import { Clause, PolicyPage } from "../components/site/policy";
import { ORIGIN, SITE } from "../lib/site";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns and refunds | Affordable Home Electronics" },
      {
        name: "description",
        content:
          "Our return window, restocking fees, what we can and cannot take back, and how refunds are paid.",
      },
    ],
    links: [{ rel: "canonical", href: `${ORIGIN}/returns` }],
  }),
  component: Returns,
});

function Returns() {
  return (
    <PolicyPage
      path="/returns"
      mainEntity={{
        "@type": "MerchantReturnPolicy",
        applicableCountry: "US",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 10,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/RestockingFees",
        restockingFee: 15,
        merchantReturnLink: `${ORIGIN}/returns`,
      }}
      eyebrow="Store policy"
      title="Returns and refunds."
      lead="Our return policy for online and mail orders. Read it before you buy — under New York law you are entitled to see it first, and we would rather you know where you stand than find out afterwards."
    >
      <Clause title="The window">
        <p>
          You have <b>ten days from delivery</b> to return an item for exchange or refund. We measure it from the day
          the parcel reaches you, not the day we invoiced it, so time spent on a truck is not time off your window.
        </p>
        <p>
          No credit is issued on anything returned more than <b>thirty days</b> after purchase, whatever the reason.
        </p>
      </Clause>

      <Clause title="Call first">
        <p>
          Every return needs an <b>authorization number</b>. Call the shop on{" "}
          <a href={SITE.phoneHref} className="font-mono">
            {SITE.phone}
          </a>{" "}
          and we will give you one.
        </p>
        <p>
          Parcels that arrive without a number take much longer to deal with, because we have no way of telling whose
          they are or what they are for.
        </p>
      </Clause>

      <Clause title="What condition it has to be in">
        <p>
          Original factory condition, with all packaging, accessories, cables and manuals it came with.
        </p>
        <p>
          All returns are subject to a <b>15% restocking fee</b>. Where the goods or the packaging are not complete and
          in mint condition, we reserve the right to increase that to <b>20%</b>.
        </p>
      </Clause>

      <Clause title="What we cannot take back">
        <ul>
          <li>Anything ordered in specially for you.</li>
          <li>Cable cut to length.</li>
          <li>Software and licence keys once the key has been issued.</li>
          <li>Equipment that has been installed, drilled or wired in.</li>
          <li>Hard drives once the seal is broken.</li>
        </ul>
      </Clause>

      <Clause title="Who pays the postage">
        <p>
          Shipping charges are not refundable. If we send a replacement within the return period, we ship it back to
          you at no cost.
        </p>
      </Clause>

      <Clause title="How the money comes back">
        <p>
          Refunds go to the card or PayPal account the order was paid with, once the return has reached us and been
          checked. We cannot refund to a different card, and we do not give cash refunds on orders paid online.
        </p>
      </Clause>

      <Clause title="Cancelling before it ships">
        <p>
          Before checkout you can remove anything from your cart. After that, call the shop — if it has not gone out
          yet we can usually stop it.
        </p>
        <p>
          We may cancel an order ourselves, and if we do we will tell you why.
        </p>
      </Clause>
    </PolicyPage>
  );
}
