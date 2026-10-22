import { useId } from "react";

/**
 * The house mark, redrawn as vector to match the chosen logo exactly: the cart
 * with its four-panel basket, a lens dot in each panel, two speed lines and a
 * rounded handle. (An earlier rebuild had a different basket and six dots, and
 * next to the plain-type initials it read as pasted on.)
 *
 * Handle and wheels take `currentColor`, so the one component sits on white in
 * the header and reverses to white on the blue footer. The props are unchanged
 * from the old component, so every existing placement keeps working:
 *   - `detail` is accepted for compatibility; the dots read at every size now.
 *   - `empty` draws an outlined basket for the empty-cart and 404 states.
 */
export function Mark({
  className = "h-7 w-9",
  empty = false,
}: {
  className?: string;
  detail?: "full" | "compact";
  empty?: boolean;
}) {
  const gid = `aheBasket${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 330 260" className={className} aria-hidden="true" fill="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#34cdf2" />
          <stop offset="1" stopColor="#2f7fe0" />
        </linearGradient>
      </defs>
      <path
        d="M2 83 L118 74 L118 86 Z M48 114 L124 106 L124 117 Z"
        fill="#2ab8e0"
        fillOpacity={empty ? 0.35 : 1}
      />
      {empty ? (
        <path
          d="M132 30 H318 Q328 30 326 40 L306 152 Q304 160 295 160 L172 165 Z"
          stroke="currentColor"
          strokeOpacity="0.35"
          strokeWidth="8"
          strokeLinejoin="round"
        />
      ) : (
        <>
          <path d="M132 30 H318 Q328 30 326 40 L306 152 Q304 160 295 160 L172 165 Z" fill={`url(#${gid})`} />
          <path d="M236 30 L240 163 M150 97 L314 95" stroke="#ffffff" strokeWidth="7" />
          <g fill="#3fe0ff">
            <circle cx="196" cy="63" r="6.5" />
            <circle cx="279" cy="63" r="6.5" />
            <circle cx="205" cy="130" r="6.5" />
            <circle cx="270" cy="129" r="6.5" />
          </g>
        </>
      )}
      <g stroke="currentColor" strokeOpacity={empty ? 0.45 : 1}>
        <path
          d="M72 9 H110 Q127 9 132 26 L165 150 Q169 166 158 171 Q146 177 150 189 Q154 200 170 200 H290"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <g fill="currentColor" fillOpacity={empty ? 0.45 : 1}>
        <circle cx="186" cy="236" r="16" />
        <circle cx="262" cy="236" r="16" />
      </g>
    </svg>
  );
}

/**
 * Mark plus the full name in the logo's own tall lettering, stacked on three
 * lines the way the logo is. Sized so the words are exactly as tall as the
 * cart, which is what makes the two read as one piece.
 */
export function Lockup({ reversed = false, className = "" }: { reversed?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 sm:gap-2.5 ${reversed ? "text-white" : "text-ink"} ${className}`}>
      <Mark className="h-[38px] w-[48px] shrink-0 sm:h-[44px] sm:w-[56px]" />
      <span className="ahe-display text-[14px] leading-[0.98] tracking-[0.015em] sm:text-[15.5px]">
        Affordable
        <br />
        Home
        <br />
        Electronics
      </span>
    </span>
  );
}
