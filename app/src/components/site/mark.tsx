/**
 * The house mark, modernized from the shop's original cart logo.
 * Keeps the original's silhouette, its teal to indigo basket and its round
 * wheels; drops the drop shadow, the black keyline and the outlined italic
 * type. The basket grid now reads as a wall of camera feeds.
 */
export function Mark({ className = "h-6 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 24" className={className} aria-hidden="true" fill="none">
      <defs>
        <linearGradient id="aheBasket" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#57c3d4" />
          <stop offset="1" stopColor="#3b3a8f" />
        </linearGradient>
      </defs>
      <rect x="8" y="6" width="17" height="9" fill="url(#aheBasket)" />
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
        <path d="M1 2.5h3.6L8 15" />
        <rect x="8" y="6" width="17" height="9" />
        <path d="M13.67 6v9M19.33 6v9M8 10.5h17" />
        <path d="M11 15v3M21 15v3" />
      </g>
      <circle cx="11" cy="20.5" r="2" fill="#3b3a8f" />
      <circle cx="21" cy="20.5" r="2" fill="#3b3a8f" />
    </svg>
  );
}

/** Stacked three line lockup, the shape of the original sign. */
export function Lockup({ className = "", tone = "ink" }: { className?: string; tone?: "ink" | "surface" }) {
  const color = tone === "ink" ? "text-ink" : "text-surface";
  return (
    <span className={`inline-flex items-center gap-4 ${color} ${className}`}>
      <Mark className="h-11 w-[52px] shrink-0" />
      <span className="text-[19px] font-semibold uppercase leading-[0.94] tracking-tight">
        Affordable
        <br />
        Home
        <br />
        Electronics
      </span>
    </span>
  );
}

export function Wordmark({ tone = "ink" }: { tone?: "ink" | "surface" }) {
  const color = tone === "ink" ? "text-ink" : "text-surface";
  return (
    <span className={`inline-flex items-center gap-2.5 ${color}`}>
      <Mark className="h-[22px] w-[26px]" />
      <span className="text-[15px] font-semibold leading-none tracking-tight">Affordable Home Electronics</span>
    </span>
  );
}
