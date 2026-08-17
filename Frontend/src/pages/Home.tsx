import React from 'react';
import { useI18n } from '../contexts/I18nContext';
import { mockFaq } from '../data/faq';
import { AudienceSection } from '../components/home/AudienceSection';
import { BenefitsSection } from '../components/home/BenefitsSection';
import { FeaturedVehicles } from '../components/home/FeaturedVehicles';
import { Hero } from '../components/home/Hero';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { StatsSection } from '../components/home/StatsSection';
import { TestimonialsSection } from '../components/home/TestimonialsSection';
import { TrustBar } from '../components/home/TrustBar';
import { CtaBanner } from '../components/marketing/CtaBanner';
import { FaqSection } from '../components/marketing/FaqSection';

import { SavingsCalculator } from '../components/marketing/SavingsCalculator';

export function Home() {
  const { t } = useI18n();

  return (
    <>
      <Hero />
      <TrustBar />
      <AudienceSection />
      <HowItWorksSection />
      <FeaturedVehicles />
      <BenefitsSection />
      <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-content">
          <SavingsCalculator />
        </div>
      </section>
      <StatsSection />
      <TestimonialsSection />
      <FaqSection
        title={t('faqPage.title')}
        subtitle={t('faqPage.subtitle')}
        items={mockFaq.filter((item) => ['faq-1', 'faq-4', 'faq-9', 'faq-12', 'faq-14', 'faq-17'].includes(item.id))}
        variant={2} />
      
      <CtaBanner
        title={t('finalCta.title')}
        subtitle={t('finalCta.subtitle')}
        primary={{ label: t('finalCta.cta'), to: '/vehicules' }}
        secondary={{ label: t('finalCta.secondary'), to: '/contact' }} />
      
    </>);

}