import React, { useMemo, useState } from 'react';
import { PhoneIcon, SearchXIcon } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { faqCategories, mockFaq } from '../data/faq';
import type { FaqCategory } from '../data/faq';
import { Accordion } from '../components/ui/Accordion';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { SearchBar } from '../components/ui/SearchBar';
import { SectionTitle } from '../components/ui/SectionTitle';
import { CtaBanner } from '../components/marketing/CtaBanner';
import { PageHero } from '../components/marketing/PageHero';
import { cn } from '../utils/cn';

export function Faq() {
  const { t, locale } = useI18n();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FaqCategory | 'all'>('all');

  const results = useMemo(
    () =>
    mockFaq.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (!query) return true;
      const haystack = `${item.question[locale]} ${item.answer[locale]}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    }),
    [query, category, locale]
  );

  return (
    <>
      <PageHero
        eyebrow={t('nav.faq')}
        title={t('faqPage.title')}
        subtitle={t('faqPage.subtitle')}
        variant={2}
        aside={
        <Card padding="lg" className="lg:ml-auto lg:max-w-sm">
            <p className="font-display text-base font-semibold tracking-[-0.02em] text-ink">{t('faqPage.ctaTitle')}</p>
            <p className="mt-2 text-2xs leading-relaxed text-muted">{t('faqPage.ctaBody')}</p>
            <div className="mt-5 flex flex-col gap-2.5">
              <Button to="/contact">{t('common.contactUs')}</Button>
              <a
              href={`tel:${t('common.phone').replace(/[^\d+]/g, '')}`}
              className="inline-flex items-center justify-center gap-2 text-2xs font-semibold text-action">
              
                <PhoneIcon className="h-4 w-4" aria-hidden="true" />
                {t('common.phone')}
              </a>
            </div>
          </Card>
        } />
      

      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-content">
          <SearchBar
            id="faq-search"
            size="lg"
            label={t('common.search')}
            placeholder={t('faqPage.searchPlaceholder')}
            value={query}
            onChange={setQuery}
            clearLabel={t('common.reset')}
            className="max-w-xl" />
          

          <div className="mt-10 grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-14">
            <nav aria-label={t('common.filters')} className="lg:sticky lg:top-24 lg:self-start">
              <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
                <li>
                  <button
                    type="button"
                    onClick={() => setCategory('all')}
                    aria-current={category === 'all'}
                    className={cn(
                      'rounded-pill px-3.5 py-2 text-2xs font-semibold transition-colors duration-200 ease-signature lg:w-full lg:text-left',
                      category === 'all' ? 'bg-action text-white' : 'text-muted hover:bg-surface hover:text-ink'
                    )}>
                    
                    {t('vehiclesPage.tabAll')}
                  </button>
                </li>
                {faqCategories.map((item) =>
                <li key={item}>
                    <button
                    type="button"
                    onClick={() => setCategory(item)}
                    aria-current={category === item}
                    className={cn(
                      'rounded-pill px-3.5 py-2 text-2xs font-semibold transition-colors duration-200 ease-signature lg:w-full lg:text-left',
                      category === item ? 'bg-action text-white' : 'text-muted hover:bg-surface hover:text-ink'
                    )}>
                    
                      {t(`faqPage.categories.${item}`)}
                    </button>
                  </li>
                )}
              </ul>
            </nav>

            <div>
              {results.length === 0 ?
              <EmptyState
                icon={<SearchXIcon className="h-5 w-5" />}
                title={t('faqPage.emptyTitle')}
                body={t('faqPage.emptyBody')}
                action={<Button to="/contact">{t('common.contactUs')}</Button>} /> :


              <Accordion
                defaultOpenId={results[0]?.id}
                items={results.map((item) => ({
                  id: item.id,
                  question: item.question[locale],
                  answer: item.answer[locale]
                }))} />

              }
            </div>
          </div>
        </div>
      </section>

      <CtaBanner
        title={t('finalCta.title')}
        primary={{ label: t('finalCta.cta'), to: '/vehicules' }}
        secondary={{ label: t('common.contactUs'), to: '/contact' }} />
      
    </>);

}