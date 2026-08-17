import React from 'react';
import { cn } from '../../utils/cn';
import { Reveal } from '../ui/Reveal';

export interface TimelineStep {
  id: string;
  title: string;
  body: string;
}

interface StepsTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

/** Horizontal on desktop, vertical on mobile. Numbers carry real sequence meaning here. */
export function StepsTimeline({ steps, className }: StepsTimelineProps) {
  return (
    <ol className={cn('relative grid gap-8 lg:grid-cols-4 lg:gap-6', className)}>
      <span
        className="nv-hairline absolute left-[0.9375rem] top-2 hidden h-px w-full lg:block"
        aria-hidden="true"
        style={{ left: '2rem', width: 'calc(100% - 4rem)' }} />
      
      {steps.map((step, index) =>
      <Reveal as="li" key={step.id} index={index} className="relative flex gap-4 lg:flex-col">
          <span
          className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-action bg-white font-display text-2xs font-bold text-action"
          aria-hidden="true">
          
            {index + 1}
          </span>
          <div className="lg:pr-6">
            <h3 className="font-display text-base font-semibold tracking-[-0.02em] text-ink">{step.title}</h3>
            <p className="mt-1.5 text-2xs leading-relaxed text-muted">{step.body}</p>
          </div>
        </Reveal>
      )}
    </ol>);

}