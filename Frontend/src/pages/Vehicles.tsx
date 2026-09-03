import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CarFrontIcon, Clock3Icon, GaugeIcon, ShieldCheckIcon, SlidersHorizontalIcon, WrenchIcon } from 'lucide-react';
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
import { PageHero } from '../components/marketing/PageHero';
import { images } from '../data/images';
import { ApiError } from '../services/api';
import { listPublicVehicles, mapPublicVehicles } from '../services/publicVehicles';

type Tab = 'all' | 'driver' | 'individual' | 'electric' | 'hybrid';

const PAGE_SIZE = 6;

export function Vehicles() {
  const { t, locale } = useI18n();
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
    [catalog, city, brand, minRange, availableOnly],
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
      <PageHero
        eyebrow={t('nav.vehicles')}
        title={t('vehiclesPage.heroTitle')}
        subtitle={t('vehiclesPage.subtitle')}
        image={{ src: images.suv, alt: t('vehiclesPage.heroImageAlt') }}
        actions={<Button to="/#demande-location" size="lg">{t('hero.ctaRent')}</Button>}
      />

      <section className="bg-ink px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-content divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { value: locale === 'fr' ? '24 h' : '24 hr', label: t('vehiclesPage.kpiResponse'), icon: <Clock3Icon className="h-5 w-5" /> },
            { value: '$1,600', label: t('vehiclesPage.kpiElectric'), icon: <GaugeIcon className="h-5 w-5" /> },
            { value: '100%', label: t('vehiclesPage.kpiSupport'), icon: <CarFrontIcon className="h-5 w-5" /> },
          ].map((item) => <div key={item.label} className="flex items-center gap-4 px-4 py-5 sm:px-8"><span className="grid h-10 w-10 place-items-center rounded-full bg-action/15 text-sky-300">{item.icon}</span><div><p className="font-display text-2xl font-semibold text-sky-300">{item.value}</p><p className="mt-0.5 text-2xs font-medium text-sky-100/65">{item.label}</p></div></div>)}
        </div>
      </section>

      <section className="border-b border-line bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
        <div className="mx-auto max-w-4xl">
          <div className="text-center"><h2 className="font-display text-3xl font-semibold tracking-[-0.025em] text-ink sm:text-4xl">{t('vehiclesPage.includedTitle')}</h2><svg className="mx-auto mt-3 h-5 w-32 overflow-visible text-action" viewBox="0 0 128 20" aria-hidden="true"><path d="M3 14 C35 4, 82 3, 125 11" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg></div>
          <div className="mt-9 grid gap-4 sm:grid-cols-3">
            {[{ icon: <GaugeIcon className="h-6 w-6" />, label: t('vehiclesPage.includedKm') }, { icon: <ShieldCheckIcon className="h-6 w-6" />, label: t('vehiclesPage.includedInsurance') }, { icon: <WrenchIcon className="h-6 w-6" />, label: t('vehiclesPage.includedMaintenance') }].map((item) => <div key={item.label} className="flex items-center gap-4 rounded-card border border-line bg-white p-5 shadow-xs"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-sky-50 text-action">{item.icon}</span><p className="text-sm font-semibold leading-snug text-ink">{item.label}</p></div>)}
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
