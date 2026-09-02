import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CarFrontIcon, SlidersHorizontalIcon } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import type { City, Powertrain, UseCase, Vehicle } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Checkbox } from '../components/ui/Checkbox';
import { EmptyState } from '../components/ui/EmptyState';
import { CenteredLoading } from '../components/ui/CenteredLoading';
import { Reveal } from '../components/ui/Reveal';
import { SearchBar } from '../components/ui/SearchBar';
import { SectionTitle } from '../components/ui/SectionTitle';
import { Select } from '../components/ui/Select';
import { Tabs } from '../components/ui/Tabs';
import { VehicleCard } from '../components/marketing/VehicleCard';
import { ApiError } from '../services/api';
import { listPublicVehicles, mapPublicVehicles } from '../services/publicVehicles';

type Tab = 'all' | 'driver' | 'individual' | 'electric' | 'hybrid';

const PAGE_SIZE = 6;

export function Vehicles() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const [catalog, setCatalog] = useState<Vehicle[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadErrorTitle, setLoadErrorTitle] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [city, setCity] = useState<City>('montreal');
  const [brand, setBrand] = useState('all');
  const [minRange, setMinRange] = useState(0);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const mountedRef = useRef(true);

  const loadVehicles = async (nextPage = 1, append = false) => {
    if (append) {
      setLoadingMore(true);
      setLoadMoreError(null);
    } else {
      setLoading(true);
      setLoadErrorTitle(null);
      setLoadError(null);
      setLoadMoreError(null);
      setCatalog([]);
      setTotalCount(0);
      setPage(1);
    }
    try {
      const response = await listPublicVehicles({ page: nextPage, limit: PAGE_SIZE });
      if (!mountedRef.current) return;
      const items = mapPublicVehicles(response.items).filter((vehicle) => vehicle.status === 'available');
      setCatalog((current) => (append ? [...current, ...items] : items));
      setTotalCount(response.total);
      setPage(response.page);
    } catch (error) {
      if (!mountedRef.current) return;
      const title = error instanceof TypeError ? t('auth.networkErrorTitle') : t('auth.serverErrorTitle');
      const body =
        error instanceof TypeError
          ? t('auth.networkErrorBody')
          : error instanceof ApiError
            ? error.message
            : t('auth.serverErrorTitle');
      if (append) {
        setLoadMoreError(body);
      } else {
        setLoadErrorTitle(title);
        setLoadError(body);
      }
    } finally {
      if (mountedRef.current) {
        if (append) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    void loadVehicles(1, false);
    return () => {
      mountedRef.current = false;
    };
  }, [t]);

  const brandOptions = useMemo(
    () => Array.from(new Set(catalog.map((vehicle) => vehicle.brand))).sort(),
    [catalog],
  );

  const results = useMemo(
    () =>
      catalog.filter((vehicle) => {
        const label = `${vehicle.brand} ${vehicle.model} ${t(`cities.${vehicle.city}`)}`.toLowerCase();
        if (query && !label.includes(query.toLowerCase())) return false;
        if (vehicle.city !== city) return false;
        if (brand !== 'all' && vehicle.brand !== brand) return false;
        if (vehicle.rangeKm < minRange) return false;
        if (availableOnly && vehicle.status !== 'available') return false;
        if (tab === 'driver' || tab === 'individual') return vehicle.useCases.includes(tab as UseCase);
        if (tab === 'electric' || tab === 'hybrid') return vehicle.powertrain === (tab as Powertrain);
        return true;
      }),
    [catalog, query, city, brand, minRange, availableOnly, tab, t],
  );

  const reset = () => {
    setQuery('');
    setCity('montreal');
    setBrand('all');
    setMinRange(0);
    setAvailableOnly(false);
    setTab('all');
    setLoadMoreError(null);
  };

  const loadMore = () => void loadVehicles(page + 1, true);

  const filters = (
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
            { value: 'montreal', label: t('cities.montreal') },
          ]}
        />

        <Select
          id="filter-brand"
          label={t('vehiclesPage.filterBrand')}
          value={brand}
          onChange={(event) => setBrand(event.target.value)}
          options={[
            { value: 'all', label: t('vehiclesPage.allBrands') },
            ...brandOptions.map((item) => ({ value: item, label: item })),
          ]}
        />

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
            className="mt-3 w-full accent-action"
          />
          <p className="mt-1 text-[0.75rem] font-medium text-muted">{minRange} km</p>
        </div>

        <Checkbox
          id="filter-available"
          label={t('vehiclesPage.availableOnly')}
          checked={availableOnly}
          onChange={(event) => setAvailableOnly(event.target.checked)}
        />

        <Button variant="ghost" size="sm" onClick={reset}>
          {t('common.reset')}
        </Button>
      </div>
    </Card>
  );

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
            className="max-w-3xl"
          />

          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">
            <SearchBar
              id="vehicles-search"
              size="lg"
              label={t('common.search')}
              placeholder={t('vehiclesPage.searchPlaceholder')}
              value={query}
              onChange={setQuery}
              clearLabel={t('common.reset')}
              className="lg:max-w-md"
            />

            <Tabs
              label={t('common.filters')}
              value={tab}
              onChange={(id) => setTab(id as Tab)}
              items={[
                { id: 'all', label: t('vehiclesPage.tabAll') },
                { id: 'driver', label: t('vehiclesPage.tabDrivers') },
                { id: 'individual', label: t('vehiclesPage.tabIndividuals') },
                { id: 'electric', label: t('vehiclesPage.tabElectric') },
                { id: 'hybrid', label: t('vehiclesPage.tabHybrid') },
              ]}
            />
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
              iconLeft={<SlidersHorizontalIcon className="h-4 w-4" />}
            >
              {t('common.filters')}
            </Button>
            {showFilters && <div className="mt-4">{filters}</div>}
          </div>

          <div>
            <p className="text-2xs font-semibold text-muted">
              {t('vehiclesPage.count', { count: results.length })}
            </p>

            {loading ? (
              <CenteredLoading className="mt-6 min-h-[24rem]" />
            ) : loadError ? (
              <EmptyState
                className="mt-6"
                icon={<CarFrontIcon className="h-5 w-5" />}
                title={loadErrorTitle ?? t('auth.networkErrorTitle')}
                body={loadError}
                action={<Button onClick={() => void loadVehicles()}>{t('common.retry')}</Button>}
              />
            ) : results.length === 0 ? (
              <EmptyState
                className="mt-6"
                icon={<CarFrontIcon className="h-5 w-5" />}
                title={t('vehiclesPage.emptyTitle')}
                body={t('vehiclesPage.emptyBody')}
                action={<Button onClick={reset}>{t('vehiclesPage.emptyCta')}</Button>}
              />
            ) : (
              <>
                <ul className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {results.map((vehicle, index) => (
                    <Reveal as="li" key={vehicle.id} index={index} className="h-full">
                      <VehicleCard vehicle={vehicle} />
                    </Reveal>
                  ))}
                </ul>
                {loadMoreError && (
                  <p className="mt-4 text-center text-[0.75rem] font-medium text-bad">{loadMoreError}</p>
                )}
                {catalog.length < totalCount && (
                  <div className="mt-10 flex justify-center">
                    <Button variant="secondary" onClick={loadMore} loading={loadingMore}>
                      {t('common.loadMore')}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
