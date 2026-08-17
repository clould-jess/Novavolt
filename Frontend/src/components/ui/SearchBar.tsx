import React from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SearchBarProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  clearLabel: string;
  className?: string;
  size?: 'md' | 'lg';
}

export function SearchBar({
  id,
  label,
  value,
  onChange,
  placeholder,
  clearLabel,
  className,
  size = 'md'
}: SearchBarProps) {
  return (
    <div className={cn('relative', className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <SearchIcon
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        aria-hidden="true" />
      
      <input
        id={id}
        type="search"
        role="searchbox"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'w-full rounded-pill border border-line bg-white pl-11 pr-10 text-sm text-body placeholder:text-muted/70',
          'transition-[border-color,box-shadow] duration-200 ease-signature focus:border-action focus:outline-none focus:ring-4 focus:ring-action/10',
          size === 'lg' ? 'h-12' : 'h-11'
        )} />
      
      {value &&
      <button
        type="button"
        onClick={() => onChange('')}
        aria-label={clearLabel}
        className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors duration-150 hover:bg-surface hover:text-ink">
        
          <XIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      }
    </div>);

}