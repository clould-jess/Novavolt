import React, { useMemo, useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, CheckCircle2Icon, InfoIcon, LockIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { availabilityFor, availabilityReferenceDate } from '../../data/availability';
import { currentCustomer } from '../../data/customers';
import { documentsFor } from '../../data/documents';
import { mockVehicles } from '../../data/vehicles';
import { AvailabilityCalendar } from '../../components/ui/AvailabilityCalendar';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { Checkbox } from '../../components/ui/Checkbox';
import { PageHeading } from '../../components/ui/PageHeading';
import { ProgressStepper } from '../../components/ui/ProgressStepper';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { VehicleImage } from '../../components/ui/VehicleImage';
import { cn } from '../../utils/cn';

const optionKeys = [
{ id: 'insurance', price: 29 },
{ id: 'charge', price: 15 },
{ id: 'delivery', price: 49 }];


export function PortalBookingFlow() {
  const { t, money, date } = useI18n();
  const [step, setStep] = useState(0);
  const [vehicleId, setVehicleId] = useState(mockVehicles[0].id);
  const [start, setStart] = useState<string | undefined>('2026-08-21');
  const [end, setEnd] = useState<string | undefined>('2026-08-28');
  const [options, setOptions] = useState<string[]>(['insurance']);

  const vehicle = mockVehicles.find((item) => item.id === vehicleId) ?? mockVehicles[0];
  const documents = documentsFor(currentCustomer.id);

  const steps = [
  { id: 'vehicle', label: t('portal.stepVehicle') },
  { id: 'dates', label: t('portal.stepDates') },
  { id: 'options', label: t('portal.stepOptions') },
  { id: 'file', label: t('portal.stepFile') },
  { id: 'payment', label: t('portal.stepPayment') },
  { id: 'confirm', label: t('portal.stepConfirm') }];


  const summary = useMemo(() => {
    const base = vehicle.pricing.weekly;
    const extras = optionKeys.filter((option) => options.includes(option.id)).reduce((sum, o) => sum + o.price, 0);
    const taxes = Math.round((base + extras) * 0.14975);
    return { base, extras, taxes, deposit: vehicle.pricing.deposit, total: base + extras + taxes };
  }, [vehicle, options]);

  const toggleOption = (id: string) =>
  setOptions((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title={t('portal.bookingTitle')}
        description={t('portal.step', { current: step + 1, total: steps.length })} />
      

      <Card padding="md">
        <ProgressStepper steps={steps} current={step} label={t('portal.bookingTitle')} />
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="flex flex-col gap-5">
          {step === 0 &&
          <Card padding="md">
              <CardHeader title={t('portal.stepVehicle')} />
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {mockVehicles.slice(0, 6).map((item) =>
              <li key={item.id}>
                    <button
                  type="button"
                  onClick={() => setVehicleId(item.id)}
                  aria-pressed={item.id === vehicleId}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-[border-color,background-color] duration-200 ease-signature',
                    item.id === vehicleId ? 'border-action bg-sky-50' : 'border-line bg-white hover:border-sky-200'
                  )}>
                  
                      <VehicleImage
                    src={item.imageUrl}
                    alt={`${item.brand} ${item.model}`}
                    className="h-14 w-20 shrink-0 rounded-lg" />
                  
                      <span className="min-w-0">
                        <span className="block truncate text-2xs font-semibold text-ink">
                          {item.brand} {item.model}
                        </span>
                        <span className="block text-[0.75rem] text-muted">
                          {money(item.pricing.weekly)} {t('common.perWeek')}
                        </span>
                      </span>
                    </button>
                  </li>
              )}
              </ul>
            </Card>
          }

          {step === 1 &&
          <Card padding="md">
              <CardHeader title={t('portal.stepDates')} description={t('vehicleDetail.selectDates')} />
              <AvailabilityCalendar
              className="mt-5"
              days={availabilityFor(vehicle.id)}
              referenceDate={availabilityReferenceDate}
              selectedStart={start}
              selectedEnd={end}
              onSelectDay={(iso) => {
                if (!start || start && end) {
                  setStart(iso);
                  setEnd(undefined);
                } else if (iso < start) {
                  setStart(iso);
                } else {
                  setEnd(iso);
                }
              }} />
            
            </Card>
          }

          {step === 2 &&
          <Card padding="md">
              <CardHeader title={t('portal.stepOptions')} />
              <ul className="mt-5 flex flex-col gap-3">
                {optionKeys.map((option) =>
              <li
                key={option.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-line p-4">
                
                    <Checkbox
                  id={`option-${option.id}`}
                  checked={options.includes(option.id)}
                  onChange={() => toggleOption(option.id)}
                  label={
                  <>
                          <span className="block text-2xs font-semibold text-ink">
                            {t(`portal.option${option.id.charAt(0).toUpperCase()}${option.id.slice(1)}`)}
                          </span>
                          <span className="mt-0.5 block text-[0.75rem] text-muted">
                            {t(`portal.option${option.id.charAt(0).toUpperCase()}${option.id.slice(1)}Desc`)}
                          </span>
                        </>
                  } />
                
                    <span className="shrink-0 text-2xs font-semibold text-ink">
                      {money(option.price)} {t('common.perWeek')}
                    </span>
                  </li>
              )}
              </ul>
            </Card>
          }

          {step === 3 &&
          <Card padding="md">
              <CardHeader title={t('portal.stepFile')} description={t('portal.documentsSubtitle')} />
              <ul className="mt-5 flex flex-col divide-y divide-line">
                {documents.map((doc) =>
              <li key={doc.id} className="flex items-center justify-between gap-4 py-3 first:pt-0">
                    <span className="truncate text-2xs text-body">{doc.label}</span>
                    <StatusBadge kind="doc" value={doc.status} />
                  </li>
              )}
              </ul>
              <Button to="/portail/documents" variant="secondary" size="sm" className="mt-5">
                {t('portal.nextActionCta')}
              </Button>
            </Card>
          }

          {step === 4 &&
          <Card padding="md">
              <CardHeader title={t('portal.stepPayment')} />
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-line bg-soft p-4">
                <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-action" aria-hidden="true" />
                <p className="text-2xs leading-relaxed text-muted">{t('portal.addPaymentNote')}</p>
              </div>
              <Button className="mt-5" variant="secondary">
                {t('portal.addPayment')}
              </Button>
            </Card>
          }

          {step === 5 &&
          <Card padding="lg">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-50 text-action" aria-hidden="true">
                <CheckCircle2Icon className="h-6 w-6" />
              </span>
              <h2 className="mt-5 font-display text-xl font-semibold tracking-[-0.02em] text-ink">
                {t('portal.confirmTitle')}
              </h2>
              <p className="mt-2 max-w-lg text-2xs leading-relaxed text-muted">
                {t('portal.confirmBody', { reference: 'NV-24820' })}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button to="/portail">{t('portal.nav.overview')}</Button>
                <Button to="/portail/reservations" variant="secondary">
                  {t('portal.nav.bookings')}
                </Button>
              </div>
            </Card>
          }

          {step < 5 &&
          <div className="flex items-center justify-between gap-4">
              <Button
              variant="secondary"
              disabled={step === 0}
              onClick={() => setStep((value) => Math.max(0, value - 1))}
              iconLeft={<ArrowLeftIcon className="h-4 w-4" />}>
              
                {t('common.previous')}
              </Button>
              <Button
              onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))}
              iconRight={<ArrowRightIcon className="h-4 w-4" />}>
              
                {t('common.next')}
              </Button>
            </div>
          }
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card padding="md">
            <CardHeader title={t('portal.summary')} />
            <dl className="mt-4 flex flex-col gap-2.5">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-2xs text-muted">{t('common.vehicle')}</dt>
                <dd className="text-2xs font-semibold text-ink">
                  {vehicle.brand} {vehicle.model}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-2xs text-muted">{t('common.dates')}</dt>
                <dd className="text-2xs font-semibold text-ink">
                  {start ? date(start) : '—'} – {end ? date(end) : '—'}
                </dd>
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-line pt-3">
                <dt className="text-2xs text-muted">{t('portal.summaryBase')}</dt>
                <dd className="text-2xs font-semibold text-ink">{money(summary.base, true)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-2xs text-muted">{t('portal.summaryOptions')}</dt>
                <dd className="text-2xs font-semibold text-ink">{money(summary.extras, true)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-2xs text-muted">{t('portal.summaryTaxes')}</dt>
                <dd className="text-2xs font-semibold text-ink">{money(summary.taxes, true)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-2xs text-muted">{t('portal.summaryDeposit')}</dt>
                <dd className="text-2xs font-semibold text-ink">{money(summary.deposit)}</dd>
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-line pt-3">
                <dt className="text-2xs font-semibold text-ink">{t('portal.summaryTotal')}</dt>
                <dd className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
                  {money(summary.total, true)}
                </dd>
              </div>
            </dl>
            <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-soft p-3.5">
              <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-action" aria-hidden="true" />
              <p className="text-[0.75rem] leading-relaxed text-muted">{t('portal.bookingNotice')}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>);

}