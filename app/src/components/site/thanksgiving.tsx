/**
 * The Thanksgiving look, all harvest and no "Happy Thanksgiving": a russet top
 * bar thanking customers for their years with the shop, a warm cream tint and a
 * garland of leaves and acorns draped over the home page camera wall with two
 * pumpkins sat on it, "Golden hour" on the camera labels, and autumn leaves
 * drifting down over the storefront. Nothing on product cards, prices or
 * checkout, and the leaves never block a click.
 *
 * It switches itself on for November 1-30 and off at midnight on December 1st,
 * shop time (New York), every year. Halloween owns October 15-31, so the two
 * never overlap.
 *
 * The falling leaves are drawn only in the browser, after the page loads: they
 * are pure decoration, and leaving them out of the server render means their
 * random positions cannot cause a hydration mismatch. They stay off on the
 * cart and checkout pages, and for anyone whose device asks for reduced motion.
 */
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type CSSProperties } from "react";

import { SITE } from "../../lib/site";

const SHOP_TZ = "America/New_York";
const LEAF_COUNT = 14;

/** Month (1-12) in New York for the given instant. */
function shopMonth(now: Date): number {
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: SHOP_TZ, month: "numeric" }).formatToParts(now);
    const month = Number(parts.find((p) => p.type === "month")?.value);
    if (month) return month;
  } catch {
    // A runtime without full time-zone data: fall through to a fixed offset.
  }
  // New York is UTC-5 for all of November.
  return new Date(now.getTime() - 5 * 60 * 60 * 1000).getUTCMonth() + 1;
}

export function isThanksgivingSeason(now: Date = new Date()): boolean {
  return shopMonth(now) === 11;
}

/** True during the season. Re-checked in the browser after it loads. */
export function useThanksgiving(): boolean {
  const [on, setOn] = useState(() => isThanksgivingSeason());
  useEffect(() => {
    setOn(isThanksgivingSeason());
  }, []);
  return on;
}

/** Small maple leaf for the top bar greeting. */
export function LeafIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d={MAPLE} fill="#ff9a3c" />
    </svg>
  );
}

const MAPLE =
  "M12 2l1.6 3.6 2.4-1-.6 4 3.2-1.4-.9 2.4L22 11l-3.4 1.6.8 2.2-3.6-.6.4 2.6-3.2-2v5.2h-2v-5.2l-3.2 2 .4-2.6-3.6.6.8-2.2L2 11l4.3-1.4-.9-2.4 3.2 1.4-.6-4 2.4 1z";
const OAK =
  "M12 2c1.2 1 1.4 2.3.9 3.3 1.4-.4 2.6.2 2.8 1.4-1 .3-1.5 1-1.3 1.8 1.3-.3 2.4.4 2.4 1.6-1 .2-1.6.9-1.5 1.7 1.2 0 2 .9 1.7 2-1.6.2-3-.2-4-1v4.4c0 1.2.4 2.3 1 3.3l-.9.5c-.7-1-1.1-2.3-1.1-3.7v-4.5c-1 .8-2.4 1.2-4 1-.3-1.1.5-2 1.7-2 .1-.8-.5-1.5-1.5-1.7 0-1.2 1.1-1.9 2.4-1.6.2-.8-.3-1.5-1.3-1.8.2-1.2 1.4-1.8 2.8-1.4C10.6 4.3 10.8 3 12 2z";

const COLORS = ["#d9541e", "#e8761c", "#f2a33a", "#b5371b", "#c9862b", "#9c4a1a"];

type Leaf = {
  left: number; // vw
  size: number; // px
  duration: number; // s
  delay: number; // s
  sway: number; // px
  spin: number; // deg
  color: string;
  oak: boolean;
};

function makeLeaves(): Leaf[] {
  return Array.from({ length: LEAF_COUNT }, (_, i) => ({
    left: Math.random() * 100,
    size: 16 + Math.random() * 16,
    duration: 11 + Math.random() * 10,
    // Negative delays spread the leaves down the screen from the first frame,
    // instead of the whole set starting at the top together.
    delay: -Math.random() * 20,
    sway: 30 + Math.random() * 60,
    spin: (Math.random() < 0.5 ? -1 : 1) * (180 + Math.random() * 360),
    color: COLORS[i % COLORS.length],
    oak: i % 3 === 0,
  }));
}

const QUIET_PATHS = ["/cart", "/checkout"];

