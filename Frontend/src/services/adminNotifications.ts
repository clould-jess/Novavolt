import { apiRequest } from './api';
import { getAuthSession } from './auth';

export type AdminNotificationType = 'FLEET_REQUEST' | 'RESERVATION_REQUEST' | 'CONTACT_MESSAGE';
export interface AdminNotification { id: string; type: AdminNotificationType; entityId: string; title: string; preview: string; readAt: string | null; createdAt: string; }
export interface AdminNotificationsResponse { items: AdminNotification[]; total: number; unread: number; page: number; limit: number; }
function token() { return getAuthSession()?.accessToken; }
export function listAdminNotifications(unread = false) { return apiRequest<AdminNotificationsResponse>(`/admin-notifications?limit=50&unread=${unread}`, {}, token()); }
export function markAdminNotificationRead(id: string) { return apiRequest<{ ok: boolean }>(`/admin-notifications/${id}/read`, { method: 'PATCH' }, token()); }
export function archiveAdminNotification(id: string) { return apiRequest<{ ok: boolean }>(`/admin-notifications/${id}/archive`, { method: 'PATCH' }, token()); }
