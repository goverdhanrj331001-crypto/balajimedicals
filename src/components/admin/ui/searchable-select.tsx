'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/icon';

interface SearchableSelectProps {
  value?: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; imageUrl?: string }[];
  placeholder?: string;
  label?: string;
  required?: boolean;
  hint?: string;
  /** Show "Add New" button — calls onAddNew when clicked */
  onAddNew?: () => void;
  emptyText?: string;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  label,
  required = false,
  hint,
  onAddNew,
  emptyText = 'No options found',
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div ref={ref} className="relative">
      {label && (
        <span className="mb-1.5 block text-[11px] font-bold text-[#3e494a]">
          {label} {required && <span className="text-[#910816]">*</span>}
        </span>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg border border-[#bdc9ca] bg-white px-3 py-2.5 text-left text-[12px] outline-none focus:border-[#006872] focus:ring-2 focus:ring-[#d9eeee]"
      >
        <span className={selected ? 'font-semibold text-[#1b1c1c]' : 'text-[#6e797b]'}>
          {selected ? (
            <span className="flex items-center gap-2">
              {selected.imageUrl && (
                <img
                  src={selected.imageUrl}
                  alt=""
                  className="h-5 w-5 rounded object-cover"
                />
              )}
              {selected.label}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <Icon name={open ? 'expand_less' : 'expand_more'} className="text-[18px] text-[#6e797b]" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-[#bdc9ca] bg-white shadow-lg">
          <div className="relative border-b border-[#f0eded]">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full py-2 pl-9 pr-3 text-[12px] outline-none"
            />
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-[#6e797b]"
            />
          </div>
          <div className="max-h-56 overflow-y-auto fancy-scroll">
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-center text-[11px] text-[#6e797b]">{emptyText}</p>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] hover:bg-[#d9eeee] ${
                    o.value === value ? 'bg-[#d9eeee] font-bold text-[#006872]' : 'text-[#3e494a]'
                  }`}
                >
                  {o.imageUrl && (
                    <img src={o.imageUrl} alt="" loading="lazy" decoding="async" className="h-5 w-5 rounded object-cover" />
                  )}
                  {o.label}
                </button>
              ))
            )}
            {onAddNew && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onAddNew();
                }}
                className="flex w-full items-center gap-2 border-t border-[#f0eded] px-3 py-2 text-left text-[12px] font-bold text-[#006872] hover:bg-[#d9eeee]"
              >
                <Icon name="add_circle" className="text-[16px]" /> Add New
              </button>
            )}
          </div>
        </div>
      )}
      {hint && <p className="mt-1 text-[10px] text-[#6e797b]">{hint}</p>}
    </div>
  );
}
