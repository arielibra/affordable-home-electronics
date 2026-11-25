/**
 * The holiday look, November 25 through January 1 (shop time, New York).
 *
 * Two phases:
 *  - Thanksgiving week (Nov 25-30): the winter look with the harvest woven in.
 *    The top bar wishes a Happy Thanksgiving and thanks customers for their
 *    years with the shop, the pine garland carries autumn leaves, pinecones and
 *    cranberries alongside its lights and baubles, and a few leaves drift down
 *    with the snow.
 *  - December 1 to January 1: pure winter. "Happy Holidays", a pine garland
 *    with warm fairy lights, glass baubles and velvet bows, three large glass
 *    ornaments hanging over the home page, and snow.
 *
 * Thanksgiving's own look (thanksgiving.tsx) owns November 1-24 and Halloween
 * owns October 15-31, so none of them overlap.
 *
 * Everything here is decoration: it never takes a click, stays off the cart
 * and checkout pages for the falling snow, and respects reduced motion. The
 * garland and the snow are drawn in the browser after the page loads (the
 * garland is built to the exact width of the camera wall, and the snow uses
 * random positions), so neither can cause a hydration mismatch.
 */
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

import { SITE } from "../../lib/site";

const SHOP_TZ = "America/New_York";

/* ------------------------------------------------------------------ dates */

/** Month (1-12) and day in New York for the given instant. */
function shopDate(now: Date): { month: number; day: number } {
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: SHOP_TZ, month: "numeric", day: "numeric" }).formatToParts(now);
    const month = Number(parts.find((p) => p.type === "month")?.value);
    const day = Number(parts.find((p) => p.type === "day")?.value);
    if (month && day) return { month, day };
  } catch {
    // A runtime without full time-zone data: fall through to a fixed offset.
  }
  // New York is UTC-5 for the whole season.
  const ny = new Date(now.getTime() - 5 * 60 * 60 * 1000);
  return { month: ny.getUTCMonth() + 1, day: ny.getUTCDate() };
}

export function isChristmasSeason(now: Date = new Date()): boolean {
  const { month, day } = shopDate(now);
  return (month === 11 && day >= 25) || month === 12 || (month === 1 && day <= 1);
}

/** Thanksgiving week inside the holiday season: the harvest is woven in. */
export function isHarvestBlend(now: Date = new Date()): boolean {
  const { month, day } = shopDate(now);
  return month === 11 && day >= 25;
}

export type HolidayPhase = "off" | "thanksgiving" | "winter";

export function holidayPhase(now: Date = new Date()): HolidayPhase {
  if (!isChristmasSeason(now)) return "off";
  return isHarvestBlend(now) ? "thanksgiving" : "winter";
}

/** The current phase. Re-checked in the browser after it loads. */
export function useHolidayPhase(): HolidayPhase {
  const [phase, setPhase] = useState<HolidayPhase>(() => holidayPhase());
  useEffect(() => {
    setPhase(holidayPhase());
  }, []);
  return phase;
}

/** True during the whole holiday season (both phases). */
export function useChristmas(): boolean {
  return useHolidayPhase() !== "off";
}

/** Top bar headline and the line after it, for each phase. */
export function holidayGreeting(phase: HolidayPhase, now: Date = new Date()): { title: string; line: string } {
  if (phase === "thanksgiving") {
    return { title: "Happy Thanksgiving", line: `Thankful for ${now.getFullYear() - SITE.since} years of customers` };
  }
  return { title: "Happy Holidays", line: "Authorized dealer. Full USA warranty on every item." };
}

/* ------------------------------------------------------------- shared art */

/** A seeded random generator, so the garland looks the same on every visit. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A detailed six-armed snowflake (24x24), each arm with two pairs of branches. */
const FLAKE = (() => {
  let d = "";
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const P = (r: number, side = 0, len = 0) => {
      const x = 12 + c * r;
      const y = 12 + s * r;
      if (!side) return [x, y];
      const b = a + side * (Math.PI / 4);
      return [x + Math.cos(b) * len, y + Math.sin(b) * len];
    };
    const f = (n: number) => n.toFixed(2);
    const [x1, y1] = P(10.5);
    d += `M12 12L${f(x1)} ${f(y1)}`;
    for (const [r, len] of [
      [5, 3.2],
      [7.8, 2.2],
    ]) {
      const [bx, by] = P(r);
      for (const side of [-1, 1]) {
        const [ex, ey] = P(r, side, len);
        d += `M${f(bx)} ${f(by)}L${f(ex)} ${f(ey)}`;
      }
    }
  }
  return d;
})();

