import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BatteryChargingIcon,
  BriefcaseIcon,
  CarFrontIcon,
  CheckIcon,
  CheckCircle2Icon,
  GaugeIcon,
  HeadphonesIcon,
  MapPinIcon,
  ShieldCheckIcon,
  UsersIcon,
  WrenchIcon,
  ZapIcon,
} from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { mockFaq } from '../data/faq';
import { availabilityFor, availabilityReferenceDate } from '../data/availability';
import { AvailabilityCalendar } from '../components/ui/AvailabilityCalendar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Reveal } from '../components/ui/Reveal';
import { SectionTitle } from '../components/ui/SectionTitle';
import { StatusBadge } from '../components/ui/StatusBadge';
import { VehicleImage } from '../components/ui/VehicleImage';
import { CenteredLoading } from '../components/ui/CenteredLoading';
import { FaqSection } from '../components/marketing/FaqSection';
import { VehicleCard } from '../components/marketing/VehicleCard';
import { ApiError } from '../services/api';
import { getPublicVehicle, listPublicVehicles, mapPublicVehicles, type PublicVehicle } from '../services/publicVehicles';
import { createReservationRequest } from '../services/reservations';
import { useToast } from '../contexts/ToastContext';
import type { Vehicle } from '../types';

const included = [
  { key: 'vehicleDetail.included1', icon: WrenchIcon },
  { key: 'vehicleDetail.included2', icon: HeadphonesIcon },
  { key: 'vehicleDetail.included3', icon: ShieldCheckIcon },
  { key: 'vehicleDetail.included4', icon: UsersIcon },
];

function powertrainLabel(t: ReturnType<typeof useI18n>['t'], value: PublicVehicle['powertrain']) {
  if (value === 'ELECTRIC') return t('powertrain.electric');
  if (value === 'HYBRID') return t('powertrain.hybrid');
  return 'Plug-in hybrid';
}

