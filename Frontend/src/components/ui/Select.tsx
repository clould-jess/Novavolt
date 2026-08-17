import React from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Field, controlClass } from './Field';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'className' | 'children'> {
  id: string;
  label: string;
  options: SelectOption[];
  hint?: string;
  error?: string;
  className?: string;
}

export function Select({ id, label, options, hint, error, required, className, ...rest }: SelectProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <div className="relative">
        <select
          id={id}
          required={required}
          aria-invalid={Boolean(error)}
          className={cn(controlClass(Boolean(error)), 'h-11 appearance-none pr-10')}
          {...rest}>
          
          {options.map((option) =>
          <option key={option.value} value={option.value}>
              {option.label}
            </option>
          )}
        </select>
        <ChevronDownIcon
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true" />
        
      </div>
    </Field>);

}