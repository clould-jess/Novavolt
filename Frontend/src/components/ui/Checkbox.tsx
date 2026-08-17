import React from 'react';
import { AlertCircleIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id' | 'type' | 'className'> {
  id: string;
  label: React.ReactNode;
  error?: string;
  className?: string;
}

export function Checkbox({ id, label, error, className, ...rest }: CheckboxProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-start gap-2.5">
        <input
          id={id}
          type="checkbox"
          aria-invalid={Boolean(error)}
          className={cn(
            'mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-[5px] border text-action accent-action',
            'transition-colors duration-150 ease-signature focus:ring-4 focus:ring-action/10',
            error ? 'border-bad' : 'border-line'
          )}
          {...rest} />
        
        <label htmlFor={id} className="text-2xs leading-relaxed text-body">
          {label}
        </label>
      </div>
      {error &&
      <p className="flex items-center gap-1.5 pl-7 text-2xs font-medium text-bad">
          <AlertCircleIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {error}
        </p>
      }
    </div>);

}