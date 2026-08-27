import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangleIcon,
  CameraIcon,
  CarFrontIcon,
  CheckCircle2Icon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  RefreshCcwIcon,
  SearchIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../contexts/I18nContext';
import { useToast } from '../../contexts/ToastContext';
import {
  listStaffVehicles,
  updateVehicleStatus,
  type AdminVehicle,
  type AdminVehiclePowertrain,
  type AdminVehicleStatus,
} from '../../services/vehicles';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { PageHeading } from '../../components/ui/PageHeading';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { VehicleImage } from '../../components/ui/VehicleImage';

const statusOptions: Array<{ value: AdminVehicleStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'admin.fleet.allStatuses' },
  { value: 'AVAILABLE', label: 'badge.available' },
  { value: 'RESERVED', label: 'badge.reserved' },
  { value: 'RENTED', label: 'badge.rented' },
  { value: 'MAINTENANCE', label: 'badge.maintenance' },
  { value: 'INACTIVE', label: 'badge.unavailable' },
];

const powertrainOptions: Array<{ value: AdminVehiclePowertrain | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'admin.fleet.allPowertrains' },
  { value: 'ELECTRIC', label: 'powertrain.electric' },
  { value: 'HYBRID', label: 'powertrain.hybrid' },
  { value: 'PLUG_IN_HYBRID', label: 'powertrain.plugInHybrid' },
];

const MAX_VEHICLE_PHOTOS = 5;

function sortVehiclePhotos(photos: AdminVehicle['photos']) {
  return [...photos].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder;
    return left.id.localeCompare(right.id);
  });
}

function getVehicleCoverPhoto(vehicle: AdminVehicle) {
  return sortVehiclePhotos(vehicle.photos)[0];
}

function mapStatusToBadge(value: AdminVehicleStatus): string {
  return value === 'INACTIVE' ? 'unavailable' : value.toLowerCase();
}

function isGreyedStatus(status: AdminVehicleStatus) {
  return status === 'MAINTENANCE' || status === 'INACTIVE';
}

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong';
}

