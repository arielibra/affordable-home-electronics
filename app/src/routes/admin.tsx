import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { BrandsPanel } from "../components/admin/brands-panel";
import { CatalogPanel } from "../components/admin/catalog-panel";
import { CategoriesPanel } from "../components/admin/categories-panel";
import { MessagesPanel } from "../components/admin/messages-panel";
import { OrdersPanel } from "../components/admin/orders-panel";
import { StockPanel } from "../components/admin/stock-panel";
import { Field, Notice, TextInput } from "../components/site/form";
import { Mark } from "../components/site/mark";
import { ICONS } from "../components/admin/icons";
import { SITE } from "../lib/site";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Shop admin | Affordable Home Electronics" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Admin,
});

type Tab = "catalog" | "stock" | "categories" | "brands" | "orders" | "messages";

type Security = {
  fails24h: number;
  addresses24h: number;
  lockedNow: number;
  lastAt: string | null;
  countries: string[];
};

/**
 * The same six screens, grouped the way the work splits: what he sells, and
 * who is buying it. Six flat tabs gave no hint that Categories and Brands
 * belong together and Messages does not, and a heading costs nothing.
 */
const GROUPS: { heading: string; items: [Tab, string][] }[] = [
  {
    heading: "Catalogue",
    items: [
      ["catalog", "Products"],
      ["stock", "Prices and stock"],
      ["categories", "Categories"],
      ["brands", "Brands"],
    ],
  },
  {
    heading: "Customers",
    items: [
      ["orders", "Orders"],
      ["messages", "Messages"],
    ],
  },
];

/** A line under each title saying what the screen is for. */
const BLURBS: Record<Tab, string> = {
  catalog: "Every listing on the shop — add one, edit one, copy one, take one down.",
  stock: "Prices and how many are on the shelf, across the whole catalogue at once.",
  categories: "The sections customers browse by.",
  brands: "The makers you stock, and the logo shown against each.",
  orders: "Everything sold, wherever it sold, and where each one has got to.",
  messages: "What customers have sent in through the site.",
};

const ALL: [Tab, string][] = GROUPS.flatMap((g) => g.items);

/**
 * The marker slides between items rather than blinking from one to the next.
 * Measured from the live buttons, never hard-coded, so renaming a section or
 * changing the type size cannot knock it out of line.
 */
