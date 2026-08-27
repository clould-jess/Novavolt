import { apiRequest } from './api';
import { getAuthSession } from './auth';

export type PartnershipLeadStatus = 'NEW' | 'CONTACTED' | 'ARCHIVED';

export interface CreatePartnershipLeadInput {
  name: string;
  email: string;
  phone: string;
  company: string;
  vehicleCount: '1-5' | '6-20' | '20+';
  message?: string | null;
}

export interface PartnershipLeadRecord extends CreatePartnershipLeadInput {
  id: string;
  status: PartnershipLeadStatus;
  message: string | null;
  emailSentAt: string | null;
  emailError: string | null;
  createdAt: string;
  updatedAt: string;
  emailDelivered: boolean;
}

export interface PartnershipLeadListResponse {
  items: PartnershipLeadRecord[];
  total: number;
  page: number;
  limit: number;
}

function getToken(): string | undefined {
  return getAuthSession()?.accessToken;
}

export async function createPartnershipLead(
  payload: CreatePartnershipLeadInput,
): Promise<PartnershipLeadRecord> {
  return apiRequest<PartnershipLeadRecord>('/partnership-leads', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listPartnershipLeads(limit = 100): Promise<PartnershipLeadListResponse> {
  return apiRequest<PartnershipLeadListResponse>(`/partnership-leads?limit=${limit}`, {}, getToken());
}

export async function updatePartnershipLeadStatus(
  id: string,
  status: PartnershipLeadStatus,
): Promise<PartnershipLeadRecord> {
  return apiRequest<PartnershipLeadRecord>(`/partnership-leads/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }, getToken());
}

export async function deletePartnershipLead(id: string): Promise<{ deleted: true }> {
  return apiRequest<{ deleted: true }>(
    `/partnership-leads/${id}`,
    {
      method: 'DELETE',
    },
    getToken(),
  );
}
