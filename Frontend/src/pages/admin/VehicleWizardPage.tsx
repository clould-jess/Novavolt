import { useEffect, useMemo, useState } from 'react';
import {
  CameraIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SaveIcon,
  UploadIcon,
} from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useI18n } from '../../contexts/I18nContext';
import { useToast } from '../../contexts/ToastContext';
import {
  completeVehiclePhotoUpload,
  createVehicle,
  deleteVehiclePhoto,
  listStaffVehicles,
  startVehiclePhotoUpload,
  updateVehicle,
  updateVehicleStatus,
  type AdminVehicle,
  type AdminVehiclePhoto,
  type AdminVehiclePowertrain,
  type AdminVehicleStatus,
} from '../../services/vehicles';
import { formatDate } from '../../utils/format';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { CenteredLoading } from '../../components/ui/CenteredLoading';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { PageHeading } from '../../components/ui/PageHeading';
import { PhotoCarousel } from '../../components/ui/PhotoCarousel';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Textarea } from '../../components/ui/Textarea';
import { VehicleImage } from '../../components/ui/VehicleImage';

type VehicleFormState = {
  vin: string;
  make: string;
  model: string;
  year: string;
  color: string;
  city: string;
  seats: string;
  rangeKm: string;
  description: string;
  plate: string;
  powertrain: AdminVehiclePowertrain;
  odometer: string;
  weeklyRateCents: string;
  status: AdminVehicleStatus;
};

type InlineFeedback = {
  tone: 'success' | 'danger' | 'info';
  text: string;
};

const MAX_VEHICLE_PHOTOS = 5;

const emptyForm: VehicleFormState = {
  vin: '',
  make: '',
  model: '',
  year: String(new Date().getFullYear()),
  color: '',
  city: '',
  seats: '4',
  rangeKm: '350',
  description: '',
  plate: '',
  powertrain: 'ELECTRIC',
  odometer: '0',
  weeklyRateCents: '1000',
  status: 'AVAILABLE',
};

const statusOptions: Array<{ value: AdminVehicleStatus; labelKey: string }> = [
  { value: 'AVAILABLE', labelKey: 'badge.available' },
  { value: 'RESERVED', labelKey: 'badge.reserved' },
  { value: 'RENTED', labelKey: 'badge.rented' },
  { value: 'MAINTENANCE', labelKey: 'badge.maintenance' },
  { value: 'INACTIVE', labelKey: 'badge.unavailable' },
];

const powertrainOptions: Array<{ value: AdminVehiclePowertrain; labelKey: string }> = [
  { value: 'ELECTRIC', labelKey: 'powertrain.electric' },
  { value: 'HYBRID', labelKey: 'powertrain.hybrid' },
  { value: 'PLUG_IN_HYBRID', labelKey: 'powertrain.plugInHybrid' },
];

function sortVehiclePhotos(photos: AdminVehiclePhoto[]) {
  return [...photos].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder;
    return left.id.localeCompare(right.id);
  });
}

function mapStatusToBadge(value: AdminVehicleStatus): string {
  return value === 'INACTIVE' ? 'unavailable' : value.toLowerCase();
}

function normalizeVehicleForm(vehicle: AdminVehicle): VehicleFormState {
  return {
    vin: vehicle.vin,
    make: vehicle.make,
    model: vehicle.model,
    year: String(vehicle.year),
    color: vehicle.color ?? '',
    city: vehicle.city ?? '',
    seats: String(vehicle.seats ?? 4),
    rangeKm: String(vehicle.rangeKm ?? 350),
    description: vehicle.description ?? '',
    plate: vehicle.plate,
    powertrain: vehicle.powertrain,
    odometer: String(vehicle.odometer),
    weeklyRateCents: String(vehicle.weeklyRateCents),
    status: vehicle.status,
  };
}

function normalizeUpdatePayload(form: VehicleFormState) {
  return {
    make: form.make.trim(),
    model: form.model.trim(),
    year: Number(form.year),
    color: form.color.trim() || undefined,
    city: form.city.trim() || undefined,
    seats: Number(form.seats),
    rangeKm: Number(form.rangeKm),
    description: form.description.trim() || undefined,
    powertrain: form.powertrain,
    odometer: Number(form.odometer),
    weeklyRateCents: Number(form.weeklyRateCents),
  };
}

