import React from 'react';
import { useParams } from 'react-router-dom';
import { FileTextIcon, InfoIcon } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { getLegalDocument } from '../data/legal';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { SectionTitle } from '../components/ui/SectionTitle';

export function Legal() {
  const { slug = '' } = useParams();
  const { t, locale } = useI18n();
  const document = getLegalDocument(slug);

  if (!document) {
    return (
      <div className="mx-auto max-w-content px-4 pb-24 pt-36 sm:px-6 lg:px-8">
        <EmptyState
          icon={<FileTextIcon className="h-5 w-5" />}
          title={t('common.error')}
          action={<Button to="/">{t('nav.home')}</Button>} />
        
      </div>);

  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-content px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pt-36">
        <SectionTitle
          as="h1"
          size="display"
          variant={0}
          eyebrow={t('footer.legalTitle')}
          title={t(document.titleKey)}
          subtitle={t('legal.updated')}
          className="max-w-3xl" />
        

        <Card tone="soft" className="mt-8 flex items-start gap-3" padding="md">
          <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-action" aria-hidden="true" />
          <p className="text-2xs leading-relaxed text-muted">{t('legal.disclaimer')}</p>
        </Card>

        <div className="mt-12 grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-16">
          <nav aria-label={t('legal.toc')} className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-[0.75rem] font-semibold uppercase tracking-wide text-muted">{t('legal.toc')}</p>
            <ul className="mt-4 flex flex-col gap-2 border-l border-line pl-4">
              {document.sections.map((section) =>
              <li key={section.id}>
                  <a
                  href={`#${section.id}`}
                  className="nv-link-slide inline-block text-2xs font-medium text-muted hover:text-action">
                  
                    {section.title[locale]}
                  </a>
                </li>
              )}
            </ul>
          </nav>

          <article className="max-w-2xl">
            {document.sections.map((section, index) =>
            <section key={section.id} id={section.id} className="scroll-mt-28 border-t border-line pt-8 first:border-t-0 first:pt-0 [&:not(:first-child)]:mt-10">
                <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-ink">
                  <span className="mr-2 text-action">{String(index + 1).padStart(2, '0')}</span>
                  {section.title[locale]}
                </h2>
                {section.body.map((paragraph, pIndex) =>
              <p key={pIndex} className="mt-4 text-sm leading-relaxed text-muted">
                    {paragraph[locale]}
                  </p>
              )}
              </section>
            )}
          </article>
        </div>
      </div>
    </div>);

}