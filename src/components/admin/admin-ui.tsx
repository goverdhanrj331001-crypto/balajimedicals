'use client';

import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/icon';

// ─── StatCard ─────────────────────────────────────────────────────
type Tone = 'teal' | 'gold' | 'red' | 'blue';
const toneClasses: Record<Tone, string> = {
  teal: 'bg-[#d9eeee] text-[#006872]',
  gold: 'bg-[#ffddb5] text-[#835400]',
  red:  'bg-[#ffdad7] text-[#910816]',
  blue: 'bg-[#dcecf4] text-[#1d6272]',
};

export function StatCard({
  label,
  value,
  delta,
  icon,
  tone = 'teal',
}: {
  label: string;
  value: string | number;
  delta?: string;
  icon: string;
  tone?: Tone;
}) {
  return (
    <article className="soft-card rounded-xl bg-white p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] text-[#6e797b]">{label}</p>
          <p className="mt-2 text-[24px] font-extrabold tracking-tight">{value}</p>
          {delta && <p className="mt-1 text-[11px] font-bold text-[#006872]">{delta}</p>}
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
          <Icon name={icon} className="text-[21px]" />
        </span>
      </div>
    </article>
  );
}

// ─── SectionCard ─────────────────────────────────────────────────
export function SectionCard({
  title,
  action,
  children,
  className = '',
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`soft-card rounded-xl bg-white p-4 md:p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-[16px] font-bold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

// ─── AdminTable (status-aware) ──────────────────────────────────
const statusClasses: Record<string, string> = {
  Delivered:    'rounded-full bg-[#d9eeee] px-2 py-1 text-[10px] font-bold text-[#006872]',
  Active:       'rounded-full bg-[#d9eeee] px-2 py-1 text-[10px] font-bold text-[#006872]',
  Verified:     'rounded-full bg-[#d9eeee] px-2 py-1 text-[10px] font-bold text-[#006872]',
  'In Stock':   'rounded-full bg-[#d9eeee] px-2 py-1 text-[10px] font-bold text-[#006872]',
  Completed:    'rounded-full bg-[#d9eeee] px-2 py-1 text-[10px] font-bold text-[#006872]',
  Confirmed:    'rounded-full bg-[#d9eeee] px-2 py-1 text-[10px] font-bold text-[#006872]',
  Closed:       'rounded-full bg-[#d9eeee] px-2 py-1 text-[10px] font-bold text-[#006872]',
  Processing:   'rounded-full bg-[#ffddb5] px-2 py-1 text-[10px] font-bold text-[#835400]',
  Pending:      'rounded-full bg-[#ffddb5] px-2 py-1 text-[10px] font-bold text-[#835400]',
  'Low Stock':  'rounded-full bg-[#ffddb5] px-2 py-1 text-[10px] font-bold text-[#835400]',
  'In Transit': 'rounded-full bg-[#ffddb5] px-2 py-1 text-[10px] font-bold text-[#835400]',
  'In Progress':'rounded-full bg-[#ffddb5] px-2 py-1 text-[10px] font-bold text-[#835400]',
  Open:         'rounded-full bg-[#ffddb5] px-2 py-1 text-[10px] font-bold text-[#835400]',
  Cancelled:    'rounded-full bg-[#ffdad7] px-2 py-1 text-[10px] font-bold text-[#910816]',
  Blocked:      'rounded-full bg-[#ffdad7] px-2 py-1 text-[10px] font-bold text-[#910816]',
  'Out of Stock':'rounded-full bg-[#ffdad7] px-2 py-1 text-[10px] font-bold text-[#910816]',
  Refunded:     'rounded-full bg-[#ffdad7] px-2 py-1 text-[10px] font-bold text-[#910816]',
  Failed:       'rounded-full bg-[#ffdad7] px-2 py-1 text-[10px] font-bold text-[#910816]',
  Expired:      'rounded-full bg-[#ffdad7] px-2 py-1 text-[10px] font-bold text-[#910816]',
  High:         'rounded-full bg-[#ffdad7] px-2 py-1 text-[10px] font-bold text-[#910816]',
  Medium:       'rounded-full bg-[#ffddb5] px-2 py-1 text-[10px] font-bold text-[#835400]',
  Low:          'rounded-full bg-[#d9eeee] px-2 py-1 text-[10px] font-bold text-[#006872]',
};

export function AdminTable({
  headers,
  rows,
  showAction = true,
  onAction,
  renderRow,
}: {
  headers: readonly string[];
  rows: readonly (readonly string[])[];
  showAction?: boolean;
  onAction?: (rowIndex: number) => void;
  renderRow?: (row: readonly string[], rowIndex: number) => ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[#e4e2e1]">
            {headers.map((h) => (
              <th key={h} className="px-3 py-3 text-[10px] font-bold uppercase tracking-[.08em] text-[#6e797b]">
                {h}
              </th>
            ))}
            {showAction && (
              <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-[.08em] text-[#6e797b]">
                Action
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={headers.length + (showAction ? 1 : 0)} className="px-3 py-8 text-center text-[12px] text-[#6e797b]">
                No records found.
              </td>
            </tr>
          )}
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-[#f0eded] transition hover:bg-[#fbf9f8]">
              {renderRow ? (
                renderRow(row, ri)
              ) : (
                row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-3 text-[12px] text-[#3e494a]">
                    <span className={statusClasses[cell] ?? ''}>{cell}</span>
                  </td>
                ))
              )}
              {showAction && (
                <td className="px-3 py-3">
                  <button
                    type="button"
                    className="rounded p-1 text-[#006872] hover:bg-[#d9eeee]"
                    onClick={() => onAction?.(ri)}
                    aria-label="Open row action"
                  >
                    <Icon name="more_horiz" className="text-[19px]" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── StatusPill ──────────────────────────────────────────────────
export function StatusPill({ value }: { value: string }) {
  return <span className={statusClasses[value] ?? 'rounded-full bg-[#f0eded] px-2 py-1 text-[10px] font-bold text-[#3e494a]'}>{value}</span>;
}

// ─── Toolbar (search + filters placeholder) ─────────────────────
export function Toolbar({
  placeholder = 'Search...',
  value,
  onChange,
}: {
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 sm:max-w-[320px]">
        <input
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full rounded-lg border border-[#bdc9ca] bg-white py-2.5 pl-10 pr-3 text-[12px] outline-none focus:border-[#006872] focus:ring-2 focus:ring-[#d9eeee]"
          placeholder={placeholder}
        />
        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#6e797b]" />
      </div>
    </div>
  );
}

// ─── StatusRow ────────────────────────────────────────────────────
export function StatusRow({ label, status, good = false }: { label: string; status: string; good?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-[#f0eded] py-2.5 last:border-b-0">
      <span className="text-[12px]">{label}</span>
      <span className={`flex items-center gap-1 text-[11px] font-bold ${good ? 'text-[#006872]' : 'text-[#ba1a1a]'}`}>
        <span className={`h-2 w-2 rounded-full ${good ? 'bg-[#00838f]' : 'bg-[#ba1a1a]'}`} />
        {status}
      </span>
    </div>
  );
}

// ─── Pagination ──────────────────────────────────────────────────
export function Pagination({
  total,
  page,
  pageSize,
  onPage,
}: {
  total: number;
  page: number;
  pageSize: number;
  onPage: (p: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div className="mt-4 flex items-center justify-between text-[11px] text-[#6e797b]">
      <span>Showing {from}–{to} of {total} records</span>
      <div className="flex gap-1">
        <button
          type="button"
          disabled={page === 1}
          className="rounded border border-[#bdc9ca] bg-white px-2 py-1 disabled:opacity-50"
          onClick={() => onPage(page - 1)}
        >
          Prev
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
          const p = i + 1;
          return (
            <button
              key={p}
              type="button"
              className={`rounded px-2 py-1 ${p === page ? 'bg-[#006872] font-bold text-white' : 'border border-[#bdc9ca] bg-white'}`}
              onClick={() => onPage(p)}
            >
              {p}
            </button>
          );
        })}
        <button
          type="button"
          disabled={page === totalPages}
          className="rounded border border-[#bdc9ca] bg-white px-2 py-1 disabled:opacity-50"
          onClick={() => onPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
