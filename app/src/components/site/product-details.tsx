import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import {
  parseSpecSheet,
  renderRichText,
  renderSpecSheet,
  specLinkLabel,
} from "../../lib/rich-text";
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
      count: links.length,
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

function DownloadsPanel({ links }: { links: string[] }) {
  return (
    <div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {links.map((url) => {
          const label = specLinkLabel(url);
          const pdf = /\.pdf(?:$|[?#])/i.test(url);
          let host = "";
          try {
            host = new URL(url).hostname.replace(/^www\./, "");
          } catch {
            /* leave blank */
          }
          return (
            <li key={url}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="group flex min-h-[72px] items-center gap-4 rounded-[14px] border border-[#dbe7f3] bg-white p-4 no-underline transition-all hover:-translate-y-px hover:border-[#4a86c9] hover:shadow-[0_6px_18px_-10px_rgba(31,102,184,0.45)]"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[#e9f2fb] text-signal">
                  {pdf ? (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                      <path d="M14 3v5h5" />
                      <path d="M9 13h6M9 17h4" />
                    </svg>
                  ) : (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
                    </svg>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold leading-snug text-ink">
                    {label.replace(/ \(PDF\)$/, "").replace(/ on [^ ]+$/, "")}
                  </span>
                  <span className="mt-0.5 block truncate text-[13px] text-muted">
                    {pdf ? "PDF" : "Web page"}
                    {host ? ` · ${host}` : ""}
                  </span>
                </span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="shrink-0 text-muted transition-colors group-hover:text-signal"
                >
                  {pdf ? (
                    <path d="M12 4v12m0 0l-5-5m5 5l5-5M5 20h14" />
                  ) : (
                    <path d="M7 17L17 7M9 7h8v8" />
                  )}
                </svg>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          );
        })}
      </ul>
      <p className="mt-5 text-[14px] text-muted">
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
