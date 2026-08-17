import React from 'react';
import { CalendarRangeIcon, FuelIcon, HeadphonesIcon, ShieldCheckIcon, WrenchIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { Reveal } from '../ui/Reveal';
import { SectionTitle } from '../ui/SectionTitle';

const benefits = [
{ key: 'b1', icon: FuelIcon, span: 'lg:col-span-3' },
{ key: 'b2', icon: WrenchIcon, span: 'lg:col-span-3' },
{ key: 'b3', icon: ShieldCheckIcon, span: 'lg:col-span-2' },
{ key: 'b4', icon: CalendarRangeIcon, span: 'lg:col-span-2' },
{ key: 'b5', icon: HeadphonesIcon, span: 'lg:col-span-2' }];


export function BenefitsSection() {
  const { t } = useI18n();

  return (
    <section className="bg-soft px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-content">
        <SectionTitle
          as="h2"
          variant={0}
          title={t('benefits.title')}
          subtitle={t('benefits.subtitle')}
          className="max-w-2xl" />
        
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-6">
          {benefits.map(({ key, icon: Icon, span }, index) =>
          <Reveal as="li" key={key} index={index} className={span}>
              <div className="flex h-full flex-col rounded-card border border-line bg-white p-6">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-action" aria-hidden="true">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-base font-semibold tracking-[-0.02em] text-ink">
                  {t(`benefits.${key}.title`)}
                </h3>
                <p className="mt-2 text-2xs leading-relaxed text-muted">{t(`benefits.${key}.body`)}</p>
              </div>
            </Reveal>
          )}
        </ul>
      </div>
    </section>);

}