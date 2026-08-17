import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../contexts/I18nContext';
import { cn } from '../../utils/cn';

interface LogoProps {
  tone?: 'dark' | 'light';
  className?: string;
  to?: string;
  compact?: boolean;
}

/**
 * Novavolt wordmark: an abstract energy arc + bolt notch, original mark.
 * Works on light and dark surfaces via the `tone` prop.
 */
export function Logo({ tone = 'dark', className, to = '/', compact = false }: LogoProps) {
  const { t } = useI18n();
  const text = tone === 'dark' ? 'text-ink' : 'text-white';

  return (
    <Link to={to} className={cn('group inline-flex items-center gap-2.5', className)} aria-label={t('common.brand')}>
      <span
        className={cn(
          'relative grid h-9 w-9 shrink-0 place-items-center rounded-xl',
          tone === 'dark' ? 'bg-ink' : 'bg-white/10 ring-1 ring-inset ring-white/25'
        )}>
        
        <svg viewBox="0 0 24 24" className="h-5 w-5" role="img" aria-label={t('common.logoAlt')}>
          <path
            d="M4 17.5C4 10.6 8.6 6 15.5 6"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2"
            strokeLinecap="round" />
          
          <path d="M13.6 9.6h5.2l-3.1 4h3.4l-6.2 6.4 1.6-4.6h-3z" fill="#FFFFFF" />
        </svg>
      </span>
      <span className={cn('font-display text-[1.0625rem] font-extrabold tracking-[-0.02em]', text)}>
        NOVA<span className="text-action">VOLT</span>
        {!compact && <span className="sr-only"> — {t('common.tagline')}</span>}
      </span>
    </Link>);

}