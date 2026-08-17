import React from 'react';
import { LifeBuoyIcon, MailIcon, PhoneIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { mockFaq } from '../../data/faq';
import { currentCustomer } from '../../data/customers';
import { mockIncidents } from '../../data/operations';
import { Accordion } from '../../components/ui/Accordion';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { PageHeading } from '../../components/ui/PageHeading';
import { StatusBadge } from '../../components/ui/StatusBadge';

export function PortalSupport() {
  const { t, locale, date } = useI18n();
  const items = mockFaq.filter((item) => ['support', 'charging', 'payments'].includes(item.category)).slice(0, 6);
  const requests = mockIncidents.filter((incident) => incident.customerId === currentCustomer.id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeading title={t('portal.supportTitle')} description={t('portal.supportSubtitle')} />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card tone="ink" padding="lg" className="lg:col-span-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-sky-400" aria-hidden="true">
            <LifeBuoyIcon className="h-5 w-5" />
          </span>
          <h2 className="mt-5 font-display text-2xl font-semibold tracking-[-0.02em] text-white">
            {t('portal.supportRoadside')}
          </h2>
          <p className="mt-2 max-w-md text-2xs leading-relaxed text-sky-100/70">{t('vehicleDetail.included2')}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              href={`tel:${t('common.phone').replace(/[^\d+]/g, '')}`}
              variant="inverse"
              iconLeft={<PhoneIcon className="h-4 w-4" />}>
              
              {t('common.phone')}
            </Button>
            <Button
              href={`mailto:${t('common.email')}`}
              variant="ghost"
              className="text-sky-400 hover:bg-white/10"
              iconLeft={<MailIcon className="h-4 w-4" />}>
              
              {t('contactPage.emailTitle')}
            </Button>
          </div>
        </Card>

        <Card padding="md">
          <CardHeader title={t('portal.incidentHistory')} />
          <ul className="mt-4 flex flex-col divide-y divide-line">
            {requests.map((request) =>
            <li key={request.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                <div className="min-w-0">
                  <p className="truncate text-2xs font-semibold text-ink">{request.reference}</p>
                  <p className="text-[0.75rem] text-muted">{date(request.createdAt)}</p>
                </div>
                <StatusBadge kind="incident" value={request.status} />
              </li>
            )}
          </ul>
          <Button to="/portail/incident" variant="secondary" size="sm" fullWidth className="mt-5">
            {t('portal.reportIncident')}
          </Button>
        </Card>
      </div>

      <Card padding="lg">
        <CardHeader title={t('faqPage.title')} description={t('faqPage.subtitle')} />
        <Accordion
          className="mt-5"
          items={items.map((item) => ({
            id: item.id,
            question: item.question[locale],
            answer: item.answer[locale]
          }))} />
        
      </Card>
    </div>);

}