import type { ReactNode } from "react";

export function Shell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1240px] px-5 ${className}`}>{children}</div>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
      <span className="h-2 w-2 shrink-0 bg-signal" />
      {children}
    </p>
  );
}

export function SectionHead({ title, lead, aside }: { title: string; lead?: string; aside?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="max-w-[18ch] text-3xl font-semibold leading-[1.05] tracking-tighter text-ink md:text-4xl">{title}</h2>
        {lead ? <p className="mt-3 max-w-[58ch] text-base leading-relaxed text-muted">{lead}</p> : null}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-mono text-3xl leading-none tracking-tighter text-ink md:text-4xl">{value}</p>
      <p className="mt-2 text-sm leading-snug text-muted">{label}</p>
    </div>
  );
}
