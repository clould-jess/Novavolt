import React, { useState } from 'react';
import { ImagePlusIcon, PhoneIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { useToast } from '../../contexts/ToastContext';
import { currentCustomer } from '../../data/customers';
import { mockIncidents } from '../../data/operations';
import { getVehicle } from '../../data/vehicles';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { PageHeading } from '../../components/ui/PageHeading';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Textarea } from '../../components/ui/Textarea';

export function PortalIncident() {
  const { t, date } = useI18n();
  const { showToast } = useToast();
  const [category, setCategory] = useState('damage');
  const [urgency, setUrgency] = useState('medium');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string>();
  const [sending, setSending] = useState(false);
  const history = mockIncidents.filter((incident) => incident.customerId === currentCustomer.id);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (description.trim().length < 10) {
      setError(t('auth.errorRequired'));
      return;
    }
    setError(undefined);
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setDescription('');
      showToast({ tone: 'success', title: t('common.success'), body: t('portal.incidentSubtitle') });
    }, 800);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeading title={t('portal.incidentTitle')} description={t('portal.incidentSubtitle')} />

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <Card padding="lg">
          <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                id="incident-category"
                label={t('portal.incidentCategory')}
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                options={[
                { value: 'damage', label: t('portal.incidentCatDamage') },
                { value: 'breakdown', label: t('portal.incidentCatBreakdown') },
                { value: 'charging', label: t('portal.incidentCatCharging') },
                { value: 'accident', label: t('portal.incidentCatAccident') },
                { value: 'other', label: t('portal.incidentCatOther') }]
                } />
              
              <Select
                id="incident-urgency"
                label={t('portal.incidentUrgency')}
                value={urgency}
                onChange={(event) => setUrgency(event.target.value)}
                options={[
                { value: 'low', label: t('portal.urgencyLow') },
                { value: 'medium', label: t('portal.urgencyMedium') },
                { value: 'high', label: t('portal.urgencyHigh') }]
                } />
              
            </div>
            <Textarea
              id="incident-description"
              label={t('portal.incidentDescription')}
              value={description}
              required
              error={error}
              onChange={(event) => setDescription(event.target.value)} />
            
            <div>
              <p className="text-2xs font-semibold text-ink">{t('portal.incidentPhotos')}</p>
              <label
                htmlFor="incident-photos"
                className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-line bg-soft px-4 py-4 text-2xs text-muted transition-colors duration-200 ease-signature hover:border-action">
                
                <ImagePlusIcon className="h-4 w-4 text-action" aria-hidden="true" />
                {t('portal.uploadCta')}
              </label>
              <input id="incident-photos" type="file" accept="image/*" multiple className="sr-only" />
            </div>
            <Button type="submit" size="lg" loading={sending} className="mt-2 self-start">
              {t('portal.incidentSubmit')}
            </Button>
          </form>
        </Card>

        <div className="flex flex-col gap-5">
          <Card tone="ink" padding="lg">
            <p className="text-[0.75rem] font-semibold uppercase tracking-wide text-sky-400">
              {t('portal.supportRoadside')}
            </p>
            <p className="mt-3 font-display text-xl font-semibold tracking-[-0.02em] text-white">
              {t('common.phone')}
            </p>
            <Button
              href={`tel:${t('common.phone').replace(/[^\d+]/g, '')}`}
              variant="inverse"
              className="mt-5"
              iconLeft={<PhoneIcon className="h-4 w-4" />}>
              
              {t('portal.supportCall')}
            </Button>
          </Card>

          <Card padding="md">
            <CardHeader title={t('portal.incidentHistory')} />
            <ul className="mt-4 flex flex-col divide-y divide-line">
              {history.map((incident) => {
                const vehicle = getVehicle(incident.vehicleId);
                return (
                  <li key={incident.id} className="py-3 first:pt-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-2xs font-semibold text-ink">{incident.reference}</p>
                      <StatusBadge kind="incident" value={incident.status} />
                    </div>
                    <p className="mt-1 text-[0.75rem] text-muted">
                      {incident.category} · {vehicle?.model} · {date(incident.createdAt)}
                    </p>
                  </li>);

              })}
            </ul>
          </Card>
        </div>
      </div>
    </div>);

}