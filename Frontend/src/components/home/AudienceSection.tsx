import React from 'react';
import { ArrowRightIcon, CheckIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { images } from '../../data/images';
import { Button } from '../ui/Button';
import { Reveal } from '../ui/Reveal';
import { SectionTitle } from '../ui/SectionTitle';
import { VehicleImage } from '../ui/VehicleImage';

const cards = [
{ id: 'driver', to: '/chauffeurs', image: images.driverHero },
{ id: 'individual', to: '/particuliers', image: images.individualHero }];


export function AudienceSection() {
  const { t } = useI18n();

  return (
    <section className="bg-soft px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-content">
        <SectionTitle
          as="h2"
          variant={1}
          title={t('audiences.title')}
          subtitle={t('audiences.subtitle')}
          className="max-w-2xl" />
        

        <div className="mt-10 grid gap-6 lg:mt-14 lg:grid-cols-2">
          {cards.map((card, index) =>
          <Reveal key={card.id} index={index} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white transition-[border-color,box-shadow,transform] duration-200 ease-signature hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-card">
                <VehicleImage
                src={card.image}
                alt={t(`audiences.${card.id}.imageAlt`)}
                className="aspect-[16/9]"
                imgClassName="transition-transform duration-300 ease-signature group-hover:scale-[1.02]" />
              
                <div className="flex flex-1 flex-col p-6 lg:p-8">
                  <h3 className="font-display text-xl font-semibold tracking-[-0.02em] text-ink">
                    {t(`audiences.${card.id}.title`)}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted">{t(`audiences.${card.id}.body`)}</p>
                  <ul className="mt-5 flex flex-col gap-2.5">
                    {['b1', 'b2', 'b3'].map((key) =>
                  <li key={key} className="flex items-start gap-2.5 text-2xs leading-relaxed text-body">
                        <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-action" aria-hidden="true" />
                        {t(`audiences.${card.id}.${key}`)}
                      </li>
                  )}
                  </ul>
                  <div className="mt-auto pt-7">
                    <Button to={card.to} variant="secondary" iconRight={<ArrowRightIcon className="h-4 w-4" />}>
                      {t(`audiences.${card.id}.cta`)}
                    </Button>
                  </div>
                </div>
              </article>
            </Reveal>
          )}
        </div>
      </div>
    </section>);

}