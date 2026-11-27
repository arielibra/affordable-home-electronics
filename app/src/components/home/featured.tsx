import { Link } from "@tanstack/react-router";

import { ProductCard, type CardProduct } from "../site/product-card";
import { MoreLink, SectionHead, Shell } from "../site/section";

export function Featured({ products }: { products: CardProduct[] }) {
  if (products.length === 0) return null;
  return (
    <section className="bg-ground py-12 md:py-16">
      <Shell>
        <SectionHead
          title="New from Alibi"
          lead="The latest Alibi Vigilant cameras and recorders, at the price we sell them for with the list price beside it."
          aside={
            <Link to="/brands/$brand" params={{ brand: "alibi" }}>
              <MoreLink>See all Alibi</MoreLink>
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
