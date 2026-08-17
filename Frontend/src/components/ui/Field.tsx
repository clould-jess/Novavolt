import React from 'react';
import { AlertCircleIcon, CheckCircle2Icon } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface FieldProps {
  id: string;
  /** Real label text — never a placeholder-only field. */
  label: string;
  hint?: string;
  error?: string;
  success?: string;
  required?: boolean;
  optionalLabel?: string;
  className?: string;
  children: React.ReactNode;
}

export function Field({ id, label, hint, error, success, required, optionalLabel, className, children }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-2xs font-semibold text-ink">
        <span>
          {label}
          {required &&
          <span className="ml-1 text-bad" aria-hidden="true">
              *
            </span>
          }
        </span>
        {!required && optionalLabel && <span className="font-medium text-muted">{optionalLabel}</span>}
      </label>
      {children}
      {hint && !error && !success &&
      <p id={`${id}-hint`} className="text-2xs text-muted">
          {hint}
        </p>
      }
      {error &&
      <p id={`${id}-error`} className="flex items-center gap-1.5 text-2xs font-medium text-bad">
          <AlertCircleIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      }
      {success && !error &&
      <p className="flex items-center gap-1.5 text-2xs font-medium text-ok">
          <CheckCircle2Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {success}
        </p>
      }
    </div>);

}

/** Shared control chrome for inputs, selects and textareas. */
export const controlClass = (invalid?: boolean) =>
cn(
  'w-full rounded-xl border bg-white px-3.5 text-sm text-body placeholder:text-muted/70',
  'transition-[border-color,box-shadow] duration-200 ease-signature',
  'focus:border-action focus:outline-none focus:ring-4 focus:ring-action/10',
  'disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted',
  invalid ? 'border-bad focus:border-bad focus:ring-bad/10' : 'border-line'
);