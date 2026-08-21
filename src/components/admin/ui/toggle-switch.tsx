'use client';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
}: ToggleSwitchProps) {
  const dimensions = size === 'sm'
    ? { track: 'h-5 w-9', knob: 'h-3 w-3', translate: 'left-5', top: 'top-1' }
    : { track: 'h-6 w-11', knob: 'h-4 w-4', translate: 'left-6', top: 'top-1' };

  return (
    <div className="flex items-center justify-between gap-3">
      {(label || description) && (
        <div className="min-w-0 flex-1">
          {label && (
            <p className="text-[12px] font-bold text-[#3e494a]">{label}</p>
          )}
          {description && (
            <p className="text-[11px] text-[#6e797b]">{description}</p>
          )}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex shrink-0 ${dimensions.track} items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#006872]/40 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          checked ? 'bg-[#006872]' : 'bg-[#bdc9ca]'
        }`}
      >
        <span
          className={`inline-block ${dimensions.knob} transform rounded-full bg-white shadow-md transition-transform duration-200 ${
            checked ? dimensions.translate : 'left-1'
          } ${dimensions.top}`}
        />
      </button>
    </div>
  );
}
