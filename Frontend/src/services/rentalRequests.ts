import { apiRequest } from './api';
import { getAuthSession } from './auth';

export interface RentalRequestInput { firstName: string; lastName: string; phone: string; email: string; city: string; }
export interface RentalRequest extends RentalRequestInput { id: string; createdAt: string; updatedAt?: string; }

export function createRentalRequest(payload: RentalRequestInput) { return apiRequest<{ success: true; message: string; data: RentalRequest }>('/rental-requests', { method: 'POST', body: JSON.stringify(payload) }); }
function extractItems(response: unknown): RentalRequest[] {
  if (Array.isArray(response)) return response as RentalRequest[];
  if (!response || typeof response !== 'object') return [];
  const record = response as Record<string, unknown>;
  if (Array.isArray(record.items)) return record.items as RentalRequest[];
  if (Array.isArray(record.data)) return record.data as RentalRequest[];
  if (record.data && typeof record.data === 'object' && Array.isArray((record.data as Record<string, unknown>).items)) return (record.data as Record<string, unknown>).items as RentalRequest[];
  return [];
}
export async function listRentalRequests(): Promise<RentalRequest[]> { return extractItems(await apiRequest<unknown>('/rental-requests', {}, getAuthSession()?.accessToken)); }
export function deleteRentalRequest(id: string) { return apiRequest<{ ok?: boolean }>(`/rental-requests/${id}`, { method: 'DELETE' }, getAuthSession()?.accessToken); }