import { apiRequest } from './api';
import { getAuthSession } from './auth';

export interface ActiveSession { id: string; userAgent: string | null; ipAddress: string | null; createdAt: string; lastUsedAt: string; expiresAt: string; current: boolean; }
function token() { return getAuthSession()?.accessToken; }
export function listActiveSessions() { return apiRequest<ActiveSession[]>('/auth/sessions', {}, token()); }
export function revokeActiveSession(id: string) { return apiRequest<{ ok: boolean }>(`/auth/sessions/${id}`, { method: 'DELETE' }, token()); }
