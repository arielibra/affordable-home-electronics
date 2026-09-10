# The payment marks in the footer

The footer shows real acceptance marks, not type. The files live in
`app/public/pay/` and `app/public/pay/SOURCES.md` records where each one came
from.

| Mark | File | Where it came from |
| --- | --- | --- |
| Visa | `visa.svg` | `payment-icons` flat set, MPL-2.0 |
| Mastercard | `mastercard.svg` | same |
| American Express | `amex.svg` | same |
| Discover | `discover.svg` | same |
| PayPal | `paypal.svg` | same |
| Apple Pay | `apple-pay.svg` | `simple-icons` glyph (CC0-1.0) set on a white plate |
| Google Pay | `google-pay.svg` | same |

Apple Pay and Google Pay only appear at checkout when the shopper's own device
supports them — Stripe decides that at run time. Showing the marks is still
accurate, because the shop does accept them.

## Replacing one with the network's own artwork

A licence on a file is not a licence on a trademark. Displaying these is fine
because the shop genuinely accepts every one of them, which is exactly what an
acceptance mark is for. But each network publishes current artwork and asks
merchants to use it unmodified, and two of them issue it to accepting merchants
directly rather than posting it publicly:

| Mark | Where the official file comes from |
| --- | --- |
| Visa | <https://globalclient.visa.com/brand-mark>, guidelines at <https://www.merchantsignage.visa.com/brandguidelines> |
| Mastercard | <https://www.mastercard.com/brandcenter/us/en/download-artwork.html> — the **acceptance** mark, not the corporate logo |
| American Express | Issued through Amex merchant services; ask the contact on the account for the current digital acceptance mark kit |
| Discover | Issued through Discover merchant services |
| PayPal | <https://www.paypal.com/us/webapps/mpp/logo-center> |
| Apple Pay | Apple's Marketing Resources for Apple Pay. Apple is strict about the mark being used exactly as supplied, and it is the one here most worth replacing — this version is a monochrome glyph, not Apple's supplied badge |
| Google Pay | Google Pay brand guidelines for merchants. Google's own mark is in colour; the file here is monochrome |

Swapping any of them is a file swap and nothing else: same folder, same name,
same size. Nothing in the code changes.

## If a file ever goes missing

`app/src/components/site/pay-marks.tsx` has `OFFICIAL_MARKS`. Set it to `false`
and the row falls back to plain type tiles, which is the right behaviour if the
artwork is ever pulled.

## A rule worth remembering

Only show a mark for something the shop genuinely accepts **today**. A PayPal
logo above a checkout with no PayPal button is the kind of small dishonesty a
customer notices at exactly the wrong moment.
