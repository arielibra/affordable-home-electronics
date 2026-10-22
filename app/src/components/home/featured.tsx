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
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
          {products.slice(0, 9).map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
          <Link
            to="/shop"
            className="flex min-h-[200px] flex-col justify-end gap-1.5 rounded-[14px] bg-ink p-5 text-white transition-colors hover:bg-ink-soft"
          >
            <span className="ahe-display text-[28px] leading-none">Shop all →</span>
            <span className="text-[14px] text-[#cfe1ef]">Cameras, recorders, access control and more</span>
          </Link>
        </div>
      </Shell>
    </section>
  );
}
