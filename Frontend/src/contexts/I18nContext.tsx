import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import fr from '../messages/fr.json';
import en from '../messages/en.json';
import type { Locale } from '../types';
import { formatCurrency, formatDate, formatDateLong, formatNumber } from '../utils/format';

type Dict = Record<string, unknown>;

const dictionaries: Record<Locale, Dict> = { fr: fr as Dict, en: en as Dict };

function lookup(dict: Dict, path: string): string | undefined {
  const value = path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Dict)) return (acc as Dict)[key];
    return undefined;
  }, dict);
  return typeof value === 'string' ? value : undefined;
}

interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  money: (amount: number, decimals?: boolean) => string;
  num: (value: number) => string;
  date: (iso: string, pattern?: string) => string;
  dateLong: (iso: string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: {children: React.ReactNode;}) {
  const [locale, setLocale] = useState<Locale>('fr');

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const raw = lookup(dictionaries[locale], key) ?? lookup(dictionaries.fr, key) ?? key;
      if (!vars) return raw;
      return Object.entries(vars).reduce((acc, [name, value]) => acc.replace(`{${name}}`, String(value)), raw);
    },
    [locale]
  );

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      setLocale,
      t,
      money: (amount: number, decimals?: boolean) => formatCurrency(amount, locale, { decimals }),
      num: (n: number) => formatNumber(n, locale),
      date: (iso: string, pattern?: string) => formatDate(iso, locale, pattern),
      dateLong: (iso: string) => formatDateLong(iso, locale)
    }),
    [locale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}