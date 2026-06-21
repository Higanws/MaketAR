import type { ReactNode } from "react";

export function PropertySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="property-label">
      {label}
      <input className="property-input" type="number" value={Math.round(value)} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

export function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="property-label">
      {label}
      <div className="flex gap-2">
        <input className="h-9 w-11 rounded-md border border-slate-200 bg-white p-1" type="color" value={value.startsWith("#") ? value : "#ffffff"} onChange={(event) => onChange(event.target.value)} />
        <input className="property-input min-w-0 flex-1" value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </label>
  );
}

export function RangeInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="property-label">
      {label}
      <div className="flex items-center gap-2">
        <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="min-w-0 flex-1" />
        <span className="w-12 text-right text-xs text-slate-500">{Math.round(value * 100) / 100}</span>
      </div>
    </label>
  );
}
