import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CalendarCheckIcon, HeadphonesIcon, ShieldCheckIcon, WrenchIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { images } from '../../data/images';
import { Button } from '../ui/Button';
import { VehicleImage } from '../ui/VehicleImage';
import { QuickQuoteForm } from './QuickQuoteForm';

const reassurance = [
{ key: 'hero.reassurance.support', icon: HeadphonesIcon },
{ key: 'hero.reassurance.maintenance', icon: WrenchIcon },
{ key: 'hero.reassurance.insurance', icon: ShieldCheckIcon },
{ key: 'hero.reassurance.booking', icon: CalendarCheckIcon }];


export function Hero() {
  const { t } = useI18n();
  const reduced = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden bg-ink pb-14 pt-28 lg:pb-20 lg:pt-36">
      {/* Photo + readability overlay */}
      <VehicleImage
        src={images.heroCar}
        alt={t('hero.imageAlt')}
        className="absolute inset-0 -z-10 h-full w-full"
        imgClassName="object-cover" />
      
      <div className="absolute inset-0 -z-10 bg-ink/72" aria-hidden="true" />

      {/* Slow sky-blue halo behind the vehicle */}
      <div
        className="pointer-events-none absolute -z-10 left-1/2 top-1/3 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-sky-400/25 blur-[120px] animate-halo"
        aria-hidden="true" />
      

      {/* Fine luminous lines */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        {[18, 42, 66, 84].map((left, index) =>
        <motion.span
          key={left}
          className="absolute top-0 h-full w-px bg-gradient-to-b from-transparent via-sky-400/25 to-transparent"
          style={{ left: `${left}%` }}
          initial={reduced ? false : { opacity: 0.1 }}
          animate={reduced ? undefined : { opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 7 + index, repeat: Infinity, ease: 'linear' }} />

        )}
      </div>

      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="inline-flex items-center gap-2 text-2xs font-semibold text-sky-400">
            
            <span className="h-px w-8 bg-sky-400" aria-hidden="true" />
            {t('common.tagline')}
          </motion.p>

          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.23, 1, 0.32, 1] }}
            className="mt-4 font-display text-4xl font-bold leading-[1.03] tracking-[-0.035em] text-white sm:text-5xl lg:text-[4rem]">
            
            {t('hero.title')}
          </motion.h1>

          <motion.svg
            viewBox="0 0 260 12"
            width={260}
            height={12}
            className="mt-4 max-w-full"
            aria-hidden="true"
            initial={false}>
            
            <motion.path
              d="M3 8C74 2 176 4 256 7"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="3"
              strokeLinecap="round"
              initial={reduced ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.85, delay: 0.2, ease: [0.23, 1, 0.32, 1] }} />
            
          </motion.svg>

          <motion.p
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
            className="mt-5 max-w-xl text-base leading-relaxed text-sky-100/85 sm:text-lg">
            
            {t('hero.subtitle')}
          </motion.p>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="mt-8 flex flex-wrap gap-3">
            
            <Button to="/vehicules" size="lg">
              {t('hero.ctaPrimary')}
            </Button>
            <Button to="/chauffeurs" size="lg" variant="inverse">
              {t('hero.ctaSecondary')}
            </Button>
          </motion.div>

          <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            {reassurance.map(({ key, icon: Icon }) =>
            <li key={key} className="flex items-center gap-2 text-2xs font-medium text-sky-100/80">
                <Icon className="h-4 w-4 text-sky-400" aria-hidden="true" />
                {t(key)}
              </li>
            )}
          </ul>
        </div>

        <QuickQuoteForm className="mt-10 lg:mt-14" />
      </div>
    </section>);

}