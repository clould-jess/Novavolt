import React from 'react';
import { useI18n } from '../../contexts/I18nContext';
import type { Locale } from '../../types';
import { cn } from '../../utils/cn';

interface LanguageSwitcherProps {
  tone?: 'dark' | 'light';
  className?: string;
}

const locales: Locale[] = ['fr', 'en'];

export function LanguageSwitcher({ tone = 'dark', className }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t('common.language')}
      className={cn(
        'inline-flex items-center rounded-pill border p-0.5',
        tone === 'dark' ? 'border-line bg-white' : 'border-white/20 bg-white/10',
        className
      )}>
      
      {locales.map((item) => {
        const active = item === locale;
        return (
          <button
            key={item}
            type="button"
            onClick={() => setLocale(item)}
            aria-pressed={active}
            className={cn(
              'rounded-pill px-2.5 py-1 text-[0.75rem] font-bold uppercase transition-colors duration-200 ease-signature',
              active ?
              'bg-action text-white' :
              tone === 'dark' ?
              'text-muted hover:text-ink' :
              'text-sky-100/80 hover:text-white'
            )}>
            
            {item}
          </button>);

      })}
    </div>);

}