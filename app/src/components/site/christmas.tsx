/**
 * The winter / Christmas look: an evergreen top bar wishing customers happy
 * holidays, a cool snowy tint behind the home page, a string of twinkling
 * Christmas lights draped over the camera wall with snow piled on its top
 * edge, a little decorated tree with presents beside it, "Snow watch" on the
 * camera labels, and snowflakes drifting down over the storefront. Nothing on
 * product cards, prices or checkout, and the snow never blocks a click.
 *
 * It switches itself on from November 25 through January 1, shop time (New
 * York), every year. Thanksgiving owns November 1-24, so the two never overlap.
 *
 * The falling snow is drawn only in the browser, after the page loads: it is
 * pure decoration, and leaving it out of the server render means its random
 * positions cannot cause a hydration mismatch. It stays off on the cart and
 * checkout pages, and for anyone whose device asks for reduced motion.
 */
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type CSSProperties } from "react";

const SHOP_TZ = "America/New_York";
const FLAKE_COUNT = 34;

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

/** True during the season. Re-checked in the browser after it loads. */
export function useChristmas(): boolean {
  const [on, setOn] = useState(() => isChristmasSeason());
  useEffect(() => {
    setOn(isChristmasSeason());
  }, []);
  return on;
}

/** Six-armed snowflake, drawn as strokes in a 24x24 box. */
const FLAKE =
  "M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7M12 2l-2 2.2M12 2l2 2.2M12 22l-2-2.2M12 22l2-2.2M3.3 7l.6 2.9M3.3 7l2.9-.7M20.7 17l-.6-2.9M20.7 17l-2.9.7M3.3 17l2.9.7M3.3 17l.6-2.9M20.7 7l-2.9-.7M20.7 7l-.6 2.9";

/** Small snowflake for the top bar greeting. */
export function SnowflakeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d={FLAKE} fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

type Flake = {
  left: number; // vw
  size: number; // px
  duration: number; // s
  delay: number; // s
  sway: number; // px
  spin: number; // deg
  opacity: number;
  dot: boolean; // a soft round flake instead of a crystal
};

function makeFlakes(): Flake[] {
  return Array.from({ length: FLAKE_COUNT }, (_, i) => ({
    left: Math.random() * 100,
    size: 10 + Math.random() * 16,
    duration: 9 + Math.random() * 10,
    // Negative delays spread the flakes down the screen from the first frame,
    // instead of the whole set starting at the top together.
    delay: -Math.random() * 18,
    sway: 15 + Math.random() * 40,
    spin: (Math.random() < 0.5 ? -1 : 1) * (90 + Math.random() * 180),
    opacity: 0.55 + Math.random() * 0.4,
    dot: i % 3 === 0,
  }));
}

const QUIET_PATHS = ["/cart", "/checkout"];

