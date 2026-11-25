/**
 * The Thanksgiving look, all harvest and no "Happy Thanksgiving": a russet top
 * bar thanking customers for their years with the shop, a warm cream tint and a
 * garland of leaves and acorns draped over the home page camera wall with two
 * pumpkins sat on it, "Golden hour" on the camera labels, and autumn leaves
 * drifting down over the storefront. Nothing on product cards, prices or
 * checkout, and the leaves never block a click.
 *
 * It switches itself on for November 1-24, shop time (New York), every year.
 * Halloween owns October 15-31 and the winter/Christmas look takes over on
 * November 25, so none of them overlap.
 *
 * The falling leaves are drawn only in the browser, after the page loads: they
 * are pure decoration, and leaving them out of the server render means their
 * random positions cannot cause a hydration mismatch. They stay off on the
 * cart and checkout pages, and for anyone whose device asks for reduced motion.
 */
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type CSSProperties } from "react";

import { SITE } from "../../lib/site";
import { isChristmasSeason } from "./christmas";

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
  // The winter/Christmas look takes over from November 25 (see christmas.tsx).
  return shopMonth(now) === 11 && !isChristmasSeason(now);
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
 * Harvest bunting. The cord is two drooping swags drawn in a 1200x90 box that
 * stretches to the page width; a swag's sag at fraction t is 10 + 120t(1-t) px,
 * so each pennant (its own small svg, never stretched) sits on the cord at any
 * width. Pennants sway a little; reduced motion keeps them still.
 */
const PENNANT_FILLS = ["url(#ahe-tg-burlap)", "#c9572a", "#f3e6cf", "#e3952f", "#7e2c16"];
const PENNANTS = [0, 1].flatMap((half) =>
  Array.from({ length: 9 }, (_, k) => {
    const t = (k + 0.5) / 9;
    const n = half * 9 + k;
    const fill = PENNANT_FILLS[n % PENNANT_FILLS.length];
    const light = fill === "#f3e6cf" || fill.startsWith("url");
    return {
      x: (half + t) * 50,
      y: 10 + 120 * t * (1 - t),
      fill,
      mark: light ? "#c9572a" : "#f6dcb0",
      oak: k % 2 === 1,
      delay: -((k * 0.4 + half) % 3.4),
    };
  }),
);
/** Leaf-and-acorn knots where the swags meet. */
const KNOTS = [0, 50, 100];