export function AdminVehicles() {
  const { t, money, num, locale } = useI18n();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [items, setItems] = useState<AdminVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<AdminVehicleStatus | 'ALL'>('ALL');
  const [powertrainFilter, setPowertrainFilter] = useState<AdminVehiclePowertrain | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [pendingStatusById, setPendingStatusById] = useState<Record<string, AdminVehicleStatus | null>>({});

  const stats = useMemo(() => {
    const available = items.filter((item) => item.status === 'AVAILABLE').length;
    const rented = items.filter((item) => item.status === 'RENTED').length;
    const maintenance = items.filter((item) => item.status === 'MAINTENANCE').length;
    const inactive = items.filter((item) => item.status === 'INACTIVE').length;
    return { available, rented, maintenance, inactive };
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (powertrainFilter !== 'ALL' && item.powertrain !== powertrainFilter) return false;
      if (!q) return true;
      return [item.make, item.model, item.vin, item.plate, item.city ?? '', String(item.year)]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [items, powertrainFilter, search, statusFilter]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listStaffVehicles({ page: 1, limit: 100 });
      setItems(response.items);
    } catch (err) {
      const message = toErrorMessage(err);
      setError(message);
      showToast({ tone: 'error', title: t('common.error'), body: message });
    } finally {
      setLoading(false);
    }
  }, [showToast, t]);

  const changeStatus = async (vehicleId: string, status: AdminVehicleStatus) => {
    setPendingStatusById((current) => ({ ...current, [vehicleId]: status }));
    try {
      const updated = await updateVehicleStatus(vehicleId, { status });
      setItems((current) => current.map((item) => (item.id === vehicleId ? { ...item, status: updated.status } : item)));
      showToast({
        tone: 'success',
        title: t('common.success'),
        body: t(`badge.${mapStatusToBadge(updated.status)}`),
      });
    } catch (err) {
      const message = toErrorMessage(err);
      showToast({ tone: 'error', title: t('common.error'), body: message });
    } finally {
      setPendingStatusById((current) => ({ ...current, [vehicleId]: null }));
    }
  };

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title={t('admin.fleet.title')}
        description={t('admin.fleet.pageLead')}
        action={
          <Button iconLeft={<PlusIcon className="h-4 w-4" />} onClick={() => navigate('/admin/vehicules/nouveau')}>
            {t('admin.fleet.addVehicle')}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card padding="md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-2xs font-semibold uppercase tracking-wide text-muted">{t('badge.available')}</p>
              <div className="mt-2">
                {loading ? (
                  <Loader2Icon className="h-6 w-6 animate-spin text-muted" aria-hidden="true" />
                ) : (
                  <p className="font-display text-2xl font-semibold text-ink">{num(stats.available)}</p>
                )}
              </div>
            </div>
            <CheckCircle2Icon className="h-5 w-5 text-ok" />
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-2xs font-semibold uppercase tracking-wide text-muted">{t('badge.rented')}</p>
              <div className="mt-2">
                {loading ? (
                  <Loader2Icon className="h-6 w-6 animate-spin text-muted" aria-hidden="true" />
                ) : (
                  <p className="font-display text-2xl font-semibold text-ink">{num(stats.rented)}</p>
                )}
              </div>
            </div>
            <CarFrontIcon className="h-5 w-5 text-action" />
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-2xs font-semibold uppercase tracking-wide text-muted">{t('badge.maintenance')}</p>
              <div className="mt-2">
                {loading ? (
                  <Loader2Icon className="h-6 w-6 animate-spin text-muted" aria-hidden="true" />
                ) : (
                  <p className="font-display text-2xl font-semibold text-ink">{num(stats.maintenance)}</p>
                )}
              </div>
            </div>
            <AlertTriangleIcon className="h-5 w-5 text-bad" />
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-2xs font-semibold uppercase tracking-wide text-muted">{t('badge.unavailable')}</p>
              <div className="mt-2">
                {loading ? (
                  <Loader2Icon className="h-6 w-6 animate-spin text-muted" aria-hidden="true" />
                ) : (
                  <p className="font-display text-2xl font-semibold text-ink">{num(stats.inactive)}</p>
                )}
              </div>
            </div>
            <RefreshCcwIcon className="h-5 w-5 text-muted" />
          </div>
        </Card>
      </div>

      <Card padding="md">
        <CardHeader
          title={t('admin.fleet.listTitle')}
          description={t('admin.fleet.listSubtitle')}
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void refresh()}
              iconLeft={<RefreshCcwIcon className="h-4 w-4" />}
            >
              {t('common.retry')}
            </Button>
          }
        />

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_12rem_12rem]">
          <Input
            id="vehicle-search"
            label={t('common.search')}
            placeholder={t('admin.fleet.searchPlaceholder')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            iconLeft={<SearchIcon className="h-4 w-4" />}
          />
          <Select
            id="vehicle-status-filter"
            label={t('common.status')}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as AdminVehicleStatus | 'ALL')}
            options={statusOptions.map((option) => ({ value: option.value, label: t(option.label) }))}
          />
          <Select
            id="vehicle-powertrain-filter"
            label={t('admin.fleet.powertrainFilter')}
            value={powertrainFilter}
            onChange={(event) => setPowertrainFilter(event.target.value as AdminVehiclePowertrain | 'ALL')}
            options={powertrainOptions.map((option) => ({ value: option.value, label: t(option.label) }))}
          />
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-5">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse" padding="none">
                  <div className="h-48 bg-surface" />
                  <div className="space-y-3 p-5">
                    <div className="h-4 w-2/3 rounded bg-surface" />
                    <div className="h-3 w-1/2 rounded bg-surface" />
                    <div className="h-3 w-full rounded bg-surface" />
                  </div>
                </Card>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<CarFrontIcon className="h-6 w-6" />}
              title={t('admin.fleet.emptyFilteredTitle')}
              body={t('admin.fleet.emptyFilteredBody')}
              action={<Button onClick={() => navigate('/admin/vehicules/nouveau')}>{t('admin.fleet.addVehicle')}</Button>}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((vehicle) => {
                const cover = getVehicleCoverPhoto(vehicle);
                const coverUrl = cover?.imagekitThumbnailUrl ?? cover?.imagekitUrl ?? undefined;
                const photoCount = vehicle.photos.length;
                const locked = isGreyedStatus(vehicle.status);
                const pendingStatus = pendingStatusById[vehicle.id];
                const canSetAvailable = vehicle.status !== 'AVAILABLE';
                const canSetMaintenance = vehicle.status !== 'MAINTENANCE' && vehicle.status !== 'RENTED';
                const canSetInactive = vehicle.status !== 'INACTIVE' && vehicle.status !== 'RENTED';
                return (
                  <Card
                    key={vehicle.id}
                    as="article"
                    padding="none"
                    className={`overflow-hidden transition ${locked ? 'border-line bg-slate-50 opacity-85 grayscale-[0.15]' : 'bg-white'}`}
                  >
                    <div className={`relative aspect-[16/10] ${locked ? 'bg-slate-100' : 'bg-surface'}`}>
                      {coverUrl ? (
                        <VehicleImage
                          src={coverUrl}
                          alt={`${vehicle.make} ${vehicle.model}`}
                          className="h-full w-full"
                          imgClassName="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted">
                          <CameraIcon className="h-7 w-7" />
                          <span className="text-sm">{t('admin.fleet.photoPending')}</span>
                        </div>
                      )}
                      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                        <StatusBadge kind="vehicle" value={mapStatusToBadge(vehicle.status)} />
                        <Badge tone="inverse">{num(photoCount)}/{MAX_VEHICLE_PHOTOS}</Badge>
                      </div>
                    </div>

                    <div className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-lg font-semibold text-ink">
                            {vehicle.make} {vehicle.model}
                          </h3>
                          <p className="mt-1 text-sm text-muted">
                            {vehicle.city ?? t('common.city')} · {vehicle.year} · {vehicle.plate}
                          </p>
                        </div>
                        <p className="font-display text-lg font-semibold text-action">{money(vehicle.weeklyRateCents)}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge tone="neutral">
                          {num(vehicle.seats ?? 0)} {t('common.seats')}
                        </Badge>
                        <Badge tone="neutral">
                          {num(vehicle.rangeKm ?? 0)} {t('common.range')}
                        </Badge>
                        <Badge tone="neutral">{vehicle.odometer.toLocaleString(locale)} km</Badge>
                        <Badge tone="info">
                          {t(`powertrain.${vehicle.powertrain === 'PLUG_IN_HYBRID' ? 'plugInHybrid' : vehicle.powertrain.toLowerCase()}`)}
                        </Badge>
                      </div>

                      {vehicle.description && <p className="text-sm leading-relaxed text-body">{vehicle.description}</p>}

                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                        <span className="text-2xs font-semibold uppercase tracking-wide text-muted">
                          {t('admin.fleet.cardOpen')}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant={vehicle.status === 'AVAILABLE' ? 'primary' : 'secondary'}
                            size="sm"
                            loading={pendingStatus === 'AVAILABLE'}
                            disabled={pendingStatus !== null || !canSetAvailable}
                            onClick={() => void changeStatus(vehicle.id, 'AVAILABLE')}
                          >
                            {t('admin.fleet.markAvailable')}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            loading={pendingStatus === 'MAINTENANCE'}
                            disabled={pendingStatus !== null || !canSetMaintenance}
                            onClick={() => void changeStatus(vehicle.id, 'MAINTENANCE')}
                          >
                            {t('admin.fleet.markMaintenance')}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            loading={pendingStatus === 'INACTIVE'}
                            disabled={pendingStatus !== null || !canSetInactive}
                            onClick={() => void changeStatus(vehicle.id, 'INACTIVE')}
                          >
                            {t('admin.fleet.markUnavailable')}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            iconLeft={<PencilIcon className="h-4 w-4" />}
                            onClick={() => navigate(`/admin/vehicules/${vehicle.id}/modifier`)}
                          >
                            {t('admin.fleet.cardEdit')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
