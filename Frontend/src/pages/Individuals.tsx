import { useEffect, useMemo, useState } from 'react';
import { BriefcaseIcon, CalendarHeartIcon, ClockIcon, SparklesIcon } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { mockFaq } from '../data/faq';
import { images } from '../data/images';
import { plansFor } from '../data/plans';
import { Button } from '../components/ui/Button';
import { PricingCard } from '../components/ui/PricingCard';
import { Reveal } from '../components/ui/Reveal';
import { SectionTitle } from '../components/ui/SectionTitle';
import { CtaBanner } from '../components/marketing/CtaBanner';
import { FaqSection } from '../components/marketing/FaqSection';
import { PageHero } from '../components/marketing/PageHero';
import { StepsTimeline } from '../components/marketing/StepsTimeline';
import { VehicleCard } from '../components/marketing/VehicleCard';
import { EmptyState } from '../components/ui/EmptyState';
import { CenteredLoading } from '../components/ui/CenteredLoading';
import { CarFrontIcon } from 'lucide-react';
import { ApiError } from '../services/api';
import { listPublicVehicles, mapPublicVehicles } from '../services/publicVehicles';

const useCases = [
  { key: 'u1', icon: CalendarHeartIcon },
  { key: 'u2', icon: BriefcaseIcon },
  { key: 'u3', icon: SparklesIcon },
  { key: 'u4', icon: ClockIcon },
];

export function Individuals() {
  const { t } = useI18n();
  const plans = plansFor('individual');
  const [catalog, setCatalog] = useState<ReturnType<typeof mapPublicVehicles>>([]);
  const [loading, setLoading] = useState(true);
  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const [errorBody, setErrorBody] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setErrorTitle(null);
    setErrorBody(null);
    listPublicVehicles()
      .then((response) => {
        if (!active) return;
        setCatalog(mapPublicVehicles(response.items).filter((vehicle) => vehicle.status === 'available'));
      })
      .catch((error) => {
        if (!active) return;
        if (error instanceof TypeError) {
          setErrorTitle(t('auth.networkErrorTitle'));
          setErrorBody(t('auth.networkErrorBody'));
          return;
        }
        if (error instanceof ApiError) {
          setErrorTitle(t('auth.serverErrorTitle'));
          setErrorBody(error.message);
          return;
        }
        setErrorTitle(t('auth.serverErrorTitle'));
        setErrorBody(t('auth.serverErrorTitle'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [t]);

  const recommended = useMemo(
    () => catalog.filter((vehicle) => vehicle.useCases.includes('individual')).slice(0, 3),
    [catalog],
  );

  const steps = ['s1', 's2', 's4'].map((id) => ({
    id,
    title: t(`how.${id}.title`),
    body: t(`how.${id}.body`),
  }));

  return (
    <>
      <PageHero
        eyebrow={t('nav.individuals')}
        title={t('individualsPage.heroTitle')}
        subtitle={t('individualsPage.heroSubtitle')}
        image={{ src: images.individualHero, alt: t('individualsPage.heroImageAlt') }}
        variant={2}
        actions={
          <>
            <Button to="/vehicules" size="lg">
              {t('individualsPage.heroCta')}
            </Button>
            <Button to="/comment-ca-marche" size="lg" variant="secondary">
              {t('nav.howItWorks')}
            </Button>
          </>
        }
      />

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-content">
          <SectionTitle as="h2" variant={0} title={t('individualsPage.durationsTitle')} className="max-w-xl" />
          <ul className="mt-10 grid gap-5 lg:mt-14 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <Reveal as="li" key={plan.id} index={index} className="h-full">
                <PricingCard plan={plan} ctaTo="/portail/reservation" />
              </Reveal>
            ))}
          </ul>
          <p className="mt-6 text-[0.75rem] text-muted">{t('common.indicative')}</p>
        </div>
      </section>

      <section className="border-y border-line bg-soft px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-content">
          <SectionTitle as="h2" variant={1} title={t('individualsPage.casesTitle')} className="max-w-xl" />
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
            {useCases.map(({ key, icon: Icon }, index) => (
              <Reveal as="li" key={key} index={index}>
                <div className="flex h-full flex-col rounded-card border border-line bg-white p-5">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-action" aria-hidden="true">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-display text-base font-semibold tracking-[-0.02em] text-ink">
                    {t(`individualsPage.${key}.title`)}
                  </h3>
                  <p className="mt-2 text-2xs leading-relaxed text-muted">{t(`individualsPage.${key}.body`)}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-content gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <SectionTitle as="h2" variant={2} title={t('individualsPage.benefitsTitle')} />
          <dl className="divide-y divide-line border-y border-line">
            {['b1', 'b2', 'b3'].map((key) => (
              <div key={key} className="py-5">
                <dt className="font-display text-base font-semibold tracking-[-0.02em] text-ink">
                  {t(`individualsPage.${key}.title`)}
                </dt>
                <dd className="mt-1.5 text-2xs leading-relaxed text-muted">{t(`individualsPage.${key}.body`)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-t border-line bg-soft px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-content">
          <SectionTitle as="h2" variant={3} title={t('individualsPage.recommendedTitle')} className="max-w-xl" />
          {loading ? (
            <CenteredLoading className="mt-10 min-h-[18rem]" />
          ) : errorBody ? (
            <EmptyState
              className="mt-10"
              compact
              icon={<CarFrontIcon className="h-5 w-5" />}
              title={errorTitle ?? t('auth.networkErrorTitle')}
              body={errorBody}
            />
          ) : (
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
              {recommended.map((vehicle, index) => (
                <Reveal as="li" key={vehicle.id} index={index} className="h-full">
                  <VehicleCard vehicle={vehicle} />
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-content">
          <SectionTitle as="h2" variant={0} title={t('individualsPage.bookingTitle')} className="max-w-xl" />
          <StepsTimeline steps={steps} className="mt-10 lg:mt-16 lg:grid-cols-3" />
        </div>
      </section>

      <FaqSection
        tone="soft"
        title={t('individualsPage.faqTitle')}
        items={mockFaq.filter((item) => ['individuals', 'charging', 'cancellation'].includes(item.category))}
        variant={1}
      />

      <CtaBanner
        title={t('individualsPage.ctaTitle')}
        primary={{ label: t('individualsPage.heroCta'), to: '/vehicules' }}
        secondary={{ label: t('nav.pricing'), to: '/tarifs' }}
      />
    </>
  );
}
