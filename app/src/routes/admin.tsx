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
import { Shell } from "../components/site/section";
import { SITE } from "../lib/site";
import { btnQuiet, card, h1, h2, lede, small } from "../components/admin/ui";

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
 * Only shown when something actually looks like an attempt to get in.
 *
 * The distinction that matters is attempts versus addresses: one address
 * failing a few times is a forgotten password, several addresses failing is
 * somebody working through a list. A banner that cried wolf on every mistype
 * would be ignored within a week, so a single address under the lockout
 * threshold says nothing at all.
 */
const TABS: [Tab, string][] = [
  ["catalog", "Products"],
  ["stock", "Prices and stock"],
  ["categories", "Categories"],
  ["brands", "Brands"],
  ["orders", "Orders"],
  ["messages", "Messages"],
];

/**
 * One track, one pill, and the pill moves. Measured from the live buttons
 * rather than guessed, because the labels are different widths and anything
 * hard-coded drifts the moment one of them is renamed.
 */
function Tabs({ tab, onPick }: { tab: Tab; onPick: (t: Tab) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const host = wrap.current;
    if (!host) return;
    const measure = () => {
      const active = host.querySelector<HTMLElement>('[aria-selected="true"]');
      if (active) setPill({ left: active.offsetLeft, width: active.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    return () => ro.disconnect();
  }, [tab]);

  return (
    <div ref={wrap} role="tablist" className="ahe-tabs relative mt-8 overflow-x-auto">
      <span
        aria-hidden
        className="ahe-tab-pill"
        style={{ transform: `translateX(${pill.left}px)`, width: pill.width }}
      />
      {TABS.map(([key, label]) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={tab === key}
          onClick={() => onPick(key)}
          className="ahe-tab"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function SecurityBanner({ s }: { s: Security }) {
  const many = s.addresses24h > 1;
  const noisy = s.fails24h >= 5 || s.lockedNow > 0 || many;
  if (!noisy) return null;
  return (
    <div className="mt-6 border border-[color:var(--admin-hairline)] border-l-[3px] border-l-[color:var(--color-signal)] bg-surface p-4">
      <p className="text-[13px] font-medium text-muted">Sign-in attempts</p>
      <p className="mt-2 text-sm leading-relaxed text-ink">
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
      <p className="mt-2 max-w-[74ch] text-[13px] leading-relaxed text-muted">
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
      <Frame>
        <p className="text-sm text-muted">Checking.</p>
      </Frame>
    );
  }

  if (status === "unconfigured") {
    return (
      <Frame>
        <h1 className="text-3xl font-semibold tracking-tighter text-ink">The back office is not switched on yet.</h1>
        <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-muted">
          It needs a password set on the site itself, as a secret called <code className="font-mono text-ink">ADMIN_PASSWORD</code>.
          Nobody can sign in until that exists, which is deliberate: an admin page with no password is worse than no
          admin page at all.
        </p>
      </Frame>
    );
  }

  if (status === "out") return <SignIn onIn={() => setStatus("in")} />;

  return (
    <Frame wide>
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h1 className={h1}>Mind the shop.</h1>
          <p className={`${lede} mt-3`}>Everything about the catalogue and the orders, in one place.</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link to="/" className={btnQuiet}>
            View the site
          </Link>
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" });
              window.location.reload();
            }}
            className={btnQuiet}
          >
            Sign out
          </button>
        </div>
      </header>

      {security ? <SecurityBanner s={security} /> : null}

      <Tabs tab={tab} onPick={setTab} />

      <div key={tab} className="ahe-panel pt-9">
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
    </Frame>
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
    <div className="flex min-h-dvh items-center justify-center bg-ground px-5 py-16">
      <div className="w-full max-w-[400px]">
        <Mark detail="full" className="h-12 w-[68px] text-ink" />
        <h1 className="mt-8 text-3xl font-semibold leading-none tracking-tighter text-ink">Shop sign in</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          For staff. Customers never need this page.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <Field label="Password" name="password">
            <TextInput id="password" name="password" type="password" required autoFocus autoComplete="current-password" />
          </Field>
          {error ? <Notice tone="bad">{error}</Notice> : null}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 w-full items-center justify-center bg-ink px-6 text-sm font-medium text-surface active:scale-[0.98] disabled:bg-line disabled:text-muted"
          >
            {pending ? "Checking" : "Sign in"}
          </button>
        </form>
        <p className="mt-8 text-sm leading-relaxed text-muted">
          Locked out? The password is held by whoever set up the site. Shop line{" "}
          <a href={SITE.emailHref} className="font-mono text-ink underline underline-offset-4">
            {SITE.email}
          </a>
          .
        </p>
      </div>
    </div>
  );
}

function Frame({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="ahe-admin min-h-dvh bg-ground">
      <Shell className={wide ? "py-10 md:py-14" : "py-16"}>{children}</Shell>
    </div>
  );
}
