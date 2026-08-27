import { useEffect, useState } from 'react';
import { ArrowRightIcon, CarFrontIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { CenteredLoading } from '../ui/CenteredLoading';
import { SectionTitle } from '../ui/SectionTitle';
import { ApiError } from '../../services/api';
import { listPublicVehicles, mapPublicVehicles } from '../../services/publicVehicles';
import { VehicleCard } from '../marketing/VehicleCard';
import { Reveal } from '../ui/Reveal';

export function FeaturedVehicles() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featured, setFeatured] = useState<ReturnType<typeof mapPublicVehicles>>([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    listPublicVehicles()
      .then((response) => {
        if (!active) return;
        setFeatured(mapPublicVehicles(response.items).filter((vehicle) => vehicle.status === 'available').slice(0, 3));
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof TypeError) {
          setError(t('auth.networkErrorBody'));
          return;
        }
        if (err instanceof ApiError) {
          setError(err.message);
          return;
        }
        setError(t('auth.serverErrorTitle'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [t]);

  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-content">
        <SectionTitle as="h2" variant={2} title={t('featured.title')} subtitle={t('featured.subtitle')} className="max-w-xl" />

        {loading ? (
          <CenteredLoading className="mt-10 min-h-[18rem]" />
        ) : error ? (
          <EmptyState
            className="mt-10"
            compact
            icon={<CarFrontIcon className="h-5 w-5" />}
            title={t('auth.networkErrorTitle')}
            body={error}
          />
        ) : (
          <ul className="mt-10 grid gap-6 lg:grid-cols-3">
            {featured.map((vehicle, index) => (
              <Reveal as="li" key={vehicle.id} index={index} className="h-full">
                <VehicleCard vehicle={vehicle} />
              </Reveal>
            ))}
          </ul>
        )}

        <div className="mt-10 flex justify-center">
          <Button to="/vehicules" variant="secondary" iconRight={<ArrowRightIcon className="h-4 w-4" />}>
            {t('featured.cta')}
          </Button>
        </div>
      </div>
    </section>
  );
}
