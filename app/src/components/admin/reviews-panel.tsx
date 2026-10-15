import { useEffect, useState } from "react";

import { Stars } from "../site/reviews";

type Review = {
  id: string;
  product_slug: string;
  product_name: string | null;
  reference: string | null;
  customer: string | null;
  rating: number;
  title: string;
  body: string;
  author: string;
  status: "pending" | "approved" | "hidden";
  created_at: string;
};

type Filter = "pending" | "approved" | "hidden";

const LABEL: Record<Filter, string> = { pending: "Waiting", approved: "Live", hidden: "Hidden" };

function when(value: string): string {
  const d = new Date(value.replace(" ", "T") + "Z");
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

/**
 * Every review waits here before it goes on the site.
 *
 * The rule he should apply is in the note at the top, because it is the one
 * that keeps the shop on the right side of Google and the FTC: publish honest
 * reviews whatever the stars, hide only abuse, spam and personal details.
 * Hiding the bad ones turns real reviews into fake ones.
 */
export function ReviewsPanel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("pending");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/reviews")
      .then((r) => r.json() as Promise<{ ok: boolean; reviews?: Review[]; error?: string }>)
      .then((d) => {
        if (!alive) return;
        if (d.ok && d.reviews) {
          setReviews(d.reviews);
          if (!d.reviews.some((r) => r.status === "pending") && d.reviews.length) setFilter("approved");
        } else setError(d.error ?? "Could not load reviews.");
      })
      .catch(() => alive && setError("Could not load reviews."))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  async function decide(id: string, status: Filter) {
    setBusy(id);
    setError("");
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const d = (await res.json()) as { ok: boolean; error?: string };
      if (d.ok) setReviews((all) => all.map((r) => (r.id === id ? { ...r, status } : r)));
      else setError(d.error ?? "That did not save.");
    } catch {
      setError("Could not reach the site.");
    } finally {
      setBusy("");
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading reviews.</p>;

  const counts = { pending: 0, approved: 0, hidden: 0 } as Record<Filter, number>;
  for (const r of reviews) counts[r.status] = (counts[r.status] ?? 0) + 1;
  const shown = reviews.filter((r) => r.status === filter);

  return (
    <div>
      <div className="mb-6 max-w-[78ch] border-l-2 border-[color:var(--admin-hairline)] py-1 pl-4 text-[13px] leading-[1.6] text-muted">
        Only customers with a shipped order can write one, and nothing shows until you approve it. Approve honest reviews
        whatever the stars. Hide only abuse, spam, or anything with someone's phone number or address in it. Hiding fair bad
        reviews breaks Google's rules and makes the good ones look fake.
      </div>

      {error ? <p className="mb-4 border-l-2 border-signal py-2 pl-3 text-sm text-signal">{error}</p> : null}

      <div className="flex flex-wrap gap-2 border-b border-[color:var(--admin-hairline)] pb-4">
        {(Object.keys(LABEL) as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
              filter === f ? "bg-ink text-white" : "bg-surface text-muted hover:text-ink"
            }`}
          >
            {LABEL[f]} {counts[f] ? <span className="ml-1 font-mono">{counts[f]}</span> : null}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="mt-6 border border-[color:var(--admin-hairline)] bg-surface p-10 text-center">
          <p className="text-base text-ink">
            {filter === "pending" ? "Nothing waiting." : filter === "approved" ? "No live reviews yet." : "Nothing hidden."}
          </p>
          {reviews.length === 0 ? (
            <p className="mx-auto mt-2 max-w-[60ch] text-sm text-muted">
              Customers are emailed two weeks after their order ships, and can also review from any product page with their
              order number. Amazon and Walmart buyers are never emailed.
            </p>
          ) : null}
        </div>
      ) : (
        <ul className="mt-2">
          {shown.map((r) => (
            <li
              key={r.id}
              className="grid gap-4 border-b border-[color:var(--admin-hairline)] py-5 lg:grid-cols-[260px_1fr_auto]"
            >
              <div>
                <p className="text-sm font-medium text-ink">{r.author}</p>
                <p className="mt-1 text-[13px] text-muted">
                  {r.customer ? `${r.customer} · ` : ""}
                  {r.reference ?? "order deleted"}
                </p>
                <p className="mt-1 font-mono text-[13px] text-muted">{when(r.created_at)}</p>
              </div>
              <div className="min-w-0">
                <a
                  href={`/p/${r.product_slug}#reviews`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[13px] text-muted underline underline-offset-4 hover:text-ink"
                >
                  {r.product_name ?? r.product_slug}
                </a>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <Stars value={r.rating} />
                  {r.title ? <p className="text-sm font-semibold text-ink">{r.title}</p> : null}
                </div>
                {r.body ? (
                  <p className="mt-2 max-w-[70ch] whitespace-pre-wrap text-sm leading-relaxed text-ink">{r.body}</p>
                ) : (
                  <p className="mt-2 text-sm text-muted">Stars only, no written review.</p>
                )}
              </div>
              <div className="flex flex-wrap items-start gap-2 lg:flex-col lg:items-stretch">
                {r.status !== "approved" ? (
                  <button
                    type="button"
                    disabled={busy === r.id}
                    onClick={() => decide(r.id, "approved")}
                    className="rounded-lg bg-ink px-4 py-2 text-[13px] font-medium text-white disabled:opacity-60"
                  >
                    {r.status === "hidden" ? "Put it live" : "Approve"}
                  </button>
                ) : null}
                {r.status !== "hidden" ? (
                  <button
                    type="button"
                    disabled={busy === r.id}
                    onClick={() => decide(r.id, "hidden")}
                    className="rounded-lg border border-[color:var(--admin-hairline)] px-4 py-2 text-[13px] font-medium text-ink disabled:opacity-60"
                  >
                    {r.status === "approved" ? "Take down" : "Hide"}
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
