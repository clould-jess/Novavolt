import React from 'react';
import { useI18n } from '../../contexts/I18nContext';
import type { InvoiceStatus } from '../../types';
import { cn } from '../../utils/cn';
import { StatusBadge } from './StatusBadge';

interface PaymentStatusProps {
  status: InvoiceStatus;
  amount: number;
  dueAt?: string;
  reference?: string;
  className?: string;
}

/** Compact payment line: amount, status and due date, aligned on a shared baseline. */
export function PaymentStatus({ status, amount, dueAt, reference, className }: PaymentStatusProps) {
  const { t, money, date } = useI18n();

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3',
        className
      )}>
      
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink">{money(amount, true)}</p>
        <p className="mt-0.5 text-[0.75rem] text-muted">
          {reference && <span className="mr-2">{reference}</span>}
          {dueAt && t('portal.dueOn', { date: date(dueAt) })}
        </p>
      </div>
      <StatusBadge kind="invoice" value={status} />
    </div>);

}