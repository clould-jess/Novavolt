import React from 'react';
import { BriefcaseIcon, CalendarHeartIcon, ClockIcon, SparklesIcon } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { mockFaq } from '../data/faq';
import { images } from '../data/images';
import { plansFor } from '../data/plans';
import { mockVehicles } from '../data/vehicles';
import { Button } from '../components/ui/Button';
import { PricingCard } from '../components/ui/PricingCard';
import { Reveal } from '../components/ui/Reveal';
import { SectionTitle } from '../components/ui/SectionTitle';
import { CtaBanner } from '../components/marketing/CtaBanner';
import { FaqSection } from '../components/marketing/FaqSection';
import { PageHero } from '../components/marketing/PageHero';
import { StepsTimeline } from '../components/marketing/StepsTimeline';
import { VehicleCard } from '../components/marketing/VehicleCard';

const useCases = [
{ key: 'u1', icon: CalendarHeartIcon },
{ key: 'u2', icon: BriefcaseIcon },
{ key: 'u3', icon: SparklesIcon },
{ key: 'u4', icon: ClockIcon }];


export function Individuals() {
  const { t } = useI18n();
  const plans = plansFor('individual');
  const recommended = mockVehicles.filter((vehicle) => vehicle.useCases.includes('individual')).slice(0, 3);

  const steps = ['s1', 's2', 's4'].map((id) => ({
    id,
    title: t(`how.${id}.title`),
    body: t(`how.${id}.body`)
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
        } />
      

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-content">
          <SectionTitle as="h2" variant={0} title={t('individualsPage.durationsTitle')} className="max-w-xl" />
          <ul className="mt-10 grid gap-5 lg:mt-14 lg:grid-cols-3">
            {plans.map((plan, index) =>
            <Reveal as="li" key={plan.id} index={index} className="h-full">
                <PricingCard plan={plan} ctaTo="/portail/reservation" />
              </Reveal>
            )}
          </ul>
          <p className="mt-6 text-[0.75rem] text-muted">{t('common.indicative')}</p>
        </div>
      </section>

      <section className="border-y border-line bg-soft px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-content">
          <SectionTitle as="h2" variant={1} title={t('individualsPage.casesTitle')} className="max-w-xl" />
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
            {useCases.map(({ key, icon: Icon }, index) =>
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
            )}
          </ul>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-content gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <SectionTitle as="h2" variant={2} title={t('individualsPage.benefitsTitle')} />
          <dl className="divide-y divide-line border-y border-line">
            {['b1', 'b2', 'b3'].map((key) =>
            <div key={key} className="py-5">
                <dt className="font-display text-base font-semibold tracking-[-0.02em] text-ink">
                  {t(`individualsPage.${key}.title`)}
                </dt>
                <dd className="mt-1.5 text-2xs leading-relaxed text-muted">{t(`individualsPage.${key}.body`)}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>

      <section className="border-t border-line bg-soft px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-content">
          <SectionTitle as="h2" variant={3} title={t('individualsPage.recommendedTitle')} className="max-w-xl" />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
            {recommended.map((vehicle, index) =>
            <Reveal as="li" key={vehicle.id} index={index} className="h-full">
                <VehicleCard vehicle={vehicle} priceMode="daily" />
              </Reveal>
            )}
          </ul>
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
        variant={1} />
      

      <CtaBanner
        title={t('individualsPage.ctaTitle')}
        primary={{ label: t('individualsPage.heroCta'), to: '/vehicules' }}
        secondary={{ label: t('nav.pricing'), to: '/tarifs' }} />
      
    </>);

}