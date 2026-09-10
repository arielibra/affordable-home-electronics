# The payment marks in the footer

The footer currently sets the accepted methods as **type** — small white tiles
reading Visa, Mastercard, Amex, Discover, PayPal, Apple Pay, Google Pay.

That is deliberate, not a placeholder we forgot. Every card network owns its
acceptance mark and requires merchants to display **their** artwork,
unmodified, at a minimum size, with clear space around it. A hand-drawn
approximation is a brand violation, and the networks do occasionally enforce
it. So the real marks get downloaded from each network, not redrawn.

Swapping them in is a two-minute job once the files exist.

## 1. Download the official artwork

SVG where offered, otherwise PNG at 2x or better.

| Mark | Where |
| --- | --- |
| Visa | <https://globalclient.visa.com/brand-mark> — Visa's own brand-mark download. Guidelines at <https://www.merchantsignage.visa.com/brandguidelines> |
| Mastercard | <https://www.mastercard.com/brandcenter/us/en/download-artwork.html> — take the horizontal or stacked **acceptance** mark, not the corporate logo |
| American Express | Amex supplies acceptance marks to merchants through its merchant site; if nothing is downloadable, ask the merchant-services contact on the account for the current digital acceptance mark kit |
| Discover | Discover's brand assets are issued to accepting merchants — request the acceptance mark from Discover merchant services |
| PayPal | <https://www.paypal.com/us/webapps/mpp/logo-center> — PayPal's logo centre, which also has the "Buy now with PayPal" buttons |
| Apple Pay | Apple's Marketing Resources for Apple Pay. Apple's guidelines are strict about the mark being used exactly as supplied |
| Google Pay | Google Pay's brand guidelines page for merchants |

Apple Pay and Google Pay only appear at checkout when the shopper's own device
supports them — Stripe decides that at run time. Showing the marks is still
accurate, because the shop does accept them.

## 2. Drop the files in

Save them into `app/public/pay/` with exactly these names:

```
visa.svg   mastercard.svg   amex.svg   discover.svg
paypal.svg   apple-pay.svg   google-pay.svg
```

If a network only gives you PNG, keep the same base name and change the
extension in the component (one line).

## 3. Flip the switch

In `app/src/components/site/pay-marks.tsx`:

```ts
export const OFFICIAL_MARKS = true;
```

That is the whole change. The same component, the same slots, the same layout —
it just renders the real artwork instead of the type. Both the footer and the
checkout summary pick it up.

## A rule worth remembering

Only show a mark for something the shop genuinely accepts **today**. A PayPal
logo above a checkout with no PayPal button is the kind of small dishonesty a
customer notices at exactly the wrong moment.
