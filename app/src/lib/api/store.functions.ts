import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  addToCart,
  allProducts,
  cartLines,
  categoryCounts,
  clearCart,
  featuredProducts,
  getProduct,
  listBrands,
  listCategories,
  productsIn,
  productImages,
  relatedProducts,
  searchProducts,
  setCartQty,
} from "../store.server";
import { bindings } from "../bindings.server";
import { productReviews } from "../reviews.server";
import { deliverableAddress, enquiryMessage, ownerAddress, sendMail } from "../email.server";
import { SPAM_HOLD, scoreEnquiry } from "../spam";
import { paypalClientId, paypalEnabled, paypalLive } from "../paypal.server";
import { FREE_SHIPPING_THRESHOLD_CENTS, SHIPPING_FLAT_CENTS, paymentsEnabled } from "../stripe.server";

const id = z.string().min(8).max(64);
const slug = z.string().min(1).max(120);

export const getStorefront = createServerFn({ method: "GET" }).handler(async () => {
  const [categories, counts, featured] = await Promise.all([listCategories(), categoryCounts(), featuredProducts(8)]);
  return { categories, counts, featured };
});

export const getShop = createServerFn({ method: "GET" })
  .inputValidator(z.object({ sort: z.enum(["featured", "price-asc", "price-desc", "name"]).default("featured") }))
  .handler(async ({ data }) => {
    const [categories, counts, products] = await Promise.all([listCategories(), categoryCounts(), allProducts(data.sort)]);
    return { categories, counts, products };
  });

export const getCategoryPage = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug, sort: z.enum(["featured", "price-asc", "price-desc", "name"]).default("featured") }))
  .handler(async ({ data }) => {
    const [categories, products, counts] = await Promise.all([
      listCategories(),
      productsIn(data.slug, data.sort),
      categoryCounts(),
    ]);
    const category = categories.find((c) => c.slug === data.slug) ?? null;
    return { categories, category, products, counts };
  });

export const getProductPage = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug }))
  .handler(async ({ data }) => {
    const product = await getProduct(data.slug);
    if (!product) return { product: null, related: [], categoryName: "" };
    const [related, categories, images, reviews] = await Promise.all([
      relatedProducts(product),
      listCategories(),
      productImages(product.slug, product.image),
      productReviews(product.slug),
    ]);
    return {
      product,
      images,
      reviews,
      related,
      categoryName: categories.find((c) => c.slug === product.category)?.name ?? "",
    };
  });

export const searchCatalog = createServerFn({ method: "GET" })
  .inputValidator(z.object({ q: z.string().max(80).default("") }))
  .handler(async ({ data }) => {
    const q = data.q.trim();
    const [categories, products] = await Promise.all([listCategories(), q.length > 1 ? searchProducts(q) : Promise.resolve([])]);
    return { categories, products, q };
  });

export const getBrandIndex = createServerFn({ method: "GET" }).handler(async () => ({ brands: await listBrands() }));

export const getCart = createServerFn({ method: "POST" })
  .inputValidator(z.object({ cartId: id }))
  .handler(async ({ data }) => ({ lines: await cartLines(data.cartId) }));

export const mutateCart = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      cartId: id,
      slug,
      qty: z.number().int().min(0).max(99),
      mode: z.enum(["add", "set"]),
    }),
  )
  .handler(async ({ data }) => {
    if (data.mode === "add") await addToCart(data.cartId, data.slug, Math.max(1, data.qty));
    else await setCartQty(data.cartId, data.slug, data.qty);
    return { lines: await cartLines(data.cartId) };
  });

const orderInput = z.object({
  cartId: id,
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().min(7).max(40),
  company: z.string().max(120).default(""),
  address1: z.string().min(3).max(160),
  address2: z.string().max(160).default(""),
  city: z.string().min(2).max(80),
  state: z.string().min(2).max(40),
  zip: z.string().min(3).max(16),
  notes: z.string().max(1000).default(""),
});

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator(orderInput)
  .handler(async ({ data }) => {
    const DB = bindings().DB;
    if (!DB) throw new Error("Orders are unavailable right now.");
    const lines = await cartLines(data.cartId);
    if (lines.length === 0) return { ok: false as const, reason: "empty" as const };
    const subtotal = lines.reduce((s, l) => s + l.price_cents * l.qty, 0);
    const orderId = crypto.randomUUID();
    const bytes = new Uint8Array(3);
    crypto.getRandomValues(bytes);
    const reference = "AHE-" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
    await DB.prepare(
      "INSERT INTO orders (id,reference,name,email,phone,company,address1,address2,city,state,zip,notes,subtotal_cents) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13)",
    )
      .bind(
        orderId, reference, data.name, data.email, data.phone, data.company,
        data.address1, data.address2, data.city, data.state, data.zip, data.notes, subtotal,
      )
      .run();
    const stmt = DB.prepare("INSERT INTO order_items (order_id,product_slug,name,qty,price_cents) VALUES (?1,?2,?3,?4,?5)");
    await DB.batch(lines.map((l) => stmt.bind(orderId, l.slug, l.name, l.qty, l.price_cents)));
    await clearCart(data.cartId);
    return { ok: true as const, reference, subtotal, lines };
  });

