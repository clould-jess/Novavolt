import React from 'react';
import { cn } from '../../utils/cn';

interface StatCardProps {
  value: React.ReactNode;
  label: string;
  icon?: React.ReactNode;
  hint?: string;
  tone?: 'light' | 'dark';
  className?: string;
}

export function StatCard({ value, label, icon, hint, tone = 'light', className }: StatCardProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-card border p-5',
        tone === 'light' ? 'border-line bg-white' : 'border-white/10 bg-white/[0.04]',
        className
      )}>
      
      {icon &&
      <span
        className={cn(
          'mb-4 grid h-9 w-9 place-items-center rounded-xl',
          tone === 'light' ? 'bg-sky-50 text-action' : 'bg-white/10 text-sky-400'
        )}
        aria-hidden="true">
        
          {icon}
        </span>
      }
      <p
        className={cn(
          'font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl',
          tone === 'light' ? 'text-ink' : 'text-white'
        )}>
        
        {value}
      </p>
      <p className={cn('mt-2 text-2xs font-semibold', tone === 'light' ? 'text-muted' : 'text-sky-100/75')}>{label}</p>
      {hint &&
      <p className={cn('mt-auto pt-3 text-[0.75rem]', tone === 'light' ? 'text-muted' : 'text-sky-100/50')}>{hint}</p>
      }
    </div>);

}