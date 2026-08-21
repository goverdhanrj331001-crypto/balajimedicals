'use client';

import { type ReactNode } from 'react';

// ─── Form primitives ─────────────────────────────────────────────

export function Field({
  label,
  hint,
  error,
  children,
  wide = false,
  className = '',
}: {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${wide ? 'md:col-span-2' : ''} ${className}`}>
      {label && (
        <span className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">
          {label}
        </span>
      )}
      {children}
      {hint && !error && <span className="mt-1 block text-[10px] text-[#6e797b]">{hint}</span>}
      {error && <span className="mt-1 block text-[10px] font-semibold text-[#910816]">{error}</span>}
    </label>
  );
}

const inputCls =
  'w-full rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#006872] focus:ring-2 focus:ring-[#d9eeee] disabled:bg-[#f5f3f3]';

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ''}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} min-h-24 resize-y ${props.className ?? ''}`} />;
}

export function Select({
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }) {
  return (
    <select {...props} className={`${inputCls} ${props.className ?? ''}`}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// ─── Buttons ─────────────────────────────────────────────────────
export function PrimaryButton({
  children,
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className="flex items-center justify-center gap-2 rounded-lg bg-[#006872] px-4 py-2.5 text-[12px] font-bold text-white shadow-sm transition hover:bg-[#00535b] disabled:opacity-60"
    >
      {loading && <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="flex items-center justify-center gap-2 rounded-lg border border-[#bdc9ca] bg-white px-4 py-2.5 text-[12px] font-bold text-[#3e494a] transition hover:bg-[#f5f3f3] disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function DangerButton({
  children,
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className="flex items-center justify-center gap-2 rounded-lg bg-[#910816] px-4 py-2.5 text-[12px] font-bold text-white transition hover:bg-[#7a0712] disabled:opacity-60"
    >
      {loading && <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
      {children}
    </button>
  );
}
