import { useEffect, useState } from "react";

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
};

function when(value: string): string {
  const d = new Date(value.replace(" ", "T") + "Z");
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

export function MessagesPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      <p className="border-b border-[color:var(--admin-hairline)] pb-4 font-mono text-[13px] uppercase tracking-[0.14em] text-muted">
        {messages.length} messages
      </p>
      <ul className="mt-2">
        {messages.map((m) => (
          <li key={m.id} className="grid gap-4 border-b border-[color:var(--admin-hairline)] py-5 lg:grid-cols-[260px_1fr]">
            <div>
              <p className="text-sm font-medium text-ink">{m.name}</p>
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
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