/** A maple leaf (24x24), for the Thanksgiving week accents. */
const MAPLE =
  "M12 2l1.6 3.6 2.4-1-.6 4 3.2-1.4-.9 2.4L22 11l-3.4 1.6.8 2.2-3.6-.6.4 2.6-3.2-2v5.2h-2v-5.2l-3.2 2 .4-2.6-3.6.6.8-2.2L2 11l4.3-1.4-.9-2.4 3.2 1.4-.6-4 2.4 1z";
const OAK =
  "M12 2c1.2 1 1.4 2.3.9 3.3 1.4-.4 2.6.2 2.8 1.4-1 .3-1.5 1-1.3 1.8 1.3-.3 2.4.4 2.4 1.6-1 .2-1.6.9-1.5 1.7 1.2 0 2 .9 1.7 2-1.6.2-3-.2-4-1v4.4c0 1.2.4 2.3 1 3.3l-.9.5c-.7-1-1.1-2.3-1.1-3.7v-4.5c-1 .8-2.4 1.2-4 1-.3-1.1.5-2 1.7-2 .1-.8-.5-1.5-1.5-1.7 0-1.2 1.1-1.9 2.4-1.6.2-.8-.3-1.5-1.3-1.8.2-1.2 1.4-1.8 2.8-1.4C10.6 4.3 10.8 3 12 2z";

/** Small snowflake for the top bar greeting. */
export function SnowflakeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d={FLAKE} fill="none" stroke="#f6e3a6" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Small maple leaf for the Thanksgiving-week greeting. */
export function HarvestLeafIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d={MAPLE} fill="#f0a04b" />
    </svg>
  );
}

