import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The homepage slideshow, directly under the headline in the hero.
 *
 * Slides are the owner's own banners, all the same wide shape (6336 x 2688,
 * about 2.36 : 1), shown whole and never cropped because most carry words of
 * their own. To add one: export it at that size, save a 1600px and a 900px
 * WebP under 100 KB in public/assets/slides/, and add a line below. `href` is
 * optional; with it the whole slide becomes a link.
 *
 * Behaviour: slides sideways every 6 seconds; stops while the pointer is on it,
 * while it has keyboard focus, and while the tab is hidden; swipes on touch;
 * dots jump to any slide. With reduced motion turned on it never moves by
 * itself and changes slide without the sliding animation.
 */
type Overlay = {
  /** Headline, first line white, second line blue, like the plate slide. */
  lines: [string, string];
  sub: string;
  points: { icon: "person" | "light" | "bell"; text: string }[];
};
type Slide = { name: string; alt: string; href?: string; overlay?: Overlay };

const SLIDES: Slide[] = [
  {
    name: "night-watch",
    alt: "An Alibi camera with its spotlight on, catching a man breaking into a car on a city street at night",
    // Set as real text rather than baked into the picture: always spelled
    // right, sharp at any size, and readable by search engines.
    overlay: {
      lines: ["It knows a thief", "from a passerby."],
      sub: "AI detection cameras by Alibi",
      points: [
        { icon: "person", text: "Spots people, not shadows or trees" },
        { icon: "light", text: "Lights up the moment someone lingers" },
        { icon: "bell", text: "Alerts your phone instantly" },
      ],
    },
  },
  {
    name: "warranty",
    alt: "Access control terminals, Lorex and ENS cameras and a recorder, with a 3 year included and 6 year extended warranty",
  },
  {
    name: "plate-recognition",
    alt: "Two Alibi license plate cameras on a garage wall reading a car's plate as the gate opens. Every car. Every plate.",
  },
];

const INTERVAL_MS = 6000;
const W = 6336;
const H = 2688;

export function HeroSlides() {
  const n = SLIDES.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const go = useCallback((i: number) => setIndex(((i % n) + n) % n), [n]);

  // Restarting the timer on every index change means a click on a dot gets a
  // full interval before the next automatic move, rather than a stray jump.
  useEffect(() => {
    if (paused || reduced || n < 2) return;
    const t = window.setTimeout(() => {
      if (document.visibilityState === "visible") go(index + 1);
    }, INTERVAL_MS);
    return () => window.clearTimeout(t);
  }, [index, paused, reduced, n, go]);

  return (
    <div
      className="ahe-slides"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const x0 = touchX.current;
        touchX.current = null;
        const x1 = e.changedTouches[0]?.clientX;
        if (x0 == null || x1 == null) return;
        const dx = x1 - x0;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
      }}
    >
      <div className="ahe-slides-view" style={{ aspectRatio: `${W} / ${H}` }}>
        <div
          className={`ahe-slides-track ${reduced ? "" : "ahe-slides-animate"}`}
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {SLIDES.map((s, i) => {
            const img = (
              <img
                src={`/assets/slides/${s.name}-1600.webp`}
                srcSet={`/assets/slides/${s.name}-900.webp 900w, /assets/slides/${s.name}-1600.webp 1600w`}
                sizes="(max-width: 1240px) 100vw, 1180px"
                width={1600}
                height={679}
                alt={s.alt}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
                decoding="async"
                draggable={false}
              />
            );
            return (
              <div
                key={s.name}
                className="ahe-slide"
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${n}`}
                aria-hidden={i !== index}
              >
                {s.overlay ? <SlideText o={s.overlay} /> : null}
                {s.href ? (
                  <a href={s.href} tabIndex={i === index ? 0 : -1}>
                    {img}
                  </a>
                ) : (
                  img
                )}
              </div>
            );
          })}
        </div>
      </div>

      {n > 1 ? (
        <div className="ahe-slides-dots">
          {SLIDES.map((s, i) => (
            <button
              key={s.name}
              type="button"
              aria-label={`Show slide ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => go(i)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

const ICONS: Record<Overlay["points"][number]["icon"], string> = {
  person: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0",
  light: "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.4.3.6.8.6 1.2v1h6v-1c0-.5.2-.9.6-1.2A6 6 0 0 0 12 3Z",
  bell: "M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2Zm4 4a2 2 0 0 0 4 0",
};

function SlideText({ o }: { o: Overlay }) {
  return (
    <div className="ahe-slide-text">
      <p className="ahe-slide-h">
        <span>{o.lines[0]}</span>
        <span className="ahe-slide-h2">{o.lines[1]}</span>
      </p>
      <p className="ahe-slide-sub">{o.sub}</p>
      <ul className="ahe-slide-points">
        {o.points.map((p) => (
          <li key={p.text}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d={ICONS[p.icon]} />
            </svg>
            {p.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
