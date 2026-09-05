# Turning on card payment

The code is finished and deployed. Everything below is account setup, and all of
it has to be done by the business owner, not by me.

## Why I cannot finish this for you

Switching payment on needs a Stripe **secret key**. That key can move money out
of the account, so it should only ever be typed by the owner into the hosting
platform. Do not paste it into a chat, an email, or a document. That means the
last two steps are yours.

## 1. Create the Stripe account

At stripe.com. It asks for the legal business name, address, EIN or SSN, a
description of what is sold, and the bank account that gets paid out. Budget
fifteen minutes and have the paperwork nearby. Nothing else here works until
this is done.

Fees at the time of writing are 2.9% plus 30 cents per card charge. Stripe Tax
adds roughly 0.5%. Check current numbers on Stripe's pricing page.

## 2. Turn on Stripe Tax

Dashboard, Tax, then set the **origin address** to 62-65 Saunders Street, Rego
Park, NY 11374 and register New York as a place where tax is collected. The
checkout is built with automatic tax enabled, so if this is skipped, every
payment attempt fails with a tax error rather than silently undercharging.

Confirm the registrations with the accountant. I am not a tax adviser and this
is not tax advice.

## 3. Choose which payment methods to accept

Dashboard, Settings, Payment methods. Cards are on by default. Apple Pay, Google
Pay and Link cost nothing extra and noticeably lift completion on phones. The
checkout picks up whatever is enabled there; no code change needed.

## 4. Add the webhook

Dashboard, Developers, Webhooks, Add endpoint.

- URL: `https://YOUR-DOMAIN/api/stripe-webhook`
- Events: `checkout.session.completed` and `checkout.session.async_payment_succeeded`

Stripe then shows a **signing secret** starting `whsec_`. Keep it with the API
key. The webhook is what actually marks an order paid, records the address and
empties the basket, so orders will sit unconfirmed without it.

## 5. Set the two secrets

The site reads exactly two:

| Name | Where it comes from |
|---|---|
| `STRIPE_SECRET_KEY` | Developers, API keys. Starts `sk_test_` then `sk_live_`. |
| `STRIPE_WEBHOOK_SECRET` | The endpoint you just created. Starts `whsec_`. |

On Cloudflare, from the `app/` folder:

    npx wrangler secret put STRIPE_SECRET_KEY
    npx wrangler secret put STRIPE_WEBHOOK_SECRET

It prompts, you paste, nothing is written to disk or into git. Until both exist
the checkout page automatically falls back to the phone-order flow, so the site
keeps working and simply does not offer a card button.

## 6. Test before going live

Use the `sk_test_` key first and a separate test-mode webhook. Card `4242 4242
4242 4242`, any future expiry, any CVC. Walk a real order through and confirm:

- the total on Stripe matches the cart plus shipping plus tax
- the order lands in the database with status `paid`
- the basket empties afterwards
- a receipt arrives by email

Then swap both secrets for the live ones and run one small real purchase.

## What the code does

- `/api/checkout` builds a Stripe Checkout Session from the cart in the
  database, adds shipping options, and returns the hosted payment URL.
- Card details never touch this site. Stripe hosts the payment page, which keeps
  the compliance burden at the lowest tier.
- `/api/stripe-webhook` verifies Stripe's signature using Web Crypto, refuses
  anything older than five minutes, and only then marks the order paid.
- `/order-confirmed` polls briefly for the webhook, and explains itself calmly
  if the confirmation is slow rather than claiming the order failed.

## Shipping and tax settings

In `app/src/lib/stripe.server.ts`:

    SHIPPING_FLAT_CENTS = 1495              // $14.95
    FREE_SHIPPING_THRESHOLD_CENTS = 19900   // free over $199

Change those two numbers and the checkout, the cart and the summary copy all
follow. Free pickup in Rego Park is offered as a second shipping choice.