/** Gradients shared by every piece of art on the page (rendered once). */
function HolidayDefs() {
  const bauble = (id: string, hi: string, mid: string, lo: string) => (
    <radialGradient id={id} cx=".34" cy=".3" r=".85">
      <stop offset="0" stopColor={hi} />
      <stop offset=".42" stopColor={mid} />
      <stop offset="1" stopColor={lo} />
    </radialGradient>
  );
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        {bauble("ahe-xm-b-gold", "#fff4c9", "#d9a93a", "#6e4a10")}
        {bauble("ahe-xm-b-wine", "#f3a3ad", "#a3192f", "#3f0711")}
        {bauble("ahe-xm-b-pine", "#bfe8c9", "#2c7a48", "#0a2a16")}
        {bauble("ahe-xm-b-frost", "#ffffff", "#c9d9ea", "#6d87a3")}
        {bauble("ahe-xm-b-copper", "#ffe0c2", "#c86a2c", "#5a2508")}
        <radialGradient id="ahe-xm-glow" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fff3c4" stopOpacity=".95" />
          <stop offset=".35" stopColor="#ffd77a" stopOpacity=".45" />
          <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ahe-xm-cap" x1="0" x2="1">
          <stop offset="0" stopColor="#8a6a2a" />
          <stop offset=".45" stopColor="#f3dc93" />
          <stop offset="1" stopColor="#7a5a1e" />
        </linearGradient>
        <linearGradient id="ahe-xm-velvet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c42a3f" />
          <stop offset=".55" stopColor="#8e1426" />
          <stop offset="1" stopColor="#560a16" />
        </linearGradient>
        <linearGradient id="ahe-xm-leaf-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6b24f" />
          <stop offset=".55" stopColor="#d9541e" />
          <stop offset="1" stopColor="#9c2f14" />
        </linearGradient>
        <linearGradient id="ahe-xm-leaf-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7d27a" />
          <stop offset=".6" stopColor="#d8962f" />
          <stop offset="1" stopColor="#8f5a17" />
        </linearGradient>
        <linearGradient id="ahe-xm-cone" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a5743f" />
          <stop offset="1" stopColor="#4a2e14" />
        </linearGradient>
        <linearGradient id="ahe-xm-snow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".7" stopColor="#f3f8fd" />
          <stop offset="1" stopColor="#d9e6f3" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const BAUBLE_FILLS = ["url(#ahe-xm-b-gold)", "url(#ahe-xm-b-wine)", "url(#ahe-xm-b-frost)", "url(#ahe-xm-b-pine)", "url(#ahe-xm-b-gold)", "url(#ahe-xm-b-copper)"];

/** A glass bauble hanging from (x, y): gold cap, loop, specular highlight. */
function Bauble({ x, y, r, fill, drop }: { x: number; y: number; r: number; fill: string; drop?: number }) {
  const cy = y + (drop ?? r * 0.55) + r * 1.32;
  return (
    <g>
      <circle cx={x} cy={cy} r={r} fill={fill} />
      <circle cx={x} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth=".6" />
      <ellipse cx={x - r * 0.36} cy={cy - r * 0.4} rx={r * 0.28} ry={r * 0.17} fill="rgba(255,255,255,.85)" transform={`rotate(-35 ${x - r * 0.36} ${cy - r * 0.4})`} />
      <circle cx={x + r * 0.42} cy={cy + r * 0.45} r={r * 0.12} fill="rgba(255,255,255,.35)" />
      <rect x={x - r * 0.3} y={cy - r - r * 0.32} width={r * 0.6} height={r * 0.38} rx={r * 0.08} fill="url(#ahe-xm-cap)" />
      <path d={`M${x} ${y}v${cy - r - r * 0.32 - y}`} stroke="#c9a54a" strokeWidth=".8" />
    </g>
  );
}

/* --------------------------------------------------------------- garland */

type Garland = {
  w: number;
  h: number;
  back: Record<string, string>;
  front: Record<string, string>;
  lights: { x: number; y: number; g: number }[];
  baubles: { x: number; y: number; r: number; fill: string }[];
  leaves: { x: number; y: number; s: number; rot: number; oak: boolean; fill: string }[];
  cones: { x: number; y: number; rot: number }[];
  berries: { x: number; y: number }[];
  bows: number[];
};

const PINE_BACK = ["#123a20", "#174628", "#1b4f2d"];
const PINE_FRONT = ["#22623a", "#2b7447", "#358453", "#1d5733", "#3f915c"];

/**
 * Builds a draped pine garland to the given width. Each swag hangs from bow to
 * bow as a smooth curve; along it, tufts of needles are drawn as thousands of
 * short strokes in a few shades of green (dark ones behind, lighter ones in
 * front), so it reads as real foliage rather than a line. Lights, baubles and
 * (in Thanksgiving week) leaves, pinecones and berries are tucked into it.
 */
function buildGarland(width: number, harvest: boolean): Garland {
  const rnd = seeded(20261225 + (harvest ? 7 : 0));
  const narrow = width < 640;
  const swags = narrow ? 2 : width < 1000 ? 2 : 3;
  const sag = narrow ? 12 : 46;
  const top = 22;
  const h = top + sag + 60;
  const span = width / swags;
  const at = (x: number) => {
    const i = Math.min(swags - 1, Math.floor(x / span));
    const t = (x - i * span) / span;
    return top + 4 * sag * t * (1 - t);
  };
  const slope = (x: number) => (at(x + 1) - at(x - 1)) / 2;

  const back: Record<string, string> = {};
  const front: Record<string, string> = {};
  const add = (bucket: Record<string, string>, color: string, seg: string) => {
    bucket[color] = (bucket[color] ?? "") + seg;
  };
  const f = (n: number) => n.toFixed(1);

  // Needles: a tuft every few pixels, each needle a short stroke fanning out
  // from the core of the garland in every direction.
  const step = narrow ? 2.6 : 2.1;
  for (let x = -6; x <= width + 6; x += step) {
    const y = at(x);
    const tangent = Math.atan(slope(x));
    const n = 10;
    for (let k = 0; k < n; k++) {
      const layerFront = k >= 4;
      const ang = tangent + (rnd() * 2 - 1) * Math.PI * 0.95;
      const len = narrow ? (layerFront ? 6 : 8) + rnd() * 6 : (layerFront ? 10 : 14) + rnd() * 12;
      const ox = x + (rnd() - 0.5) * (narrow ? 6 : 8);
      const oy = y + (rnd() - 0.5) * (narrow ? 6 : 9);
      const ex = ox + Math.cos(ang) * len;
      const ey = oy + Math.sin(ang) * len * 0.75;
      const seg = `M${f(ox)} ${f(oy)}L${f(ex)} ${f(ey)}`;
      if (layerFront) add(front, PINE_FRONT[Math.floor(rnd() * PINE_FRONT.length)], seg);
      else add(back, PINE_BACK[Math.floor(rnd() * PINE_BACK.length)], seg);
    }
  }

  // Warm fairy lights, nestled in the needles.
  const lights: Garland["lights"] = [];
  for (let x = 10; x < width - 4; x += narrow ? 26 : 30) {
    lights.push({ x: x + (rnd() - 0.5) * 8, y: at(x) + (rnd() - 0.5) * 12, g: Math.floor(rnd() * 3) });
  }

  // Baubles hang from the lower edge, more of them near the bottom of each swag.
  const baubles: Garland["baubles"] = [];
  const perSwag = narrow ? 4 : 5;
  for (let i = 0; i < swags; i++) {
    for (let k = 0; k < perSwag; k++) {
      const t = (k + 0.5 + (rnd() - 0.5) * 0.35) / perSwag;
      const x = i * span + t * span;
      baubles.push({
        x,
        y: at(x) + 6,
        r: (narrow ? 4.2 : 7.5) + rnd() * (narrow ? 1.8 : 4),
        fill: BAUBLE_FILLS[(i * perSwag + k) % BAUBLE_FILLS.length],
      });
    }
  }

  // Thanksgiving week: leaves, pinecones and cranberries woven through.
  const leaves: Garland["leaves"] = [];
  const cones: Garland["cones"] = [];
  const berries: Garland["berries"] = [];
  if (harvest) {
    for (let x = 30; x < width - 20; x += narrow ? 60 : 72) {
      const lx = x + (rnd() - 0.5) * 20;
      leaves.push({
        x: lx,
        y: at(lx) - 4 + (rnd() - 0.5) * 8,
        s: (narrow ? 0.7 : 0.95) + rnd() * 0.35,
        rot: (rnd() - 0.5) * 120,
        oak: rnd() < 0.35,
        fill: rnd() < 0.55 ? "url(#ahe-xm-leaf-a)" : "url(#ahe-xm-leaf-b)",
      });
    }
    for (let x = 64; x < width - 30; x += narrow ? 150 : 170) {
      const cx = x + (rnd() - 0.5) * 30;
      cones.push({ x: cx, y: at(cx) + 4, rot: (rnd() - 0.5) * 50 });
    }
    for (let x = 44; x < width - 20; x += narrow ? 110 : 120) {
      const bx = x + (rnd() - 0.5) * 24;
      berries.push({ x: bx, y: at(bx) + 2 });
    }
  }

  const bows = Array.from({ length: swags + 1 }, (_, i) => i * span);
  return { w: width, h, back, front, lights, baubles, leaves, cones, berries, bows };
}

/** A velvet bow with two loops, two tails and a knot, centred on (x, y). */
function Bow({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-2 2c-4 8-6 16-10 24l5-2 3 5c2-9 3-18 4-27z" fill="url(#ahe-xm-velvet)" />
      <path d="M2 2c4 8 6 16 10 24l-5-2-3 5c-2-9-3-18-4-27z" fill="url(#ahe-xm-velvet)" />
      <path d="M0 0c-6-10-20-14-22-6-2 7 10 10 22 6z" fill="url(#ahe-xm-velvet)" />
      <path d="M0 0c6-10 20-14 22-6 2 7-10 10-22 6z" fill="url(#ahe-xm-velvet)" />
      <path d="M-4-1c-5-5-12-7-14-4" stroke="rgba(255,255,255,.28)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M4-1c5-5 12-7 14-4" stroke="rgba(255,255,255,.22)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <ellipse cx="0" cy="0" rx="4.4" ry="4" fill="#7a0f20" />
      <ellipse cx="-1" cy="-1.2" rx="1.8" ry="1.2" fill="rgba(255,255,255,.25)" />
    </g>
  );
}

/** A pinecone: overlapping scales in rows, centred on (x, y). */
function Pinecone({ x, y, rot }: { x: number; y: number; rot: number }) {
  const rows = [
    [-6, 3, 4.2],
    [-2, 4, 5.4],
    [2, 4, 5.8],
    [6, 3, 5],
    [10, 2, 3.6],
  ];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <ellipse cx="0" cy="3" rx="7" ry="11" fill="url(#ahe-xm-cone)" />
      {rows.map(([dy, n, w], i) =>
        Array.from({ length: n }, (_, k) => {
          const dx = (k - (n - 1) / 2) * w * 0.9;
          return <path key={`${i}-${k}`} d={`M${dx - w / 2} ${dy}q${w / 2} ${w * 0.9} ${w} 0`} fill="#6b4420" stroke="#3a2210" strokeWidth=".5" />;
        }),
      )}
    </g>
  );
}

/** Draped garland over the home page camera wall, with a ridge of snow on the wall. */
export function ChristmasLights() {
  const phase = useHolidayPhase();
  const ref = useRef<HTMLSpanElement>(null);
  const [g, setG] = useState<Garland | null>(null);

  const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;
  useIso(() => {
    if (phase === "off" || !ref.current) return;
    const el = ref.current;
    const build = () => {
      const w = Math.round(el.getBoundingClientRect().width);
      if (w > 0) setG((prev) => (prev && prev.w === w ? prev : buildGarland(w, phase === "thanksgiving")));
    };
    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);
    return () => ro.disconnect();
  }, [phase]);

  if (phase === "off") return null;
  return (
    <>
      <HolidayDefs />
      <svg className="ahe-xm-snowcap" viewBox="0 0 1200 22" preserveAspectRatio="none" aria-hidden="true">
        <path d={SNOWCAP} fill="url(#ahe-xm-snow)" />
      </svg>
      <span ref={ref} className="ahe-xm-garland" aria-hidden="true">
        {g && (
          <svg width={g.w} height={g.h} viewBox={`0 0 ${g.w} ${g.h}`} style={{ overflow: "visible" }}>
            <g strokeLinecap="round" fill="none">
              {Object.entries(g.back).map(([c, d]) => (
                <path key={c} d={d} stroke={c} strokeWidth="2.1" />
              ))}
            </g>
            {g.cones.map((c, i) => (
              <Pinecone key={i} {...c} />
            ))}
            <g strokeLinecap="round" fill="none">
              {Object.entries(g.front).map(([c, d]) => (
                <path key={c} d={d} stroke={c} strokeWidth="1.6" />
              ))}
            </g>
            {g.leaves.map((l, i) => (
              <path
                key={i}
                d={l.oak ? OAK : MAPLE}
                fill={l.fill}
                stroke="rgba(90,30,8,.35)"
                strokeWidth=".4"
                transform={`translate(${l.x - 12 * l.s} ${l.y - 12 * l.s}) scale(${l.s}) rotate(${l.rot} 12 12)`}
              />
            ))}
            {g.berries.map((b, i) => (
              <g key={i}>
                {[
                  [0, 0],
                  [4.2, 1.6],
                  [1.6, 4.4],
                ].map(([dx, dy], k) => (
                  <g key={k}>
                    <circle cx={b.x + dx} cy={b.y + dy} r="2.6" fill="#a3122a" />
                    <circle cx={b.x + dx - 0.8} cy={b.y + dy - 0.8} r=".8" fill="rgba(255,255,255,.6)" />
                  </g>
                ))}
              </g>
            ))}
            {g.lights.map((l, i) => (
              <g key={i} className={`ahe-xm-light is-g${l.g}`}>
                <circle cx={l.x} cy={l.y} r="9" fill="url(#ahe-xm-glow)" />
                <circle cx={l.x} cy={l.y} r="2.1" fill="#fffbe8" />
              </g>
            ))}
            {g.baubles.map((b, i) => (
              <Bauble key={i} {...b} />
            ))}
            {g.bows.map((x, i) => (
              <Bow key={i} x={Math.min(Math.max(x, 18), g.w - 18)} y={20} s={g.w < 640 ? 0.75 : 1} />
            ))}
          </svg>
        )}
      </span>
    </>
  );
}

