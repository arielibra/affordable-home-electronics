import type { ReactNode } from "react";

const base =
  "h-12 w-full rounded-[10px] border border-[#b9cde2] bg-surface px-3.5 text-[16px] text-ink placeholder:text-muted/70 focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/15";

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
      {/* Plain, readable labels. A bare "Optional" hint sits beside the label
          the way people expect, not as a stray line under the box. */}
      <label htmlFor={name} className="mb-1.5 block text-[14px] font-semibold text-ink">
        {label}
        {hint === "Optional" ? <span className="font-normal text-muted"> (optional)</span> : null}
      </label>
      {children}
      {hint && hint !== "Optional" && !error ? <p className="mt-1.5 text-[13px] leading-snug text-muted">{hint}</p> : null}
      {error ? <p className="mt-1.5 text-[13px] leading-snug text-signal">{error}</p> : null}
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
      className={`w-full rounded-[10px] border border-[#b9cde2] bg-surface px-3.5 py-3 text-[16px] leading-relaxed text-ink placeholder:text-muted/70 focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/15 ${props.className ?? ""}`}
    />
  );
}

export function Notice({ tone, children }: { tone: "ok" | "bad"; children: ReactNode }) {
  return (
    <p
      role="status"
      className={`rounded-r-lg border-l-[3px] bg-surface py-2.5 pl-3.5 pr-3 text-[15px] leading-relaxed ${
        tone === "ok" ? "border-ink text-ink" : "border-signal text-signal"
      }`}
    >
      {children}
    </p>
  );
}
