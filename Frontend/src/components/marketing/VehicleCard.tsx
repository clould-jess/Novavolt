import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, BatteryChargingIcon, MapPinIcon, UsersIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import type { Vehicle } from '../../types';
import { cn } from '../../utils/cn';
import { Badge } from '../ui/Badge';
import { StatusBadge } from '../ui/StatusBadge';
import { VehicleImage } from '../ui/VehicleImage';

interface VehicleCardProps {
  vehicle: Vehicle;
  className?: string;
  /** Weekly is the reference for drivers, daily for individuals. */
  priceMode?: 'weekly' | 'daily';
}

export function VehicleCard({ vehicle, className, priceMode = 'weekly' }: VehicleCardProps) {
  const { t, money } = useI18n();
  const price = priceMode === 'weekly' ? vehicle.pricing.weekly : vehicle.pricing.daily;
  const unit = priceMode === 'weekly' ? t('common.perWeek') : t('common.perDay');
  const name = `${vehicle.brand} ${vehicle.model}`;

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white transition-[border-color,box-shadow,transform] duration-200 ease-signature hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-card',
        className
      )}>
      
      <div className="relative">
        <VehicleImage src={vehicle.imageUrl} alt={`${name} ${vehicle.year}`} className="aspect-[16/10]" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge tone={vehicle.powertrain === 'electric' ? 'info' : 'neutral'}>
            {t(`powertrain.${vehicle.powertrain}`)}
          </Badge>
          {vehicle.useCases.includes('driver') && <Badge tone="accent">{t('badge.rideshare')}</Badge>}
        </div>
        <div className="absolute right-3 top-3">
          <StatusBadge kind="vehicle" value={vehicle.status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base font-semibold tracking-[-0.02em] text-ink">
            {name} <span className="font-medium text-muted">{vehicle.year}</span>
          </h3>
        </div>
        <p className="mt-1 text-[0.75rem] font-medium text-muted">{vehicle.category}</p>

        <dl className="mt-4 grid grid-cols-3 gap-3 border-y border-line py-3.5">
          <div>
            <dt className="text-[0.75rem] text-muted">{t('vehicleDetail.specRange')}</dt>
            <dd className="mt-0.5 flex items-center gap-1 text-2xs font-semibold text-ink">
              <BatteryChargingIcon className="h-3.5 w-3.5 text-action" aria-hidden="true" />
              {vehicle.rangeKm} km
            </dd>
          </div>
          <div>
            <dt className="text-[0.75rem] text-muted">{t('vehicleDetail.specSeats')}</dt>
            <dd className="mt-0.5 flex items-center gap-1 text-2xs font-semibold text-ink">
              <UsersIcon className="h-3.5 w-3.5 text-action" aria-hidden="true" />
              {vehicle.seats}
            </dd>
          </div>
          <div>
            <dt className="text-[0.75rem] text-muted">{t('common.city')}</dt>
            <dd className="mt-0.5 flex items-center gap-1 truncate text-2xs font-semibold text-ink">
              <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-action" aria-hidden="true" />
              {t(`cities.${vehicle.city}`)}
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <p>
            <span className="block text-[0.75rem] text-muted">{t('common.from')}</span>
            <span className="font-display text-xl font-bold tracking-[-0.02em] text-ink">{money(price)}</span>
            <span className="ml-1 text-[0.75rem] font-semibold text-muted">{unit}</span>
          </p>
          <Link
            to={`/vehicules/${vehicle.id}`}
            className="inline-flex items-center gap-1.5 rounded-pill border border-line px-3.5 py-2 text-2xs font-semibold text-ink transition-[border-color,color,background-color] duration-200 ease-signature hover:border-action hover:bg-action hover:text-white">
            
            {t('vehiclesPage.cardCta')}
            <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>);

}
