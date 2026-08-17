import React from 'react';
import { cn } from '../../utils/cn';
import { Field, controlClass } from './Field';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  success?: string;
  iconLeft?: React.ReactNode;
  className?: string;
}

export function Input({ id, label, hint, error, success, iconLeft, required, className, ...rest }: InputProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error} success={success} required={required} className={className}>
      <div className="relative">
        {iconLeft &&
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true">
            {iconLeft}
          </span>
        }
        <input
          id={id}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(controlClass(Boolean(error)), 'h-11', iconLeft && 'pl-10')}
          {...rest} />
        
      </div>
    </Field>);

}