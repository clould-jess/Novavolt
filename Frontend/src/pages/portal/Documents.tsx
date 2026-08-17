import React, { useState } from 'react';
import { FileTextIcon, InfoIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { useToast } from '../../contexts/ToastContext';
import { currentCustomer } from '../../data/customers';
import { documentsFor } from '../../data/documents';
import type { CustomerDocument } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { DocumentUploader } from '../../components/ui/DocumentUploader';
import { PageHeading } from '../../components/ui/PageHeading';
import { Reveal } from '../../components/ui/Reveal';
import { StatusBadge } from '../../components/ui/StatusBadge';

export function PortalDocuments() {
  const { t, date } = useI18n();
  const { showToast } = useToast();
  const [documents, setDocuments] = useState<CustomerDocument[]>(documentsFor(currentCustomer.id));
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleUpload = (id: string, fileName: string) => {
    setDocuments((current) =>
    current.map((doc) => doc.id === id ? { ...doc, status: 'review', updatedAt: '2026-08-17', note: undefined } : doc)
    );
    setActiveId(null);
    showToast({ tone: 'success', title: t('common.success'), body: fileName });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeading title={t('portal.documentsTitle')} description={t('portal.documentsSubtitle')} />

      <Card tone="soft" className="flex items-start gap-3" padding="md">
        <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-action" aria-hidden="true" />
        <p className="text-2xs leading-relaxed text-muted">{t('portal.uploadBody')}</p>
      </Card>

      <ul className="flex flex-col gap-4">
        {documents.map((doc, index) =>
        <Reveal as="li" key={doc.id} index={index}>
            <Card padding="md">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface text-muted" aria-hidden="true">
                    <FileTextIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-ink">{doc.label}</h2>
                    <p className="mt-0.5 text-[0.75rem] text-muted">
                      {t('portal.updatedOn', { date: date(doc.updatedAt) })}
                      {doc.expiresAt && ` · ${t('portal.expiresOn', { date: date(doc.expiresAt) })}`}
                    </p>
                    {doc.status === 'rejected' && doc.note &&
                  <p className="mt-2 rounded-lg bg-[#FEF2F2] px-3 py-2 text-[0.75rem] font-medium text-[#B91C1C]">
                        {t('portal.rejectedNote', { reason: doc.note })}
                      </p>
                  }
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge kind="doc" value={doc.status} size="md" />
                  <Button
                  size="sm"
                  variant={['required', 'rejected', 'expiring'].includes(doc.status) ? 'primary' : 'secondary'}
                  onClick={() => setActiveId(activeId === doc.id ? null : doc.id)}>
                  
                    {t('portal.uploadCta')}
                  </Button>
                </div>
              </div>

              {activeId === doc.id &&
            <DocumentUploader
              id={`upload-${doc.id}`}
              className="mt-4"
              onUpload={(fileName) => handleUpload(doc.id, fileName)} />

            }
            </Card>
          </Reveal>
        )}
      </ul>
    </div>);

}