import React, { useRef } from 'react';
import { cn } from '../../utils/cn';

interface CodeInputProps {
  label: string;
  length?: number;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

/** Six-box one-time code entry with real labels for assistive technology. */
export function CodeInput({ label, length = 6, value, onChange, error }: CodeInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const setDigit = (index: number, digit: string) => {
    const next = [...value];
    next[index] = digit.replace(/\D/g, '').slice(-1);
    onChange(next);
    if (digit && index < length - 1) refs.current[index + 1]?.focus();
  };

  return (
    <fieldset>
      <legend className="text-2xs font-semibold text-ink">{label}</legend>
      <div className="mt-3 flex gap-2">
        {Array.from({ length }, (_, index) =>
        <input
          key={index}
          ref={(element) => {
            refs.current[index] = element;
          }}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          aria-label={`${label} ${index + 1}`}
          aria-invalid={Boolean(error)}
          value={value[index] ?? ''}
          onChange={(event) => setDigit(index, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Backspace' && !value[index] && index > 0) refs.current[index - 1]?.focus();
          }}
          className={cn(
            'w-full rounded-xl border bg-white text-center font-display text-lg font-bold text-ink',
            'transition-[border-color,box-shadow] duration-200 ease-signature focus:border-action focus:outline-none focus:ring-4 focus:ring-action/10',
            error ? 'border-bad' : 'border-line'
          )}
          style={{ height: '3.25rem' }} />

        )}
      </div>
      {error && <p className="mt-2 text-2xs font-medium text-bad">{error}</p>}
    </fieldset>);

}