/** The house mark: an open aperture frame with one recording square inside. */
export function Mark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
      <path d="M2 7V2h5M17 2h5v5M22 17v5h-5M7 22H2v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
      <rect x="10.5" y="10.5" width="7" height="7" fill="#d2273f" />
    </svg>
  );
}

export function Wordmark({ tone = "ink" }: { tone?: "ink" | "surface" }) {
  const color = tone === "ink" ? "text-ink" : "text-surface";
  return (
    <span className={`inline-flex items-baseline gap-2 ${color}`}>
      <Mark className="h-5 w-5 translate-y-[2px]" />
      <span className="text-[15px] font-semibold leading-none tracking-tight">
        Affordable Home Electronics
      </span>
    </span>
  );
}
