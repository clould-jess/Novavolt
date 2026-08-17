import React from 'react';
import { CheckIcon, InfoIcon, MinusIcon } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { images } from '../data/images';
import { mockFaq } from '../data/faq';
import { plansFor } from '../data/plans';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PricingCard } from '../components/ui/PricingCard';
import { Reveal } from '../components/ui/Reveal';
import { SectionTitle } from '../components/ui/SectionTitle';
import { CtaBanner } from '../components/marketing/CtaBanner';
import { FaqSection } from '../components/marketing/FaqSection';
import { PageHero } from '../components/marketing/PageHero';
import { StepsTimeline } from '../components/marketing/StepsTimeline';
import { RequiredDocumentsCard } from '../components/marketing/RequiredDocumentsCard';
import { SavingsCalculator } from '../components/marketing/SavingsCalculator';

const advantages = ['a1', 'a2', 'a3', 'a4'];
const comparisonRows = ['c1', 'c2', 'c3', 'c4', 'c5'];

export function Drivers() {
  const { t } = useI18n();
  const plans = plansFor('driver');

  const steps = ['s2', 's3', 's5', 's1', 's4'].map((id, index) => ({
    id: `${id}-${index}`,
    title: t(`how.${id}.title`),
    body: t(`how.${id}.body`)
  }));

  return (
    <>
      <PageHero
        eyebrow={t('nav.drivers')}
        title={t('driversPage.heroTitle')}
        subtitle={t('driversPage.heroSubtitle')}
        image={{ src: images.driverHero, alt: t('driversPage.heroImageAlt') }}
        variant={0}
        actions={
        <>
            <Button to="/vehicules" size="lg">
              {t('driversPage.heroCta')}
            </Button>
            <Button to="/tarifs" size="lg" variant="secondary">
              {t('nav.pricing')}
            </Button>
          </>
        } />
      

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-content">
          <SectionTitle as="h2" variant={1} title={t('driversPage.advantagesTitle')} className="max-w-xl" />
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
            {advantages.map((key, index) =>
            <Reveal as="li" key={key} index={index}>
                <div className="flex h-full flex-col rounded-card border border-line bg-white p-5">
                  <span className="font-display text-2xs font-bold text-action">0{index + 1}</span>
                  <h3 className="mt-4 font-display text-base font-semibold tracking-[-0.02em] text-ink">
                    {t(`driversPage.${key}.title`)}
                  </h3>
                  <p className="mt-2 text-2xs leading-relaxed text-muted">{t(`driversPage.${key}.body`)}</p>
                </div>
              </Reveal>
            )}
          </ul>

          <Card tone="soft" className="mt-10 flex gap-4" padding="lg">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-action" aria-hidden="true">
              <InfoIcon className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-display text-base font-semibold tracking-[-0.02em] text-ink">
                {t('driversPage.eligibilityTitle')}
              </h3>
              <p className="mt-2 max-w-3xl text-2xs leading-relaxed text-muted">{t('driversPage.eligibilityBody')}</p>
            </div>
          </Card>

          <div className="mt-12">
            <RequiredDocumentsCard />
          </div>

          <div className="mt-12">
            <SavingsCalculator defaultWeeklyKm={1200} />
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-soft px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-content">
          <SectionTitle
            as="h2"
            variant={2}
            title={t('driversPage.plansTitle')}
            subtitle={t('driversPage.plansSubtitle')}
            className="max-w-xl" />
          
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

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-content">
          <SectionTitle
            as="h2"
            variant={3}
            title={t('driversPage.compareTitle')}
            subtitle={t('driversPage.compareSubtitle')}
            className="max-w-xl" />
          
          <div className="mt-10 overflow-hidden rounded-card border border-line">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">{t('driversPage.compareTitle')}</caption>
              <thead>
                <tr className="border-b border-line bg-soft">
                  <th scope="col" className="px-4 py-3 text-2xs font-semibold text-muted sm:px-6">
                    {t('driversPage.compareCol1')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-2xs font-semibold text-action sm:px-6">
                    {t('driversPage.compareCol2')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-2xs font-semibold text-muted sm:px-6">
                    {t('driversPage.compareCol3')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-white">
                {comparisonRows.map((row) =>
                <tr key={row}>
                    <th scope="row" className="px-4 py-4 text-2xs font-semibold text-ink sm:px-6">
                      {t(`driversPage.${row}`)}
                    </th>
                    <td className="px-4 py-4 text-2xs text-body sm:px-6">
                      <span className="flex items-start gap-2">
                        <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-action" aria-hidden="true" />
                        {t(`driversPage.${row}a`)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-2xs text-muted sm:px-6">
                      <span className="flex items-start gap-2">
                        <MinusIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                        {t(`driversPage.${row}b`)}
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-soft px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-content">
          <SectionTitle as="h2" variant={0} title={t('driversPage.stepsTitle')} className="max-w-xl" />
          <StepsTimeline steps={steps.slice(0, 4)} className="mt-10 lg:mt-16" />
        </div>
      </section>

      <FaqSection
        title={t('driversPage.faqTitle')}
        items={mockFaq.filter((item) => item.category === 'drivers' || item.category === 'documents')}
        variant={1} />
      

      <CtaBanner
        title={t('driversPage.ctaTitle')}
        primary={{ label: t('driversPage.heroCta'), to: '/vehicules' }}
        secondary={{ label: t('common.contactUs'), to: '/contact' }} />
      
    </>);

}