export function VehicleDetail() {
  const { id = '' } = useParams();
  const { t } = useI18n();
  const phoneHref = `tel:${t('common.phone').replace(/[^\d+]/g, '')}`;
  const { showToast } = useToast();
  const reservationRef = useRef<HTMLDivElement | null>(null);
  const [vehicle, setVehicle] = useState<PublicVehicle | null>(null);
  const [similar, setSimilar] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const [errorBody, setErrorBody] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [start, setStart] = useState<string | undefined>();
  const [end, setEnd] = useState<string | undefined>();
  const [reservationOpen, setReservationOpen] = useState(false);
  const [reservationSubmitting, setReservationSubmitting] = useState(false);
  const [reservationSubmitted, setReservationSubmitted] = useState(false);
  const [reservationForm, setReservationForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    setErrorTitle(null);
    setErrorBody(null);

    Promise.all([getPublicVehicle(id), listPublicVehicles()])
      .then(([current, list]) => {
        if (!active) return;
        if (current.status !== 'AVAILABLE') {
          throw new Error('Vehicle is unavailable');
        }
        setVehicle(current);
        setSimilar(
          mapPublicVehicles(list.items)
            .filter((item) => item.id !== current.id && item.status === 'available')
            .slice(0, 3),
        );
        setActiveImage(0);
      })
      .catch((error) => {
        if (!active) return;
        if (error instanceof Error && error.message === 'Vehicle is unavailable') {
          setErrorTitle(t('vehicleDetail.notFound'));
          setErrorBody(t('vehicleDetail.notFoundBody'));
          return;
        }
        if (error instanceof TypeError) {
          setErrorTitle(t('auth.networkErrorTitle'));
          setErrorBody(t('auth.networkErrorBody'));
          return;
        }
        if (error instanceof ApiError) {
          setErrorTitle(t('auth.serverErrorTitle'));
          setErrorBody(error.message);
          return;
        }
        setErrorTitle(t('vehicleDetail.notFound'));
        setErrorBody(t('vehicleDetail.notFoundBody'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, t]);

  const photos = useMemo(() => {
    if (!vehicle) return [];
    return [...vehicle.photos].sort((left, right) => left.sortOrder - right.sortOrder);
  }, [vehicle]);

  if (loading) {
    return (
      <div className="mx-auto max-w-content px-4 pb-24 pt-36 sm:px-6 lg:px-8">
        <CenteredLoading className="min-h-[40vh]" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="mx-auto max-w-content px-4 pb-24 pt-36 sm:px-6 lg:px-8">
        <EmptyState
          icon={<CarFrontIcon className="h-5 w-5" />}
          title={errorTitle ?? t('vehicleDetail.notFound')}
          body={errorBody ?? t('vehicleDetail.notFoundBody')}
          action={<Button to="/vehicules">{t('common.viewVehicles')}</Button>}
        />
      </div>
    );
  }

  const name = `${vehicle.make} ${vehicle.model}`;
  const gallery = photos.length > 0 ? photos : vehicle.photos;
  const activePhoto = gallery[activeImage];

  const handleSelectDay = (iso: string) => {
    if (!start || (start && end)) {
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

  const openReservationForm = () => {
    setReservationOpen(true);
    requestAnimationFrame(() => {
      reservationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleReservationSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!vehicle || !start || !end || reservationSubmitting) {
      return;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate >= endDate) {
      showToast({
        tone: 'warn',
        title: t('vehicleDetail.reservationDateErrorTitle'),
        body: t('vehicleDetail.reservationDateErrorBody'),
      });
      return;
    }

    setReservationSubmitting(true);
    try {
      const response = await createReservationRequest({
        vehicleId: vehicle.id,
        name: reservationForm.name,
        email: reservationForm.email,
        phone: reservationForm.phone,
        startAt: start,
        endAt: end,
        message: reservationForm.message,
      });

      setReservationSubmitted(true);
      setReservationForm({ name: '', email: '', phone: '', message: '' });
      setStart(undefined);
      setEnd(undefined);
      showToast({
        tone: response.emailDelivered ? 'success' : 'warn',
        title: response.emailDelivered
          ? t('vehicleDetail.reservationSuccessTitle')
          : t('vehicleDetail.reservationPendingTitle'),
        body: response.emailDelivered
          ? t('vehicleDetail.reservationSuccessBody')
          : t('vehicleDetail.reservationPendingBody'),
      });
    } catch (error) {
      showToast({
        tone: 'error',
        title:
          error instanceof ApiError && error.status === 400
            ? t('vehicleDetail.reservationDateErrorTitle')
            : t('vehicleDetail.reservationErrorTitle'),
        body:
          error instanceof ApiError && error.status === 400
            ? t('vehicleDetail.reservationDateErrorBody')
            : t('vehicleDetail.reservationErrorBody'),
      });
    } finally {
      setReservationSubmitting(false);
    }
  };

  const handleAnotherReservation = () => {
    setReservationSubmitted(false);
    setReservationForm({ name: '', email: '', phone: '', message: '' });
    setStart(undefined);
    setEnd(undefined);
    requestAnimationFrame(() => {
      reservationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const specs = [
    { label: t('vehicleDetail.specRange'), value: `${vehicle.rangeKm ?? 0} km`, icon: BatteryChargingIcon },
    { label: t('vehicleDetail.specSeats'), value: String(vehicle.seats ?? 0), icon: UsersIcon },
    {
      label: t('vehicleDetail.specCharge'),
      value: vehicle.powertrain === 'ELECTRIC' ? 'Fast charge' : '-',
      icon: ZapIcon,
    },
    { label: t('vehicleDetail.specTransmission'), value: t('vehicleDetail.automatic'), icon: GaugeIcon },
    { label: t('vehicleDetail.specTrunk'), value: vehicle.color ?? '-', icon: BriefcaseIcon },
    { label: t('vehicleDetail.specCategory'), value: powertrainLabel(t, vehicle.powertrain), icon: CarFrontIcon },
  ];

  return (
    <>
      <section className="bg-soft px-4 pb-12 pt-28 sm:px-6 lg:px-8 lg:pb-16 lg:pt-32">
        <div className="mx-auto max-w-content">
          <Link
            to="/vehicules"
            className="nv-link-slide inline-flex items-center gap-1.5 text-2xs font-semibold text-muted hover:text-ink"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {t('nav.vehicles')}
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:gap-10">
            <div>
              <VehicleImage
                src={activePhoto?.imagekitThumbnailUrl ?? activePhoto?.imagekitUrl ?? ''}
                alt={`${name} ${vehicle.year}`}
                className="aspect-[16/10] w-full rounded-card border border-line shadow-card"
                fallbackLabel={name}
              />

              <ul className="mt-3 grid grid-cols-4 gap-3" aria-label={t('vehicleDetail.gallery')}>
                {gallery.map((photo, index) => (
                  <li key={photo.id}>
                    <button
                      type="button"
                      onClick={() => setActiveImage(index)}
                      aria-current={index === activeImage}
                      aria-label={`${t('vehicleDetail.gallery')} ${index + 1}`}
                      className={
                        index === activeImage
                          ? 'block w-full overflow-hidden rounded-xl border-2 border-action'
                          : 'block w-full overflow-hidden rounded-xl border border-line transition-colors duration-200 hover:border-sky-200'
                      }
                    >
                      <VehicleImage
                        src={photo.imagekitThumbnailUrl ?? photo.imagekitUrl ?? ''}
                        alt=""
                        className="aspect-[4/3]"
                        fallbackLabel={name}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge kind="vehicle" value={vehicle.status === 'AVAILABLE' ? 'available' : 'reserved'} size="md" />
                <Badge tone="info" size="md">
                  {powertrainLabel(t, vehicle.powertrain)}
                </Badge>
              </div>

              <h1 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl">
                {name} <span className="font-semibold text-muted">{vehicle.year}</span>
              </h1>
              <p className="mt-2 flex items-center gap-1.5 text-2xs font-medium text-muted">
                <MapPinIcon className="h-4 w-4 text-action" aria-hidden="true" />
                {t(`cities.${vehicle.city ?? 'montreal'}`)}{vehicle.color ? ` - ${vehicle.color}` : ''}
              </p>

              <Card className="mt-6" padding="md">
                <div className="mt-5">
                  <Button
                    fullWidth
                    size="lg"
                    onClick={reservationOpen ? () => setReservationOpen(false) : openReservationForm}
                  >
                    {t('vehicleDetail.bookCta')}
                  </Button>
                </div>
                <p className="mt-3 text-[0.75rem] leading-relaxed text-muted">
                  {vehicle.description ?? t('portal.bookingNotice')}
                </p>
              </Card>

              <AnimatePresence initial={false}>
                {reservationOpen && (
                  <motion.div
                    ref={reservationRef}
                    initial={{ height: 0, opacity: 0, y: -8 }}
                    animate={{ height: 'auto', opacity: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, y: -8 }}
                    transition={{ duration: 0.24, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <Card className="mt-4 border-action/20 bg-white shadow-card" padding="md">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h2 className="font-display text-lg font-semibold tracking-[-0.02em] text-ink">
                            {t('vehicleDetail.reservationTitle')}
                          </h2>
                          <p className="mt-1 text-[0.75rem] leading-relaxed text-muted">
                            {t('vehicleDetail.reservationSubtitle')}
                          </p>
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => setReservationOpen(false)}>
                          {t('vehicleDetail.reservationClose')}
                        </Button>
                      </div>

                      {reservationSubmitted ? (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.24, ease: 'easeOut' }}
                          className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900"
                        >
                          <div className="flex items-start gap-3">
                            <motion.div
                              initial={{ scale: 0.7, rotate: -10 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: 'spring', stiffness: 240, damping: 14 }}
                              className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600"
                            >
                              <CheckCircle2Icon className="h-5 w-5" />
                            </motion.div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold">{t('vehicleDetail.reservationSuccessTitle')}</p>
                              <p className="mt-1 text-2xs leading-relaxed text-emerald-800">
                                {t('vehicleDetail.reservationSuccessBody')}
                              </p>
                              <Button href={phoneHref} size="sm" className="mt-4 bg-emerald-600 text-white hover:bg-emerald-700">
                                <PhoneIcon className="h-4 w-4" aria-hidden="true" />
                                {t('contactPage.callCta')}
                              </Button>
                              <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={handleAnotherReservation}>
                                {t('common.newRequest')}
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <form onSubmit={handleReservationSubmit} className="mt-5 space-y-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className="block text-2xs font-semibold text-ink">
                                {t('vehicleDetail.fieldName')}
                              </label>
                              <input
                                type="text"
                                required
                                value={reservationForm.name}
                                onChange={(event) => setReservationForm({ ...reservationForm, name: event.target.value })}
                                className="mt-1 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-medium text-ink focus:border-action focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-2xs font-semibold text-ink">
                                {t('vehicleDetail.fieldEmail')}
                              </label>
                              <input
                                type="email"
                                required
                                value={reservationForm.email}
                                onChange={(event) => setReservationForm({ ...reservationForm, email: event.target.value })}
                                className="mt-1 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-medium text-ink focus:border-action focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className="block text-2xs font-semibold text-ink">
                                {t('vehicleDetail.fieldPhone')}
                              </label>
                              <input
                                type="tel"
                                required
                                value={reservationForm.phone}
                                onChange={(event) => setReservationForm({ ...reservationForm, phone: event.target.value })}
                                className="mt-1 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-medium text-ink focus:border-action focus:outline-none"
                              />
                            </div>
                            <div className="rounded-xl border border-line bg-soft px-4 py-3">
                              <p className="text-2xs font-semibold text-muted">{t('vehicleDetail.reservationVehicle')}</p>
                              <p className="mt-1 text-sm font-semibold text-ink">{name}</p>
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className="block text-2xs font-semibold text-ink">
                                {t('vehicleDetail.fieldPickup')}
                              </label>
                              <input
                                type="date"
                                required
                                value={start ?? ''}
                                onChange={(event) => setStart(event.target.value || undefined)}
                                className="mt-1 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-medium text-ink focus:border-action focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-2xs font-semibold text-ink">
                                {t('vehicleDetail.fieldReturn')}
                              </label>
                              <input
                                type="date"
                                required
                                value={end ?? ''}
                                onChange={(event) => setEnd(event.target.value || undefined)}
                                className="mt-1 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-medium text-ink focus:border-action focus:outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-2xs font-semibold text-ink">
                              {t('vehicleDetail.fieldMessage')}
                            </label>
                            <textarea
                              rows={3}
                              value={reservationForm.message}
                              onChange={(event) => setReservationForm({ ...reservationForm, message: event.target.value })}
                              className="mt-1 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-medium text-ink focus:border-action focus:outline-none"
                            />
                          </div>

                          <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            loading={reservationSubmitting}
                          >
                            {t('vehicleDetail.reservationSubmit')}
                          </Button>
                        </form>
                      )}
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              <ul className="mt-6 grid grid-cols-2 gap-3">
                {specs.slice(0, 4).map(({ label, value, icon: Icon }) => (
                  <li key={label} className="rounded-xl border border-line bg-white px-3.5 py-3">
                    <span className="flex items-center gap-1.5 text-[0.75rem] text-muted">
                      <Icon className="h-3.5 w-3.5 text-action" aria-hidden="true" />
                      {label}
                    </span>
                    <span className="mt-1 block text-2xs font-semibold text-ink">{value}</span>
                  </li>
                ))}
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
                {specs.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="border-t border-line pt-4">
                    <dt className="flex items-center gap-1.5 text-[0.75rem] text-muted">
                      <Icon className="h-3.5 w-3.5 text-action" aria-hidden="true" />
                      {label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <SectionTitle as="h2" variant={1} title={t('vehicleDetail.includedTitle')} />
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {included.map(({ key, icon: Icon }, index) => (
                  <Reveal as="li" key={key} index={index}>
                    <div className="flex h-full items-start gap-3 rounded-card border border-line bg-soft p-4">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-action" aria-hidden="true">
                        <Icon className="h-4 w-4" />
                      </span>
                      <p className="text-2xs font-semibold leading-relaxed text-ink">{t(key)}</p>
                    </div>
                  </Reveal>
                ))}
              </ul>
            </div>

            <div>
              <SectionTitle as="h2" variant={2} title={t('vehicleDetail.suitedTitle')} />
              <ul className="mt-8 flex flex-wrap gap-3">
                {['driver', 'individual'].map((useCase) => (
                  <li
                    key={useCase}
                    className="inline-flex items-center gap-2 rounded-pill border border-action/20 bg-sky-50 px-4 py-2 text-2xs font-semibold text-action"
                  >
                    <CheckIcon className="h-4 w-4" aria-hidden="true" />
                    {t(`useCase.${useCase}`)}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <SectionTitle as="h2" variant={3} title={t('vehicleDetail.conditionsTitle')} />
              <dl className="mt-8 divide-y divide-line border-y border-line">
                {[
                  { label: t('vehicleDetail.conditionDocs'), value: t('vehicleDetail.conditionDocsValue') },
                  { label: t('vehicleDetail.conditionMileage'), value: t('vehicleDetail.conditionMileageValue') },
                  { label: t('vehicleDetail.conditionCancel'), value: t('vehicleDetail.conditionCancelValue') },
                ].map((row) => (
                  <div key={row.label} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                    <dt className="text-2xs font-semibold text-ink">{row.label}</dt>
                    <dd className="text-2xs text-muted sm:text-right">{row.value}</dd>
                  </div>
                ))}
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
                onSelectDay={handleSelectDay}
              />
            </div>

            <Card padding="md">
              <h2 className="font-display text-base font-semibold tracking-[-0.02em] text-ink">
                {t('vehicleDetail.agencyTitle')}
              </h2>
              <div
                className="mt-4 flex h-36 items-end rounded-xl border border-line bg-surface p-4"
                role="img"
                aria-label={t('contactPage.mapAlt')}
              >
                <span className="inline-flex items-center gap-2 rounded-pill bg-white px-3 py-1.5 text-[0.75rem] font-semibold text-ink shadow-xs">
                  <MapPinIcon className="h-3.5 w-3.5 text-action" aria-hidden="true" />
                  {t(`cities.${vehicle.city ?? 'montreal'}`)}
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
            {similar.map((item, index) => (
              <Reveal as="li" key={item.id} index={index} className="h-full">
                <VehicleCard vehicle={item} />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <FaqSection
        title={t('vehicleDetail.faqTitle')}
        items={mockFaq.filter((item) => ['faq-2', 'faq-9', 'faq-14', 'faq-17'].includes(item.id))}
        variant={3}
      />

      <div className="sticky bottom-0 z-40 border-t border-line bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex justify-end">
          <Button onClick={reservationOpen ? () => setReservationOpen(false) : openReservationForm}>
            {reservationOpen ? t('vehicleDetail.reservationClose') : t('vehicleDetail.bookCta')}
          </Button>
        </div>
      </div>
    </>
  );
}