function useSlider(active: string) {
  const wrap = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ top: 0, height: 0, left: 0, width: 0 });

  useLayoutEffect(() => {
    const host = wrap.current;
    if (!host) return;
    const measure = () => {
      const el = host.querySelector<HTMLElement>('[data-active="true"]');
      if (el) setBox({ top: el.offsetTop, height: el.offsetHeight, left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    return () => ro.disconnect();
  }, [active]);

  return { wrap, box };
}

function SideNav({ tab, onPick }: { tab: Tab; onPick: (t: Tab) => void }) {
  const { wrap, box } = useSlider(tab);
  return (
    <nav ref={wrap} className="ahe-nav">
      <span
        aria-hidden
        className="ahe-nav-marker"
        style={{ transform: `translateY(${box.top}px)`, height: box.height }}
      />
      {GROUPS.map((group) => (
        <div key={group.heading} className="mb-7 last:mb-0">
          <p className="ahe-nav-heading">{group.heading}</p>
          {group.items.map(([key, label]) => (
            <button
              key={key}
              type="button"
              data-active={tab === key}
              aria-current={tab === key ? "page" : undefined}
              onClick={() => onPick(key)}
              className="ahe-nav-item"
            >
              <span className="ahe-nav-icon">{ICONS[key]}</span>
              {label}
            </button>
          ))}
        </div>
      ))}
    </nav>
  );
}

/** The same six as one scrolling row, for a phone. */
function TopNav({ tab, onPick }: { tab: Tab; onPick: (t: Tab) => void }) {
  const { wrap, box } = useSlider(tab);
  return (
    <div ref={wrap} className="ahe-rail">
      <span
        aria-hidden
        className="ahe-rail-marker"
        style={{ transform: `translateX(${box.left}px)`, width: box.width }}
      />
      {ALL.map(([key, label]) => (
        <button key={key} type="button" data-active={tab === key} onClick={() => onPick(key)} className="ahe-rail-item">
          {label}
        </button>
      ))}
    </div>
  );
}

/**
 * Only shown when something actually looks like an attempt to get in.
 *
 * The distinction that matters is attempts versus addresses: one address
 * failing a few times is a forgotten password, several addresses failing is
 * somebody working through a list. A banner that cried wolf on every mistype
 * would be ignored within a week, so a single address under the lockout
 * threshold says nothing at all.
 */
function SecurityBanner({ s }: { s: Security }) {
  const many = s.addresses24h > 1;
  const noisy = s.fails24h >= 5 || s.lockedNow > 0 || many;
  if (!noisy) return null;
  return (
    <div className="ahe-alert">
      <p className="text-[13px] font-semibold text-ink">Sign-in attempts</p>
      <p className="mt-1.5 text-[14px] leading-[1.55] text-ink">
        <b>{s.fails24h}</b> failed sign-in{s.fails24h === 1 ? "" : "s"} in the last 24 hours, from{" "}
        <b>{s.addresses24h}</b> address{s.addresses24h === 1 ? "" : "es"}
        {s.countries.length ? ` (${s.countries.join(", ")})` : ""}.
        {s.lockedNow > 0 ? (
          <>
            {" "}
            <b>{s.lockedNow}</b> {s.lockedNow === 1 ? "is" : "are"} locked out right now.
          </>
        ) : null}
      </p>
      <p className="mt-2 max-w-[74ch] text-[13px] leading-[1.55] text-muted">
        {many
          ? "Several different addresses is the pattern worth noticing — that is someone guessing, not a forgotten password. Each is shut out for 15 minutes after 5 wrong tries, so the password itself is not at risk unless it is an easy one."
          : "Probably just a mistyped password. Worth a glance rather than a worry."}
      </p>
    </div>
  );
}

function Admin() {
  const [status, setStatus] = useState<"checking" | "unconfigured" | "out" | "in">("checking");
  const [tab, setTab] = useState<Tab>("catalog");
  const [security, setSecurity] = useState<Security | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/session")
      .then((r) => r.json() as Promise<{ configured: boolean; authed: boolean; security: Security | null }>)
      .then((d) => {
        if (!alive) return;
        setStatus(!d.configured ? "unconfigured" : d.authed ? "in" : "out");
        setSecurity(d.security ?? null);
      })
      .catch(() => alive && setStatus("out"));
    return () => {
      alive = false;
    };
  }, []);

  if (status === "checking") {
    return (
      <Plain>
        <p className="text-sm text-muted">Checking.</p>
      </Plain>
    );
  }

  if (status === "unconfigured") {
    return (
      <Plain>
        <h1 className="text-[32px] font-semibold leading-[1.1] tracking-[-0.025em] text-ink">
          The back office is not switched on yet.
        </h1>
        <p className="mt-4 max-w-[62ch] text-[16px] leading-[1.6] text-muted">
          It needs a password set on the site itself, as a secret called{" "}
          <code className="font-mono text-ink">ADMIN_PASSWORD</code>. Nobody can sign in until that exists, which is
          deliberate: an admin page with no password is worse than no admin page at all.
        </p>
      </Plain>
    );
  }

  if (status === "out") return <SignIn onIn={() => setStatus("in")} />;

  const title = ALL.find(([k]) => k === tab)?.[1] ?? "";

  return (
    <div className="ahe-admin">
      <aside className="ahe-sidebar">
        <div className="ahe-brand">
          <Mark detail="compact" className="h-8 w-11 shrink-0 text-ink" />
          <span className="min-w-0">
            <span className="ahe-brand-name">Affordable Home</span>
            <span className="ahe-brand-sub">Shop admin</span>
          </span>
        </div>

        <SideNav tab={tab} onPick={setTab} />

        <div className="ahe-sidefoot">
          <Link to="/" className="ahe-sidelink">
            View the site
          </Link>
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" });
              window.location.reload();
            }}
            className="ahe-sidelink"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="ahe-content">
        <header className="ahe-topbar">
          <h1 className="ahe-title">{title}</h1>
          <p className="ahe-subtitle">{BLURBS[tab]}</p>
        </header>

        <TopNav tab={tab} onPick={setTab} />

        <main className="ahe-main">
          {security ? <SecurityBanner s={security} /> : null}
          <div key={tab} className="ahe-panel">
            {tab === "catalog" ? (
              <CatalogPanel />
            ) : tab === "stock" ? (
              <StockPanel />
            ) : tab === "categories" ? (
              <CategoriesPanel />
            ) : tab === "brands" ? (
              <BrandsPanel />
            ) : tab === "orders" ? (
              <OrdersPanel />
            ) : (
              <MessagesPanel />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function SignIn({ onIn }: { onIn: () => void }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) onIn();
      else setError(data.error ?? "That did not work.");
    } catch {
      setError("Could not reach the site. Check the connection.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="ahe-admin flex min-h-dvh items-center justify-center bg-ground px-5 py-16">
      <div className="ahe-signin">
        <Mark detail="full" className="h-12 w-[68px] text-ink" />
        <h1 className="mt-7 text-[30px] font-semibold leading-[1.1] tracking-[-0.025em] text-ink">Shop sign in</h1>
        <p className="mt-2.5 text-[14px] leading-[1.55] text-muted">For staff. Customers never need this page.</p>
        <form onSubmit={onSubmit} className="mt-7 space-y-4">
          <Field label="Password" name="password">
            <TextInput id="password" name="password" type="password" required autoFocus autoComplete="current-password" />
          </Field>
          {error ? <Notice tone="bad">{error}</Notice> : null}
          <button type="submit" disabled={pending} className="ahe-signin-btn">
            {pending ? "Checking" : "Sign in"}
          </button>
        </form>
        <p className="mt-7 text-[14px] leading-[1.55] text-muted">
          Locked out? The password is held by whoever set up the site. Shop line{" "}
          <a href={SITE.phoneHref} className="font-mono text-ink underline underline-offset-4">
            {SITE.phone}
          </a>
          .
        </p>
      </div>
    </div>
  );
}

function Plain({ children }: { children: React.ReactNode }) {
  return (
    <div className="ahe-admin min-h-dvh bg-ground">
      <div className="mx-auto max-w-[72ch] px-5 py-16 md:px-8">{children}</div>
    </div>
  );
}
