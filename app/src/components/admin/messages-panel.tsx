import { useEffect, useMemo, useState } from "react";

import { SPAM_FLAG, SPAM_HOLD } from "../../lib/spam";

type Message = {
  id: string;
  name: string;
  phone: string;
  email: string;
  borough: string;
  property_type: string;
  cameras: string;
  message: string;
  created_at: string;
  spam_score: number;
  spam_reasons: string;
};

function when(value: string): string {
  const d = new Date(value.replace(" ", "T") + "Z");
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

export function MessagesPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showHeld, setShowHeld] = useState(false);

  // Held messages were never emailed, so they are the ones most likely to pile
  // up. Out of the way by default, one click to check the filter got it right.
  const held = useMemo(() => messages.filter((m) => (m.spam_score ?? 0) >= SPAM_HOLD), [messages]);
  const shown = showHeld ? messages : messages.filter((m) => (m.spam_score ?? 0) < SPAM_HOLD);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/messages")
      .then((r) => r.json() as Promise<{ ok: boolean; messages?: Message[]; error?: string }>)
      .then((d) => {
        if (!alive) return;
        if (d.ok && d.messages) setMessages(d.messages);
        else setError(d.error ?? "Could not load messages.");
      })
      .catch(() => alive && setError("Could not load messages."))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <p className="text-sm text-muted">Loading messages.</p>;
  if (error) return <p className="border-l-2 border-signal py-2 pl-3 text-sm text-signal">{error}</p>;
  if (messages.length === 0)
    return (
      <div className="border border-[color:var(--admin-hairline)] bg-surface p-10 text-center">
        <p className="text-base text-ink">Nothing yet.</p>
        <p className="mt-2 text-sm text-muted">
          Quote requests and contact messages from the website land here.
        </p>
      </div>
    );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--admin-hairline)] pb-4">
        <p className="font-mono text-[13px] uppercase tracking-[0.14em] text-muted">
          {shown.length} {shown.length === 1 ? "message" : "messages"}
        </p>
        {held.length > 0 ? (
          <button
            type="button"
            onClick={() => setShowHeld((v) => !v)}
            className="text-[13px] text-muted underline underline-offset-4 hover:text-ink"
          >
            {showHeld
              ? `Hide the ${held.length} that look like sales pitches`
              : `${held.length} looked like sales pitches and were not emailed — show`}
          </button>
        ) : null}
      </div>
      <ul className="mt-2">
        {shown.map((m) => (
          <li key={m.id} className="grid gap-4 border-b border-[color:var(--admin-hairline)] py-5 lg:grid-cols-[260px_1fr]">
            <div>
              <p className="text-sm font-medium text-ink">{m.name}</p>
              {(m.spam_score ?? 0) >= SPAM_FLAG ? (
                <p className="mt-1.5 inline-block rounded-full bg-[#fff7ed] px-2.5 py-1 text-[12px] font-medium text-[#9a3412]">
                  {(m.spam_score ?? 0) >= SPAM_HOLD
                    ? "Looks like a sales pitch"
                    : "Might be a sales pitch"}
                </p>
              ) : null}
              <p className="mt-1 font-mono text-[13px] text-muted">{when(m.created_at)}</p>
              <div className="mt-2 space-y-0.5 text-sm">
                {m.phone ? (
                  <a href={`tel:${m.phone}`} className="block font-mono text-ink underline underline-offset-4">
                    {m.phone}
                  </a>
                ) : null}
                {m.email ? (
                  <a href={`mailto:${m.email}`} className="block break-all text-ink underline underline-offset-4">
                    {m.email}
                  </a>
                ) : null}
              </div>
            </div>
            <div>
              <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[13px] uppercase tracking-[0.12em] text-muted">
                {m.property_type ? <span>{m.property_type}</span> : null}
                {m.borough ? <span>{m.borough}</span> : null}
                {m.cameras ? <span>{m.cameras} cameras</span> : null}
              </div>
              {m.message ? (
                <p className="mt-3 max-w-[70ch] whitespace-pre-wrap text-sm leading-relaxed text-ink">{m.message}</p>
              ) : (
                <p className="mt-3 text-sm text-muted">No message left.</p>
              )}
              {(m.spam_score ?? 0) >= SPAM_FLAG && m.spam_reasons ? (
                <p className="mt-2 max-w-[70ch] text-[13px] leading-relaxed text-muted">
                  Why: {m.spam_reasons}.
                </p>
              ) : null}
              <DeleteMessage
                id={m.id}
                onGone={() => setMessages((all) => all.filter((x) => x.id !== m.id))}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Permanently delete one message. Two clicks, because there is no copy kept
 * and no undo.
 */
function DeleteMessage({ id, onGone }: { id: string; onGone: () => void }) {
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function go() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/messages?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok || res.status === 404) onGone();
      else setError(data.error ?? "Could not delete that.");
    } catch {
      setError("Could not reach the site.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 text-[13px]">
      {armed ? (
        <>
          <span className="text-muted">Delete this message for good? This cannot be undone.</span>
          <button
            type="button"
            disabled={busy}
            onClick={() => void go()}
            className="font-medium text-[color:var(--admin-bad)] underline underline-offset-4 disabled:opacity-60"
          >
            {busy ? "Deleting." : "Yes, delete it"}
          </button>
          <button type="button" onClick={() => setArmed(false)} className="text-muted underline underline-offset-4 hover:text-ink">
            Keep it
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setArmed(true)}
          className="text-muted underline underline-offset-4 hover:text-[color:var(--admin-bad)]"
        >
          Delete permanently
        </button>
      )}
      {error ? <span className="text-[color:var(--admin-bad)]">{error}</span> : null}
    </div>
  );
}
