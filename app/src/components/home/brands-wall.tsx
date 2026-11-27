import { Link } from "@tanstack/react-router";

import { BrandTile, type BrandTileData } from "../site/brand-tile";
import { MoreLink, SectionHead, Shell } from "../site/section";

/**
 * "Brands we carry" on the homepage: the official logo of every brand that has
 * products on the shelf, using the same tiles as the /brands wall (quiet at
 * rest, full colour and "Shop <brand>" on hover). The list comes from the
 * shop's brands, so a brand appears or drops off as its products do; nothing
 * here is typed by hand.
 */
export function BrandsWall({ brands }: { brands: BrandTileData[] }) {
  if (!brands.length) return null;
  return (
    <section className="bg-ground py-12 md:py-16">
      <Shell>
        <SectionHead
          title="Brands we carry"
          aside={
            <Link to="/brands">
              <MoreLink>Full list</MoreLink>
            </Link>
          }
        />
        <ul className="ahe-brand-grid ahe-brand-grid--home mt-6">
          {brands.map((b) => (
            <li key={b.slug}>
              <BrandTile b={b} />
            </li>
          ))}
        </ul>
      </Shell>
    </section>
  );
}
