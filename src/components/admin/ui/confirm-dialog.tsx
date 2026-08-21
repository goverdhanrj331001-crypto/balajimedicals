'use client';

import { Modal } from './modal';
import { PrimaryButton, SecondaryButton } from './form';
import { Icon } from '@/components/ui/icon';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = true,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center">
        <span className={`flex h-12 w-12 items-center justify-center rounded-full ${danger ? 'bg-[#ffdad7] text-[#910816]' : 'bg-[#d9eeee] text-[#006872]'}`}>
          <Icon name={danger ? 'warning' : 'help'} className="text-[24px]" />
        </span>
        <h2 className="mt-3 text-[18px] font-bold">{title}</h2>
        <p className="mt-1 text-[13px] text-[#3e494a]">{message}</p>
        <div className="mt-5 flex w-full gap-2">
          <SecondaryButton onClick={onClose} className="flex-1">
            {cancelLabel}
          </SecondaryButton>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[12px] font-bold text-white transition disabled:opacity-60 ${danger ? 'bg-[#910816] hover:bg-[#7a0712]' : 'bg-[#006872] hover:bg-[#00535b]'}`}
          >
            {loading && <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
