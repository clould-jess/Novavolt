import React, { useState } from 'react';
import { FileSignatureIcon, FileTextIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { useToast } from '../../contexts/ToastContext';
import { contractsFor } from '../../data/documents';
import { currentCustomer } from '../../data/customers';
import { getVehicle } from '../../data/vehicles';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { PageHeading } from '../../components/ui/PageHeading';
import { Reveal } from '../../components/ui/Reveal';
import { StatusBadge } from '../../components/ui/StatusBadge';

export function PortalContract() {
  const { t, date } = useI18n();
  const { showToast } = useToast();
  const contracts = contractsFor(currentCustomer.id);
  const [signing, setSigning] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <PageHeading title={t('portal.contractTitle')} description={t('portal.contractSubtitle')} />

      <ul className="flex flex-col gap-4">
        {contracts.map((contract, index) => {
          const vehicle = getVehicle(contract.vehicleId);
          return (
            <Reveal as="li" key={contract.id} index={index}>
              <Card padding="md">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3.5">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface text-muted" aria-hidden="true">
                      <FileTextIcon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-ink">{contract.reference}</h2>
                      <p className="mt-0.5 text-[0.75rem] text-muted">
                        {vehicle ? `${vehicle.brand} ${vehicle.model} · ` : ''}
                        {date(contract.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge kind="contract" value={contract.status} size="md" />
                    {contract.status === 'toSign' ?
                    <Button
                      size="sm"
                      iconLeft={<FileSignatureIcon className="h-4 w-4" />}
                      onClick={() => setSigning(contract.id)}>
                      
                        {t('portal.signCta')}
                      </Button> :

                    <Button size="sm" variant="secondary">
                        {t('portal.preview')}
                      </Button>
                    }
                  </div>
                </div>

                {contract.signedAt &&
                <div className="mt-4 border-t border-line pt-4">
                    <p className="text-[0.75rem] font-semibold uppercase tracking-wide text-muted">
                      {t('portal.signHistory')}
                    </p>
                    <p className="mt-1.5 text-2xs text-body">
                      {t('contractStatus.signed')} — {date(contract.signedAt)}
                    </p>
                  </div>
                }
              </Card>
            </Reveal>);

        })}
      </ul>

      <Card tone="soft" padding="md">
        <CardHeader title={t('portal.preview')} description={t('portal.signNote')} />
        <div className="mt-4 h-40 rounded-xl border border-dashed border-line bg-white" aria-hidden="true" />
      </Card>

      <Modal
        open={Boolean(signing)}
        onClose={() => setSigning(null)}
        title={t('portal.signCta')}
        description={t('portal.signNote')}
        footer={
        <>
            <Button variant="secondary" onClick={() => setSigning(null)}>
              {t('common.cancel')}
            </Button>
            <Button
            onClick={() => {
              setSigning(null);
              showToast({ tone: 'success', title: t('common.success') });
            }}>
            
              {t('common.confirm')}
            </Button>
          </>
        } />
      
    </div>);

}