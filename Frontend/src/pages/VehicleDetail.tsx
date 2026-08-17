import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BatteryChargingIcon,
  BriefcaseIcon,
  CarFrontIcon,
  CheckIcon,
  GaugeIcon,
  HeadphonesIcon,
  MapPinIcon,
  ShieldCheckIcon,
  UsersIcon,
  WrenchIcon,
  ZapIcon } from
'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { availabilityFor, availabilityReferenceDate } from '../data/availability';
import { mockFaq } from '../data/faq';
import { getVehicle, mockVehicles } from '../data/vehicles';
import { AvailabilityCalendar } from '../components/ui/AvailabilityCalendar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Reveal } from '../components/ui/Reveal';
import { SectionTitle } from '../components/ui/SectionTitle';
import { StatusBadge } from '../components/ui/StatusBadge';
import { VehicleImage } from '../components/ui/VehicleImage';
import { FaqSection } from '../components/marketing/FaqSection';
import { VehicleCard } from '../components/marketing/VehicleCard';

const included = [
{ key: 'vehicleDetail.included1', icon: WrenchIcon },
{ key: 'vehicleDetail.included2', icon: HeadphonesIcon },
{ key: 'vehicleDetail.included3', icon: ShieldCheckIcon },
{ key: 'vehicleDetail.included4', icon: UsersIcon }];