/** A soft ridge of snow: bumps of varying height along the top, flat below. */
const SNOWCAP = (() => {
  let d = "M0 22V13";
  for (let x = 0, i = 0; x < 1200; i++) {
    const w = 22 + ((i * 37) % 30);
    const h = 2 + ((i * 53) % 6);
    d += `Q${x + w / 2} ${13 - h * 2} ${Math.min(x + w, 1200)} 13`;
    x += w;
  }
  return d + "V22z";
})();

/**
 * Three large glass ornaments hanging on gold threads from the top of the
 * home page banner, in the open space to the right of the headline. Desktop
 * only; they sway gently.
 */
export function HangingOrnaments() {
  const phase = useHolidayPhase();
  if (phase === "off") return null;
  const set =
    phase === "thanksgiving"
      ? [
          { len: 70, r: 26, fill: "url(#ahe-xm-b-copper)", delay: 0 },
          { len: 130, r: 34, fill: "url(#ahe-xm-b-gold)", delay: -1.4 },
          { len: 40, r: 20, fill: "url(#ahe-xm-b-wine)", delay: -2.6 },
        ]
      : [
          { len: 70, r: 26, fill: "url(#ahe-xm-b-wine)", delay: 0 },
          { len: 130, r: 34, fill: "url(#ahe-xm-b-gold)", delay: -1.4 },
          { len: 40, r: 20, fill: "url(#ahe-xm-b-frost)", delay: -2.6 },
        ];
  return (
    <div className="ahe-xm-hang" aria-hidden="true">
      {set.map((o, i) => {
        const w = o.r * 2 + 8;
        const h = o.len + o.r * 2.5 + 10;
        return (
          <svg
            key={i}
            className="ahe-xm-hang-one"
            width={w}
            height={h}
            viewBox={`${-w / 2} 0 ${w} ${h}`}
            style={{ animationDelay: `${o.delay}s` } as CSSProperties}
          >
            <Bauble x={0} y={0} r={o.r} fill={o.fill} drop={o.len} />
            {/* A frosted band around the big one */}
            {i === 1 && (
              <path
                d={`M${-o.r * 0.97} ${o.len + o.r * 1.32 + 2}q${o.r} ${o.r * 0.34} ${o.r * 1.94} 0`}
                stroke="rgba(255,255,255,.55)"
                strokeWidth="2.4"
                strokeDasharray="1 3.4"
                strokeLinecap="round"
                fill="none"
                transform={`translate(0 ${0})`}
              />
            )}
          </svg>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------- falling snow */

type Flake = {
  left: number; // vw
  size: number; // px
  duration: number; // s
  delay: number; // s
  sway: number; // px
  spin: number; // deg
  opacity: number;
  kind: "crystal" | "soft" | "leaf";
  leafOak?: boolean;
  leafFill?: string;
};

const LEAF_FILLS = ["#d9541e", "#e8761c", "#f2a33a", "#b5371b", "#c9862b"];

function makeFlakes(harvest: boolean): Flake[] {
  const count = 42;
  return Array.from({ length: count }, (_, i) => {
    const leaf = harvest && i % 6 === 0;
    const soft = !leaf && i % 3 === 1;
    // Depth: small flakes fall slower and fainter, like they're further away.
    const depth = Math.random();
    return {
      left: Math.random() * 100,
      size: leaf ? 16 + Math.random() * 10 : soft ? 4 + depth * 7 : 9 + depth * 15,
      duration: leaf ? 13 + Math.random() * 8 : 16 - depth * 7 + Math.random() * 3,
      delay: -Math.random() * 20,
      sway: leaf ? 40 + Math.random() * 50 : 12 + Math.random() * 30,
      spin: (Math.random() < 0.5 ? -1 : 1) * (leaf ? 220 + Math.random() * 300 : 60 + Math.random() * 160),
      opacity: leaf ? 0.85 : 0.45 + depth * 0.5,
      kind: leaf ? "leaf" : soft ? "soft" : "crystal",
      leafOak: Math.random() < 0.35,
      leafFill: LEAF_FILLS[i % LEAF_FILLS.length],
    };
  });
}

const QUIET_PATHS = ["/cart", "/checkout"];

/** Falling snow across the whole page (with a few leaves in Thanksgiving week). Decorative only. */
export function FallingSnow() {
  const phase = useHolidayPhase();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [flakes, setFlakes] = useState<Flake[] | null>(null);

  useEffect(() => {
    if (phase === "off") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    setFlakes(makeFlakes(phase === "thanksgiving"));
  }, [phase]);

  if (phase === "off" || !flakes || QUIET_PATHS.some((p) => path.startsWith(p))) return null;

  return (
    <div className="ahe-snow" aria-hidden="true">
      {flakes.map((f, i) => (
        <span
          key={i}
          className={`ahe-snow-flake is-${f.kind}`}
          style={
            {
              left: `${f.left}vw`,
              animationDuration: `${f.duration}s`,
              animationDelay: `${f.delay}s`,
              "--sway": `${f.sway}px`,
            } as CSSProperties
          }
        >
          <svg
            viewBox="0 0 24 24"
            width={f.size}
            height={f.size}
            style={
              {
                opacity: f.opacity,
                animationDuration: `${f.duration / 3}s`,
                animationDelay: `${f.delay}s`,
                "--spin": `${f.spin}deg`,
              } as CSSProperties
            }
          >
            {f.kind === "leaf" ? (
              <path d={f.leafOak ? OAK : MAPLE} fill={f.leafFill} />
            ) : f.kind === "soft" ? (
              <circle cx="12" cy="12" r="10" fill="#ffffff" />
            ) : (
              <path d={FLAKE} fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
            )}
          </svg>
        </span>
      ))}
    </div>
  );
}
