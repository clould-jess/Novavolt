import React from 'react';
import { HandshakeIcon, LeafIcon, MapPinIcon, SparklesIcon } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { images } from '../data/images';
import type { City } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Reveal } from '../components/ui/Reveal';
import { SectionTitle } from '../components/ui/SectionTitle';
import { VehicleImage } from '../components/ui/VehicleImage';
import { CtaBanner } from '../components/marketing/CtaBanner';
import { PageHero } from '../components/marketing/PageHero';

const values = [
{ key: 'v1', icon: SparklesIcon },
{ key: 'v2', icon: LeafIcon },
{ key: 'v3', icon: HandshakeIcon },
{ key: 'v4', icon: MapPinIcon }];


const cities: City[] = ['montreal', 'toronto', 'ottawa', 'vancouver'];

export function About() {
  const { t } = useI18n();

  return (
    <>
      <PageHero
        eyebrow={t('nav.about')}
        title={t('aboutPage.title')}
        subtitle={t('aboutPage.subtitle')}
        image={{ src: images.fleet, alt: t('aboutPage.teamTitle') }}
        variant={0} />
      

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-content gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionTitle as="h2" variant={1} title={t('aboutPage.storyTitle')} />
            <p className="mt-6 text-sm leading-relaxed text-muted">{t('aboutPage.storyBody')}</p>
          </div>
          <Card tone="soft" padding="lg">
            <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-ink">
              {t('aboutPage.missionTitle')}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">{t('aboutPage.missionBody')}</p>
            <span className="mt-6 block h-px w-full nv-hairline" aria-hidden="true" />
            <p className="mt-6 text-2xs font-semibold text-action">{t('common.tagline')}</p>
          </Card>
        </div>
      </section>

      <section className="border-y border-line bg-soft px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-content">
          <SectionTitle as="h2" variant={2} title={t('aboutPage.valuesTitle')} className="max-w-xl" />
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
            {values.map(({ key, icon: Icon }, index) =>
            <Reveal as="li" key={key} index={index}>
                <div className="flex h-full flex-col rounded-card border border-line bg-white p-5">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-action" aria-hidden="true">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-display text-base font-semibold tracking-[-0.02em] text-ink">
                    {t(`aboutPage.${key}.title`)}
                  </h3>
                  <p className="mt-2 text-2xs leading-relaxed text-muted">{t(`aboutPage.${key}.body`)}</p>
                </div>
              </Reveal>
            )}
          </ul>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-content gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
          <div>
            <SectionTitle
              as="h2"
              variant={3}
              title={t('aboutPage.territoriesTitle')}
              subtitle={t('aboutPage.territoriesBody')} />
            
            <ul className="mt-8 grid grid-cols-2 gap-3">
              {cities.map((city) =>
              <li
                key={city}
                className="flex items-center gap-2 rounded-xl border border-line bg-soft px-4 py-3 text-2xs font-semibold text-ink">
                
                  <MapPinIcon className="h-4 w-4 text-action" aria-hidden="true" />
                  {t(`cities.${city}`)}
                </li>
              )}
            </ul>
          </div>
          <VehicleImage
            src={images.road}
            alt={t('aboutPage.territoriesTitle')}
            className="aspect-[4/3] rounded-card border border-line" />
          
        </div>
      </section>

      <section className="border-t border-line bg-soft px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-content">
          <SectionTitle
            as="h2"
            variant={0}
            title={t('aboutPage.teamTitle')}
            subtitle={t('aboutPage.teamBody')}
            className="max-w-xl" />
          
          <ul className="mt-10 grid gap-5 sm:grid-cols-3">
            {['Opérations', 'Service client', 'Entretien'].map((label, index) =>
            <Reveal as="li" key={label} index={index}>
                <div className="flex h-full flex-col items-start rounded-card border border-line bg-white p-6">
                  <span
                  className="grid h-14 w-14 place-items-center rounded-2xl bg-ink font-display text-lg font-bold text-sky-400"
                  aria-hidden="true">
                  
                    {label.charAt(0)}
                  </span>
                  <p className="mt-5 text-2xs font-semibold text-ink">{label}</p>
                  <p className="mt-1 text-[0.75rem] text-muted">Novavolt · Canada</p>
                </div>
              </Reveal>
            )}
          </ul>
          <div className="mt-10">
            <Button to="/contact" variant="secondary">
              {t('common.contactUs')}
            </Button>
          </div>
        </div>
      </section>

      <CtaBanner
        title={t('aboutPage.ctaTitle')}
        primary={{ label: t('common.contactUs'), to: '/contact' }}
        secondary={{ label: t('common.viewVehicles'), to: '/vehicules' }} />
      
    </>);

}