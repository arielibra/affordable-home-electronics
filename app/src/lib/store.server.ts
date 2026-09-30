import { bindings } from "./bindings.server";
import type { D1Database } from "@cloudflare/workers-types";

export type Category = { slug: string; name: string; blurb: string; position: number };
export type Product = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  price_cents: number;
  msrp_cents: number | null;
  blurb: string;
  image: string;
  featured: number;
  stock: number;
  stock_tracked: number;
  active: number;
};

/** A tracked product with nothing left cannot be bought. Untracked products
 *  behave exactly as they did before stock existed: always available. */
export function inStock(p: { stock: number; stock_tracked: number }): boolean {
  return p.stock_tracked === 0 || p.stock > 0;
}
export type CartLine = {
  slug: string;
  name: string;
  image: string;
  brand: string;
  price_cents: number;
  qty: number;
  stock: number;
  stock_tracked: number;
};

function db(): D1Database {
  const d = bindings().DB;
  if (!d) throw new Error("The catalog database is not available.");
  return d;
}

export async function listCategories(): Promise<Category[]> {
  const r = await db().prepare("SELECT slug,name,blurb,position FROM categories ORDER BY position").all<Category>();
  return r.results ?? [];
}

export async function categoryCounts(): Promise<Record<string, number>> {
  const r = await db().prepare("SELECT category, COUNT(*) AS n FROM products WHERE active = 1 GROUP BY category").all<{ category: string; n: number }>();
  const out: Record<string, number> = {};
  for (const row of r.results ?? []) out[row.category] = row.n;
  return out;
}

export async function featuredProducts(limit = 8): Promise<Product[]> {
  const r = await db()
    .prepare("SELECT * FROM products WHERE featured = 1 AND active = 1 ORDER BY price_cents LIMIT ?1")
    .bind(limit)
    .all<Product>();
  return r.results ?? [];
}

export async function productsIn(category: string, sort = "featured"): Promise<Product[]> {
  const order =
    sort === "price-asc" ? "price_cents ASC" : sort === "price-desc" ? "price_cents DESC" : sort === "name" ? "name ASC" : "featured DESC, price_cents ASC";
  const r = await db().prepare(`SELECT * FROM products WHERE category = ?1 AND active = 1 ORDER BY ${order}`).bind(category).all<Product>();
  return r.results ?? [];
}

export async function allProducts(sort = "featured"): Promise<Product[]> {
  const order =
    sort === "price-asc" ? "price_cents ASC" : sort === "price-desc" ? "price_cents DESC" : sort === "name" ? "name ASC" : "featured DESC, category, price_cents ASC";
  const r = await db().prepare(`SELECT * FROM products WHERE active = 1 ORDER BY ${order}`).all<Product>();
  return r.results ?? [];
}

export async function searchProducts(q: string, limit = 60): Promise<Product[]> {
  const like = `%${q.trim().toLowerCase()}%`;
  const r = await db()
    .prepare("SELECT * FROM products WHERE active = 1 AND (lower(name) LIKE ?1 OR lower(brand) LIKE ?1 OR lower(blurb) LIKE ?1) ORDER BY featured DESC, price_cents LIMIT ?2")
    .bind(like, limit)
    .all<Product>();
  return r.results ?? [];
}

export async function getProduct(slug: string): Promise<Product | null> {
  return await db().prepare("SELECT * FROM products WHERE slug = ?1 AND active = 1").bind(slug).first<Product>();
}

/**
 * Every photo for a product, main one first.
 *
 * Falls back to the single `products.image` when the gallery table has nothing
 * for it, so a product added before galleries existed still shows its picture.
 */
export async function productImages(slug: string, fallback: string): Promise<string[]> {
  const r = await db()
    .prepare("SELECT url FROM product_images WHERE product_slug = ?1 ORDER BY position")
    .bind(slug)
    .all<{ url: string }>();
  const urls = (r.results ?? []).map((x) => x.url).filter(Boolean);
  if (urls.length > 0) return urls;
  return fallback ? [fallback] : [];
}

export async function relatedProducts(p: Product, limit = 4): Promise<Product[]> {
  const r = await db()
    .prepare("SELECT * FROM products WHERE category = ?1 AND slug <> ?2 AND active = 1 AND (stock_tracked = 0 OR stock > 0) ORDER BY abs(price_cents - ?3) LIMIT ?4")
    .bind(p.category, p.slug, p.price_cents, limit)
    .all<Product>();
  return r.results ?? [];
}

