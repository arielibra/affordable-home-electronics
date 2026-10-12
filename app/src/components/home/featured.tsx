import { Link } from "@tanstack/react-router";

import { ProductCard, type CardProduct } from "../site/product-card";
import { SectionHead, Shell } from "../site/section";

export function Featured({ products }: { products: CardProduct[] }) {
  if (products.length === 0) return null;
  return (
    <section className="bg-ground py-16 lg:py-20">
      <Shell>
        <SectionHead
          title="On the counter this week"
          lead="Real stock at the price we sell it for, with the manufacturer list price beside it so you can see the difference."
          aside={
            <Link to="/shop" className="border-b border-signal pb-0.5 text-sm text-ink hover:text-signal">
              See all {products.length > 0 ? "products" : ""}
            </Link>
          }
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
      </Shell>
    </section>
  );
}
