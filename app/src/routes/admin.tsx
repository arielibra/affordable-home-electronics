import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

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
function SecurityBanner({ s }: { s: Security }) {
  const many = s.addresses24h > 1;
  const noisy = s.fails24h >= 5 || s.lockedNow > 0 || many;
  if (!noisy) return null;
  return (
    <div className="mt-6 border border-line border-l-[3px] border-l-[color:var(--color-signal)] bg-surface p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Sign-in attempts</p>
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
      <p className="mt-2 max-w-[74ch] text-xs leading-relaxed text-muted">
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
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-signal">Back office</p>
          <h1 className="mt-2 text-3xl font-semibold leading-none tracking-tighter text-ink md:text-4xl">
            Mind the shop.
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-sm text-muted underline underline-offset-4 hover:text-ink">
            View the site
          </Link>
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" });
              window.location.reload();
            }}
            className="h-9 border border-line px-4 text-xs font-medium text-ink hover:border-ink"
          >
            Sign out
          </button>
        </div>
      </div>

      {security ? <SecurityBanner s={security} /> : null}

      <div className="mt-6 flex flex-wrap gap-1 border-b border-line">
        {(
          [
            ["catalog", "Products"],
            ["stock", "Prices and stock"],
            ["categories", "Categories"],
            ["brands", "Brands"],
            ["orders", "Orders"],
            ["messages", "Messages"],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            aria-current={tab === key}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm transition-colors ${
              tab === key ? "border-signal text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="py-8">
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
    <div className="min-h-dvh bg-ground">
      <Shell className={wide ? "py-10" : "py-16"}>{children}</Shell>
    </div>
  );
}
