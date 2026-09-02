import { apiRequest } from './api';
import { getAuthSession } from './auth';

export type ReservationRequestStatus = 'NEW' | 'CONTACTED' | 'ARCHIVED';

export interface CreateReservationRequestInput {
  vehicleId: string;
  name: string;
  email: string;
  phone: string;
  pickupAddress: string;
  rentalUse: 'PERSONAL' | 'RIDESHARE';
  message?: string | null;
}

export interface ReservationRequestRecord extends CreateReservationRequestInput {
  id: string;
  vehicleLabel: string | null;
  vehicleYear: number | null;
  vehicleStatus: string | null;
  status: ReservationRequestStatus;
  emailSentAt: string | null;
  emailError: string | null;
  createdAt: string;
  updatedAt: string;
  emailDelivered: boolean;
  startAt?: string | null;
  endAt?: string | null;
}

export interface ReservationRequestListResponse {
  items: ReservationRequestRecord[];
  total: number;
  page: number;
  limit: number;
}

function getToken(): string | undefined {
  return getAuthSession()?.accessToken;
}

export async function createReservationRequest(
  payload: CreateReservationRequestInput,
): Promise<ReservationRequestRecord> {
  return apiRequest<ReservationRequestRecord>('/reservation-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listReservationRequests(
  limit = 100,
): Promise<ReservationRequestListResponse> {
  return apiRequest<ReservationRequestListResponse>(
    `/reservation-requests?limit=${limit}`,
    {},
    getToken(),
  );
}

export async function updateReservationRequestStatus(
  id: string,
  status: ReservationRequestStatus,
): Promise<ReservationRequestRecord> {
  return apiRequest<ReservationRequestRecord>(
    `/reservation-requests/${id}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
    getToken(),
  );
}

export async function deleteReservationRequest(id: string): Promise<{ deleted: true }> {
  return apiRequest<{ deleted: true }>(
    `/reservation-requests/${id}`,
    {
      method: 'DELETE',
    },
    getToken(),
  );
}
