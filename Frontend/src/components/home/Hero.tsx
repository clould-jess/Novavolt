import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRightIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { images } from '../../data/images';

export function Hero() {
  const { t, locale } = useI18n();
  const reduced = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden bg-white pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8 xl:gap-12">
          
          {/* Main Left Content */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start text-left">
            <motion.h1
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[3.85rem] xl:text-[4.25rem] font-black leading-[1.08] tracking-[-0.03em] text-slate-900"
            >
              {locale === 'fr' ? (
                <>
                  Voitures de<br />
                  location<br />
                  flexibles, Prêt<br />
                  pour Uber et{' '}
                  <span className="text-sky-500 inline-block font-black tracking-normal">
                    Lyft
                  </span>
                  <span className="text-sky-500 font-bold ml-0.5">*</span>
                </>
              ) : (
                <>
                  Flexible<br />
                  rental cars,<br />
                  Ready for<br />
                  Uber and{' '}
                  <span className="text-sky-500 inline-block font-black tracking-normal">
                    Lyft
                  </span>
                  <span className="text-sky-500 font-bold ml-0.5">*</span>
                </>
              )}
            </motion.h1>

            <motion.p
              initial={reduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.12, ease: [0.23, 1, 0.32, 1] }}
              className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-slate-600 font-normal"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Link
                to="/#demande-location"
                className="inline-flex items-center justify-center rounded-xl bg-action px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white shadow-sm transition-all duration-200 hover:bg-action-dark hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0"
              >
                {t('hero.ctaRent')}
              </Link>

              <Link
                to="/vehicules"
                className="group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>{t('hero.ctaCars')}</span>
                <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </motion.div>

            <motion.p
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.28 }}
              className="mt-4 text-xs text-slate-400 font-medium"
            >
              {t('hero.disclaimer')}
            </motion.p>
          </div>

          {/* Right Image Container */}
          <motion.div
            initial={reduced ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
            className="lg:col-span-6 xl:col-span-6 w-full flex items-center justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl shadow-2xl ring-1 ring-slate-900/10 bg-slate-100 group">
              <img
                src={images.heroCar}
                alt={t('hero.imageAlt')}
                className="h-[320px] sm:h-[420px] lg:h-[480px] xl:h-[530px] w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                loading="eager"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent" />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}