import React from 'react';
import { CheckIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface StepperStep {
  id: string;
  label: string;
}

interface ProgressStepperProps {
  steps: StepperStep[];
  current: number;
  label: string;
  className?: string;
}

export function ProgressStepper({ steps, current, label, className }: ProgressStepperProps) {
  return (
    <nav aria-label={label} className={className}>
      <ol className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0">
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li key={step.id} className="flex flex-1 items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
              <div className="flex w-full items-center gap-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    'grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[0.75rem] font-bold transition-colors duration-200 ease-signature',
                    done && 'border-action bg-action text-white',
                    active && 'border-action bg-white text-action ring-4 ring-action/10',
                    !done && !active && 'border-line bg-white text-muted'
                  )}>
                  
                  {done ? <CheckIcon className="h-3.5 w-3.5" /> : index + 1}
                </span>
                {index < steps.length - 1 &&
                <span
                  aria-hidden="true"
                  className={cn('hidden h-px flex-1 sm:block', done ? 'bg-action' : 'bg-line')} />

                }
              </div>
              <span
                className={cn(
                  'text-2xs font-semibold sm:pr-4',
                  active ? 'text-ink' : done ? 'text-action' : 'text-muted'
                )}>
                
                {step.label}
                {active && <span className="sr-only"> — {label}</span>}
              </span>
            </li>);

        })}
      </ol>
    </nav>);

}