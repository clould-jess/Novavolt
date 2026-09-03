import React from 'react';
import { CalendarRangeIcon, FuelIcon, HeadphonesIcon, ShieldCheckIcon, WrenchIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { Reveal } from '../ui/Reveal';
import { SectionTitle } from '../ui/SectionTitle';

const CAR_IMAGE = 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=900&q=80';

const benefits = [
  { key: 'b1', icon: FuelIcon },
  { key: 'b2', icon: WrenchIcon },
  { key: 'b3', icon: ShieldCheckIcon },
  { key: 'b4', icon: CalendarRangeIcon },
  { key: 'b5', icon: HeadphonesIcon },
];

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
          className="max-w-2xl"
        />

        <div className="mt-10 lg:mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2 items-stretch">

          {/* LEFT — une seule grande image */}
          <Reveal index={0}>
            <div className="h-full min-h-[380px] lg:min-h-[520px] overflow-hidden rounded-2xl shadow-card">
              <img
                src={CAR_IMAGE}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover object-center"
              />
            </div>
          </Reveal>

          {/* RIGHT — liste des points */}
          <div className="flex flex-col justify-center gap-0 divide-y divide-line">
            {benefits.map(({ key, icon: Icon }, index) => (
              <Reveal key={key} index={index + 1}>
                <div className="flex items-start gap-4 py-5">
                  <span
                    className="mt-0.5 shrink-0 grid h-9 w-9 place-items-center rounded-lg bg-sky-50 text-action"
                    aria-hidden="true"
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-display text-sm font-bold tracking-[-0.02em] text-ink underline underline-offset-4 decoration-sky-400 decoration-2">
                      {t(`benefits.${key}.title`)}
                    </h3>
                    <p className="mt-1.5 text-2xs leading-relaxed text-muted">
                      {t(`benefits.${key}.body`)}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}