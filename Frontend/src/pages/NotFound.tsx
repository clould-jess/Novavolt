import { CompassIcon, HomeIcon, ArrowRightIcon } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { Button } from '../components/ui/Button';

export function NotFound() {
  const { t } = useI18n();

  return (
    <div className="relative overflow-hidden bg-white px-4 pb-24 pt-32 sm:px-6 sm:pt-40 lg:px-8 lg:pb-32">
      {/* Background Subtle Radial Glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-2xl text-center">
        {/* 404 Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-2xs font-semibold text-action">
          <CompassIcon className="h-4 w-4 animate-spin-slow" />
          <span>{t('notFound.badge')}</span>
        </div>

        {/* Title */}
        <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
          {t('notFound.title')}
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
          {t('notFound.subtitle')}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button to="/" variant="primary" size="lg" className="inline-flex items-center gap-2">
            <HomeIcon className="h-4.5 w-4.5" />
            {t('notFound.homeCta')}
          </Button>

          <Button to="/vehicules" variant="secondary" size="lg" className="inline-flex items-center gap-2">
            {t('notFound.vehiclesCta')}
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}