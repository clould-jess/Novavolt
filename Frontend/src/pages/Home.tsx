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
import { CtaBanner } from '../components/marketing/CtaBanner';
import { FaqSection } from '../components/marketing/FaqSection';
import { RentalRequestPage } from './RentalRequest';



export function Home() {
  const { t } = useI18n();

  return (
    <>
      <Hero />

      <AudienceSection />
      <HowItWorksSection />
      <FeaturedVehicles />
      <BenefitsSection />

      <StatsSection />
      <RentalRequestPage />
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
