import React from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { SectionTitle } from '../ui/SectionTitle';
import { StepsTimeline } from '../marketing/StepsTimeline';

export function HowItWorksSection() {
  const { t } = useI18n();

  const steps = ['s1', 's2', 's3', 's4'].map((id) => ({
    id,
    title: t(`how.${id}.title`),
    body: t(`how.${id}.body`)
  }));

  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-content">
        <SectionTitle as="h2" variant={2} title={t('how.title')} subtitle={t('how.subtitle')} className="max-w-xl" />
        <StepsTimeline steps={steps} className="mt-10 lg:mt-16" />
      </div>
    </section>);

}