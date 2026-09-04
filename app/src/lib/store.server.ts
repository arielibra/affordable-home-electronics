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
};
export type CartLine = { slug: string; name: string; image: string; brand: string; price_cents: number; qty: number };

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
  const r = await db().prepare("SELECT category, COUNT(*) AS n FROM products GROUP BY category").all<{ category: string; n: number }>();
  const out: Record<string, number> = {};
  for (const row of r.results ?? []) out[row.category] = row.n;
  return out;
}

export async function featuredProducts(limit = 8): Promise<Product[]> {
  const r = await db()
    .prepare("SELECT * FROM products WHERE featured = 1 ORDER BY price_cents LIMIT ?1")
    .bind(limit)
    .all<Product>();
  return r.results ?? [];
}

export async function productsIn(category: string, sort = "featured"): Promise<Product[]> {
  const order =
    sort === "price-asc" ? "price_cents ASC" : sort === "price-desc" ? "price_cents DESC" : sort === "name" ? "name ASC" : "featured DESC, price_cents ASC";
  const r = await db().prepare(`SELECT * FROM products WHERE category = ?1 ORDER BY ${order}`).bind(category).all<Product>();
  return r.results ?? [];
}

export async function searchProducts(q: string, limit = 60): Promise<Product[]> {
  const like = `%${q.trim().toLowerCase()}%`;
  const r = await db()
    .prepare("SELECT * FROM products WHERE lower(name) LIKE ?1 OR lower(brand) LIKE ?1 OR lower(blurb) LIKE ?1 ORDER BY featured DESC, price_cents LIMIT ?2")
    .bind(like, limit)
    .all<Product>();
  return r.results ?? [];
}

export async function getProduct(slug: string): Promise<Product | null> {
  return await db().prepare("SELECT * FROM products WHERE slug = ?1").bind(slug).first<Product>();
}

export async function relatedProducts(p: Product, limit = 4): Promise<Product[]> {
  const r = await db()
    .prepare("SELECT * FROM products WHERE category = ?1 AND slug <> ?2 ORDER BY abs(price_cents - ?3) LIMIT ?4")
    .bind(p.category, p.slug, p.price_cents, limit)
    .all<Product>();
  return r.results ?? [];
}

export async function listBrands(): Promise<{ brand: string; n: number }[]> {
  const r = await db()
    .prepare("SELECT brand, COUNT(*) AS n FROM products WHERE brand <> '' GROUP BY brand HAVING n > 0 ORDER BY n DESC, brand")
    .all<{ brand: string; n: number }>();
  return r.results ?? [];
}

export async function cartLines(cartId: string): Promise<CartLine[]> {
  if (!cartId) return [];
  const r = await db()
    .prepare(
      "SELECT p.slug, p.name, p.image, p.brand, p.price_cents, c.qty FROM cart_items c JOIN products p ON p.slug = c.product_slug WHERE c.cart_id = ?1 ORDER BY p.name",
    )
    .bind(cartId)
    .all<CartLine>();
  return r.results ?? [];
}

export async function addToCart(cartId: string, slug: string, qty: number) {
  const d = db();
  await d.prepare("INSERT OR IGNORE INTO carts (id) VALUES (?1)").bind(cartId).run();
  await d
    .prepare(
      "INSERT INTO cart_items (cart_id, product_slug, qty) VALUES (?1,?2,?3) ON CONFLICT(cart_id, product_slug) DO UPDATE SET qty = qty + ?3",
    )
    .bind(cartId, slug, qty)
    .run();
}

export async function setCartQty(cartId: string, slug: string, qty: number) {
  const d = db();
  if (qty <= 0) {
    await d.prepare("DELETE FROM cart_items WHERE cart_id = ?1 AND product_slug = ?2").bind(cartId, slug).run();
    return;
  }
  await d.prepare("UPDATE cart_items SET qty = ?3 WHERE cart_id = ?1 AND product_slug = ?2").bind(cartId, slug, qty).run();
}

export async function clearCart(cartId: string) {
  await db().prepare("DELETE FROM cart_items WHERE cart_id = ?1").bind(cartId).run();
}
