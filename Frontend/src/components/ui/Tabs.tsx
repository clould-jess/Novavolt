import React from 'react';
import { cn } from '../../utils/cn';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  variant?: 'pill' | 'underline';
  className?: string;
}

export function Tabs({ items, value, onChange, label, variant = 'pill', className }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        'nv-scroll-thin flex gap-1 overflow-x-auto',
        variant === 'pill' ? 'rounded-pill border border-line bg-white p-1' : 'border-b border-line',
        className
      )}>
      
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              'whitespace-nowrap font-semibold transition-[color,background-color,border-color] duration-200 ease-signature',
              variant === 'pill' ?
              cn(
                'rounded-pill px-4 py-2 text-2xs',
                active ? 'bg-action text-white' : 'text-muted hover:bg-surface hover:text-ink'
              ) :
              cn(
                '-mb-px border-b-2 px-4 pb-3 pt-2 text-sm',
                active ? 'border-action text-action' : 'border-transparent text-muted hover:text-ink'
              )
            )}>
            
            {item.label}
            {typeof item.count === 'number' &&
            <span className={cn('ml-1.5 text-[0.75rem]', active ? 'text-white/80' : 'text-muted')}>
                {item.count}
              </span>
            }
          </button>);

      })}
    </div>);

}