export const submitQuote = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().min(2).max(120),
      phone: z.string().min(7).max(40),
      email: z.string().max(160).default(""),
      borough: z.string().max(60).default(""),
      property_type: z.string().max(60).default(""),
      cameras: z.string().max(40).default(""),
      message: z.string().max(1200).default(""),
    }),
  )
  .handler(async ({ data }) => {
    const DB = bindings().DB;
    if (!DB) throw new Error("The quote form is unavailable right now.");

    // The same agency works a list under different names from one number.
    // Cheap to check, and it caught two of the first four pitches.
    let phoneSeenUnderAnotherName = false;
    const phone = data.phone.trim();
    if (phone) {
      try {
        const seen = await DB.prepare(
          "SELECT 1 AS hit FROM quote_requests WHERE phone = ?1 AND lower(trim(name)) <> lower(trim(?2)) LIMIT 1",
        )
          .bind(phone, data.name)
          .first<{ hit: number }>();
        phoneSeenUnderAnotherName = Boolean(seen);
      } catch {
        // A scoring hint is never worth failing a customer's message over.
      }
    }

    const verdict = scoreEnquiry({
      message: data.message,
      topic: data.property_type,
      phoneSeenUnderAnotherName,
    });

    // Saved whatever it scores. A filter that silently drops a customer is
    // worse than one that lets a sales pitch through.
    await DB.prepare(
      "INSERT INTO quote_requests (id,name,phone,email,borough,property_type,cameras,message,spam_score,spam_reasons) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10)",
    )
      .bind(
        crypto.randomUUID(),
        data.name,
        data.phone,
        data.email,
        data.borough,
        data.property_type,
        data.cameras,
        data.message,
        verdict.score,
        verdict.reasons.join("; ").slice(0, 400),
      )
      .run();

    // Tell the shop. Until this existed the message sat in the database and
    // nobody was told, which is why a wholesale enquiry could go a day
    // unanswered. Obvious pitches are held back rather than emailed, so the
    // inbox stays worth opening; they are still in Messages, marked.
    const owner = ownerAddress();
    if (owner && verdict.score < SPAM_HOLD) {
      await sendMail("", "enquiry", {
        to: owner,
        replyTo: deliverableAddress(data.email) || undefined,
        ...enquiryMessage({
          name: data.name,
          email: data.email,
          phone: data.phone,
          topic: data.property_type,
          message: data.message,
          spamScore: verdict.score,
          spamReasons: verdict.reasons,
        }),
      });
    }

    return { ok: true as const };
  });

/** Which ways of paying are actually switched on right now. The checkout page
 *  offers exactly what this reports and nothing more, so a missing secret shows
 *  up as one fewer button rather than a broken one. */
export const getCheckoutConfig = createServerFn({ method: "GET" }).handler(async () => ({
  payments: paymentsEnabled(),
  paypal: paypalEnabled(),
  paypalClientId: paypalClientId(),
  paypalLive: paypalLive(),
  shippingFlatCents: SHIPPING_FLAT_CENTS,
  freeShippingOverCents: FREE_SHIPPING_THRESHOLD_CENTS,
}));

/** Looked up by the Stripe session id, which only the buyer's redirect carries.
 *  Deliberately returns totals and a reference, never the shipping address. */
export const getPaidOrder = createServerFn({ method: "POST" })
  .inputValidator(z.object({ sessionId: z.string().min(10).max(120) }))
  .handler(async ({ data }) => {
    const DB = bindings().DB;
    if (!DB) return { found: false as const };
    const row = await DB.prepare(
      "SELECT reference, status, amount_total_cents, shipping_cents, tax_cents, subtotal_cents, email FROM orders WHERE stripe_session_id = ?1",
    )
      .bind(data.sessionId)
      .first<{
        reference: string;
        status: string;
        amount_total_cents: number | null;
        shipping_cents: number | null;
        tax_cents: number | null;
        subtotal_cents: number | null;
        email: string;
      }>();
    if (!row) return { found: false as const };
    return { found: true as const, ...row };
  });
