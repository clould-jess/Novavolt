import React from 'react';
import { useI18n } from '../../contexts/I18nContext';
import type { FaqItem } from '../../data/faq';
import { cn } from '../../utils/cn';
import { Accordion } from '../ui/Accordion';
import { SectionTitle } from '../ui/SectionTitle';

interface FaqSectionProps {
  title: string;
  subtitle?: string;
  items: FaqItem[];
  variant?: 0 | 1 | 2 | 3;
  tone?: 'white' | 'soft';
  className?: string;
  aside?: React.ReactNode;
}

export function FaqSection({ title, subtitle, items, variant = 0, tone = 'white', className, aside }: FaqSectionProps) {
  const { locale } = useI18n();

  return (
    <section
      className={cn('px-4 py-16 sm:px-6 lg:px-8 lg:py-24', tone === 'white' ? 'bg-white' : 'bg-soft', className)}>
      
      <div className="mx-auto grid max-w-content gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <SectionTitle as="h2" variant={variant} title={title} subtitle={subtitle} />
          {aside && <div className="mt-8">{aside}</div>}
        </div>
        <Accordion
          defaultOpenId={items[0]?.id}
          items={items.map((item) => ({
            id: item.id,
            question: item.question[locale],
            answer: item.answer[locale]
          }))} />
        
      </div>
    </section>);

}