import React, { useState } from 'react';
import { CreditCardIcon, FileTextIcon, PhoneIcon, UserCheckIcon } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import type { UseCase } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Reveal } from '../components/ui/Reveal';
import { SectionTitle } from '../components/ui/SectionTitle';
import { Tabs } from '../components/ui/Tabs';
import { CtaBanner } from '../components/marketing/CtaBanner';
import { PageHero } from '../components/marketing/PageHero';

const needs = [
{ key: 'how.need1', icon: UserCheckIcon },
{ key: 'how.need2', icon: PhoneIcon },
{ key: 'how.need3', icon: CreditCardIcon },
{ key: 'how.need4', icon: FileTextIcon }];


const driverOrder = ['s1', 's5', 's3', 's2', 's4'];
const individualOrder = ['s1', 's5', 's2', 's3', 's4'];

export function HowItWorks() {
  const { t } = useI18n();
  const [audience, setAudience] = useState<UseCase>('driver');
  const order = audience === 'driver' ? driverOrder : individualOrder;

  return (
    <>
      <PageHero
        eyebrow={t('nav.howItWorks')}
        title={t('how.title')}
        subtitle={t('how.subtitle')}
        variant={1}
        actions={
        <Button to="/vehicules" size="lg">
            {t('common.viewVehicles')}
          </Button>
        } />
      

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-content">
          <Tabs
            label={t('how.title')}
            value={audience}
            onChange={(id) => setAudience(id as UseCase)}
            items={[
            { id: 'driver', label: t('how.tabsDriver') },
            { id: 'individual', label: t('how.tabsIndividual') }]
            }
            className="w-fit" />
          

          {/* Vertical rail: the sequence is the content here, so it reads as one continuous path. */}
          <ol className="mt-10 lg:mt-14">
            {order.map((id, index) =>
            <Reveal as="li" key={`${audience}-${id}`} index={index} className="relative flex gap-5 pb-8 last:pb-0">
                <div className="flex flex-col items-center">
                  <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-action bg-white font-display text-sm font-bold text-action"
                  aria-hidden="true">
                  
                    {index + 1}
                  </span>
                  {index < order.length - 1 && <span className="mt-1 w-px flex-1 bg-line" aria-hidden="true" />}
                </div>
                <div className="max-w-2xl pt-1.5">
                  <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-ink">
                    {t(`how.${id}.title`)}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{t(`how.${id}.body`)}</p>
                </div>
              </Reveal>
            )}
          </ol>
        </div>
      </section>

      <section className="border-y border-line bg-soft px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-content">
          <SectionTitle
            as="h2"
            variant={3}
            title={t('how.needTitle')}
            subtitle={t('how.needSubtitle')}
            className="max-w-2xl" />
          
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-14">
            {needs.map(({ key, icon: Icon }, index) =>
            <Reveal as="li" key={key} index={index}>
                <Card className="flex h-full items-start gap-3.5" padding="md">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-50 text-action" aria-hidden="true">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-2xs leading-relaxed text-body">{t(key)}</p>
                </Card>
              </Reveal>
            )}
          </ul>
          <p className="mt-6 text-[0.75rem] text-muted">{t('common.notice')}</p>
        </div>
      </section>

      <CtaBanner
        title={t('finalCta.title')}
        subtitle={t('finalCta.subtitle')}
        primary={{ label: t('finalCta.cta'), to: '/vehicules' }}
        secondary={{ label: t('nav.faq'), to: '/faq' }} />
      
    </>);

}