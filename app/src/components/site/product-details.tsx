import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { parseSpecSheet, renderRichText, renderSpecSheet } from "../../lib/rich-text";
import { SITE } from "../../lib/site";
import { Shell } from "./section";

/**
 * Everything about a product below the buy box, in one tabbed panel:
 * Overview (the write-up), Specifications (the spec sheet) and Downloads
 * (data sheets, manuals and other manufacturer links).
 *
 * - Tabs with nothing to show are left out, so a product with only specs gets
 *   one clean panel and no empty tabs.
 * - Every panel is rendered into the page and the inactive ones are hidden,
 *   so search engines and AI assistants still read all of it.
 * - WAI-ARIA tabs: arrow keys, Home and End move between tabs; each tab can
 *   be linked to (#overview, #specifications, #downloads).
 */

type TabId = "overview" | "specifications" | "downloads";
type Tab = { id: TabId; label: string; count?: number; body: ReactNode };

const SPEC_PREVIEW_ROWS = 14;

export function ProductDetails({ blurb, specs }: { blurb?: string | null; specs?: string | null }) {
  const sheet = parseSpecSheet(specs ?? "");
  const hasSpecs = sheet.blocks.length > 0;
  const links = sheet.links;

  const tabs: Tab[] = [];
  if (blurb && blurb.trim())
    tabs.push({ id: "overview", label: "Overview", body: <OverviewPanel text={blurb} /> });
  if (hasSpecs)
    tabs.push({
      id: "specifications",
      label: "Specifications",
      count: sheet.rowCount,
      body: <SpecsPanel sheet={sheet} />,
    });
  if (links.length)
    tabs.push({
      id: "downloads",
      label: "Downloads",
      count: resources(links).length,
      body: <DownloadsPanel links={links} />,
    });

  const [active, setActive] = useState<TabId>(tabs[0]?.id ?? "overview");
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const base = useId();

  // Open the tab a link points at (#specifications), on load and when the hash changes.
  useEffect(() => {
    const pick = () => {
      const h = window.location.hash.slice(1) as TabId;
      if (tabs.some((t) => t.id === h)) setActive(h);
    };
    pick();
    window.addEventListener("hashchange", pick);
    return () => window.removeEventListener("hashchange", pick);
    // The tab list only changes with the product, which remounts this component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (tabs.length === 0) return null;

  const select = (id: TabId, focus = false) => {
    setActive(id);
    if (focus) refs.current[id]?.focus();
    // Keep the address shareable without jumping the page.
    try {
      history.replaceState(null, "", `#${id}`);
    } catch {
      /* some embedded browsers refuse; the tab still switches */
    }
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = tabs.length - 1;
    const to =
      e.key === "ArrowRight"
        ? i === last
          ? 0
          : i + 1
        : e.key === "ArrowLeft"
          ? i === 0
            ? last
            : i - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : -1;
    if (to < 0) return;
    e.preventDefault();
    select(tabs[to].id, true);
  };

  return (
    <section className="pb-10 pt-4" aria-label="Product details">
      <Shell>
        <div className="overflow-hidden rounded-[18px] border border-[#dbe7f3] bg-surface shadow-[0_1px_2px_rgba(27,58,92,0.04),0_8px_24px_-12px_rgba(27,58,92,0.12)]">
          <div className="border-b border-[#e3edf7] bg-[#f8fbfe]">
            <div
              role="tablist"
              aria-label="Product details"
              className="ahe-tabs flex gap-1 overflow-x-auto px-3 sm:px-5"
            >
              {tabs.map((t, i) => {
                const on = t.id === active;
                return (
                  <button
                    key={t.id}
                    ref={(el) => {
                      refs.current[t.id] = el;
                    }}
                    id={`${base}-tab-${t.id}`}
                    role="tab"
                    type="button"
                    aria-selected={on}
                    aria-controls={`${base}-panel-${t.id}`}
                    tabIndex={on ? 0 : -1}
                    onClick={() => select(t.id)}
                    onKeyDown={(e) => onKey(e, i)}
                    className={`group relative flex min-h-[56px] shrink-0 items-center gap-2 px-3 text-[15px] font-semibold transition-colors focus-visible:outline-none sm:px-4 sm:text-[16px] ${
                      on ? "text-ink" : "text-muted hover:text-ink"
                    }`}
                  >
                    <span className="rounded-[8px] px-1 py-0.5 group-focus-visible:ring-2 group-focus-visible:ring-signal">
                      {t.label}
                    </span>
                    {t.count ? (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[12px] font-bold tabular-nums transition-colors ${
                          on ? "bg-ink text-white" : "bg-[#e6eef7] text-muted group-hover:text-ink"
                        }`}
                      >
                        {t.count}
                      </span>
                    ) : null}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-2 -bottom-px h-[3px] rounded-t-full bg-signal transition-transform duration-200 ease-out ${
                        on ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {tabs.map((t) => (
            <div
              key={t.id}
              id={`${base}-panel-${t.id}`}
              role="tabpanel"
              aria-labelledby={`${base}-tab-${t.id}`}
              hidden={t.id !== active}
              tabIndex={0}
              className="ahe-panel p-5 focus-visible:outline-none sm:p-8"
            >
              {t.body}
            </div>
          ))}
        </div>
      </Shell>
    </section>
  );
}

function OverviewPanel({ text }: { text: string }) {
  return (
    <div className="ahe-prose max-w-[72ch] text-[16px] leading-[1.7] text-muted">
      {renderRichText(text)}
    </div>
  );
}

function SpecsPanel({ sheet }: { sheet: ReturnType<typeof parseSpecSheet> }) {
  const [open, setOpen] = useState(false);
  const foldable = sheet.rowCount > SPEC_PREVIEW_ROWS + 4;
  const folded = foldable && !open;
  return (
    <div>
      <div
        className={`ahe-specs relative text-[15px] leading-relaxed ${folded ? "max-h-[34rem] overflow-hidden" : ""}`}
      >
        {renderSpecSheet(sheet)}
        {folded ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-surface via-surface/80 to-transparent"
          />
        ) : null}
      </div>
      {foldable ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#cfdcea] bg-white px-5 text-[14px] font-semibold text-ink transition-colors hover:border-ink"
        >
          {open ? "Show fewer" : `Show all ${sheet.rowCount} specifications`}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

type Resource = {
  url: string;
  title: string;
  kind: string;
  pdf: boolean;
  host: string;
  sheet: boolean;
};

// What each manufacturer link is, read from its address. Order matters:
// "firmware and manuals" is firmware; a "compatible HDD" post is a guide.
const KINDS: [RegExp, string, string][] = [
  [/data[-_ ]?sheet|spec[-_ ]?sheet|(^|[/_-])specs?([-_.]|$)/, "Data sheet", "Spec sheet"],
  [/compatible[-_ ]?(hdd|hard)|hdd|hard[-_ ]?drive/, "Compatible hard drives", "Guide"],
  [/firmware/, "Firmware updates", "Firmware"],
  [/mobile[-_ ]?app|-app\/?$/, "Mobile viewing app", "App"],
  [/software|vms|client|cms/, "PC viewing software", "Software"],
  [/matrix|accessor/, "Product matrix & accessories", "Guide"],
  [/install/, "Installation guide", "Guide"],
  [/quick[-_ ]?(start|guide)|qsg/, "Quick start guide", "Guide"],
  [/manual/, "User manual", "Manual"],
  [/(^|[/_-])pos([-_]|$)|point[-_ ]?of[-_ ]?sale/, "Point-of-sale (POS) setup", "Guide"],
  [/configuration[-_ ]?guide|config[-_ ]?guide/, "Configuration guide", "Guide"],
  [/osd/, "On-screen menu guide", "Guide"],
  [/site[-_ ]?survey/, "Site survey guide", "Guide"],
  [/power[-_ ]?distance/, "Power distance guide", "Guide"],
  [/catalog/, "Product catalog", "Catalog"],
];

function describe(url: string): Resource {
  let host = "";
  let path = url.toLowerCase();
  try {
    const u = new URL(url);
    host = u.hostname.replace(/^www\./, "");
    path = decodeURIComponent(u.pathname).toLowerCase();
  } catch {
    /* keep the raw address */
  }
  const pdf = /\.pdf$/.test(path);
  const hit = KINDS.find(([re]) => re.test(path));
  if (hit) return { url, host, pdf, title: hit[1], kind: hit[2], sheet: hit[2] === "Spec sheet" };
  // Anything else is either the manufacturer's page for this product or a
  // document we can't classify; never show a raw address as the name.
  if (!pdf) return { url, host, pdf, title: "Product page", kind: "Product", sheet: false };
  return { url, host, pdf, title: "Manufacturer document", kind: "Document", sheet: false };
}

/** One entry per document: the same page with and without a trailing slash, or two pages with the same name, show once. */
function resources(links: string[]): Resource[] {
  const seen = new Set<string>();
  const out: Resource[] = [];
  for (const url of links) {
    const r = describe(url);
    const key = url
      .toLowerCase()
      .replace(/^https?:\/\/(www\.)?/, "")
      .replace(/\/+$/, "");
    if (seen.has(key) || seen.has(`t:${r.title}`)) continue;
    seen.add(key);
    seen.add(`t:${r.title}`);
    out.push(r);
  }
  return out;
}

function DownloadsPanel({ links }: { links: string[] }) {
  const all = resources(links);
  const featured = all.find((r) => r.sheet && r.pdf) ?? all.find((r) => r.pdf);
  const rest = all.filter((r) => r !== featured);
  return (
    <div className="grid gap-7">
      {featured ? (
        <a
          href={featured.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="group flex flex-wrap items-center gap-x-6 gap-y-4 rounded-[16px] bg-ink px-5 py-5 text-white no-underline sm:flex-nowrap sm:px-7"
        >
          {/* A sheet of paper with its corner turned, drawn in CSS: reads as "document" without a stock icon. */}
          <span
            aria-hidden="true"
            className="relative h-[60px] w-[48px] shrink-0 rounded-[4px] bg-white shadow-[0_6px_14px_-6px_rgba(0,0,0,0.5)]"
          >
            <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-bl-[3px] bg-[#c9daec]" />
            <span className="absolute inset-x-2 top-[22px] h-[3px] rounded-full bg-[#dbe6f2]" />
            <span className="absolute left-2 right-4 top-[29px] h-[3px] rounded-full bg-[#dbe6f2]" />
            <span className="ahe-display absolute bottom-1.5 left-2 text-[13px] leading-none tracking-[0.06em] text-ink">
              PDF
            </span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="ahe-display block text-[13px] uppercase leading-none tracking-[0.14em] text-[#9cc3ea]">
              {featured.kind}
            </span>
            <span className="mt-1.5 block text-[19px] font-semibold leading-snug">
              {featured.title}
            </span>
            <span className="mt-0.5 block text-[14px] text-[#c4d6ea]">
              {featured.sheet ? "Full manufacturer specifications" : "PDF document"}
              {featured.host ? ` from ${featured.host}` : ""}
            </span>
          </span>
          <span className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-white px-5 text-[15px] font-semibold text-ink transition-transform group-hover:-translate-y-px">
            Download
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="transition-transform group-hover:translate-y-0.5"
            >
              <path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 20h14" />
            </svg>
          </span>
          <span className="sr-only">(PDF, opens in a new tab)</span>
        </a>
      ) : null}

      {rest.length ? (
        <div>
          <h3 className="ahe-display text-[13px] uppercase tracking-[0.14em] text-muted">
            More from the manufacturer
          </h3>
          <ul className="mt-2 grid sm:grid-cols-2 sm:gap-x-10">
            {rest.map((r) => (
              <li key={r.url} className="border-t border-[#e3edf7]">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="group grid min-h-[64px] grid-cols-[5.5rem_1fr_auto] items-center gap-3 py-3 text-ink no-underline"
                >
                  <span className="ahe-display text-[13px] uppercase leading-none tracking-[0.12em] text-signal">
                    {r.kind}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold leading-snug decoration-signal decoration-2 underline-offset-[5px] group-hover:underline">
                      {r.title}
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] text-muted">
                      {r.pdf ? "PDF" : r.host || "Web page"}
                    </span>
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="text-[#8aa6c4] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal"
                  >
                    <path d="M7 17L17 7M9 7h8v8" />
                  </svg>
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="text-[14px] text-muted">
        Need a document that isn&rsquo;t here? Call{" "}
        <a
          href={SITE.phoneHref}
          className="font-semibold text-ink underline underline-offset-4 hover:text-signal"
        >
          {SITE.phone}
        </a>{" "}
        and we&rsquo;ll send it over.
      </p>
    </div>
  );
}
