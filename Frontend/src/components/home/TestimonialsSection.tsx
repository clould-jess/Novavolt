import React from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { Reveal } from '../ui/Reveal';
import { SectionTitle } from '../ui/SectionTitle';
import { TestimonialCard } from '../ui/TestimonialCard';

const testimonials = ['t1', 't2', 't3'];

export function TestimonialsSection() {
  const { t } = useI18n();

  return (
    <section className="border-y border-line bg-soft px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-content">
        <SectionTitle
          as="h2"
          variant={1}
          title={t('testimonials.title')}
          subtitle={t('testimonials.subtitle')}
          className="max-w-xl" />
        
        {/* One featured voice carries the section; the two others support it. */}
        <div className="mt-10 grid gap-5 lg:mt-14 lg:grid-cols-[1.25fr_1fr] lg:items-stretch">
          <Reveal className="h-full">
            <TestimonialCard
              featured
              quote={t(`testimonials.${testimonials[0]}.quote`)}
              name={t(`testimonials.${testimonials[0]}.name`)}
              role={t(`testimonials.${testimonials[0]}.role`)} />
            
          </Reveal>
          <div className="grid gap-5">
            {testimonials.slice(1).map((id, index) =>
            <Reveal key={id} index={index + 1} className="h-full">
                <TestimonialCard
                quote={t(`testimonials.${id}.quote`)}
                name={t(`testimonials.${id}.name`)}
                role={t(`testimonials.${id}.role`)} />
              
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>);

}