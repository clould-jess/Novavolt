import { format, parseISO } from 'date-fns';
import { enCA, frCA } from 'date-fns/locale';
import type { Locale } from '../types';

const dateLocales = { fr: frCA, en: enCA };

/** CAD currency, Canadian conventions (1 250 $ in FR, $1,250 in EN). */
export function formatCurrency(amount: number, locale: Locale, options?: {decimals?: boolean;}): string {
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
    style: 'currency',
    currency: 'CAD',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: options?.decimals ? 2 : 0,
    maximumFractionDigits: options?.decimals ? 2 : 0
  }).format(amount);
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-CA' : 'en-CA').format(value);
}

export function formatDate(iso: string, locale: Locale, pattern?: string): string {
  const date = typeof iso === 'string' ? parseISO(iso) : iso;
  const fallback = locale === 'fr' ? 'd MMM yyyy' : 'MMM d, yyyy';
  return format(date, pattern ?? fallback, { locale: dateLocales[locale] });
}

export function formatDateLong(iso: string, locale: Locale): string {
  return formatDate(iso, locale, locale === 'fr' ? 'd MMMM yyyy' : 'MMMM d, yyyy');
}

export function formatDateRange(startIso: string, endIso: string, locale: Locale): string {
  return `${formatDate(startIso, locale, 'd MMM')} – ${formatDate(endIso, locale)}`;
}

/** Simple FR/EN pluraliser for demo copy. */
export function plural(count: number, singular: string, pluralForm: string): string {
  return count <= 1 ? singular : pluralForm;
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}