/** Falling leaves across the whole page. Decorative only. */
export function FallingLeaves() {
  const on = useThanksgiving();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [leaves, setLeaves] = useState<Leaf[] | null>(null);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    setLeaves(makeLeaves());
  }, []);

  if (!on || !leaves || QUIET_PATHS.some((p) => path.startsWith(p))) return null;

  return (
    <div className="ahe-fall-leaves" aria-hidden="true">
      {leaves.map((l, i) => (
        <span
          key={i}
          className="ahe-fall-leaf"
          style={
            {
              left: `${l.left}vw`,
              animationDuration: `${l.duration}s`,
              animationDelay: `${l.delay}s`,
              "--sway": `${l.sway}px`,
            } as CSSProperties
          }
        >
          <svg
            viewBox="0 0 24 24"
            width={l.size}
            height={l.size}
            style={
              {
                animationDuration: `${l.duration / 3}s`,
                animationDelay: `${l.delay}s`,
                "--spin": `${l.spin}deg`,
              } as CSSProperties
            }
          >
            <path d={l.oak ? OAK : MAPLE} fill={l.color} />
          </svg>
        </span>
      ))}
    </div>
  );
}

/** The top bar line: "Thankful for 23 years", counted from the founding year. */
export function thanksLine(now: Date = new Date()): string {
  return `Thankful for ${now.getFullYear() - SITE.since} years of customers`;
}

const ACORN =
  "M12 3c.4 0 .7.3.7.7v1.1c3.5.3 6.3 2 6.3 4.2v.6H5v-.6c0-2.2 2.8-3.9 6.3-4.2V3.7c0-.4.3-.7.7-.7zM6 11h12c0 4.6-2.7 8.7-6 10-3.3-1.3-6-5.4-6-10z";

/**
 * Where each charm hangs on the garland cord. The cord is two drooping
 * scallops, each a quadratic curve whose sag at fraction t is 10 + 120t(1-t)
 * px, so the charms sit on the cord at any page width.
 */
const CHARMS = [0, 1].flatMap((half) =>
  [0.12, 0.3, 0.5, 0.7, 0.88].map((t, i) => ({
    x: (half + t) * 50,
    y: 10 + 120 * t * (1 - t),
    kind: i === 2 ? "acorn" : i % 2 ? "oak" : "maple",
    color: COLORS[(half * 5 + i) % COLORS.length],
    tilt: (i % 2 ? 1 : -1) * (12 + i * 6),
  })),
);

/** Garland and pumpkins for the home page camera wall. Decorative only. */
export function HarvestGarland() {
  const on = useThanksgiving();
  if (!on) return null;
  return (
    <>
      <span className="ahe-tg-garland" aria-hidden="true">
        <svg className="ahe-tg-cord" viewBox="0 0 1200 90" preserveAspectRatio="none">
          <path d="M0 10Q300 70 600 10Q900 70 1200 10" />
        </svg>
        {CHARMS.map((c, i) => (
          <svg
            key={i}
            viewBox="0 0 24 24"
            className={`ahe-tg-charm${c.kind === "acorn" ? " is-acorn" : ""}`}
            style={{ left: `${c.x}%`, top: `${c.y}px`, transform: `translate(-50%, -20%) rotate(${c.tilt}deg)` }}
          >
            {c.kind === "acorn" ? (
              <path d={ACORN} fill="#8a5a2b" />
            ) : (
              <path d={c.kind === "oak" ? OAK : MAPLE} fill={c.color} />
            )}
          </svg>
        ))}
      </span>
      <svg className="ahe-tg-pumpkins" viewBox="0 0 120 64" aria-hidden="true">
        <Pumpkin x={40} y={34} rx={30} ry={24} body="#e8761c" rib="#c95f12" />
        <Pumpkin x={88} y={44} rx={22} ry={17} body="#f2a33a" rib="#d4862a" />
        <path d="M58 60c-6-6-4-14 2-16" fill="none" stroke="#5d7a2c" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </>
  );
}

function Pumpkin({ x, y, rx, ry, body, rib }: { x: number; y: number; rx: number; ry: number; body: string; rib: string }) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={body} />
      <ellipse cx={x} cy={y} rx={rx * 0.62} ry={ry} fill="none" stroke={rib} strokeWidth="1.6" />
      <ellipse cx={x} cy={y} rx={rx * 0.22} ry={ry} fill="none" stroke={rib} strokeWidth="1.6" />
      <path d={`M${x} ${y - ry + 2}c0-5 1-8 4-10`} fill="none" stroke="#6b4a1f" strokeWidth="3.2" strokeLinecap="round" />
    </g>
  );
}
