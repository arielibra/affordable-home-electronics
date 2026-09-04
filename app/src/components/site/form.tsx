import type { ReactNode } from "react";

const base =
  "h-11 w-full border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted/70 focus:border-ink focus:outline-none";

export function Field({
  label,
  name,
  error,
  hint,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="mt-1.5 text-xs leading-snug text-muted">{hint}</p> : null}
      {error ? <p className="mt-1.5 text-xs leading-snug text-signal">{error}</p> : null}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${base} ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${base} pr-8 ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full border border-line bg-surface px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-muted/70 focus:border-ink focus:outline-none ${props.className ?? ""}`}
    />
  );
}

export function Notice({ tone, children }: { tone: "ok" | "bad"; children: ReactNode }) {
  return (
    <p
      role="status"
      className={`border-l-2 py-2 pl-3 text-sm leading-relaxed ${
        tone === "ok" ? "border-ink text-ink" : "border-signal text-signal"
      }`}
    >
      {children}
    </p>
  );
}
