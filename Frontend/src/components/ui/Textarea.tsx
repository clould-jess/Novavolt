import React from 'react';
import { cn } from '../../utils/cn';
import { Field, controlClass } from './Field';

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'className'> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
}

export function Textarea({ id, label, hint, error, required, rows = 5, className, ...rest }: TextareaProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <textarea
        id={id}
        rows={rows}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(controlClass(Boolean(error)), 'py-3 leading-relaxed')}
        {...rest} />
      
    </Field>);

}