function normalizeCreatePayload(form: VehicleFormState) {
  return {
    vin: form.vin.trim().toUpperCase(),
    plate: form.plate.trim().toUpperCase(),
    ...normalizeUpdatePayload(form),
    city: form.city.trim(),
  };
}

function makePhotoLabel(photo: AdminVehiclePhoto, index: number) {
  const base = photo.altText?.trim() || `Photo ${index + 1}`;
  return `${base} #${photo.sortOrder}`;
}

async function readResponseError(response: Response) {
  const raw = await response.text();
  if (!raw) {
    return `Request failed with status ${response.status}`;
  }
  try {
    const parsed = JSON.parse(raw) as { message?: string | string[]; error?: string };
    if (Array.isArray(parsed.message)) return parsed.message.join(', ');
    if (typeof parsed.message === 'string') return parsed.message;
    if (typeof parsed.error === 'string') return parsed.error;
  } catch {
    // ignore
  }
  return raw.slice(0, 240);
}

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong';
}

async function uploadPhoto(
  vehicle: AdminVehicle,
  photoFile: File,
  photoAltText: string,
  photoSortOrder: string,
) {
  const upload = await startVehiclePhotoUpload(vehicle.id, {
    mimeType: photoFile.type as 'image/jpeg' | 'image/png' | 'image/webp',
    sizeBytes: photoFile.size,
    altText: photoAltText.trim() || undefined,
    sortOrder: Number(photoSortOrder) || vehicle.photos.length,
  });

  const formData = new FormData();
  formData.set('file', photoFile);
  formData.set('fileName', upload.fileName);
  formData.set('folder', upload.folder);
  formData.set('publicKey', upload.publicKey);
  formData.set('token', upload.token);
  formData.set('expire', String(upload.expire));
  formData.set('signature', upload.signature);
  formData.set('useUniqueFileName', 'false');

  const uploadResponse = await fetch(upload.uploadUrl, {
    method: 'POST',
    body: formData,
  });

  if (!uploadResponse.ok) {
    throw new Error(await readResponseError(uploadResponse));
  }

  const result = (await uploadResponse.json()) as {
    fileId: string;
    filePath: string;
    url: string;
    thumbnailUrl?: string;
    size?: number;
    width?: number;
    height?: number;
  };

  await completeVehiclePhotoUpload(vehicle.id, upload.photoId, {
    imagekitFileId: result.fileId,
    imagekitFilePath: result.filePath,
    imagekitUrl: result.url,
    imagekitThumbnailUrl: result.thumbnailUrl,
    sizeBytes: result.size,
    width: result.width,
    height: result.height,
  });

  return upload.photoId;
}

