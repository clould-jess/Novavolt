import React from 'react';
import { CalendarDaysIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Field, controlClass } from './Field';

interface DatePickerProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

/** Native date control, wrapped in the Novavolt field chrome for consistency and a11y. */
export function DatePicker({
  id,
  label,
  value,
  onChange,
  min,
  max,
  hint,
  error,
  required,
  className
}: DatePickerProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <div className="relative">
        <input
          id={id}
          type="date"
          value={value}
          min={min}
          max={max}
          required={required}
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange(event.target.value)}
          className={cn(controlClass(Boolean(error)), 'h-11 pr-10')} />
        
        <CalendarDaysIcon
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true" />
        
      </div>
    </Field>);

}