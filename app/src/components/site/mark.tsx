/**
 * The house mark: the shop's original cart, rebuilt to the chosen identity.
 * The basket carries six camera lenses, which is the whole business in one
 * shape, and two fine lines trail behind it. Drawn as vector rather than
 * shipped as an image so it stays sharp at any size and reverses on a dark
 * ground without a second file.
 *
 * `detail` matters: six lenses turn to mush below about forty pixels, so
 * small placements get the grid without the dots. That is a deliberate
 * small-use variant, not a different logo.
 */
export function Mark({
  className = "h-7 w-10",
  detail = "compact",
  empty = false,
}: {
  className?: string;
  detail?: "full" | "compact";
  empty?: boolean;
}) {
  const LENSES: [number, number][] = [
    [19.1, 9.6],
    [25.6, 9.6],
    [32.1, 9.6],
    [20.4, 14.4],
    [25.9, 14.4],
    [31.4, 14.4],
  ];

  return (
    <svg viewBox="0 0 40 28" className={className} aria-hidden="true" fill="none">
      <defs>
        <linearGradient id="aheBasket" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3fb0d8" />
          <stop offset="1" stopColor="#1f66b8" />
        </linearGradient>
      </defs>

      {/* The trail. Two fine lines, not a cartoon whoosh. */}
      <g
        stroke="#3fb0d8"
        strokeWidth="2"
        strokeLinecap="square"
        strokeOpacity={empty ? 0.3 : 0.9}
      >
        <path d="M0.5 8.5h5M2 13h3.5" />
      </g>

      {empty ? (
        <path d="M15 7h21l-2.5 10h-15z" fill="none" stroke="currentColor" strokeWidth="2" strokeOpacity="0.4" />
      ) : (
        <path d="M15 7h21l-2.5 10h-15z" fill="url(#aheBasket)" />
      )}

      {/* Panel divisions, and the lenses when there is room for them. */}
      <g
        stroke={empty ? "currentColor" : "var(--color-surface, #ffffff)"}
        strokeWidth="1.5"
        strokeOpacity={empty ? 0.22 : 1}
        strokeLinecap="butt"
      >
        <path d="M22 7l1.5 10M29 7l-.5 10M16.75 12h18" />
      </g>
      {detail === "full" && !empty
        ? LENSES.map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.15" fill="#ffffff" />)
        : null}

      {/* Handle, legs and wheels take the surrounding text colour, so one
          component reverses cleanly on a dark ground. */}
      <g
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="square"
        strokeLinejoin="miter"
        strokeOpacity={empty ? 0.4 : 1}
      >
        <path d="M8 3.2h4.2L15 7" />
        <path d="M21.6 17.4l.6 3.6M31 17.4l-.5 3.6" />
      </g>
      <circle cx="22.4" cy="23.6" r="2.4" fill="currentColor" fillOpacity={empty ? 0.4 : 1} />
      <circle cx="30.4" cy="23.6" r="2.4" fill="currentColor" fillOpacity={empty ? 0.4 : 1} />
    </svg>
  );
}

/** Stacked three line lockup, the shape of the original sign. */
export function Lockup({ className = "", size = "md" }: { className?: string; size?: "md" | "lg" }) {
  const mark = size === "lg" ? "h-[88px] w-[126px]" : "h-12 w-[68px]";
  const type = size === "lg" ? "text-[38px]" : "text-[20px]";
  return (
    <span className={`inline-flex items-center gap-5 ${className}`}>
      <Mark detail="full" className={`${mark} shrink-0`} />
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
      <Mark className="h-[26px] w-[37px]" />
      <span className="text-[15px] font-semibold leading-none tracking-tight">Affordable Home Electronics</span>
    </span>
  );
}
