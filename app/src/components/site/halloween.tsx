/**
 * The Halloween look: a dusk tint and a moon behind the home page camera wall,
 * a few bats crossing it, "Night vision" on the camera labels, and a slim
 * greeting bar under the header. Nothing on product cards, prices or checkout.
 *
 * It switches itself on for October 15-31 and off at midnight on November 1st,
 * shop time (New York), every year. The date is worked out on the server for
 * the first paint and again in the shopper's browser, so a page cached the
 * night before still drops the theme on the 1st.
 */
import { useEffect, useState } from "react";

const START_DAY = 15; // October 15
const SHOP_TZ = "America/New_York";

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
  // New York is UTC-4 for all of late October (daylight time ends in November).
  const ny = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  return { month: ny.getUTCMonth() + 1, day: ny.getUTCDate() };
}

export function isHalloweenSeason(now: Date = new Date()): boolean {
  const { month, day } = shopDate(now);
  return month === 10 && day >= START_DAY && day <= 31;
}

/** True during the season. Re-checked in the browser after it loads. */
export function useHalloween(): boolean {
  const [on, setOn] = useState(() => isHalloweenSeason());
  useEffect(() => {
    setOn(isHalloweenSeason());
  }, []);
  return on;
}

export function HalloweenStrip() {
  const on = useHalloween();
  if (!on) return null;
  return (
    <div className="ahe-hw-strip">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[20px] w-[20px] shrink-0">
        <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" fill="#ffd27a" />
      </svg>
      <b>Happy Halloween</b>
      <span>Porch lights on, cameras watching.</span>
    </div>
  );
}

const BAT =
  "M32 8c-2-4-4-5-6-5 1 2 1 4 0 5-3-3-9-4-14-2 3 1 5 3 5 6-4-2-10-2-15 1 6 1 10 4 12 9 2-3 6-4 10-2 2-3 5-4 8-4s6 1 8 4c4-2 8-1 10 2 2-5 6-8 12-9-5-3-11-3-15-1 0-3 2-5 5-6-5-2-11-1-14 2-1-1-1-3 0-5-2 0-4 1-6 5z";

/** Moon and bats for the home page camera wall. Decorative only. */
export function HalloweenSky() {
  const on = useHalloween();
  if (!on) return null;
  return (
    <>
      <span className="ahe-hw-moon" aria-hidden="true" />
      <span className="ahe-hw-bats" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <svg key={i} viewBox="0 0 64 28">
            <path d={BAT} />
          </svg>
        ))}
      </span>
    </>
  );
}
