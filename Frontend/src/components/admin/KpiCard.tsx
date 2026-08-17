import React from 'react';
import { cn } from '../../utils/cn';

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
  tone?: 'neutral' | 'accent' | 'warn' | 'danger';
  /** The primary KPI gets more visual weight than the rest of the strip. */
  emphasis?: boolean;
  className?: string;
}

const tones = {
  neutral: 'text-action bg-sky-50',
  accent: 'text-white bg-action',
  warn: 'text-[#B45309] bg-[#FFFBEB]',
  danger: 'text-[#B91C1C] bg-[#FEF2F2]'
};

export function KpiCard({ label, value, hint, icon, tone = 'neutral', emphasis = false, className }: KpiCardProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-card border bg-white p-4',
        emphasis ? 'border-action/30 ring-1 ring-action/10' : 'border-line',
        className
      )}>
      
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.75rem] font-semibold uppercase tracking-wide text-muted">{label}</p>
        {icon &&
        <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-lg', tones[tone])} aria-hidden="true">
            {icon}
          </span>
        }
      </div>
      <p
        className={cn(
          'mt-3 font-display font-bold tracking-[-0.03em] text-ink',
          emphasis ? 'text-3xl' : 'text-2xl'
        )}>
        
        {value}
      </p>
      {hint && <p className="mt-auto pt-2 text-[0.75rem] text-muted">{hint}</p>}
    </div>);

}