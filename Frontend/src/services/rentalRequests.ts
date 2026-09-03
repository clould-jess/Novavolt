import { apiRequest } from './api';
import { getAuthSession } from './auth';

export interface RentalRequestInput {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
}

export interface RentalRequest extends RentalRequestInput {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

type RentalRequestListResponse = { items: RentalRequest[]; total?: number } | RentalRequest[];

export function createRentalRequest(payload: RentalRequestInput) {
  return apiRequest<{ success: true; message: string; data: RentalRequest }>('/rental-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listRentalRequests(): Promise<RentalRequest[]> {
  const response = await apiRequest<RentalRequestListResponse>(
    '/rental-requests',
    {},
    getAuthSession()?.accessToken,
  );
  return Array.isArray(response) ? response : response.items;
}

export function deleteRentalRequest(id: string) {
  return apiRequest<{ ok?: boolean }>(`/rental-requests/${id}`, { method: 'DELETE' }, getAuthSession()?.accessToken);
}