/** Falling snow across the whole page. Decorative only. */
export function FallingSnow() {
  const on = useChristmas();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [flakes, setFlakes] = useState<Flake[] | null>(null);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    setFlakes(makeFlakes());
  }, []);

  if (!on || !flakes || QUIET_PATHS.some((p) => path.startsWith(p))) return null;

  return (
    <div className="ahe-snow" aria-hidden="true">
      {flakes.map((f, i) => (
        <span
          key={i}
          className="ahe-snow-flake"
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
            {f.dot ? (
              <circle cx="12" cy="12" r="6" fill="#ffffff" />
            ) : (
              <path d={FLAKE} fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </span>
      ))}
    </div>
  );
}

/**
 * Christmas lights. The wire is two drooping swags drawn in a 1200x90 box that
 * stretches to the page width; a swag's sag at fraction t is 10 + 120t(1-t) px,
 * so each bulb (its own small svg, never stretched) sits on the wire at any
 * width. Bulbs twinkle in turn; reduced motion keeps them steady.
 */
const BULB_COLORS = ["#e23b3b", "#f5c542", "#2fa84f", "#3b8fe2", "#f08a2c"];
const BULBS = [0, 1].flatMap((half) =>
  Array.from({ length: 11 }, (_, k) => {
    const t = (k + 0.5) / 11;
    const n = half * 11 + k;
    return {
      x: (half + t) * 50,
      y: 10 + 120 * t * (1 - t),
      color: BULB_COLORS[n % BULB_COLORS.length],
      tilt: k % 2 === 0 ? -14 : 14,
      delay: -((n * 0.37) % 2.4),
    };
  }),
);
/** A lumpy ridge of snow: bumps of varying height along the top, flat below. */
const SNOWCAP = (() => {
  let d = "M0 20V12";
  for (let x = 0, i = 0; x < 1200; i++) {
    const w = 26 + ((i * 37) % 30);
    const h = 3 + ((i * 53) % 7);
    d += `Q${x + w / 2} ${12 - h * 2} ${Math.min(x + w, 1200)} 12`;
    x += w;
  }
  return d + "V20z";
})();

/** Pine-and-bow knots where the swags meet. */
const KNOTS = [0, 50, 100];

/** Lights, snow and a tree with presents for the home page camera wall. Decorative only. */
export function ChristmasLights() {
  const on = useChristmas();
  if (!on) return null;
  return (
    <>
      <svg className="ahe-xm-snowcap" viewBox="0 0 1200 20" preserveAspectRatio="none" aria-hidden="true">
        <path d={SNOWCAP} fill="#ffffff" />
      </svg>
      <span className="ahe-xm-lights" aria-hidden="true">
        <svg className="ahe-xm-wire" viewBox="0 0 1200 90" preserveAspectRatio="none">
          <path d="M0 10Q300 70 600 10Q900 70 1200 10" />
        </svg>
        {BULBS.map((b, i) => (
          <svg
            key={i}
            viewBox="0 0 20 30"
            className="ahe-xm-bulb"
            style={{ left: `${b.x}%`, top: `${b.y}px`, transform: `translateX(-50%) rotate(${b.tilt}deg)` } as CSSProperties}
          >
            <rect x="6.5" y="0" width="7" height="7" rx="1.5" fill="#3d4a3f" />
            <path
              className="ahe-xm-glass"
              d="M10 6c4.5 0 7 5 7 10.5S13.6 29 10 29 3 22 3 16.5 5.5 6 10 6z"
              fill={b.color}
              style={{ animationDelay: `${b.delay}s`, color: b.color } as CSSProperties}
            />
            <ellipse cx="7.4" cy="13" rx="1.6" ry="3.4" fill="rgba(255,255,255,.55)" />
          </svg>
        ))}
        {KNOTS.map((x) => (
          <svg key={x} viewBox="0 0 56 40" className="ahe-xm-knot" style={{ left: `${x}%` }}>
            <Sprig x={4} y={18} angle={-24} />
            <Sprig x={30} y={18} angle={24} />
            {/* Red bow */}
            <path d="M28 18c-7-8-15-7-14-1 1 5 9 4 14 1zM28 18c7-8 15-7 14-1-1 5-9 4-14 1z" fill="#c62828" stroke="#8e1b1b" strokeWidth=".8" />
            <path d="M27 19l-4 12 3-1 2 3 1-13zM29 19l4 12-3-1-2 3-1-13z" fill="#d93636" />
            <circle cx="28" cy="18" r="3" fill="#a61f1f" />
          </svg>
        ))}
      </span>
      <svg className="ahe-xm-tree" viewBox="0 0 170 130" aria-hidden="true">
        <ellipse cx="88" cy="124" rx="78" ry="5" fill="rgba(20,50,80,.16)" />
        {/* Tree */}
        <rect x="52" y="104" width="12" height="16" fill="#6d4a2b" />
        <path d="M58 10L22 62h14L14 92h18L4 112h108L84 92h18L80 62h14z" fill="#1f6b3a" />
        <path d="M58 10L22 62h14L14 92h18L4 112h54z" fill="rgba(255,255,255,.08)" />
        {/* Snow on the branches */}
        <path d="M24 61c6-3 12 1 18-1s12 2 18-1 12 2 18-1 8 1 12 2" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M16 91c8-3 14 1 22-1s14 2 22-1 14 2 22-1 10 1 16 2" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Ornaments */}
        {[
          [44, 48, "#e23b3b"],
          [70, 52, "#f5c542"],
          [36, 80, "#3b8fe2"],
          [60, 76, "#e23b3b"],
          [84, 84, "#f5c542"],
          [28, 104, "#f5c542"],
          [52, 100, "#3b8fe2"],
          [78, 106, "#e23b3b"],
          [98, 104, "#2fa84f"],
        ].map(([x, y, c], i) => (
          <g key={i}>
            <circle cx={x as number} cy={y as number} r="4.2" fill={c as string} />
            <circle cx={(x as number) - 1.3} cy={(y as number) - 1.4} r="1.2" fill="rgba(255,255,255,.7)" />
          </g>
        ))}
        {/* Star */}
        <path
          className="ahe-xm-star"
          d="M58 0l3.1 6.6 7.2.8-5.4 4.9 1.5 7.1L58 15.8l-6.4 3.6 1.5-7.1-5.4-4.9 7.2-.8z"
          fill="#ffd54a"
        />
        {/* Presents */}
        <Gift x={108} y={92} w={30} h={28} box="#c62828" ribbon="#ffd54a" />
        <Gift x={136} y={102} w={26} h={18} box="#2f7dd1" ribbon="#ffffff" />
        <Gift x={118} y={106} w={18} h={14} box="#2fa84f" ribbon="#e23b3b" />
      </svg>
    </>
  );
}

/** A pine sprig: a stem with needles either side. */
function Sprig({ x, y, angle }: { x: number; y: number; angle: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle} 11 0)`}>
      <path d="M0 0h22" stroke="#2f5d2a" strokeWidth="1.6" strokeLinecap="round" />
      {[2, 6, 10, 14, 18].map((n) => (
        <g key={n}>
          <path d={`M${n} 0l3 -6`} stroke="#2e7d3a" strokeWidth="2" strokeLinecap="round" />
          <path d={`M${n} 0l3 6`} stroke="#1f6b3a" strokeWidth="2" strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
}

/** A wrapped present with a ribbon and bow. */
function Gift({ x, y, w, h, box, ribbon }: { x: number; y: number; w: number; h: number; box: string; ribbon: string }) {
  const cx = x + w / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="2" fill={box} />
      <rect x={cx - 2} y={y} width="4" height={h} fill={ribbon} />
      <rect x={x} y={y + h * 0.35} width={w} height="4" fill={ribbon} />
      <path d={`M${cx} ${y}c-5-6-11-5-10-1 1 3 6 3 10 1zM${cx} ${y}c5-6 11-5 10-1-1 3-6 3-10 1z`} fill={ribbon} />
    </g>
  );
}
