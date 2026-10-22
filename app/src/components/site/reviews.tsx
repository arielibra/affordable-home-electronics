import { useEffect, useState } from "react";

import { Field, Notice, TextArea, TextInput } from "./form";

/* ------------------------------------------------------------------ *
 * Stars
 * ------------------------------------------------------------------ */

const STAR = "M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5l-5.9 3.1 1.2-6.5L2.5 9.5l6.6-.9z";

/** Read-only stars. Fractional averages fill part of the last star. */
export function Stars({ value, size = 16, label }: { value: number; size?: number; label?: string }) {
  return (
    <span className="inline-flex items-center gap-[2px]" role="img" aria-label={label ?? `${value} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }} aria-hidden>
            <svg viewBox="0 0 24 24" width={size} height={size} className="absolute inset-0 text-line">
              <path d={STAR} fill="currentColor" />
            </svg>
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <svg viewBox="0 0 24 24" width={size} height={size} className="text-[#e8a317]">
                <path d={STAR} fill="currentColor" />
              </svg>
            </span>
          </span>
        );
      })}
    </span>
  );
}

const WORDS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

/** The picker: real radio buttons, so it works by keyboard and screen reader. */
function StarPicker({ name, value, onChange }: { name: string; value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <fieldset>
      <legend className="mb-1.5 block text-[14px] font-semibold text-muted">Your rating</legend>
      <div className="flex items-center gap-3">
        <div className="flex" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer p-0.5" onMouseEnter={() => setHover(n)}>
              <input
                type="radio"
                name={name}
                value={n}
                checked={value === n}
                onChange={() => onChange(n)}
                className="peer sr-only"
              />
              <svg
                viewBox="0 0 24 24"
                width={30}
                height={30}
                aria-hidden
                className={`rounded-sm peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-ink ${
                  n <= shown ? "text-[#e8a317]" : "text-line"
                }`}
              >
                <path d={STAR} fill="currentColor" />
              </svg>
              <span className="sr-only">
                {n} star{n === 1 ? "" : "s"}, {WORDS[n]}
              </span>
            </label>
          ))}
        </div>
        <span className="text-[15px] text-muted">{shown ? WORDS[shown] : "Pick 1 to 5"}</span>
      </div>
    </fieldset>
  );
}

/* ------------------------------------------------------------------ *
 * Writing a review
 * ------------------------------------------------------------------ */

type Product = {
  slug: string;
  name: string;
  image: string;
  existing: { rating: number; title: string; body: string; status: string } | null;
};
type Draft = { rating: number; title: string; body: string };

async function call(body: Record<string, unknown>) {
  const res = await fetch("/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as {
    ok: boolean;
    error?: string;
    reference?: string;
    suggestedName?: string;
    products?: Product[];
    saved?: number;
  };
}

/**
 * Verified buyers only. From the follow-up email the link carries a token;
 * on a product page the buyer gives the order number and email instead.
 * `only` limits it to the product whose page this is.
 */
export function ReviewWriter({ token, only, onCancel }: { token?: string; only?: string; onCancel?: () => void }) {
  const [auth, setAuth] = useState<{ token?: string; reference?: string; email?: string } | null>(
    token ? { token } : null,
  );
  const [products, setProducts] = useState<Product[] | null>(null);
  const [reference, setReference] = useState("");
  const [author, setAuthor] = useState("");
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(0);

  async function load(a: { token?: string; reference?: string; email?: string }) {
    setPending(true);
    setError("");
    try {
      const d = await call(a);
      if (!d.ok || !d.products) {
        setError(d.error ?? "That did not work.");
        return;
      }
      const list = only ? d.products.filter((p) => p.slug === only) : d.products;
      if (only && list.length === 0) {
        setError(
          d.products.length
            ? "That order does not include this product. You can review what it does include from the link in your email."
            : "We could not match that order to anything on the site right now. Call the shop and we will sort it out.",
        );
        return;
      }
      if (!list.length) {
        setError("Nothing from this order is on the site any more, so there is nothing to review here.");
        return;
      }
      setAuth(a);
      setReference(d.reference ?? "");
      setAuthor(d.suggestedName ?? "");
      setProducts(list);
      setDrafts(
        Object.fromEntries(
          list.map((p) => [p.slug, p.existing ? { rating: p.existing.rating, title: p.existing.title, body: p.existing.body } : { rating: 0, title: "", body: "" }]),
        ),
      );
    } catch {
      setError("Could not reach the site. Check the connection and try again.");
    } finally {
      setPending(false);
    }
  }

  // The email link proves the buyer already, so go straight to the form.
  useEffect(() => {
    if (token) void load({ token });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth || !products) return;
    const reviews = products
      .map((p) => ({ slug: p.slug, ...drafts[p.slug] }))
      .filter((r) => r.rating >= 1);
    if (!reviews.length) {
      setError("Pick a star rating first.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const d = await call({ ...auth, author, reviews });
      if (d.ok) setDone(d.saved ?? reviews.length);
      else setError(d.error ?? "That did not work.");
    } catch {
      setError("Could not reach the site. Check the connection and try again.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-[14px] border border-[#dbe7f3] bg-surface p-6">
        <p className="text-lg font-semibold tracking-tight text-ink">Thank you.</p>
        <p className="mt-2 max-w-[58ch] text-[15px] leading-relaxed text-muted">
          {done === 1 ? "Your review has" : `Your ${done} reviews have`} been sent to the shop. We read every one before it
          goes up, which usually takes a day or two.
        </p>
      </div>
    );
  }

  if (!products) {
    if (token) {
      return error ? (
        <div className="space-y-4">
          <Notice tone="bad">{error}</Notice>
          <ReviewWriter only={only} />
        </div>
      ) : (
        <p className="text-[15px] text-muted">Finding your order.</p>
      );
    }
    return (
      <form
        className="rounded-[14px] border border-[#dbe7f3] bg-surface p-6"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          void load({ reference: String(f.get("reference") ?? ""), email: String(f.get("email") ?? "") });
        }}
      >
        <p className="text-lg font-semibold tracking-tight text-ink">Bought this from us?</p>
        <p className="mt-1.5 max-w-[60ch] text-[15px] leading-relaxed text-muted">
          Reviews come from verified buyers only. Enter your order number (it starts AHE) and the email you ordered with.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Order number" name="rv-reference">
            <TextInput id="rv-reference" name="reference" required placeholder="AHE-29689" autoComplete="off" />
          </Field>
          <Field label="Email" name="rv-email">
            <TextInput id="rv-email" name="email" type="email" required autoComplete="email" />
          </Field>
        </div>
        {error ? (
          <div className="mt-4">
            <Notice tone="bad">{error}</Notice>
          </div>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={pending}
            className="h-12 rounded-[10px] bg-ink px-6 text-[15px] font-semibold text-white transition-colors hover:bg-ink-soft disabled:opacity-60"
          >
            {pending ? "Checking" : "Continue"}
          </button>
          {onCancel ? (
            <button type="button" onClick={onCancel} className="text-[15px] text-signal underline underline-offset-4 hover:text-ink">
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {reference ? <p className="text-[14px] font-semibold text-muted">Order {reference}</p> : null}
      {products.map((p) => {
        const d = drafts[p.slug];
        const set = (patch: Partial<Draft>) => setDrafts((all) => ({ ...all, [p.slug]: { ...all[p.slug], ...patch } }));
        return (
          <fieldset key={p.slug} className="rounded-[14px] border border-[#dbe7f3] bg-surface p-5 md:p-6">
            <legend className="sr-only">{p.name}</legend>
            <div className="flex items-start gap-4">
              {p.image ? (
                <img src={p.image} alt="" className="h-16 w-16 shrink-0 rounded-[10px] border border-[#e3edf7] bg-white object-contain" />
              ) : null}
              <div className="min-w-0">
                <p className="text-[15px] font-semibold leading-snug text-ink">{p.name}</p>
                {p.existing ? (
                  <p className="mt-1 text-[13px] text-muted">
                    You reviewed this already{p.existing.status === "pending" ? " (waiting for approval)" : ""}. Saving again
                    replaces it.
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <StarPicker name={`rating-${p.slug}`} value={d.rating} onChange={(n) => set({ rating: n })} />
              <Field label="Headline (optional)" name={`title-${p.slug}`}>
                <TextInput
                  id={`title-${p.slug}`}
                  value={d.title}
                  maxLength={120}
                  onChange={(e) => set({ title: e.target.value })}
                  placeholder="Sum it up in a few words"
                />
              </Field>
              <Field label="Your review (optional)" name={`body-${p.slug}`}>
                <TextArea
                  id={`body-${p.slug}`}
                  rows={4}
                  value={d.body}
                  maxLength={3000}
                  onChange={(e) => set({ body: e.target.value })}
                  placeholder="What did you use it for? How was setup? Anything the next buyer should know?"
                />
              </Field>
            </div>
          </fieldset>
        );
      })}

      <div className="max-w-sm">
        <Field label="Shown as" name="rv-author" hint="First name and last initial is plenty.">
          <TextInput id="rv-author" value={author} maxLength={40} onChange={(e) => setAuthor(e.target.value)} />
        </Field>
      </div>

      {error ? <Notice tone="bad">{error}</Notice> : null}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="h-12 rounded-[10px] bg-ink px-6 text-[15px] font-semibold text-white transition-colors hover:bg-ink-soft disabled:opacity-60"
        >
          {pending ? "Sending" : products.length > 1 ? "Send reviews" : "Send review"}
        </button>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="text-[15px] text-signal underline underline-offset-4 hover:text-ink">
            Cancel
          </button>
        ) : null}
      </div>
      <p className="max-w-[64ch] text-[13px] leading-relaxed text-muted">
        Every review is read by the shop before it appears. We publish honest reviews good or bad, and only remove ones
        that are abusive, off-topic or share personal details.
      </p>
    </form>
  );
}

/* ------------------------------------------------------------------ *
 * The section on a product page
 * ------------------------------------------------------------------ */

export type ReviewData = {
  summary: { count: number; average: number; breakdown: number[] };
  reviews: { id: string; rating: number; title: string; body: string; author: string; date: string }[];
};

function when(date: string): string {
  const d = new Date(`${date}T12:00:00Z`);
  return Number.isNaN(d.getTime()) ? date : d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function ProductReviews({ slug, data }: { slug: string; data: ReviewData }) {
  const [writing, setWriting] = useState(false);
  const { summary, reviews } = data;

  return (
    <section id="reviews" className="py-10" aria-labelledby="reviews-title">
      <div className="flex flex-wrap items-end justify-between gap-4 pb-4">
        <h2 id="reviews-title" className="text-[32px] text-ink">
          Customer reviews
        </h2>
        {!writing ? (
          <button
            type="button"
            onClick={() => setWriting(true)}
            className="rounded-[10px] border border-ink px-5 py-2.5 text-[15px] font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
          >
            Write a review
          </button>
        ) : null}
      </div>

      {writing ? (
        <div className="mt-6 max-w-3xl">
          <ReviewWriter only={slug} onCancel={() => setWriting(false)} />
        </div>
      ) : null}

      {summary.count === 0 ? (
        !writing ? (
          <p className="mt-6 max-w-[60ch] text-[15px] leading-relaxed text-muted">
            No reviews yet. If you bought this from us, you can be the first. Reviews come from verified buyers only.
          </p>
        ) : null
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[260px_1fr]">
          <div>
            <p className="ahe-price text-5xl leading-none tracking-tighter text-ink">{summary.average.toFixed(1)}</p>
            <div className="mt-3">
              <Stars value={summary.average} size={20} />
            </div>
            <p className="mt-2 text-[15px] text-muted">
              {summary.count} verified {summary.count === 1 ? "review" : "reviews"}
            </p>
            <ul className="mt-5 space-y-1.5">
              {[5, 4, 3, 2, 1].map((n) => {
                const c = summary.breakdown[n - 1] ?? 0;
                return (
                  <li key={n} className="flex items-center gap-3 text-[13px] text-muted">
                    <span className="w-12 shrink-0 whitespace-nowrap font-mono">{n} star</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#e6eef6]">
                      <span className="block h-full bg-[#e8a317]" style={{ width: `${summary.count ? (c / summary.count) * 100 : 0}%` }} />
                    </span>
                    <span className="w-6 text-right font-mono">{c}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <ul>
            {reviews.map((r) => (
              <li key={r.id} className="border-b border-line py-6 first:pt-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Stars value={r.rating} />
                  {r.title ? <p className="text-base font-semibold tracking-tight text-ink">{r.title}</p> : null}
                </div>
                <p className="mt-1.5 text-[13px] text-muted">
                  {r.author} · <span className="text-ink">Verified buyer</span> · {when(r.date)}
                </p>
                {r.body ? (
                  <p className="mt-3 max-w-[72ch] whitespace-pre-wrap text-[15px] leading-relaxed text-ink">{r.body}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
