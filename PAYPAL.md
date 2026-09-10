# PayPal

Card payment runs through Stripe. PayPal is a second, independent route,
because **Stripe cannot offer PayPal to a US business** — Stripe's PayPal
support covers the EU, UK, Norway, Liechtenstein and Switzerland only. So the
shop talks to PayPal directly.

## What your dad needs to do

1. A **PayPal Business account** (a personal account cannot take orders like
   this). If the old shopping cart already took PayPal, use that same account —
   the history and the reputation are worth keeping.
2. In the PayPal Developer dashboard, create an app. That gives a **Client ID**
   and a **Secret**, once for Sandbox and again for Live.
3. Add a webhook on that app pointing at
   `https://<the site>/api/paypal-webhook`, subscribed to
   **PAYMENT.CAPTURE.COMPLETED** and **CHECKOUT.ORDER.APPROVED**. Copy the
   **Webhook ID** it gives back.

## The secrets

Set from a terminal, never pasted into a file, a chat or an email:

```
npx wrangler secret put PAYPAL_CLIENT_ID
npx wrangler secret put PAYPAL_SECRET
npx wrangler secret put PAYPAL_WEBHOOK_ID
```

Then, only when the sandbox testing is done and it is time to take real money:

```
npx wrangler secret put PAYPAL_ENV     # value: live
```

Until `PAYPAL_ENV` is `live`, everything runs against PayPal's sandbox, which
is exactly where the first test orders belong. If any of the three secrets is
missing, the PayPal option simply does not appear at checkout — no broken
button, no half-working payment.

## How an order actually flows

1. The customer fills in the delivery details on `/checkout` and picks PayPal.
2. `POST /api/paypal/create` prices the order: cart subtotal, shipping by the
   same rule Stripe uses, and **sales tax from Stripe Tax** — because PayPal
   computes no tax at all, and the two payment routes must not disagree about
   what a customer owes. The order is written down as `pending_payment` before
   the customer is ever sent to PayPal.
3. The customer approves in PayPal's window.
4. `POST /api/paypal/capture` takes the money and marks the order paid, records
   the line items, decrements stock, empties the cart, and files the tax
   calculation as a Stripe Tax transaction so it lands in the same reports as
   the card orders.
5. `POST /api/paypal-webhook` is the safety net. If the customer approved and
   then closed the tab before step 4, the webhook captures the payment itself
   and writes the order. Both paths are idempotent — whichever gets there first
   does the work, the second sees `status = 'paid'` and stops.

## Testing before it goes live

Use a PayPal **sandbox buyer** account, not a real one. Run a shipped order and
a pickup order, and check afterwards that the order shows in `/admin`, the
stock count moved, the cart emptied, and the tax figure matches what Stripe
would have charged for the same address.

Then, deliberately: approve a payment and close the tab before it finishes. An
order must still appear. That is the test most shops skip and then discover in
production.
