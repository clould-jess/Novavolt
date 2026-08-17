import React from 'react';
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  BellIcon,
  CalendarDaysIcon,
  FileWarningIcon,
  KeyRoundIcon } from
'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { mockBookings, mockRentals } from '../../data/bookings';
import { currentCustomer } from '../../data/customers';
import { documentsFor } from '../../data/documents';
import { invoicesFor } from '../../data/finance';
import { mockNotifications } from '../../data/operations';
import { getVehicle } from '../../data/vehicles';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { PageHeading } from '../../components/ui/PageHeading';
import { PaymentStatus } from '../../components/ui/PaymentStatus';
import { Reveal } from '../../components/ui/Reveal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { VehicleImage } from '../../components/ui/VehicleImage';

export function PortalOverview() {
  const { t, date, money } = useI18n();
  const rental = mockRentals.find((item) => item.id === currentCustomer.activeRentalId);
  const vehicle = rental ? getVehicle(rental.vehicleId) : undefined;
  const upcoming = mockBookings.find((booking) => booking.customerId === currentCustomer.id);
  const documents = documentsFor(currentCustomer.id);
  const pending = documents.filter((doc) => ['required', 'rejected'].includes(doc.status));
  const expiring = documents.filter((doc) => doc.status === 'expiring');
  const nextInvoice = invoicesFor(currentCustomer.id).find((invoice) => invoice.status === 'upcoming');

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title={t('portal.greeting', { name: currentCustomer.firstName })}
        description={t('portal.greetingBody')}
        action={
        <Button to="/portail/reservation" iconRight={<ArrowRightIcon className="h-4 w-4" />}>
            {t('portal.bookingTitle')}
          </Button>
        } />
      

      {/* The required action wins the page: it is what unblocks the rental. */}
      <Reveal>
        <Card className="border-warn/30 bg-[#FFFBEB]" padding="lg">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-warn" aria-hidden="true">
                <AlertTriangleIcon className="h-5 w-5" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[0.75rem] font-semibold uppercase tracking-wide text-[#B45309]">
                    {t('portal.nextAction')}
                  </p>
                  <StatusBadge kind="file" value={currentCustomer.fileStatus} />
                </div>
                <p className="mt-2 max-w-xl font-display text-lg font-semibold tracking-[-0.02em] text-ink">
                  {t('portal.nextActionBody')}
                </p>
              </div>
            </div>
            <Button to="/portail/documents" className="shrink-0">
              {t('portal.nextActionCta')}
            </Button>
          </div>
        </Card>
      </Reveal>

      <div className="grid gap-5 lg:grid-cols-3">
        <Reveal index={0} className="lg:col-span-2">
          <Card padding="none" className="h-full overflow-hidden">
            {rental && vehicle ?
            <div className="flex h-full flex-col sm:flex-row">
                <VehicleImage
                src={vehicle.imageUrl}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="aspect-[16/10] sm:aspect-auto sm:w-2/5" />
              
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[0.75rem] font-semibold uppercase tracking-wide text-action">
                      {t('portal.activeRental')}
                    </p>
                    <StatusBadge kind="rental" value={rental.stage} />
                  </div>
                  <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.02em] text-ink">
                    {vehicle.brand} {vehicle.model} <span className="text-muted">{vehicle.year}</span>
                  </h2>
                  <dl className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-[0.75rem] text-muted">{t('common.dates')}</dt>
                      <dd className="mt-0.5 text-2xs font-semibold text-ink">
                        {date(rental.startDate)} – {date(rental.endDate)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[0.75rem] text-muted">{t('common.reference')}</dt>
                      <dd className="mt-0.5 text-2xs font-semibold text-ink">{rental.reference}</dd>
                    </div>
                  </dl>
                  <div className="mt-auto flex flex-wrap gap-2.5 pt-5">
                    <Button to="/portail/location" size="sm">
                      {t('portal.rentalTitle')}
                    </Button>
                    <Button to="/portail/incident" size="sm" variant="secondary">
                      {t('portal.reportIncident')}
                    </Button>
                  </div>
                </div>
              </div> :

            <div className="p-6">
                <CardHeader title={t('portal.upcomingBooking')} />
              </div>
            }
          </Card>
        </Reveal>

        <Reveal index={1}>
          <Card className="flex h-full flex-col" padding="md">
            <CardHeader title={t('portal.nextPayment')} />
            {nextInvoice ?
            <>
                <p className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] text-ink">
                  {money(nextInvoice.amount, true)}
                </p>
                <p className="mt-1 text-2xs text-muted">{t('portal.dueOn', { date: date(nextInvoice.dueAt) })}</p>
                <div className="mt-auto pt-5">
                  <Button to="/portail/paiements" variant="secondary" size="sm" fullWidth>
                    {t('portal.paymentsTitle')}
                  </Button>
                </div>
              </> :

            <p className="mt-4 text-2xs text-muted">{t('common.noResults')}</p>
            }
          </Card>
        </Reveal>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Reveal index={0}>
          <Card className="h-full" padding="md">
            <CardHeader
              title={t('portal.docsMissing')}
              action={<Badge tone={pending.length > 0 ? 'danger' : 'success'}>{pending.length}</Badge>} />
            
            <ul className="mt-4 flex flex-col gap-2.5">
              {pending.map((doc) =>
              <li key={doc.id} className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2 text-2xs text-body">
                    <FileWarningIcon className="h-4 w-4 shrink-0 text-warn" aria-hidden="true" />
                    <span className="truncate">{doc.label}</span>
                  </span>
                  <StatusBadge kind="doc" value={doc.status} />
                </li>
              )}
            </ul>
            <div className="mt-5">
              <Button to="/portail/documents" size="sm" variant="secondary" fullWidth>
                {t('portal.documentsTitle')}
              </Button>
            </div>
          </Card>
        </Reveal>

        <Reveal index={1}>
          <Card className="h-full" padding="md">
            <CardHeader title={t('portal.docsExpiring')} />
            <ul className="mt-4 flex flex-col gap-3">
              {expiring.map((doc) =>
              <li key={doc.id}>
                  <p className="text-2xs font-semibold text-ink">{doc.label}</p>
                  <p className="mt-0.5 text-[0.75rem] text-muted">
                    {doc.expiresAt && t('portal.expiresOn', { date: date(doc.expiresAt) })}
                  </p>
                </li>
              )}
              {upcoming &&
              <li className="border-t border-line pt-3">
                  <p className="flex items-center gap-2 text-2xs font-semibold text-ink">
                    <CalendarDaysIcon className="h-4 w-4 text-action" aria-hidden="true" />
                    {t('portal.upcomingBooking')} · {upcoming.reference}
                  </p>
                  <p className="mt-0.5 text-[0.75rem] text-muted">
                    {date(upcoming.startDate)} – {date(upcoming.endDate)}
                  </p>
                </li>
              }
            </ul>
          </Card>
        </Reveal>

        <Reveal index={2}>
          <Card className="h-full" padding="md">
            <CardHeader
              title={t('portal.notifications')}
              action={
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-sky-50 text-action" aria-hidden="true">
                  <BellIcon className="h-4 w-4" />
                </span>
              } />
            
            <ul className="mt-4 flex flex-col divide-y divide-line">
              {mockNotifications.map((notification) =>
              <li key={notification.id} className="flex items-start gap-2.5 py-2.5 first:pt-0">
                  <KeyRoundIcon
                  className={notification.read ? 'mt-0.5 h-3.5 w-3.5 text-muted' : 'mt-0.5 h-3.5 w-3.5 text-action'}
                  aria-hidden="true" />
                
                  <div className="min-w-0">
                    <p className="truncate text-2xs font-semibold text-ink">{t(notification.titleKey)}</p>
                    <p className="text-[0.75rem] text-muted">{date(notification.createdAt)}</p>
                  </div>
                </li>
              )}
            </ul>
          </Card>
        </Reveal>
      </div>
    </div>);

}