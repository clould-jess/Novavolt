import React from 'react';
import { CheckIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import type { RentalStage } from '../../types';
import { cn } from '../../utils/cn';

const order: RentalStage[] = ['reserved', 'contract', 'ready', 'active', 'returnDue', 'completed'];

interface RentalTimelineProps {
  stage: RentalStage;
  dates?: Partial<Record<RentalStage, string>>;
  className?: string;
}

/** Horizontal on desktop, vertical on mobile. */
export function RentalTimeline({ stage, dates, className }: RentalTimelineProps) {
  const { t } = useI18n();
  const currentIndex = order.indexOf(stage);

  return (
    <ol className={cn('flex flex-col gap-0 lg:flex-row', className)} aria-label={t('portal.rentalTimeline')}>
      {order.map((item, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        return (
          <li key={item} className="relative flex flex-1 gap-3 pb-6 last:pb-0 lg:flex-col lg:pb-0">
            <div className="flex flex-col items-center lg:w-full lg:flex-row">
              <span
                aria-hidden="true"
                className={cn(
                  'grid h-6 w-6 shrink-0 place-items-center rounded-full border',
                  done && 'border-action bg-action text-white',
                  active && 'border-action bg-white ring-4 ring-action/15',
                  !done && !active && 'border-line bg-white'
                )}>
                
                {done ?
                <CheckIcon className="h-3 w-3" /> :

                <span className={cn('h-1.5 w-1.5 rounded-full', active ? 'bg-action' : 'bg-line')} />
                }
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  'w-px flex-1 lg:h-px lg:w-full',
                  index === order.length - 1 && 'lg:hidden',
                  done ? 'bg-action' : 'bg-line'
                )} />
              
            </div>
            <div className="pb-1 lg:pt-3">
              <p className={cn('text-2xs font-semibold', active ? 'text-ink' : done ? 'text-action' : 'text-muted')}>
                {t(`rentalStage.${item}`)}
              </p>
              {dates?.[item] && <p className="mt-0.5 text-[0.75rem] text-muted">{dates[item]}</p>}
              {active && <span className="sr-only">({t('common.status')})</span>}
            </div>
          </li>);

      })}
    </ol>);

}