export type BrandListing = { brand: string; slug: string; blurb: string; logo: string; n: number };

/** The curated list the shop maintains, in the order they chose, counted by
 *  what is actually listed. Brands with nothing on the shelf are left out of
 *  this particular list because the heading above it promises stock. */
export async function listBrands(): Promise<BrandListing[]> {
  const r = await db()
    .prepare(
      `SELECT b.name AS brand, b.slug AS slug, b.blurb AS blurb, b.logo AS logo,
              (SELECT COUNT(*) FROM products p WHERE p.brand_slug = b.slug AND p.active = 1) AS n
         FROM brands b
        WHERE b.active = 1
        ORDER BY b.position, b.name`,
    )
    .all<BrandListing>();
  return (r.results ?? []).filter((b) => b.n > 0);
}

export async function cartLines(cartId: string): Promise<CartLine[]> {
  if (!cartId) return [];
  const r = await db()
    .prepare(
      "SELECT p.slug, p.name, p.image, p.brand, p.price_cents, p.stock, p.stock_tracked, c.qty FROM cart_items c JOIN products p ON p.slug = c.product_slug WHERE c.cart_id = ?1 AND p.active = 1 ORDER BY p.name",
    )
    .bind(cartId)
    .all<CartLine>();
  return r.results ?? [];
}

export async function addToCart(cartId: string, slug: string, qty: number) {
  const d = db();
  const p = await d
    .prepare("SELECT stock, stock_tracked, active FROM products WHERE slug = ?1")
    .bind(slug)
    .first<{ stock: number; stock_tracked: number; active: number }>();
  if (!p || p.active === 0 || !inStock(p)) return;

  const existing = await d
    .prepare("SELECT qty FROM cart_items WHERE cart_id = ?1 AND product_slug = ?2")
    .bind(cartId, slug)
    .first<{ qty: number }>();
  let want = (existing?.qty ?? 0) + qty;
  if (p.stock_tracked === 1) want = Math.min(want, p.stock);
  if (want <= 0) return;

  await d.prepare("INSERT OR IGNORE INTO carts (id) VALUES (?1)").bind(cartId).run();
  await d
    .prepare(
      "INSERT INTO cart_items (cart_id, product_slug, qty) VALUES (?1,?2,?3) ON CONFLICT(cart_id, product_slug) DO UPDATE SET qty = ?3",
    )
    .bind(cartId, slug, want)
    .run();
}

export async function setCartQty(cartId: string, slug: string, qty: number) {
  const d = db();
  if (qty <= 0) {
    await d.prepare("DELETE FROM cart_items WHERE cart_id = ?1 AND product_slug = ?2").bind(cartId, slug).run();
    return;
  }
  const p = await d
    .prepare("SELECT stock, stock_tracked FROM products WHERE slug = ?1")
    .bind(slug)
    .first<{ stock: number; stock_tracked: number }>();
  const capped = p && p.stock_tracked === 1 ? Math.min(qty, p.stock) : qty;
  if (capped <= 0) {
    await d.prepare("DELETE FROM cart_items WHERE cart_id = ?1 AND product_slug = ?2").bind(cartId, slug).run();
    return;
  }
  await d.prepare("UPDATE cart_items SET qty = ?3 WHERE cart_id = ?1 AND product_slug = ?2").bind(cartId, slug, capped).run();
}

/** Called once a payment succeeds. Never lets a count go below zero. */
export async function decrementStock(lines: { slug: string; qty: number }[]) {
  if (lines.length === 0) return;
  const d = db();
  const stmt = d.prepare(
    "UPDATE products SET stock = MAX(0, stock - ?2) WHERE slug = ?1 AND stock_tracked = 1",
  );
  await d.batch(lines.map((l) => stmt.bind(l.slug, l.qty)));
}

/** Anything in the basket that has since sold out or been hidden. */
export async function unavailableInCart(cartId: string): Promise<string[]> {
  const r = await db()
    .prepare(
      `SELECT p.name FROM cart_items c JOIN products p ON p.slug = c.product_slug
        WHERE c.cart_id = ?1 AND (p.active = 0 OR (p.stock_tracked = 1 AND p.stock < c.qty))`,
    )
    .bind(cartId)
    .all<{ name: string }>();
  return (r.results ?? []).map((x) => x.name);
}

export async function clearCart(cartId: string) {
  await db().prepare("DELETE FROM cart_items WHERE cart_id = ?1").bind(cartId).run();
}
