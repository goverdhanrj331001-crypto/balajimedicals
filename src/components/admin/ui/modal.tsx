'use client';

import { type ReactNode, useEffect } from 'react';
import { Icon } from '@/components/ui/icon';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-[#001f23]/40 p-4 md:p-8">
      <div
        className={`relative w-full ${sizeClasses[size]} rounded-2xl bg-white shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-[#e4e2e1] p-5">
            <div>
              {title && <h2 className="text-[18px] font-bold tracking-tight">{title}</h2>}
              {description && <p className="mt-1 text-[13px] text-[#3e494a]">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-[#6e797b] hover:bg-[#f0eded]"
              aria-label="Close"
            >
              <Icon name="close" />
            </button>
          </div>
        )}
        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-[#e4e2e1] p-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
