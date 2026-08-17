import React from 'react';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({ icon, title, body, action, className, compact = false }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-soft text-center',
        compact ? 'px-6 py-10' : 'px-6 py-16',
        className
      )}>
      
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-action shadow-xs" aria-hidden="true">
        {icon}
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold tracking-[-0.02em] text-ink">{title}</h3>
      {body && <p className="mt-1.5 max-w-sm text-2xs leading-relaxed text-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>);

}