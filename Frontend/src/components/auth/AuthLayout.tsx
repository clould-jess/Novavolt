import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ShieldCheckIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { images } from '../../data/images';
import { Logo } from '../ui/Logo';
import { VehicleImage } from '../ui/VehicleImage';
import { LanguageSwitcher } from '../marketing/LanguageSwitcher';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Premium EV visual — desktop only */}
      <aside className="relative hidden w-[42%] shrink-0 overflow-hidden bg-ink lg:block">
        <VehicleImage src={images.authVisual} alt={t('auth.visualAlt')} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-ink/70" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-sky-400/25 blur-[100px] animate-halo"
          aria-hidden="true" />
        
        <div className="relative flex h-full flex-col justify-between p-10">
          <Logo transparent />
          <div>
            <h2 className="max-w-sm font-display text-3xl font-bold leading-tight tracking-[-0.03em] text-white">
              {t('auth.visualTitle')}
            </h2>
            <span className="mt-5 block h-px w-40 nv-hairline" aria-hidden="true" />
            <p className="mt-5 max-w-sm text-2xs leading-relaxed text-sky-100/75">{t('auth.visualBody')}</p>
          </div>
          <p className="flex items-center gap-2 text-[0.75rem] text-sky-100/60">
            <ShieldCheckIcon className="h-4 w-4 text-sky-400" aria-hidden="true" />
            {t('auth.secureNote')}
          </p>
        </div>
      </aside>

      <main className="flex flex-1 flex-col px-4 py-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between gap-4">
          <div className="lg:hidden">
            <Logo transparent />
          </div>
          <Link
            to="/"
            className="nv-link-slide hidden items-center gap-1.5 text-2xs font-semibold text-muted hover:text-ink lg:inline-flex">
            
            <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {t('nav.home')}
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="font-display text-3xl font-bold tracking-[-0.03em] text-ink">{title}</h1>
          {subtitle && <p className="mt-2.5 text-sm leading-relaxed text-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-2xs text-muted">{footer}</div>}
        </div>
      </main>
    </div>);

}
