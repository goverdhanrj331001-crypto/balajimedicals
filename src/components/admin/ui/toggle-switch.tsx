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

      {/* Toggle track */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        style={{
          position: 'relative',
          display: 'inline-flex',
          width: size === 'sm' ? '36px' : '48px',
          height: size === 'sm' ? '20px' : '26px',
          borderRadius: '9999px',
          flexShrink: 0,
          transition: 'background-color 0.2s',
          backgroundColor: checked ? '#006872' : '#bdc9ca',
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          outline: 'none',
        }}
      >
        {/* Knob */}
        <span
          style={{
            position: 'absolute',
            top: '3px',
            left: checked
              ? size === 'sm' ? '18px' : '24px'
              : '3px',
            width: size === 'sm' ? '14px' : '20px',
            height: size === 'sm' ? '14px' : '20px',
            borderRadius: '9999px',
            backgroundColor: 'white',
            boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
            transition: 'left 0.2s ease',
          }}
        />
      </button>
    </div>
  );
}
