import { apiRequest } from './api';
import { getAuthSession } from './auth';

export interface CurrentUserProfile {
  id: string;
  email: string;
  role: string;
  status: string;
  emailVerifiedAt?: string | null;
  profile?: {
    firstName: string;
    lastName: string;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    province?: string | null;
    postalCode?: string | null;
    language?: string | null;
  } | null;
  lastLoginAt?: string | null;
  createdAt: string;
}

export async function fetchCurrentUser(): Promise<CurrentUserProfile> {
  const session = getAuthSession();
  if (!session?.accessToken) {
    throw new Error('Missing session');
  }
  return apiRequest<CurrentUserProfile>('/users/me', {}, session.accessToken);
}
