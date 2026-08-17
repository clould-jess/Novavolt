import React from 'react';
import { cn } from '../../utils/cn';

interface ToggleProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onLabel: string;
  offLabel: string;
}

/** Switch with a visible textual state so meaning never depends on colour alone. */
export function Toggle({ id, label, description, checked, onChange, onLabel, offLabel }: ToggleProps) {
  return (
    <div className="flex items-start justify-between gap-6 py-3">
      <div className="min-w-0">
        <label htmlFor={id} className="block text-sm font-semibold text-ink">
          {label}
        </label>
        {description && <p className="mt-0.5 text-2xs leading-relaxed text-muted">{description}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className={cn('text-2xs font-semibold', checked ? 'text-action' : 'text-muted')}>
          {checked ? onLabel : offLabel}
        </span>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          onClick={() => onChange(!checked)}
          className={cn(
            'relative h-6 w-11 shrink-0 rounded-pill border transition-colors duration-200 ease-signature',
            checked ? 'border-action bg-action' : 'border-line bg-surface'
          )}>
          
          <span
            className={cn(
              'absolute top-0.5 rounded-full bg-white shadow-xs transition-transform duration-200 ease-signature',
              checked ? 'translate-x-5' : 'translate-x-0.5'
            )}
            style={{ height: '1.125rem', width: '1.125rem' }} />
          
        </button>
      </div>
    </div>);

}