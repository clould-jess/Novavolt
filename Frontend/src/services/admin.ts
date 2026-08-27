import { apiRequest } from './api';
import { getAuthSession } from './auth';
import type { DashboardKPIs } from '../types';

export interface AdminDashboardResponse extends DashboardKPIs {
  users: number;
  pendingApplications: number;
  openInvoices: number;
  collectedRevenueCents: number;
  currency: 'CAD';
}

function getToken(): string | undefined {
  return getAuthSession()?.accessToken;
}

export async function getAdminDashboard(): Promise<AdminDashboardResponse> {
  return apiRequest<AdminDashboardResponse>('/admin/dashboard', {}, getToken());
}
