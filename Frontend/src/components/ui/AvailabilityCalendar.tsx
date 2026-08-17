import React, { useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth } from
'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import type { AvailabilityDay, DayStatus } from '../../types';
import { cn } from '../../utils/cn';
import { IconButton } from './IconButton';

interface AvailabilityCalendarProps {
  days: AvailabilityDay[];
  referenceDate: Date;
  selectedStart?: string;
  selectedEnd?: string;
  onSelectDay?: (iso: string) => void;
  className?: string;
}

const statusStyles: Record<DayStatus, {cell: string;mark: string;}> = {
  available: { cell: 'bg-white text-ink border-line hover:border-action', mark: 'bg-ok' },
  reserved: { cell: 'bg-sky-50 text-action border-sky-200', mark: 'bg-sky-400' },
  rented: { cell: 'bg-surface text-muted border-line', mark: 'bg-ink' },
  maintenance: { cell: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]', mark: 'bg-warn' }
};

const legendOrder: DayStatus[] = ['available', 'reserved', 'rented', 'maintenance'];
const legendKeys: Record<DayStatus, string> = {
  available: 'vehicleDetail.legendAvailable',
  reserved: 'vehicleDetail.legendReserved',
  rented: 'vehicleDetail.legendRented',
  maintenance: 'vehicleDetail.legendMaintenance'
};

export function AvailabilityCalendar({
  days,
  referenceDate,
  selectedStart,
  selectedEnd,
  onSelectDay,
  className
}: AvailabilityCalendarProps) {
  const { t, locale } = useI18n();
  const [monthOffset, setMonthOffset] = useState(0);
  const month = addMonths(startOfMonth(referenceDate), monthOffset);
  const statusByDate = new Map(days.map((day) => [day.date, day.status]));

  const gridDays = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  const leadingBlanks = (getDay(startOfMonth(month)) + 6) % 7; // Monday-first grid
  const weekdayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const weekdayLabelsEn = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const labels = locale === 'fr' ? weekdayLabels : weekdayLabelsEn;

  return (
    <div className={cn('rounded-card border border-line bg-white p-4 sm:p-5', className)}>
      <div className="flex items-center justify-between">
        <p className="font-display text-sm font-semibold capitalize text-ink">
          {format(month, locale === 'fr' ? 'MMMM yyyy' : 'MMMM yyyy')}
        </p>
        <div className="flex items-center gap-1">
          <IconButton
            size="sm"
            label={t('common.previous')}
            icon={<ChevronLeftIcon className="h-4 w-4" />}
            onClick={() => setMonthOffset((value) => value - 1)}
            disabled={monthOffset <= 0} />
          
          <IconButton
            size="sm"
            label={t('common.next')}
            icon={<ChevronRightIcon className="h-4 w-4" />}
            onClick={() => setMonthOffset((value) => value + 1)}
            disabled={monthOffset >= 2} />
          
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5" role="grid" aria-label={t('vehicleDetail.availabilityTitle')}>
        {labels.map((label, index) =>
        <div key={`${label}-${index}`} className="pb-1 text-center text-[0.75rem] font-semibold text-muted">
            {label}
          </div>
        )}
        {Array.from({ length: leadingBlanks }, (_, index) =>
        <div key={`blank-${index}`} aria-hidden="true" />
        )}
        {gridDays.map((day) => {
          const iso = format(day, 'yyyy-MM-dd');
          const status = statusByDate.get(iso) ?? 'available';
          const style = statusStyles[status];
          const selected =
          selectedStart && isSameDay(day, parseISO(selectedStart)) ||
          selectedEnd && isSameDay(day, parseISO(selectedEnd));
          const inRange =
          selectedStart && selectedEnd && day >= parseISO(selectedStart) && day <= parseISO(selectedEnd);
          const selectable = status === 'available' && Boolean(onSelectDay);

          return (
            <button
              key={iso}
              type="button"
              disabled={!selectable}
              onClick={selectable ? () => onSelectDay?.(iso) : undefined}
              aria-label={`${format(day, 'd MMMM')} — ${t(legendKeys[status])}`}
              aria-pressed={Boolean(selected)}
              className={cn(
                'relative flex aspect-square flex-col items-center justify-center rounded-lg border text-2xs font-semibold transition-[border-color,background-color] duration-150 ease-signature',
                style.cell,
                !isSameMonth(day, month) && 'opacity-40',
                inRange && 'ring-2 ring-inset ring-action/30',
                selected && 'border-action bg-action text-white',
                !selectable && 'cursor-not-allowed'
              )}>
              
              {format(day, 'd')}
              <span
                aria-hidden="true"
                className={cn('mt-1 h-1 w-1 rounded-full', selected ? 'bg-white' : style.mark)} />
              
            </button>);

        })}
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-4">
        {legendOrder.map((status) =>
        <li key={status} className="flex items-center gap-1.5 text-[0.75rem] text-muted">
            <span className={cn('h-2 w-2 rounded-full', statusStyles[status].mark)} aria-hidden="true" />
            {t(legendKeys[status])}
          </li>
        )}
      </ul>
    </div>);

}