export function VehicleDetail() {
  const { id = '' } = useParams();
  const { t, money } = useI18n();
  const vehicle = getVehicle(id);
  const [activeImage, setActiveImage] = useState(0);
  const [start, setStart] = useState<string | undefined>();
  const [end, setEnd] = useState<string | undefined>();

  if (!vehicle) {
    return (
      <div className="mx-auto max-w-content px-4 pb-24 pt-36 sm:px-6 lg:px-8">
        <EmptyState
          icon={<CarFrontIcon className="h-5 w-5" />}
          title={t('vehicleDetail.notFound')}
          body={t('vehicleDetail.notFoundBody')}
          action={<Button to="/vehicules">{t('common.viewVehicles')}</Button>} />
        
      </div>);

  }

  const name = `${vehicle.brand} ${vehicle.model}`;
  const similar = mockVehicles.filter((item) => item.id !== vehicle.id && item.powertrain === vehicle.powertrain).slice(0, 3);
  const specs = [
  { label: t('vehicleDetail.specRange'), value: `${vehicle.rangeKm} km`, icon: BatteryChargingIcon },
  { label: t('vehicleDetail.specSeats'), value: String(vehicle.seats), icon: UsersIcon },
  {
    label: t('vehicleDetail.specCharge'),
    value: vehicle.chargeKw > 0 ? `${vehicle.chargeKw} kW` : '—',
    icon: ZapIcon
  },
  { label: t('vehicleDetail.specTransmission'), value: t('vehicleDetail.automatic'), icon: GaugeIcon },
  { label: t('vehicleDetail.specTrunk'), value: `${vehicle.trunkLitres} L`, icon: BriefcaseIcon },
  { label: t('vehicleDetail.specCategory'), value: vehicle.category, icon: CarFrontIcon }];


  const handleSelectDay = (iso: string) => {
    if (!start || start && end) {
      setStart(iso);
      setEnd(undefined);
      return;
    }
    if (iso < start) {
      setStart(iso);
      return;
    }
    setEnd(iso);
  };

  return (
    <>
      <section className="bg-soft px-4 pb-12 pt-28 sm:px-6 lg:px-8 lg:pb-16 lg:pt-32">
        <div className="mx-auto max-w-content">
          <Link
            to="/vehicules"
            className="nv-link-slide inline-flex items-center gap-1.5 text-2xs font-semibold text-muted hover:text-ink">
            
            <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {t('nav.vehicles')}
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:gap-10">
            <div>
              <VehicleImage
                src={vehicle.gallery[activeImage]}
                alt={`${name} ${vehicle.year}`}
                className="aspect-[16/10] w-full rounded-card border border-line shadow-card" />
              
              <ul className="mt-3 grid grid-cols-4 gap-3" aria-label={t('vehicleDetail.gallery')}>
                {vehicle.gallery.map((src, index) =>
                <li key={`${src}-${index}`}>
                    <button
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-current={index === activeImage}
                    aria-label={`${t('vehicleDetail.gallery')} ${index + 1}`}
                    className={
                    index === activeImage ?
                    'block w-full overflow-hidden rounded-xl border-2 border-action' :
                    'block w-full overflow-hidden rounded-xl border border-line transition-colors duration-200 hover:border-sky-200'
                    }>
                    
                      <VehicleImage src={src} alt="" className="aspect-[4/3]" />
                    </button>
                  </li>
                )}
              </ul>
            </div>

            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge kind="vehicle" value={vehicle.status} size="md" />
                <Badge tone="info" size="md">
                  {t(`powertrain.${vehicle.powertrain}`)}
                </Badge>
                {vehicle.useCases.includes('driver') &&
                <Badge tone="accent" size="md">
                    {t('badge.rideshare')}
                  </Badge>
                }
              </div>
              <h1 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl">
                {name} <span className="font-semibold text-muted">{vehicle.year}</span>
              </h1>
              <p className="mt-2 flex items-center gap-1.5 text-2xs font-medium text-muted">
                <MapPinIcon className="h-4 w-4 text-action" aria-hidden="true" />
                {t(`cities.${vehicle.city}`)} · {vehicle.category}
              </p>

              <Card className="mt-6" padding="md">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[0.75rem] font-medium text-muted">{t('common.from')}</p>
                    <p className="font-display text-3xl font-bold tracking-[-0.03em] text-ink">
                      {money(vehicle.pricing.weekly)}
                      <span className="ml-1 text-2xs font-semibold text-muted">{t('common.perWeek')}</span>
                    </p>
                  </div>
                  <ul className="text-right text-[0.75rem] text-muted">
                    <li>
                      {money(vehicle.pricing.daily)} {t('common.perDay')}
                    </li>
                    <li>
                      {money(vehicle.pricing.monthly)} {t('common.perMonth')}
                    </li>
                  </ul>
                </div>
                <div className="mt-5 hidden lg:block">
                  <Button fullWidth size="lg" to="/portail/reservation">
                    {t('vehicleDetail.bookCta')}
                  </Button>
                </div>
                <p className="mt-3 text-[0.75rem] leading-relaxed text-muted">{t('portal.bookingNotice')}</p>
              </Card>

              <ul className="mt-6 grid grid-cols-2 gap-3">
                {specs.slice(0, 4).map(({ label, value, icon: Icon }) =>
                <li key={label} className="rounded-xl border border-line bg-white px-3.5 py-3">
                    <span className="flex items-center gap-1.5 text-[0.75rem] text-muted">
                      <Icon className="h-3.5 w-3.5 text-action" aria-hidden="true" />
                      {label}
                    </span>
                    <span className="mt-1 block text-2xs font-semibold text-ink">{value}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-content gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:gap-10">
          <div className="flex flex-col gap-12">
            <div>
              <SectionTitle as="h2" variant={0} title={t('vehicleDetail.specs')} />
              <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
                {specs.map(({ label, value, icon: Icon }) =>
                <div key={label} className="border-t border-line pt-4">
                    <dt className="flex items-center gap-1.5 text-[0.75rem] text-muted">
                      <Icon className="h-3.5 w-3.5 text-action" aria-hidden="true" />
                      {label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
                  </div>
                )}
              </dl>
              <ul className="mt-8 flex flex-wrap gap-2">
                {vehicle.highlights.map((highlight) =>
                <li key={highlight}>
                    <Badge tone="neutral">{highlight}</Badge>
                  </li>
                )}
              </ul>
            </div>

            <div>
              <SectionTitle as="h2" variant={1} title={t('vehicleDetail.includedTitle')} />
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {included.map(({ key, icon: Icon }, index) =>
                <Reveal as="li" key={key} index={index}>
                    <div className="flex h-full items-start gap-3 rounded-card border border-line bg-soft p-4">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-action" aria-hidden="true">
                        <Icon className="h-4 w-4" />
                      </span>
                      <p className="text-2xs font-semibold leading-relaxed text-ink">{t(key)}</p>
                    </div>
                  </Reveal>
                )}
              </ul>
            </div>

            <div>
              <SectionTitle as="h2" variant={2} title={t('vehicleDetail.suitedTitle')} />
              <ul className="mt-8 flex flex-wrap gap-3">
                {vehicle.useCases.map((useCase) =>
                <li
                  key={useCase}
                  className="inline-flex items-center gap-2 rounded-pill border border-action/20 bg-sky-50 px-4 py-2 text-2xs font-semibold text-action">
                  
                    <CheckIcon className="h-4 w-4" aria-hidden="true" />
                    {t(`useCase.${useCase}`)}
                  </li>
                )}
              </ul>
            </div>

            <div>
              <SectionTitle as="h2" variant={3} title={t('vehicleDetail.conditionsTitle')} />
              <dl className="mt-8 divide-y divide-line border-y border-line">
                {[
                { label: t('vehicleDetail.conditionDeposit'), value: money(vehicle.pricing.deposit) },
                { label: t('vehicleDetail.conditionDocs'), value: t('vehicleDetail.conditionDocsValue') },
                { label: t('vehicleDetail.conditionMileage'), value: t('vehicleDetail.conditionMileageValue') },
                { label: t('vehicleDetail.conditionCancel'), value: t('vehicleDetail.conditionCancelValue') }].
                map((row) =>
                <div key={row.label} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                    <dt className="text-2xs font-semibold text-ink">{row.label}</dt>
                    <dd className="text-2xs text-muted sm:text-right">{row.value}</dd>
                  </div>
                )}
              </dl>
              <p className="mt-4 text-[0.75rem] text-muted">{t('common.notice')}</p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-display text-lg font-semibold tracking-[-0.02em] text-ink">
                {t('vehicleDetail.availabilityTitle')}
              </h2>
              <p className="mt-1.5 text-[0.75rem] text-muted">{t('vehicleDetail.selectDates')}</p>
              <AvailabilityCalendar
                className="mt-4"
                days={availabilityFor(vehicle.id)}
                referenceDate={availabilityReferenceDate}
                selectedStart={start}
                selectedEnd={end}
                onSelectDay={handleSelectDay} />
              
            </div>

            <Card padding="md">
              <h2 className="font-display text-base font-semibold tracking-[-0.02em] text-ink">
                {t('vehicleDetail.agencyTitle')}
              </h2>
              <div
                className="mt-4 flex h-36 items-end rounded-xl border border-line bg-surface p-4"
                role="img"
                aria-label={t('contactPage.mapAlt')}>
                
                <span className="inline-flex items-center gap-2 rounded-pill bg-white px-3 py-1.5 text-[0.75rem] font-semibold text-ink shadow-xs">
                  <MapPinIcon className="h-3.5 w-3.5 text-action" aria-hidden="true" />
                  {t(`cities.${vehicle.city}`)}
                </span>
              </div>
              <p className="mt-3 text-[0.75rem] leading-relaxed text-muted">{t('vehicleDetail.agencyNote')}</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-soft px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-content">
          <SectionTitle as="h2" variant={1} title={t('vehicleDetail.similar')} />
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((item, index) =>
            <Reveal as="li" key={item.id} index={index} className="h-full">
                <VehicleCard vehicle={item} />
              </Reveal>
            )}
          </ul>
        </div>
      </section>

      <FaqSection
        title={t('vehicleDetail.faqTitle')}
        items={mockFaq.filter((item) => ['faq-2', 'faq-9', 'faq-14', 'faq-17'].includes(item.id))}
        variant={3} />
      

      {/* Mobile sticky price + CTA */}
      <div className="sticky bottom-0 z-40 border-t border-line bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <p>
            <span className="block text-[0.75rem] text-muted">{t('common.from')}</span>
            <span className="font-display text-lg font-bold tracking-[-0.02em] text-ink">
              {money(vehicle.pricing.weekly)}
            </span>
            <span className="ml-1 text-[0.75rem] font-semibold text-muted">{t('common.perWeek')}</span>
          </p>
          <Button to="/portail/reservation">{t('vehicleDetail.bookCta')}</Button>
        </div>
      </div>
    </>);

}