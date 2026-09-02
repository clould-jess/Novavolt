import { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2Icon, CheckCircle2Icon, Clock3Icon, MailIcon, PhoneIcon, RotateCcwIcon, SearchIcon, SendIcon, Trash2Icon, CarFrontIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../contexts/I18nContext';
import { useToast } from '../../contexts/ToastContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { CenteredLoading } from '../../components/ui/CenteredLoading';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PageHeading } from '../../components/ui/PageHeading';
import {
  listReservationRequests,
  deleteReservationRequest,
  updateReservationRequestStatus,
  type ReservationRequestRecord,
  type ReservationRequestStatus,
} from '../../services/reservations';

const statusTone: Record<ReservationRequestStatus, 'info' | 'success' | 'neutral'> = {
  NEW: 'info',
  CONTACTED: 'success',
  ARCHIVED: 'neutral',
};

function statusLabel(status: ReservationRequestStatus, t: (key: string) => string): string {
  switch (status) {
    case 'NEW':
      return t('admin.reservations.statusNew');
    case 'CONTACTED':
      return t('admin.reservations.statusContacted');
    case 'ARCHIVED':
      return t('admin.reservations.statusArchived');
    default:
      return status;
  }
}

function nextStatus(status: ReservationRequestStatus): ReservationRequestStatus {
  return status === 'NEW' ? 'CONTACTED' : status === 'CONTACTED' ? 'ARCHIVED' : 'NEW';
}

function requestVehicleLabel(item: ReservationRequestRecord): string {
  const base = item.vehicleLabel ?? item.vehicleId;
  return item.vehicleYear ? `${base} - ${item.vehicleYear}` : base;
}

export function AdminReservations() {
  const { t, dateLong } = useI18n();
  const { showToast } = useToast();
  const [items, setItems] = useState<ReservationRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ReservationRequestRecord | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listReservationRequests();
      setItems(response.items);
    } catch {
      showToast({
        tone: 'error',
        title: t('admin.reservations.loadErrorTitle'),
        body: t('admin.reservations.loadErrorBody'),
      });
    } finally {
      setLoading(false);
    }
  }, [showToast, t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const summary = useMemo(() => {
    return {
      total: items.length,
      pending: items.filter((item) => item.status === 'NEW').length,
      contacted: items.filter((item) => item.status === 'CONTACTED').length,
      archived: items.filter((item) => item.status === 'ARCHIVED').length,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [
        item.vehicleLabel ?? '',
        item.vehicleId,
        item.name,
        item.email,
        item.phone,
        item.pickupAddress ?? '',
        item.rentalUse ?? '',
        item.message ?? '',
        item.status,
      ]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [items, search]);

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageItems = filteredItems.slice((safePage - 1) * pageSize, safePage * pageSize);

  const changeStatus = async (item: ReservationRequestRecord) => {
    const targetStatus = nextStatus(item.status);
    setRefreshingId(item.id);
    try {
      const updated = await updateReservationRequestStatus(item.id, targetStatus);
      setItems((current) => current.map((row) => (row.id === updated.id ? updated : row)));
      showToast({
        tone: 'success',
        title: t('admin.reservations.updateSuccessTitle'),
        body: t('admin.reservations.updateSuccessBody'),
      });
    } catch {
      showToast({
        tone: 'error',
        title: t('admin.reservations.updateErrorTitle'),
        body: t('admin.reservations.updateErrorBody'),
      });
    } finally {
      setRefreshingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeletingId(deleteTarget.id);
    try {
      await deleteReservationRequest(deleteTarget.id);
      setItems((current) => current.filter((row) => row.id !== deleteTarget.id));
      showToast({
        tone: 'success',
        title: t('admin.reservations.deleteSuccessTitle'),
        body: t('admin.reservations.deleteSuccessBody'),
      });
      setDeleteTarget(null);
    } catch {
      showToast({
        tone: 'error',
        title: t('admin.reservations.deleteErrorTitle'),
        body: t('admin.reservations.deleteErrorBody'),
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeading title={t('admin.reservations.title')} description={t('admin.reservations.subtitle')} />
        <CenteredLoading className="min-h-[28rem]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title={t('admin.reservations.title')}
        description={t('admin.reservations.subtitle')}
        action={<Button onClick={() => void load()} variant="secondary">{t('common.refresh')}</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-[0.75rem] text-muted">{t('admin.reservations.total')}</p>
          <p className="mt-2 font-display text-2xl font-semibold text-ink">{summary.total}</p>
        </Card>
        <Card>
          <p className="text-[0.75rem] text-muted">{t('admin.reservations.new')}</p>
          <p className="mt-2 font-display text-2xl font-semibold text-ink">{summary.pending}</p>
        </Card>
        <Card>
          <p className="text-[0.75rem] text-muted">{t('admin.reservations.contacted')}</p>
          <p className="mt-2 font-display text-2xl font-semibold text-ink">{summary.contacted}</p>
        </Card>
        <Card>
          <p className="text-[0.75rem] text-muted">{t('admin.reservations.archived')}</p>
          <p className="mt-2 font-display text-2xl font-semibold text-ink">{summary.archived}</p>
        </Card>
      </div>

      <Card padding="md">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
          <Input
            id="reservations-search"
            label={t('common.search')}
            placeholder={t('common.search')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            iconLeft={<SearchIcon className="h-4 w-4" />}
          />
          <div className="text-right text-2xs text-muted">
            {filteredItems.length} / {items.length}
          </div>
        </div>
      </Card>

      {items.length === 0 ? (
        <EmptyState
          icon={<Building2Icon className="h-6 w-6" />}
          title={t('admin.reservations.emptyTitle')}
          body={t('admin.reservations.emptyBody')}
        />
      ) : pageItems.length === 0 ? (
        <EmptyState
          icon={<Building2Icon className="h-6 w-6" />}
          title={t('common.noResults')}
          body={t('admin.reservations.emptyBody')}
        />
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            {pageItems.map((item) => (
              <Card key={item.id} className={item.status === 'ARCHIVED' ? 'opacity-75' : ''}>
                <CardHeader
                  title={
                    <div className="flex flex-wrap items-center gap-2">
                      <span>{requestVehicleLabel(item)}</span>
                      <Badge tone={statusTone[item.status]}>{statusLabel(item.status, t)}</Badge>
                      {!item.emailDelivered && <Badge tone="warn">{t('admin.reservations.emailPending')}</Badge>}
                    </div>
                  }
                  description={`${item.name} - ${item.email}`}
                  action={<span className="text-2xs text-muted">{dateLong(item.createdAt)}</span>}
                />

                <div className="mt-4 grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
                  <div className="space-y-3">
                    <div className="rounded-xl border border-line bg-soft p-4">
                      <div className="flex items-center gap-2 text-2xs font-semibold uppercase tracking-wide text-muted">
                        <CarFrontIcon className="h-3.5 w-3.5" />
                        {t('admin.reservations.vehicle')}
                      </div>
                      <p className="mt-2 text-sm font-medium text-ink">{requestVehicleLabel(item)}</p>
                      {item.pickupAddress && (
                        <p className="mt-2 text-xs text-body">
                          <span className="font-semibold text-ink">{t('admin.reservations.pickupAddress')} : </span>
                          <span>{item.pickupAddress}</span>
                        </p>
                      )}
                      {item.rentalUse && (
                        <div className="mt-1.5 flex items-center gap-2 text-xs text-body">
                          <span className="font-semibold text-ink">{t('admin.reservations.rentalUse')} : </span>
                          <Badge tone="info" size="sm">
                            {item.rentalUse === 'PERSONAL'
                              ? t('admin.reservations.rentalUsePersonal')
                              : t('admin.reservations.rentalUseRideshare')}
                          </Badge>
                        </div>
                      )}
                      {item.startAt && item.endAt && (
                        <p className="mt-2 text-xs text-muted">
                          <span className="font-semibold text-ink">{t('admin.reservations.dates')} : </span>
                          {new Date(item.startAt).toLocaleDateString()} - {new Date(item.endAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl border border-line bg-soft p-4">
                      <div className="flex items-center gap-2 text-2xs font-semibold uppercase tracking-wide text-muted">
                        <Clock3Icon className="h-3.5 w-3.5" />
                        {t('admin.reservations.message')}
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-body">
                        {item.message || t('admin.reservations.noMessage')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button href={`mailto:${item.email}`} variant="primary" size="sm" iconLeft={<MailIcon className="h-4 w-4" />}>
                      {t('admin.reservations.emailLead')}
                    </Button>
                    <Button href={`tel:${item.phone.replace(/[^\d+]/g, '')}`} variant="secondary" size="sm" iconLeft={<PhoneIcon className="h-4 w-4" />}>
                      {t('admin.reservations.callLead')}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      iconLeft={item.status === 'NEW' ? <CheckCircle2Icon className="h-4 w-4" /> : item.status === 'CONTACTED' ? <RotateCcwIcon className="h-4 w-4" /> : <SendIcon className="h-4 w-4" />}
                      loading={refreshingId === item.id}
                      disabled={deletingId !== null}
                      onClick={() => void changeStatus(item)}
                    >
                      {item.status === 'NEW'
                        ? t('admin.reservations.markContacted')
                        : item.status === 'CONTACTED'
                          ? t('admin.reservations.archiveLead')
                          : t('admin.reservations.reopenLead')}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      loading={deletingId === item.id}
                      disabled={refreshingId !== null}
                      iconLeft={<Trash2Icon className="h-4 w-4" />}
                      onClick={() => setDeleteTarget(item)}
                    >
                      {t('common.remove')}
                    </Button>
                    <Button to={`/vehicules/${item.vehicleId}`} variant="ghost" size="sm">
                      {t('admin.reservations.viewVehicle')}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted">
              {safePage} / {pageCount}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                {t('common.previous')}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={safePage >= pageCount}
                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              >
                {t('common.next')}
              </Button>
            </div>
          </div>
        </>
      )}

      <Card tone="soft" className="flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-base font-semibold text-ink">{t('admin.reservations.footerTitle')}</p>
          <p className="text-xs text-muted">{t('admin.reservations.footerBody')}</p>
        </div>
        <Link to="/admin/vehicules" className="text-sm font-semibold text-action hover:underline">
          {t('admin.fleet.addVehicle')}
        </Link>
      </Card>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={t('admin.reservations.deleteTitle')}
        description={deleteTarget ? t('admin.reservations.deleteConfirm') : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" loading={deleteTarget ? deletingId === deleteTarget.id : false} onClick={() => void confirmDelete()}>
              {t('common.confirm')}
            </Button>
          </>
        }
      />
    </div>
  );
}
