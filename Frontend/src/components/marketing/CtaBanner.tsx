import React from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { SectionTitle } from '../ui/SectionTitle';

interface CtaBannerProps {
  title: string;
  subtitle?: string;
  primary: {label: string;to: string;};
  secondary?: {label: string;to: string;};
  variant?: 0 | 1 | 2 | 3;
  className?: string;
}

export function CtaBanner({ title, subtitle, primary, secondary, variant = 3, className }: CtaBannerProps) {
  const { t } = useI18n();

  return (
    <section className={cn('bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-20', className)}>
      <div className="relative mx-auto max-w-content overflow-hidden rounded-[1.5rem] bg-ink px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-sky-400/25 blur-[90px] animate-halo"
          aria-hidden="true" />
        
        <div
          className="pointer-events-none absolute inset-x-10 bottom-0 h-px nv-hairline"
          aria-hidden="true" />
        
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle
            as="h2"
            tone="light"
            variant={variant}
            title={title}
            subtitle={subtitle}
            className="max-w-xl" />
          
          <div className="flex flex-wrap gap-3">
            <Button to={primary.to} size="lg" variant="inverse">
              {primary.label}
            </Button>
            {secondary &&
            <Button to={secondary.to} size="lg" variant="ghost" className="text-sky-400 hover:bg-white/10">
                {secondary.label}
              </Button>
            }
          </div>
        </div>
        <p className="relative mt-8 text-[0.8125rem] text-sky-100/50">{t('common.indicative')}</p>
      </div>
    </section>);

}