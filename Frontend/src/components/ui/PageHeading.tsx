import React from 'react';
import { cn } from '../../utils/cn';

interface PageHeadingProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** App-shell heading for the customer portal and the admin workspace. */
export function PageHeading({ title, description, action, className }: PageHeadingProps) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold tracking-[-0.03em] text-ink sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-2xs leading-relaxed text-muted">{description}</p>}
      </div>
      {action}
    </div>);

}