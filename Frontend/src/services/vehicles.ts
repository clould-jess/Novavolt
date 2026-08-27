import { apiRequest } from './api';
import { getAuthSession } from './auth';

export type AdminVehicleStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'RENTED'
  | 'MAINTENANCE'
  | 'INACTIVE';

export type AdminVehiclePowertrain = 'ELECTRIC' | 'HYBRID' | 'PLUG_IN_HYBRID';

export interface AdminVehiclePhoto {
  id: string;
  altText?: string | null;
  sortOrder: number;
  uploadedAt?: string | null;
  malwareScanStatus: string;
  imagekitUrl?: string | null;
  imagekitThumbnailUrl?: string | null;
}

export interface AdminVehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color?: string | null;
  city?: string | null;
  seats?: number | null;
  rangeKm?: number | null;
  description?: string | null;
  plate: string;
  powertrain: AdminVehiclePowertrain;
  odometer: number;
  weeklyRateCents: number;
  currency: string;
  status: AdminVehicleStatus;
  createdAt: string;
  updatedAt: string;
  photos: AdminVehiclePhoto[];
}

export interface StaffVehicleListResponse {
  items: AdminVehicle[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateVehiclePayload {
  vin: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  city: string;
  seats: number;
  rangeKm: number;
  description?: string;
  plate: string;
  powertrain: AdminVehiclePowertrain;
  odometer: number;
  weeklyRateCents: number;
}

export interface UpdateVehiclePayload {
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  city?: string;
  seats?: number;
  rangeKm?: number;
  description?: string;
  powertrain?: AdminVehiclePowertrain;
  odometer?: number;
  weeklyRateCents?: number;
}

export interface VehicleStatusPayload {
  status: AdminVehicleStatus;
}

export interface CreateVehiclePhotoUploadPayload {
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  sizeBytes: number;
  altText?: string;
  sortOrder?: number;
}

export interface CreateVehiclePhotoUploadResponse {
  photoId: string;
  uploadUrl: string;
  publicKey: string;
  token: string;
  expire: number;
  signature: string;
  folder: string;
  fileName: string;
  urlEndpoint: string;
  expiresInSeconds: number;
}

export interface CompleteVehiclePhotoUploadPayload {
  imagekitFileId: string;
  imagekitFilePath: string;
  imagekitUrl: string;
  imagekitThumbnailUrl?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
}

export interface PhotoDownloadResponse {
  url: string;
  expiresInSeconds: number;
}

function getToken(): string | undefined {
  return getAuthSession()?.accessToken;
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue;
    search.set(key, String(value));
  }
  return search.toString();
}

export async function listStaffVehicles(query: {
  page?: number;
  limit?: number;
  status?: AdminVehicleStatus;
  powertrain?: AdminVehiclePowertrain;
  maxWeeklyRateCents?: number;
} = {}): Promise<StaffVehicleListResponse> {
  const qs = buildQuery(query);
  return apiRequest<StaffVehicleListResponse>(
    `/vehicles/staff${qs ? `?${qs}` : ''}`,
    {},
    getToken()
  );
}

export async function createVehicle(payload: CreateVehiclePayload): Promise<AdminVehicle> {
  return apiRequest<AdminVehicle>('/vehicles', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, getToken());
}

export async function updateVehicle(id: string, payload: UpdateVehiclePayload): Promise<AdminVehicle> {
  return apiRequest<AdminVehicle>(`/vehicles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, getToken());
}

export async function updateVehicleStatus(
  id: string,
  payload: VehicleStatusPayload
): Promise<AdminVehicle> {
  return apiRequest<AdminVehicle>(`/vehicles/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, getToken());
}

export async function startVehiclePhotoUpload(
  vehicleId: string,
  payload: CreateVehiclePhotoUploadPayload
): Promise<CreateVehiclePhotoUploadResponse> {
  return apiRequest<CreateVehiclePhotoUploadResponse>(
    `/vehicles/${vehicleId}/photos/upload`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    getToken()
  );
}

export async function completeVehiclePhotoUpload(
  vehicleId: string,
  photoId: string,
  payload: CompleteVehiclePhotoUploadPayload,
) {
  return apiRequest(`/vehicles/${vehicleId}/photos/${photoId}/complete`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, getToken());
}

export async function deleteVehiclePhoto(vehicleId: string, photoId: string) {
  return apiRequest(`/vehicles/${vehicleId}/photos/${photoId}`, {
    method: 'DELETE',
  }, getToken());
}

export async function getVehiclePhotoDownloadUrl(vehicleId: string, photoId: string) {
  return apiRequest<PhotoDownloadResponse>(`/vehicles/${vehicleId}/photos/${photoId}`, {}, getToken());
}
