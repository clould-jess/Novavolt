import React from 'react';
import { ClipboardListIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { mockBookings } from '../../data/bookings';
import { currentCustomer } from '../../data/customers';
import { getVehicle } from '../../data/vehicles';
import type { Booking } from '../../types';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeading } from '../../components/ui/PageHeading';
import { StatusBadge } from '../../components/ui/StatusBadge';

export function PortalBookings() {
  const { t, date, money } = useI18n();
  const bookings = mockBookings.filter((booking) => booking.customerId === currentCustomer.id);

  const columns: Column<Booking>[] = [
  {
    id: 'reference',
    header: t('common.reference'),
    primary: true,
    sortValue: (row) => row.reference,
    cell: (row) => <span className="font-semibold text-ink">{row.reference}</span>
  },
  {
    id: 'vehicle',
    header: t('common.vehicle'),
    cell: (row) => {
      const vehicle = getVehicle(row.vehicleId);
      return vehicle ? `${vehicle.brand} ${vehicle.model}` : '—';
    }
  },
  {
    id: 'dates',
    header: t('common.dates'),
    sortValue: (row) => row.startDate,
    cell: (row) => `${date(row.startDate)} – ${date(row.endDate)}`
  },
  {
    id: 'total',
    header: t('common.total'),
    align: 'right',
    sortValue: (row) => row.total,
    cell: (row) => money(row.total)
  },
  {
    id: 'status',
    header: t('common.status'),
    cell: (row) => <StatusBadge kind="booking" value={row.status} />
  }];


  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title={t('portal.nav.bookings')}
        action={<Button to="/portail/reservation">{t('portal.bookingTitle')}</Button>} />
      
      <DataTable
        caption={t('portal.nav.bookings')}
        columns={columns}
        rows={bookings}
        rowKey={(row) => row.id}
        emptyState={
        <EmptyState
          icon={<ClipboardListIcon className="h-5 w-5" />}
          title={t('portal.emptyBookings')}
          body={t('portal.emptyBookingsBody')}
          action={<Button to="/vehicules">{t('portal.emptyBookingsCta')}</Button>} />

        } />
      
    </div>);

}