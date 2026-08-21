import { cn } from '@/lib/utils';

interface IconProps {
  name: string;
  filled?: boolean;
  className?: string;
}

export function Icon({ name, filled = false, className = '' }: IconProps) {
  return (
    <span
      className={cn('material-symbols-outlined', filled && 'icon-filled', className)}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
