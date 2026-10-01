/**
 * One place for how the back office looks.
 *
 * Every panel used to carry its own copy of the same class strings — the input
 * style alone was pasted into eight files — so nothing could be changed
 * without changing it eight times, and they had already started to drift.
 *
 * The shape of it: generous space instead of hairlines, rounded corners, type
 * big enough to read across a counter, and one weight of emphasis rather than
 * five. Tiny uppercase mono labels looked precise and were the main reason the
 * screen felt busy; they are ordinary sentence-case text now.
 */

/** Page furniture ------------------------------------------------------- */

export const h1 = "text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-ink md:text-[52px]";
export const h2 = "text-[26px] font-semibold leading-[1.15] tracking-[-0.022em] text-ink";
export const h3 = "text-[19px] font-semibold leading-[1.25] tracking-[-0.015em] text-ink";

/** Quiet text that introduces a group. Was 10px uppercase mono. */
export const eyebrow = "text-[13px] font-medium text-muted";

export const lede = "text-[17px] leading-[1.5] text-muted";
export const body = "text-[15px] leading-[1.55] text-ink";
export const small = "text-[13px] leading-[1.5] text-muted";

/** Surfaces -------------------------------------------------------------- */

export const card = "ahe-card rounded-[18px] bg-surface p-6 sm:p-7";
export const cardQuiet = "rounded-[18px] bg-[color:var(--admin-sunken)] p-5 sm:p-6";
/** One order in the list. Its own card with a real edge, because a run of
 *  forty of them has to read as forty things and not one long column. */
export const orderCard =
  "ahe-order rounded-[16px] border border-[color:var(--admin-hairline)] bg-surface px-5 py-4";

export const row = "ahe-row rounded-[14px] px-4 py-3.5 transition-colors";

/** Controls -------------------------------------------------------------- */

export const input =
  "ahe-input h-12 w-full rounded-[12px] bg-surface px-3.5 text-[15px] text-ink placeholder:text-[color:var(--admin-faint)]";

export const select = `${input} pr-9`;

export const textarea =
  "ahe-input w-full rounded-[12px] bg-surface px-3.5 py-3 text-[15px] leading-[1.5] text-ink placeholder:text-[color:var(--admin-faint)]";

export const label = "block text-[13px] font-medium text-muted";

export const btn =
  "ahe-btn inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-medium";

export const btnPrimary = `${btn} bg-ink text-surface`;
export const btnQuiet = `${btn} ahe-btn-quiet bg-[color:var(--admin-sunken)] text-ink`;

/** Small inline action inside a row — "Edit", "Copy", "Remove". */
export const btnLink = "ahe-link text-[14px] font-medium text-[color:var(--color-signal)]";

/** A compact button that still has a hit area, for icon-ish controls. */
export const btnTiny =
  "ahe-btn ahe-btn-quiet inline-flex h-9 min-w-9 items-center justify-center rounded-[10px] bg-[color:var(--admin-sunken)] px-3 text-[13px] font-medium text-ink";

/** Status pills ---------------------------------------------------------- */

export const pill =
  "inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium leading-none";
export const pillQuiet = `${pill} bg-[color:var(--admin-sunken)] text-muted`;
export const pillInk = `${pill} bg-ink text-surface`;

/** Feedback -------------------------------------------------------------- */

export const notice = "rounded-[14px] bg-[color:var(--admin-sunken)] px-4 py-3 text-[14px] leading-[1.5] text-ink";
export const noticeBad =
  "rounded-[14px] bg-[color:var(--admin-bad-bg)] px-4 py-3 text-[14px] leading-[1.5] text-[color:var(--admin-bad)]";