export function AdminVehicleWizardPage() {
  const { t, locale, num } = useI18n();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const isCreate = !id;
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AdminVehicle[]>([]);
  const [draft, setDraft] = useState<VehicleFormState>(emptyForm);
  const [step, setStep] = useState(Number(searchParams.get('step') ?? '0') || 0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoAltText, setPhotoAltText] = useState('');
  const [photoSortOrder, setPhotoSortOrder] = useState('0');
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoFeedback, setPhotoFeedback] = useState<InlineFeedback | null>(null);
  const [photoDeletingId, setPhotoDeletingId] = useState<string | null>(null);

  const vehicle = useMemo(
    () => items.find((item) => item.id === id) ?? null,
    [items, id],
  );

  const photos = useMemo(() => (vehicle ? sortVehiclePhotos(vehicle.photos) : []), [vehicle]);
  const photoCount = photos.length;
  const canUploadMorePhotos = photoCount < MAX_VEHICLE_PHOTOS;

  useEffect(() => {
    const load = async () => {
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
    };

    void load();
  }, []);

  useEffect(() => {
    setStep(Number(searchParams.get('step') ?? '0') || 0);
  }, [searchParams]);

  useEffect(() => {
    if (isCreate) {
      setDraft(emptyForm);
      setPhotoAltText('');
      setPhotoSortOrder('0');
      return;
    }
    if (vehicle) {
      setDraft(normalizeVehicleForm(vehicle));
      setPhotoAltText(vehicle.make);
      setPhotoSortOrder(String(photos.length));
    }
  }, [vehicle?.id, isCreate]);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPhotoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  const goToStep = (nextStep: number) => {
    const value = Math.min(Math.max(nextStep, 0), 2);
    setStep(value);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('step', String(value));
    setSearchParams(nextParams);
  };

  const saveVehicle = async () => {
    if (!draft.make.trim() || !draft.model.trim()) throw new Error('Make and model are required');
    if (!draft.city.trim()) throw new Error('City is required');
    if (!draft.vin.trim()) throw new Error('VIN is required');
    if (!draft.plate.trim()) throw new Error('Plate is required');
    if (!draft.seats.trim() || Number.isNaN(Number(draft.seats))) throw new Error('Seats must be a valid number');
    if (!draft.rangeKm.trim() || Number.isNaN(Number(draft.rangeKm))) throw new Error('Range must be a valid number');
    if (!draft.weeklyRateCents.trim() || Number.isNaN(Number(draft.weeklyRateCents)) || Number(draft.weeklyRateCents) < 1) {
      throw new Error('Weekly rate must be at least 1');
    }

    if (isCreate) {
      const created = await createVehicle(normalizeCreatePayload(draft));
      await updateVehicleStatus(created.id, { status: draft.status });
      return created;
    }

    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    const updated = await updateVehicle(vehicle.id, normalizeUpdatePayload(draft));
    if (draft.status !== vehicle.status) {
      await updateVehicleStatus(vehicle.id, { status: draft.status });
    }
    return updated;
  };

  const handlePrimary = async () => {
    if (step < 1) {
      goToStep(step + 1);
      return;
    }

    if (step === 1) {
      setSaving(true);
      setError(null);
      try {
        const saved = await saveVehicle();
        showToast({
          tone: 'success',
          title: isCreate ? 'Vehicle created' : 'Vehicle updated',
          body: `${draft.make.trim()} ${draft.model.trim()}`.trim(),
        });
        if (saved?.id) {
          navigate(`/admin/vehicules/${saved.id}/modifier?step=2`, { replace: true });
        }
      } catch (err) {
        const message = toErrorMessage(err);
        setError(message);
        showToast({ tone: 'error', title: t('common.error'), body: message });
      } finally {
        setSaving(false);
      }
      return;
    }

    if (isCreate) {
      setSaving(true);
      setUploading(true);
      setError(null);
      try {
        const saved = await saveVehicle();
        if (photoFile) {
          await uploadPhoto(saved, photoFile, photoAltText, photoSortOrder);
        }
        showToast({
          tone: 'success',
          title: photoFile ? 'Vehicle created and first photo uploaded' : 'Vehicle created',
          body: `${draft.make.trim()} ${draft.model.trim()}`.trim(),
        });
        navigate(`/admin/vehicules/${saved.id}/modifier?step=2`, { replace: true });
      } catch (err) {
        const message = toErrorMessage(err);
        setError(message);
        showToast({ tone: 'error', title: t('common.error'), body: message });
      } finally {
        setUploading(false);
        setSaving(false);
      }
      return;
    }

    if (!vehicle) {
      return;
    }

    if (photoFile) {
      setUploading(true);
      setPhotoFeedback(null);
      try {
        await saveVehicle();
        const draftPhotoId = await uploadPhoto(vehicle, photoFile, photoAltText, photoSortOrder);
        showToast({
          tone: 'success',
          title: 'Photo uploaded',
          body: `${vehicle.make} ${vehicle.model}`,
        });
        setPhotoFile(null);
        setPhotoAltText(vehicle.make);
        setPhotoSortOrder(String(photoCount + 1));
        setItems((current) => current.map((item) => (item.id === vehicle.id ? { ...item } : item)));
        setPhotoFeedback({ tone: 'success', text: `Photo ${draftPhotoId} uploaded` });
      } catch (err) {
        const message = toErrorMessage(err);
        setPhotoFeedback({ tone: 'danger', text: message });
        showToast({ tone: 'error', title: t('common.error'), body: message });
      } finally {
        setUploading(false);
      }
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await saveVehicle();
      showToast({
        tone: 'success',
        title: 'Vehicle updated',
        body: `${draft.make.trim()} ${draft.model.trim()}`.trim(),
      });
    } catch (err) {
      const message = toErrorMessage(err);
      setError(message);
      showToast({ tone: 'error', title: t('common.error'), body: message });
    } finally {
      setSaving(false);
    }
  };

  const removePhoto = async (photoId: string) => {
    if (!vehicle) return;
    setPhotoDeletingId(photoId);
    try {
      await deleteVehiclePhoto(vehicle.id, photoId);
      showToast({ tone: 'info', title: 'Photo removed', body: `${vehicle.make} ${vehicle.model}` });
      const response = await listStaffVehicles({ page: 1, limit: 100 });
      setItems(response.items);
    } catch (err) {
      const message = toErrorMessage(err);
      showToast({ tone: 'error', title: t('common.error'), body: message });
    } finally {
      setPhotoDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title={isCreate ? t('admin.fleet.createWizardTitle') : t('admin.fleet.editWizardTitle')}
        description={isCreate ? t('admin.fleet.wizardIntroCreate') : t('admin.fleet.wizardIntroEdit')}
        action={
          <Button variant="secondary" iconLeft={<ChevronLeftIcon className="h-4 w-4" />} onClick={() => navigate('/admin/vehicules')}>
            {t('common.back')}
          </Button>
        }
      />

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <CenteredLoading className="min-h-[28rem]" />
      ) : (
      <Card padding="md">
        <CardHeader
          title={`${t('common.step')} ${step + 1} / 3`}
          description={
            step === 0
              ? t('admin.fleet.wizardStepListing')
              : step === 1
                ? t('admin.fleet.wizardStepFleet')
                : t('admin.fleet.wizardStepPhotos')
          }
        />

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {[t('admin.fleet.wizardStepListing'), t('admin.fleet.wizardStepFleet'), t('admin.fleet.wizardStepPhotos')].map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => goToStep(index)}
              className={[
                'rounded-xl border px-4 py-3 text-left transition-colors',
                step === index ? 'border-action bg-sky-50 text-action' : 'border-line bg-white text-body hover:border-sky-300',
              ].join(' ')}
            >
              <p className="text-2xs font-semibold uppercase tracking-wide">
                {t('common.step')} {index + 1}
              </p>
              <p className="mt-1 font-semibold">{label}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-6">
          {step === 0 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-action">
                {isCreate ? t('admin.fleet.wizardIntroCreate') : t('admin.fleet.wizardIntroEdit')}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input id="vehicle-make" label={t('admin.fleet.fieldMake')} value={draft.make} onChange={(event) => setDraft({ ...draft, make: event.target.value })} />
                <Input id="vehicle-model" label={t('admin.fleet.fieldModel')} value={draft.model} onChange={(event) => setDraft({ ...draft, model: event.target.value })} />
                <Input id="vehicle-year" label={t('admin.fleet.fieldYear')} type="number" min={2015} max={2035} value={draft.year} onChange={(event) => setDraft({ ...draft, year: event.target.value })} />
                <Input id="vehicle-city" label={t('admin.fleet.fieldCity')} value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.target.value })} />
                <Input id="vehicle-color" label={t('admin.fleet.fieldColor')} value={draft.color} onChange={(event) => setDraft({ ...draft, color: event.target.value })} />
                <Select
                  id="vehicle-powertrain"
                  label={t('admin.fleet.fieldPowertrain')}
                  value={draft.powertrain}
                  onChange={(event) => setDraft({ ...draft, powertrain: event.target.value as AdminVehiclePowertrain })}
                  options={powertrainOptions.map((option) => ({ value: option.value, label: t(option.labelKey) }))}
                />
              </div>
              <Textarea
                id="vehicle-description"
                label={t('admin.fleet.fieldDescription')}
                value={draft.description}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                hint={t('admin.fleet.descriptionHint')}
                rows={4}
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-action">
                {t('admin.fleet.internalSectionBody')}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input id="vehicle-vin" label={t('admin.fleet.fieldVin')} value={draft.vin} onChange={(event) => setDraft({ ...draft, vin: event.target.value })} />
                <Input id="vehicle-plate" label={t('admin.fleet.fieldPlate')} value={draft.plate} onChange={(event) => setDraft({ ...draft, plate: event.target.value })} />
                <Input id="vehicle-seats" label={t('admin.fleet.fieldSeats')} type="number" min={1} max={9} value={draft.seats} onChange={(event) => setDraft({ ...draft, seats: event.target.value })} />
                <Input id="vehicle-range" label={t('admin.fleet.fieldRangeKm')} type="number" min={1} max={2000} value={draft.rangeKm} onChange={(event) => setDraft({ ...draft, rangeKm: event.target.value })} />
                <Input id="vehicle-odometer" label={t('admin.fleet.fieldOdometer')} type="number" min={0} value={draft.odometer} onChange={(event) => setDraft({ ...draft, odometer: event.target.value })} />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-ink">{t('admin.fleet.statusLabel')}</p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDraft({ ...draft, status: option.value })}
                      className={[
                        'rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors',
                        draft.status === option.value ? 'border-action bg-sky-50 text-action' : 'border-line bg-white text-body hover:border-sky-300',
                      ].join(' ')}
                    >
                      {t(option.labelKey)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <PhotoCarousel
                className="shadow-card"
                imgClassName="object-cover"
                showThumbnails={photoCount > 1}
                items={[
                  ...(photoPreviewUrl
                    ? [{ src: photoPreviewUrl, alt: vehicle ? `${vehicle.make} ${vehicle.model}` : t('admin.fleet.previewTitle') }]
                    : []),
                  ...photos
                      .map((photo) => {
                        const fallbackAlt = `${vehicle?.make ?? ''} ${vehicle?.model ?? ''}`.trim();
                        const alt = photo.altText ?? fallbackAlt;
                        return {
                          src: photo.imagekitThumbnailUrl ?? photo.imagekitUrl ?? '',
                          alt: alt || t('admin.fleet.previewTitle'),
                        };
                      })
                    .filter((item) => item.src),
                ]}
                emptyState={
                  <div className="overflow-hidden rounded-card border border-line bg-white">
                    <div className="flex min-h-[18rem] flex-col items-center justify-center gap-2 bg-surface text-muted">
                      <CameraIcon className="h-8 w-8" />
                      <p className="font-semibold text-ink">{t('admin.fleet.previewTitle')}</p>
                      <p className="text-sm">{t('admin.fleet.photoHint')}</p>
                    </div>
                  </div>
                }
              />
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="inverse">
                  {num(photoCount)}/{MAX_VEHICLE_PHOTOS}
                </Badge>
                {vehicle && <StatusBadge kind="vehicle" value={mapStatusToBadge(vehicle.status)} />}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Input id="photo-alt" label={t('admin.fleet.photoAlt')} value={photoAltText} onChange={(event) => setPhotoAltText(event.target.value)} hint={t('admin.fleet.photoAltHint')} />
                <Input id="photo-sort" label={t('admin.fleet.photoOrder')} type="number" min={0} max={100} value={photoSortOrder} onChange={(event) => setPhotoSortOrder(event.target.value)} />
              </div>

              <div className="grid gap-3 sm:grid-cols-[1.4fr_0.6fr]">
                <Input
                  id="vehicle-photo-file"
                  label={t('admin.fleet.photoFile')}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={!vehicle && !isCreate}
                  onChange={(event) => {
                    setPhotoFile(event.target.files?.[0] ?? null);
                    setPhotoFeedback(null);
                  }}
                />
                <div className="flex items-end">
                  <Button
                    fullWidth
                    iconLeft={<UploadIcon className="h-4 w-4" />}
                    loading={uploading}
                    disabled={!photoFile || !canUploadMorePhotos}
                    onClick={() => void handlePrimary()}
                  >
                    {isCreate && photoFile ? t('admin.fleet.createAndUploadFirstPhoto') : t('admin.fleet.uploadPhoto')}
                  </Button>
                </div>
              </div>

              {photoFeedback && (
                <div
                  className={[
                    'rounded-xl px-4 py-3 text-sm',
                    photoFeedback.tone === 'success'
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                      : photoFeedback.tone === 'danger'
                        ? 'border border-red-200 bg-red-50 text-red-700'
                        : 'border border-sky-200 bg-sky-50 text-action',
                  ].join(' ')}
                >
                  {photoFeedback.text}
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-base font-semibold text-ink">{t('admin.fleet.photosTitle')}</p>
                    <p className="text-sm text-muted">{t('admin.fleet.photoHelper')}</p>
                  </div>
                  <Badge tone="neutral">
                    {num(photoCount)}/{MAX_VEHICLE_PHOTOS}
                  </Badge>
                </div>

                {!vehicle ? (
                  <EmptyState
                    icon={<CameraIcon className="h-5 w-5" />}
                    title={t('admin.fleet.selectVehicle')}
                    body={t('admin.fleet.photoHint')}
                  />
                ) : photos.length === 0 ? (
                  <EmptyState
                    icon={<CameraIcon className="h-5 w-5" />}
                    title={t('admin.fleet.noPhotos')}
                    body={t('admin.fleet.noPhotosBody')}
                  />
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {photos.map((photo, index) => {
                      const url = photo.imagekitThumbnailUrl ?? photo.imagekitUrl ?? undefined;
                      return (
                        <div key={photo.id} className="overflow-hidden rounded-card border border-line bg-white">
                          <div className="relative aspect-[4/3] bg-surface">
                            {url ? (
                              <VehicleImage src={url} alt={photo.altText ?? `${vehicle.make} ${vehicle.model}`} className="h-full w-full" imgClassName="object-cover" />
                            ) : (
                              <div className="grid h-full place-items-center text-muted">{t('common.loading')}</div>
                            )}
                            <div className="absolute left-3 top-3">
                              <Badge tone="accent">#{photo.sortOrder}</Badge>
                            </div>
                            <div className="absolute right-3 top-3">
                              <Badge tone={photo.uploadedAt ? 'success' : 'warn'}>
                                {photo.uploadedAt ? t('admin.fleet.photoReady') : t('admin.fleet.photoPending')}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-3 p-4">
                            <div>
                              <p className="text-sm font-semibold text-ink">{makePhotoLabel(photo, index)}</p>
                              <p className="mt-1 text-[0.75rem] text-muted">
                                {photo.uploadedAt ? formatDate(photo.uploadedAt, locale) : t('admin.fleet.photoPending')}
                              </p>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-[0.75rem] font-semibold text-action">{photo.uploadedAt ? 'Published' : 'Pending'}</span>
                              <Button
                                variant="danger"
                                size="sm"
                                loading={photoDeletingId === photo.id}
                                onClick={() => void removePhoto(photo.id)}
                              >
                                {t('common.remove')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <Button
              variant="secondary"
              iconLeft={<ChevronLeftIcon className="h-4 w-4" />}
              disabled={step === 0}
              onClick={() => goToStep(step - 1)}
            >
              {t('common.back')}
            </Button>
            <div className="flex flex-wrap gap-3">
              {step < 2 ? (
                <Button onClick={() => void handlePrimary()} loading={saving} iconRight={<ChevronRightIcon className="h-4 w-4" />}>
                  {step === 1 ? t('admin.fleet.saveAndContinue') : t('common.next')}
                </Button>
              ) : (
                <Button onClick={() => void handlePrimary()} loading={saving} iconLeft={<SaveIcon className="h-4 w-4" />}>
                  {isCreate && photoFile ? t('admin.fleet.createAndUploadFirstPhoto') : isCreate ? t('common.submit') : t('common.save')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
      )}
    </div>
  );
}
