import React from 'react';
import { BatteryChargingIcon, GaugeIcon, MapPinIcon, PhoneIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { mockRentals } from '../../data/bookings';
import { currentCustomer } from '../../data/customers';
import { getVehicle } from '../../data/vehicles';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeading } from '../../components/ui/PageHeading';
import { RentalTimeline } from '../../components/ui/RentalTimeline';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { VehicleImage } from '../../components/ui/VehicleImage';

export function PortalRental() {
  const { t, date, num } = useI18n();
  const rental = mockRentals.find((item) => item.id === currentCustomer.activeRentalId);
  const vehicle = rental ? getVehicle(rental.vehicleId) : undefined;

  if (!rental || !vehicle) {
    return (
      <EmptyState
        icon={<GaugeIcon className="h-5 w-5" />}
        title={t('portal.emptyBookings')}
        body={t('portal.emptyBookingsBody')}
        action={<Button to="/vehicules">{t('portal.emptyBookingsCta')}</Button>} />);


  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title={t('portal.rentalTitle')}
        description={`${rental.reference} · ${date(rental.startDate)} – ${date(rental.endDate)}`}
        action={<StatusBadge kind="rental" value={rental.stage} size="md" />} />
      

      <Card padding="none" className="overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <VehicleImage
            src={vehicle.imageUrl}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="aspect-[16/9] lg:aspect-auto lg:w-2/5" />
          
          <div className="flex-1 p-6">
            <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-ink">
              {vehicle.brand} {vehicle.model} <span className="text-muted">{vehicle.year}</span>
            </h2>
            <dl className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="flex items-center gap-1.5 text-[0.75rem] text-muted">
                  <MapPinIcon className="h-3.5 w-3.5 text-action" aria-hidden="true" />
                  {t('portal.rentalPickup')}
                </dt>
                <dd className="mt-1 text-2xs font-semibold text-ink">{rental.pickupAddress}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-[0.75rem] text-muted">
                  <BatteryChargingIcon className="h-3.5 w-3.5 text-action" aria-hidden="true" />
                  {t('portal.rentalCharge')}
                </dt>
                <dd className="mt-1 text-2xs font-semibold text-ink">{rental.chargeAtPickup} %</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-[0.75rem] text-muted">
                  <GaugeIcon className="h-3.5 w-3.5 text-action" aria-hidden="true" />
                  {t('portal.rentalOdometer')}
                </dt>
                <dd className="mt-1 text-2xs font-semibold text-ink">{num(rental.odometerAtPickup)} km</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-[0.75rem] text-muted">
                  <PhoneIcon className="h-3.5 w-3.5 text-action" aria-hidden="true" />
                  {t('portal.rentalSupport')}
                </dt>
                <dd className="mt-1 text-2xs font-semibold text-ink">{t('common.phone')}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Button to="/portail/incident" size="sm">
                {t('portal.reportIncident')}
              </Button>
              <Button to="/portail/contrat" size="sm" variant="secondary">
                {t('portal.viewContract')}
              </Button>
              <Button to="/portail/support" size="sm" variant="ghost">
                {t('portal.contactSupport')}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card padding="lg">
        <CardHeader title={t('portal.rentalTimeline')} />
        <RentalTimeline
          className="mt-6"
          stage={rental.stage}
          dates={{
            reserved: date(rental.startDate),
            active: date(rental.startDate),
            returnDue: date(rental.endDate)
          }} />
        
      </Card>
    </div>);

}