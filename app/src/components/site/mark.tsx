/**
 * The house mark, rebuilt from the shop's original cart logo to identity manual
 * standards: one trapezoidal basket carrying a six panel grid, one handle, two
 * wheels. Flat, so it holds at 16px, in one colour, and on a van door. The
 * blue to cyan gradient is the pair of colours the business already trades on.
 */
export function Mark({ className = "h-7 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 28" className={className} aria-hidden="true" fill="none">
      <defs>
        <linearGradient id="aheBasket" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#35a8c6" />
          <stop offset="1" stopColor="#1552b0" />
        </linearGradient>
      </defs>

      {/* Basket: solid, so the mark reads as a shape rather than an outline. */}
      <path d="M9 7h21l-2.5 10h-15z" fill="url(#aheBasket)" />

      {/* The grid, knocked through the basket. */}
      <g stroke="var(--color-surface, #ffffff)" strokeWidth="1.5" strokeLinecap="butt">
        <path d="M16 7l1.5 10M23 7l-.5 10M10.75 12h18" />
      </g>

      {/* Handle, legs and wheels take the surrounding text colour, so the mark
          reverses cleanly on a dark ground without a second asset. */}
      <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" strokeLinejoin="miter">
        <path d="M2 3.2h4.2L9 7" />
        <path d="M15.6 17.4l.6 3.6M25 17.4l-.5 3.6" />
      </g>
      <circle cx="16.4" cy="23.6" r="2.4" fill="currentColor" />
      <circle cx="24.4" cy="23.6" r="2.4" fill="currentColor" />
    </svg>
  );
}

/** Stacked three line lockup, the shape of the original sign. */
export function Lockup({ className = "", size = "md" }: { className?: string; size?: "md" | "lg" }) {
  const mark = size === "lg" ? "h-24 w-[110px]" : "h-12 w-[55px]";
  const type = size === "lg" ? "text-[40px]" : "text-[20px]";
  return (
    <span className={`inline-flex items-center gap-5 ${className}`}>
      <Mark className={`${mark} shrink-0`} />
      <span className={`${type} font-semibold uppercase leading-[0.92] tracking-[-0.02em]`}>
        Affordable
        <br />
        Home
        <br />
        Electronics
      </span>
    </span>
  );
}

export function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Mark className="h-[26px] w-[30px]" />
      <span className="text-[15px] font-semibold leading-none tracking-tight">Affordable Home Electronics</span>
    </span>
  );
}
