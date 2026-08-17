import React from 'react';
import { QuoteIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  featured?: boolean;
  className?: string;
}

export function TestimonialCard({ quote, name, role, featured = false, className }: TestimonialCardProps) {
  return (
    <figure
      className={cn(
        'flex h-full flex-col rounded-card border p-6',
        featured ? 'border-action/25 bg-sky-50 lg:p-8' : 'border-line bg-white',
        className
      )}>
      
      <QuoteIcon className={cn('h-5 w-5 shrink-0', featured ? 'text-action' : 'text-sky-400')} aria-hidden="true" />
      <blockquote
        className={cn(
          'mt-4 text-ink',
          featured ? 'font-display text-xl font-medium leading-snug tracking-[-0.02em] lg:text-2xl' : 'text-sm leading-relaxed'
        )}>
        
        {quote}
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-3 pt-6">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-2xs font-bold text-white"
          aria-hidden="true">
          
          {name.charAt(0)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-2xs font-semibold text-ink">{name}</span>
          <span className="block truncate text-[0.75rem] text-muted">{role}</span>
        </span>
      </figcaption>
    </figure>);

}