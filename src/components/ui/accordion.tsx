'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/icon';

interface AccordionItem {
  title: string;
  icon?: string;
  content?: string;
  children?: React.ReactNode;
}

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {items.map((item, idx) => {
        const isOpen = openIdx === idx;
        const hasContent = item.content?.trim() || item.children;
        if (!hasContent) return null;

        return (
          <div key={idx} className="overflow-hidden rounded-xl border border-[#e4e2e1] bg-white">
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
            >
              <div className="flex items-center gap-2">
                {item.icon && <Icon name={item.icon} className="text-[18px] text-[#006872]" />}
                <span className="text-[13px] font-bold text-[#1b1c1c]">{item.title}</span>
              </div>
              <Icon
                name={isOpen ? 'expand_less' : 'expand_more'}
                className="text-[20px] text-[#6e797b]"
              />
            </button>
            {isOpen && (
              <div className="border-t border-[#f0eded] px-4 py-3">
                {item.children ? (
                  item.children
                ) : (
                  <p className="text-[12px] leading-5 text-[#3e494a]">{item.content}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
