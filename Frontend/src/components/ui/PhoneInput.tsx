import React from 'react';
import { cn } from '../../utils/cn';
import { Field } from './Field';

interface PhoneInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

/** Formats Canadian numbers as (514) 555-0142 behind a fixed +1 country prefix. */
function formatCanadian(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function PhoneInput({ id, label, value, onChange, error, hint, required, className }: PhoneInputProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <div
        className={cn(
          'flex h-11 items-center overflow-hidden rounded-xl border bg-white transition-[border-color,box-shadow] duration-200 ease-signature focus-within:border-action focus-within:ring-4 focus-within:ring-action/10',
          error ? 'border-bad' : 'border-line'
        )}>
        
        <span className="flex h-full items-center border-r border-line bg-soft px-3 text-2xs font-semibold text-muted">
          +1
        </span>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(514) 555-0142"
          value={value}
          required={required}
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange(formatCanadian(event.target.value))}
          className="h-full w-full bg-transparent px-3.5 text-sm text-body placeholder:text-muted/70 focus:outline-none" />
        
      </div>
    </Field>);

}