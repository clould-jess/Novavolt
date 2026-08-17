import React from 'react';
import { LockIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { useToast } from '../../contexts/ToastContext';
import { currentCustomer } from '../../data/customers';
import { depositsFor, invoicesFor } from '../../data/finance';
import type { Invoice } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import { PageHeading } from '../../components/ui/PageHeading';
import { PaymentStatus } from '../../components/ui/PaymentStatus';
import { StatusBadge } from '../../components/ui/StatusBadge';

export function PortalPayments() {
  const { t, date, money } = useI18n();
  const { showToast } = useToast();
  const invoices = invoicesFor(currentCustomer.id);
  const deposits = depositsFor(currentCustomer.id);
  const next = invoices.find((invoice) => invoice.status === 'upcoming');

  const columns: Column<Invoice>[] = [
  {
    id: 'number',
    header: t('portal.invoices'),
    primary: true,
    sortValue: (row) => row.number,
    cell: (row) => <span className="font-semibold text-ink">{row.number}</span>
  },
  { id: 'period', header: t('common.period'), cell: (row) => row.period },
  { id: 'issued', header: t('common.date'), sortValue: (row) => row.issuedAt, cell: (row) => date(row.issuedAt) },
  {
    id: 'amount',
    header: t('common.amount'),
    align: 'right',
    sortValue: (row) => row.amount,
    cell: (row) => money(row.amount, true)
  },
  { id: 'status', header: t('common.status'), cell: (row) => <StatusBadge kind="invoice" value={row.status} /> }];


  return (
    <div className="flex flex-col gap-6">
      <PageHeading title={t('portal.paymentsTitle')} description={t('portal.paymentsSubtitle')} />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card padding="md" className="lg:col-span-2">
          <CardHeader title={t('portal.nextPayment')} />
          {next ?
          <>
              <p className="mt-4 font-display text-4xl font-bold tracking-[-0.03em] text-ink">
                {money(next.amount, true)}
              </p>
              <p className="mt-1.5 text-2xs text-muted">{t('portal.dueOn', { date: date(next.dueAt) })}</p>
            </> :

          <p className="mt-4 text-2xs text-muted">{t('common.noResults')}</p>
          }
          <div className="mt-6 flex flex-col gap-2.5 rounded-xl border border-line bg-soft p-4">
            <p className="flex items-start gap-2.5 text-[0.75rem] leading-relaxed text-muted">
              <LockIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-action" aria-hidden="true" />
              {t('portal.addPaymentNote')}
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="self-start"
              onClick={() => showToast({ tone: 'info', title: t('portal.addPayment') })}>
              
              {t('portal.addPayment')}
            </Button>
          </div>
        </Card>

        <Card padding="md">
          <CardHeader title={t('portal.depositTitle')} />
          <ul className="mt-4 flex flex-col gap-3">
            {deposits.map((deposit) =>
            <li key={deposit.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-2xs font-semibold text-ink">{money(deposit.amount)}</p>
                  <p className="text-[0.75rem] text-muted">{date(deposit.updatedAt)}</p>
                </div>
                <StatusBadge kind="deposit" value={deposit.status} />
              </li>
            )}
          </ul>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 font-display text-lg font-semibold tracking-[-0.02em] text-ink">{t('portal.invoices')}</h2>
        <DataTable caption={t('portal.invoices')} columns={columns} rows={invoices} rowKey={(row) => row.id} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
        {invoices.slice(0, 2).map((invoice) =>
        <PaymentStatus
          key={invoice.id}
          status={invoice.status}
          amount={invoice.amount}
          dueAt={invoice.dueAt}
          reference={invoice.number} />

        )}
      </div>
    </div>);

}