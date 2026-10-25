import { Link } from "@tanstack/react-router";
import type { MouseEvent } from "react";

/**
 * One brand on the /brands wall.
 *
 * The whole tile is the link. At rest the logos sit quiet and slightly
 * desaturated so a wall of different brand colours reads as one surface; on
 * hover (or keyboard focus) the logo comes up in full colour, a soft light
 * follows the pointer like a camera spotlight, and a blue bar rises from the
 * bottom: "Shop ALIBI · 3 items". On touch screens, where there is no hover,
 * the bar is always showing.
 *
 * A brand with no logo uploaded yet shows its name set in the display face,
 * so the wall never has a gap. Logos are added in Admin → Brands.
 */
export type BrandTileData = { brand: string; slug: string; logo: string; n: number };

export function BrandTile({ b }: { b: BrandTileData }) {
  function track(e: MouseEvent<HTMLAnchorElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  const items = `${b.n} ${b.n === 1 ? "item" : "items"}`;

  return (
    <Link
      to="/brands/$brand"
      params={{ brand: b.slug }}
      onMouseMove={track}
      className="ahe-brand-tile"
      aria-label={`Shop ${b.brand}, ${items}`}
    >
      <span className="ahe-brand-glow" aria-hidden="true" />
      <span className="ahe-brand-mark">
        {b.logo ? (
          <img src={b.logo} alt="" loading="lazy" decoding="async" />
        ) : (
          <span className="ahe-brand-word">{b.brand}</span>
        )}
      </span>
      <span className="ahe-brand-cta" aria-hidden="true">
        <span>
          Shop {b.brand}
          <span className="ahe-brand-count"> · {items}</span>
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </Link>
  );
}
