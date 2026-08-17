import React, { useMemo, useState } from 'react';
import { CheckIcon, CircleDashedIcon, InfoIcon } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { driverComparison, individualComparison, plansFor } from '../data/plans';
import { mockVehicles } from '../data/vehicles';
import type { City, UseCase } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PricingCard } from '../components/ui/PricingCard';
import { Reveal } from '../components/ui/Reveal';
import { SectionTitle } from '../components/ui/SectionTitle';
import { Select } from '../components/ui/Select';
import { Tabs } from '../components/ui/Tabs';
import { CtaBanner } from '../components/marketing/CtaBanner';
import { PageHero } from '../components/marketing/PageHero';

const inclusionIcon = {
  included: <CheckIcon className="h-4 w-4 text-action" aria-hidden="true" />,
  optional: <CircleDashedIcon className="h-4 w-4 text-warn" aria-hidden="true" />,
  vehicle: <InfoIcon className="h-4 w-4 text-muted" aria-hidden="true" />
};

export function Pricing() {
  const { t, money } = useI18n();
  const [audience, setAudience] = useState<UseCase>('driver');
  const [duration, setDuration] = useState('7');
  const [vehicleId, setVehicleId] = useState(mockVehicles[0].id);
  const [city, setCity] = useState<City>('montreal');

  const plans = plansFor(audience);
  const rows = audience === 'driver' ? driverComparison : individualComparison;
  const inclusionLabel = {
    included: t('pricingPage.tableIncluded'),
    optional: t('pricingPage.tableOptional'),
    vehicle: t('pricingPage.tableVehicle')
  };

  const estimate = useMemo(() => {
    const vehicle = mockVehicles.find((item) => item.id === vehicleId) ?? mockVehicles[0];
    const days = Number(duration);
    const cityFactor = city === 'toronto' || city === 'vancouver' ? 1.06 : 1;
    if (days >= 28) return Math.round(vehicle.pricing.monthly * cityFactor);
    if (days >= 7) return Math.round(vehicle.pricing.weekly * (days / 7) * cityFactor);
    return Math.round(vehicle.pricing.daily * days * cityFactor);
  }, [vehicleId, duration, city]);

  return (
    <>
      <PageHero
        eyebrow={t('nav.pricing')}
        title={t('pricingPage.title')}
        subtitle={t('pricingPage.subtitle')}
        variant={3}
        actions={
        <Tabs
          label={t('pricingPage.title')}
          value={audience}
          onChange={(id) => setAudience(id as UseCase)}
          items={[
          { id: 'driver', label: t('pricingPage.toggleDriver') },
          { id: 'individual', label: t('pricingPage.toggleIndividual') }]
          } />

        } />
      

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-content">
          <ul className="grid gap-5 lg:grid-cols-3">
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
          <SectionTitle as="h2" variant={0} title={t('pricingPage.tableTitle')} className="max-w-xl" />

          <div className="mt-10 overflow-x-auto nv-scroll-thin">
            <table className="w-full min-w-[40rem] border-collapse overflow-hidden rounded-card border border-line bg-white text-left">
              <caption className="sr-only">{t('pricingPage.tableTitle')}</caption>
              <thead>
                <tr className="border-b border-line bg-white">
                  <th scope="col" className="px-5 py-4 text-2xs font-semibold text-muted">
                    {t('driversPage.compareCol1')}
                  </th>
                  {plans.map((plan) =>
                  <th key={plan.id} scope="col" className="px-5 py-4">
                      <span className="block text-2xs font-semibold text-ink">{t(`${plan.key}.name`)}</span>
                      <span className="mt-0.5 block text-[0.75rem] font-medium text-muted">
                        {money(plan.price)} {t(plan.unitKey)}
                      </span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((row) =>
                <tr key={row.labelKey}>
                    <th scope="row" className="px-5 py-4 text-2xs font-medium text-body">
                      {t(row.labelKey)}
                    </th>
                    {plans.map((plan) => {
                    const value = row.values[plan.id];
                    return (
                      <td key={plan.id} className="px-5 py-4">
                          <span className="flex items-center gap-2 text-2xs text-muted">
                            {inclusionIcon[value]}
                            {inclusionLabel[value]}
                          </span>
                        </td>);

                  })}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-content gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16">
          <div>
            <SectionTitle
              as="h2"
              variant={2}
              title={t('pricingPage.simulatorTitle')}
              subtitle={t('pricingPage.simulatorSubtitle')} />
            
            <p className="mt-6 text-[0.75rem] leading-relaxed text-muted">{t('pricingPage.simDetail')}</p>
          </div>

          <Card padding="lg">
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                id="sim-type"
                label={t('pricingPage.simType')}
                value={audience}
                onChange={(event) => setAudience(event.target.value as UseCase)}
                options={[
                { value: 'driver', label: t('useCase.driver') },
                { value: 'individual', label: t('useCase.individual') }]
                } />
              
              <Select
                id="sim-duration"
                label={t('pricingPage.simDuration')}
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                options={[
                { value: '1', label: '1 j' },
                { value: '3', label: '3 j' },
                { value: '7', label: '7 j' },
                { value: '14', label: '14 j' },
                { value: '28', label: '28 j' }]
                } />
              
              <Select
                id="sim-vehicle"
                label={t('pricingPage.simVehicle')}
                value={vehicleId}
                onChange={(event) => setVehicleId(event.target.value)}
                options={mockVehicles.map((vehicle) => ({
                  value: vehicle.id,
                  label: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`
                }))} />
              
              <Select
                id="sim-city"
                label={t('pricingPage.simCity')}
                value={city}
                onChange={(event) => setCity(event.target.value as City)}
                options={[
                { value: 'montreal', label: t('cities.montreal') },
                { value: 'toronto', label: t('cities.toronto') },
                { value: 'ottawa', label: t('cities.ottawa') },
                { value: 'vancouver', label: t('cities.vancouver') }]
                } />
              
            </div>

            <div className="mt-6 flex items-end justify-between gap-4 rounded-card bg-soft p-5">
              <div>
                <p className="text-2xs font-semibold text-muted">{t('pricingPage.simEstimate')}</p>
                <p className="mt-1 font-display text-4xl font-bold tracking-[-0.03em] text-ink">{money(estimate)}</p>
              </div>
              <Button to="/vehicules" variant="secondary">
                {t('common.viewVehicles')}
              </Button>
            </div>
            <p className="mt-4 text-[0.75rem] leading-relaxed text-muted">{t('common.indicative')}</p>
          </Card>
        </div>
      </section>

      <CtaBanner
        title={t('pricingPage.ctaTitle')}
        primary={{ label: t('common.viewVehicles'), to: '/vehicules' }}
        secondary={{ label: t('nav.faq'), to: '/faq' }} />
      
    </>);

}