import React, { useMemo, useState } from 'react';
import { ArrowRightIcon, CarFrontIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { mockVehicles } from '../../data/vehicles';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { Reveal } from '../ui/Reveal';
import { SectionTitle } from '../ui/SectionTitle';
import { Tabs } from '../ui/Tabs';
import { VehicleCard } from '../marketing/VehicleCard';

type Filter = 'all' | 'driver' | 'individual' | 'electric' | 'hybrid';

export function FeaturedVehicles() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<Filter>('all');

  const vehicles = useMemo(() => {
    const list = mockVehicles.filter((vehicle) => {
      if (filter === 'all') return true;
      if (filter === 'driver' || filter === 'individual') return vehicle.useCases.includes(filter);
      return vehicle.powertrain === filter;
    });
    return list.slice(0, 6);
  }, [filter]);

  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-content">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle
            as="h2"
            variant={2}
            title={t('featured.title')}
            subtitle={t('featured.subtitle')}
            className="max-w-xl" />
          
          <Tabs
            label={t('common.filters')}
            value={filter}
            onChange={(id) => setFilter(id as Filter)}
            items={[
            { id: 'all', label: t('featured.filterAll') },
            { id: 'driver', label: t('featured.filterDrivers') },
            { id: 'individual', label: t('featured.filterIndividuals') },
            { id: 'electric', label: t('featured.filterElectric') },
            { id: 'hybrid', label: t('featured.filterHybrid') }]
            }
            className="shrink-0" />
          
        </div>

        {vehicles.length === 0 ?
        <EmptyState
          className="mt-10"
          compact
          icon={<CarFrontIcon className="h-5 w-5" />}
          title={t('vehiclesPage.emptyTitle')}
          body={t('vehiclesPage.emptyBody')}
          action={
          <Button variant="secondary" onClick={() => setFilter('all')}>
                {t('vehiclesPage.emptyCta')}
              </Button>
          } /> :


        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
            {vehicles.map((vehicle, index) =>
          <Reveal as="li" key={vehicle.id} index={index} className="h-full">
                <VehicleCard vehicle={vehicle} />
              </Reveal>
          )}
          </ul>
        }

        <div className="mt-10 flex justify-center">
          <Button to="/vehicules" variant="secondary" iconRight={<ArrowRightIcon className="h-4 w-4" />}>
            {t('featured.cta')}
          </Button>
        </div>
      </div>
    </section>);

}