/** Garland and pumpkins for the home page camera wall. Decorative only. */
export function HarvestGarland() {
  const on = useThanksgiving();
  if (!on) return null;
  return (
    <>
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <defs>
          <pattern id="ahe-tg-burlap" width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="#d8b98a" />
            <path d="M0 3h6M3 0v6" stroke="#c4a06c" strokeWidth="1" />
          </pattern>
          <linearGradient id="ahe-tg-maple" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f08a2c" />
            <stop offset=".55" stopColor="#d9541e" />
            <stop offset="1" stopColor="#a8321a" />
          </linearGradient>
          <linearGradient id="ahe-tg-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f6c15a" />
            <stop offset=".6" stopColor="#e3952f" />
            <stop offset="1" stopColor="#b8681f" />
          </linearGradient>
          <radialGradient id="ahe-tg-pump" cx=".38" cy=".35" r=".75">
            <stop offset="0" stopColor="#ffb04a" />
            <stop offset=".6" stopColor="#ea7a1c" />
            <stop offset="1" stopColor="#b9520f" />
          </radialGradient>
          <radialGradient id="ahe-tg-pump2" cx=".38" cy=".35" r=".75">
            <stop offset="0" stopColor="#ffd27a" />
            <stop offset=".6" stopColor="#f1a53c" />
            <stop offset="1" stopColor="#c47c22" />
          </radialGradient>
          <radialGradient id="ahe-tg-white" cx=".4" cy=".35" r=".8">
            <stop offset="0" stopColor="#fffaf0" />
            <stop offset=".7" stopColor="#efe3cc" />
            <stop offset="1" stopColor="#cdb893" />
          </radialGradient>
        </defs>
      </svg>
      <span className="ahe-tg-garland" aria-hidden="true">
        <svg className="ahe-tg-cord" viewBox="0 0 1200 90" preserveAspectRatio="none">
          <path className="is-twine" d="M0 10Q300 70 600 10Q900 70 1200 10" />
          <path className="is-twist" d="M0 10Q300 70 600 10Q900 70 1200 10" />
        </svg>
        {PENNANTS.map((p, i) => (
          <svg
            key={i}
            viewBox="0 0 36 44"
            className="ahe-tg-pennant"
            style={{ left: `${p.x}%`, top: `${p.y}px` }}
          >
            <g className="ahe-tg-flag" style={{ animationDelay: `${p.delay}s` }}>
              <path d="M1 1h34L18 43z" fill={p.fill} stroke="rgba(90,40,10,.28)" strokeWidth="1" />
              <path d="M3 4h30" stroke="rgba(255,255,255,.6)" strokeWidth="1" strokeDasharray="2 2" />
              <path d={p.oak ? OAK : MAPLE} fill={p.mark} transform="translate(10.5 8) scale(.62)" />
            </g>
          </svg>
        ))}
        {KNOTS.map((x) => (
          <svg key={x} viewBox="0 0 48 40" className="ahe-tg-knot" style={{ left: `${x}%` }}>
            <path d={MAPLE} fill="url(#ahe-tg-maple)" transform="translate(2 2) rotate(-35 12 12)" />
            <path d={OAK} fill="url(#ahe-tg-gold)" transform="translate(22 2) rotate(35 12 12)" />
            <path d={ACORN} fill="#8a5a2b" transform="translate(16 16) scale(.7)" />
          </svg>
        ))}
      </span>
      <svg className="ahe-tg-pumpkins" viewBox="0 0 190 110" aria-hidden="true">
        <ellipse cx="104" cy="103" rx="84" ry="5" fill="rgba(80,40,10,.18)" />
        {/* Vine: grows out of the big pumpkin's stalk, left to a leaf and right to a curl. */}
        <path d="M74 42c-10-8-24-6-32 6-5 8-8 14-14 18" fill="none" stroke="#5d7a2c" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M30 64c-12-2-18-14-10-24 10 2 16 12 10 24z" fill="#6f8f35" />
        <path d="M29 62c-3-7-6-13-9-20" stroke="#4e6a22" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M80 42c10-12 30-14 44-6 8 5 14 4 18-2 3-5 0-10-5-9-4 1-4 6 0 7" fill="none" stroke="#5d7a2c" strokeWidth="2" strokeLinecap="round" />
        <Pumpkin x={78} y={72} rx={36} ry={28} fill="url(#ahe-tg-pump)" rib="#b0500f" />
        <Pumpkin x={136} y={82} rx={25} ry={19} fill="url(#ahe-tg-pump2)" rib="#c07a22" />
        <Pumpkin x={170} y={91} rx={15} ry={11} fill="url(#ahe-tg-white)" rib="#bfa57a" />
        <path d={MAPLE} fill="url(#ahe-tg-maple)" transform="translate(2 86) rotate(-24 12 12) scale(.7)" />
        <path d={ACORN} fill="#8a5a2b" transform="translate(21 84) rotate(14 12 12) scale(.74)" />
      </svg>
    </>
  );
}

/** A ribbed pumpkin: five overlapping lobes, a highlight and a stalk. */
function Pumpkin({ x, y, rx, ry, fill, rib }: { x: number; y: number; rx: number; ry: number; fill: string; rib: string }) {
  return (
    <g>
      {[-0.72, -0.38, 0.72, 0.38, 0].map((o) => (
        <ellipse key={o} cx={x + o * rx * 0.62} cy={y} rx={rx * (o === 0 ? 0.46 : 0.4)} ry={ry} fill={fill} stroke={rib} strokeWidth="1" />
      ))}
      <ellipse cx={x - rx * 0.35} cy={y - ry * 0.35} rx={rx * 0.18} ry={ry * 0.32} fill="rgba(255,255,255,.25)" />
      <path d={`M${x - 2} ${y - ry + 3}q-1-7 3-11l4 1q-3 4-2 10z`} fill="#5b4220" />
    </g>
  );
}
