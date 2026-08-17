import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CarFrontIcon, SlidersHorizontalIcon } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { mockVehicles, vehicleBrands } from '../data/vehicles';
import type { City, Powertrain, UseCase } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Checkbox } from '../components/ui/Checkbox';
import { EmptyState } from '../components/ui/EmptyState';
import { Reveal } from '../components/ui/Reveal';
import { SearchBar } from '../components/ui/SearchBar';
import { SectionTitle } from '../components/ui/SectionTitle';
import { Select } from '../components/ui/Select';
import { Tabs } from '../components/ui/Tabs';
import { VehicleCard } from '../components/marketing/VehicleCard';

type Tab = 'all' | 'driver' | 'individual' | 'electric' | 'hybrid';

const PAGE_SIZE = 6;

export function Vehicles() {
  const { t, money } = useI18n();
  const [params] = useSearchParams();
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [city, setCity] = useState<City | 'all'>(params.get('ville') as City ?? 'all');
  const [brand, setBrand] = useState('all');
  const [minRange, setMinRange] = useState(0);
  const [maxWeekly, setMaxWeekly] = useState(450);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [showFilters, setShowFilters] = useState(false);

  const results = useMemo(
    () =>
    mockVehicles.filter((vehicle) => {
      const label = `${vehicle.brand} ${vehicle.model} ${t(`cities.${vehicle.city}`)}`.toLowerCase();
      if (query && !label.includes(query.toLowerCase())) return false;
      if (city !== 'all' && vehicle.city !== city) return false;
      if (brand !== 'all' && vehicle.brand !== brand) return false;
      if (vehicle.rangeKm < minRange) return false;
      if (vehicle.pricing.weekly > maxWeekly) return false;
      if (availableOnly && vehicle.status !== 'available') return false;
      if (tab === 'driver' || tab === 'individual') return vehicle.useCases.includes(tab as UseCase);
      if (tab === 'electric' || tab === 'hybrid') return vehicle.powertrain === tab as Powertrain;
      return true;
    }),
    [query, city, brand, minRange, maxWeekly, availableOnly, tab, t]
  );

  const reset = () => {
    setQuery('');
    setCity('all');
    setBrand('all');
    setMinRange(0);
    setMaxWeekly(450);
    setAvailableOnly(false);
    setTab('all');
    setVisible(PAGE_SIZE);
  };

  const filters =
  <Card padding="md" className="lg:sticky lg:top-24">
      <p className="flex items-center gap-2 font-display text-sm font-semibold text-ink">
        <SlidersHorizontalIcon className="h-4 w-4 text-action" aria-hidden="true" />
        {t('common.filters')}
      </p>
      <div className="mt-5 flex flex-col gap-4">
        <Select
        id="filter-city"
        label={t('common.city')}
        value={city}
        onChange={(event) => setCity(event.target.value as City | 'all')}
        options={[
        { value: 'all', label: t('common.allCities') },
        { value: 'montreal', label: t('cities.montreal') },
        { value: 'toronto', label: t('cities.toronto') },
        { value: 'ottawa', label: t('cities.ottawa') },
        { value: 'vancouver', label: t('cities.vancouver') }]
        } />
      
        <Select
        id="filter-brand"
        label={t('vehiclesPage.filterBrand')}
        value={brand}
        onChange={(event) => setBrand(event.target.value)}
        options={[
        { value: 'all', label: t('vehiclesPage.allBrands') },
        ...vehicleBrands.map((item) => ({ value: item, label: item }))]
        } />
      
        <div>
          <label htmlFor="filter-range" className="block text-2xs font-semibold text-ink">
            {t('vehiclesPage.filterRange')}
          </label>
          <input
          id="filter-range"
          type="range"
          min={0}
          max={500}
          step={50}
          value={minRange}
          onChange={(event) => setMinRange(Number(event.target.value))}
          className="mt-3 w-full accent-action" />
        
          <p className="mt-1 text-[0.75rem] font-medium text-muted">{minRange} km</p>
        </div>
        <div>
          <label htmlFor="filter-price" className="block text-2xs font-semibold text-ink">
            {t('vehiclesPage.filterPrice')}
          </label>
          <input
          id="filter-price"
          type="range"
          min={200}
          max={450}
          step={25}
          value={maxWeekly}
          onChange={(event) => setMaxWeekly(Number(event.target.value))}
          className="mt-3 w-full accent-action" />
        
          <p className="mt-1 text-[0.75rem] font-medium text-muted">
            {money(maxWeekly)} {t('common.perWeek')}
          </p>
        </div>
        <Checkbox
        id="filter-available"
        label={t('vehiclesPage.availableOnly')}
        checked={availableOnly}
        onChange={(event) => setAvailableOnly(event.target.checked)} />
      
        <Button variant="ghost" size="sm" onClick={reset}>
          {t('common.reset')}
        </Button>
      </div>
    </Card>;


  return (
    <>
      <section className="border-b border-line bg-soft px-4 pb-10 pt-28 sm:px-6 lg:px-8 lg:pb-12 lg:pt-36">
        <div className="mx-auto max-w-content">
          <SectionTitle
            as="h1"
            size="display"
            variant={0}
            eyebrow={t('nav.vehicles')}
            title={t('vehiclesPage.title')}
            subtitle={t('vehiclesPage.subtitle')}
            className="max-w-3xl" />
          
          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">
            <SearchBar
              id="vehicles-search"
              size="lg"
              label={t('common.search')}
              placeholder={t('vehiclesPage.searchPlaceholder')}
              value={query}
              onChange={setQuery}
              clearLabel={t('common.reset')}
              className="lg:max-w-md" />
            
            <Tabs
              label={t('common.filters')}
              value={tab}
              onChange={(id) => setTab(id as Tab)}
              items={[
              { id: 'all', label: t('vehiclesPage.tabAll') },
              { id: 'driver', label: t('vehiclesPage.tabDrivers') },
              { id: 'individual', label: t('vehiclesPage.tabIndividuals') },
              { id: 'electric', label: t('vehiclesPage.tabElectric') },
              { id: 'hybrid', label: t('vehiclesPage.tabHybrid') }]
              } />
            
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto grid max-w-content gap-8 lg:grid-cols-[17rem_1fr]">
          <div className="hidden lg:block">{filters}</div>

          <div className="lg:hidden">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowFilters((value) => !value)}
              iconLeft={<SlidersHorizontalIcon className="h-4 w-4" />}>
              
              {t('common.filters')}
            </Button>
            {showFilters && <div className="mt-4">{filters}</div>}
          </div>

          <div>
            <p className="text-2xs font-semibold text-muted">
              {t('vehiclesPage.count', { count: results.length })}
            </p>

            {results.length === 0 ?
            <EmptyState
              className="mt-6"
              icon={<CarFrontIcon className="h-5 w-5" />}
              title={t('vehiclesPage.emptyTitle')}
              body={t('vehiclesPage.emptyBody')}
              action={<Button onClick={reset}>{t('vehiclesPage.emptyCta')}</Button>} /> :


            <>
                <ul className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {results.slice(0, visible).map((vehicle, index) =>
                <Reveal as="li" key={vehicle.id} index={index} className="h-full">
                      <VehicleCard vehicle={vehicle} />
                    </Reveal>
                )}
                </ul>
                {visible < results.length &&
              <div className="mt-10 flex justify-center">
                    <Button variant="secondary" onClick={() => setVisible((value) => value + PAGE_SIZE)}>
                      {t('common.loadMore')}
                    </Button>
                  </div>
              }
              </>
            }
          </div>
        </div>
      </section>
    </>);

}