import React from 'react';
import { QuoteIcon, StarIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  photo: string;
  rating: number;
  className?: string;
}

export function TestimonialCard({ quote, name, role, photo, rating, className }: TestimonialCardProps) {
  return (
    <figure className={cn('flex h-full flex-col rounded-card border border-line bg-white p-6 shadow-card sm:p-8', className)}>
      <div className="flex items-center gap-1" aria-label={rating + ' out of 5 stars'}>
        {Array.from({ length: 5 }, (_, index) => (
          <StarIcon key={index} className={cn('h-4 w-4', index < rating ? 'fill-amber-400 text-amber-400' : 'text-line')} aria-hidden="true" />
        ))}
      </div>
      <QuoteIcon className="mt-6 h-6 w-6 text-action" aria-hidden="true" />
      <blockquote className="mt-4 text-base leading-relaxed text-ink sm:text-lg">“{quote}”</blockquote>
      <figcaption className="mt-auto flex items-center gap-3 pt-7">
        <img src={photo} alt={'Photo placeholder for ' + name} className="h-11 w-11 shrink-0 rounded-full border-2 border-sky-100 object-cover" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-ink">{name}</span>
          <span className="block truncate text-[0.75rem] text-muted">{role}</span>
        </span>
      </figcaption>
    </figure>
  );
}