import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
  /** Screen-reader label for the loading region. */
  label?: string;
}

/** Loading placeholder with a single sheen pass — never longer than the content it covers. */
export function Skeleton({ className, label }: SkeletonProps) {
  return (
    <span
      role={label ? 'status' : undefined}
      aria-label={label}
      className={cn('relative block overflow-hidden rounded-lg bg-surface', className)}>
      
      <span className="absolute inset-0 -translate-x-full animate-sheen bg-white/60" aria-hidden="true" />
    </span>);

}

export function SkeletonCard({ label }: {label?: string;}) {
  return (
    <div className="rounded-card border border-line bg-white p-4">
      <Skeleton className="h-40 w-full" label={label} />
      <Skeleton className="mt-4 h-4 w-2/3" />
      <Skeleton className="mt-2 h-3 w-1/2" />
      <Skeleton className="mt-5 h-9 w-full rounded-pill" />
    </div>);

}