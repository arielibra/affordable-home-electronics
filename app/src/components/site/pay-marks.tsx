/**
 * What the shop accepts, shown wherever a customer is deciding whether to
 * trust the checkout.
 *
 * The artwork lives in app/public/pay/ and is never drawn here — see
 * app/public/pay/SOURCES.md for where each file came from and what its licence
 * is. Card networks require merchants to use their supplied acceptance mark
 * unmodified, so replacing one of these later means dropping in a new file
 * under the same name and changing nothing else.
 *
 * Setting OFFICIAL_MARKS back to false falls through to type-only tiles, which
 * is the right behaviour if a file ever goes missing.
 */

export const OFFICIAL_MARKS = true;

type Mark = { key: string; label: string; short?: string };

const CARD_MARKS: Mark[] = [
  { key: "visa", label: "Visa" },
  { key: "mastercard", label: "Mastercard" },
  { key: "amex", label: "American Express", short: "Amex" },
  { key: "discover", label: "Discover" },
];

const WALLET_MARKS: Mark[] = [
  { key: "paypal", label: "PayPal" },
  { key: "apple-pay", label: "Apple Pay" },
  { key: "google-pay", label: "Google Pay" },
];

function Tile({ mark }: { mark: Mark }) {
  if (OFFICIAL_MARKS) {
    return (
      <img
        src={`/pay/${mark.key}.svg`}
        alt={mark.label}
        height={28}
        loading="lazy"
        className="h-[28px] w-auto rounded-[4px]"
      />
    );
  }
  return (
    <span
      title={mark.label}
      className="inline-flex h-[26px] items-center rounded-[3px] bg-white px-2.5 text-[11px] font-semibold leading-none tracking-tight text-ink"
    >
      {mark.short ?? mark.label}
    </span>
  );
}

export function PayMarks({
  wallets = true,
  label = "We accept",
  className = "",
}: {
  wallets?: boolean;
  label?: string | null;
  className?: string;
}) {
  const marks = wallets ? [...CARD_MARKS, ...WALLET_MARKS] : CARD_MARKS;
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-2.5 ${className}`}>
      {label ? (
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">{label}</span>
      ) : null}
      <ul className="flex flex-wrap items-center gap-1.5">
        {marks.map((m) => (
          <li key={m.key}>
            <Tile mark={m} />
          </li>
        ))}
      </ul>
    </div>
  );
}
