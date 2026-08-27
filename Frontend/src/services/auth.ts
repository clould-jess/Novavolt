import {
  apiRequest,
  configureAccessTokenRefresh,
  resetSessionExpiryNotification,
} from './api';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  status: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  newPassword: string;
}

export interface ResetPasswordRequestPayload {
  email: string;
}

export interface EmailVerificationRequestPayload {
  email: string;
}

export interface EmailCodePayload {
  email: string;
  code: string;
}

export interface RegisterResponse extends Partial<AuthSession> {
  user: AuthUser;
  verificationRequired?: boolean;
  verificationCode?: string;
}

export interface ActionResponse {
  ok?: boolean;
  accepted?: boolean;
  resetCode?: string;
  verificationCode?: string;
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function login(payload: LoginPayload): Promise<AuthSession> {
  return apiRequest<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function requestPasswordReset(
  payload: ResetPasswordRequestPayload
): Promise<ActionResponse> {
  return apiRequest<ActionResponse>('/auth/password-reset/request', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function confirmPasswordReset(
  payload: ResetPasswordPayload
): Promise<ActionResponse> {
  return apiRequest<ActionResponse>('/auth/password-reset/confirm', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function requestEmailVerification(
  payload: EmailVerificationRequestPayload
): Promise<ActionResponse> {
  return apiRequest<ActionResponse>('/auth/email-verification/request', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function confirmEmailVerification(
  payload: EmailCodePayload
): Promise<ActionResponse> {
  return apiRequest<ActionResponse>('/auth/email-verification/confirm', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function logout(): Promise<ActionResponse> {
  const session = getAuthSession();
  if (!session?.accessToken) {
    clearAuthSession();
    return { ok: true };
  }

  try {
    return await apiRequest<ActionResponse>(
      '/auth/logout',
      {
      method: 'POST',
      },
      session.accessToken
    );
  } catch {
    return { ok: false };
  } finally {
    clearAuthSession();
  }
}

export async function refreshAuthSession(): Promise<string | null> {
  const session = getAuthSession();
  if (!session?.refreshToken) return null;

  const tokens = await apiRequest<Pick<AuthSession, 'accessToken' | 'refreshToken'>>(
    '/auth/refresh',
    { method: 'POST', body: JSON.stringify({ refreshToken: session.refreshToken }) },
  );

  saveAuthSession(
    { ...session, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
    localStorage.getItem('novavolt.auth.session') !== null,
  );
  return tokens.accessToken;
}

export function saveAuthSession(session: AuthSession, remember = false): void {
  clearAuthSession();
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem('novavolt.auth.session', JSON.stringify(session));
  resetSessionExpiryNotification();
}

export function getAuthSession(): AuthSession | null {
  const raw =
    sessionStorage.getItem('novavolt.auth.session') ??
    localStorage.getItem('novavolt.auth.session');
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function clearAuthSession(): void {
  localStorage.removeItem('novavolt.auth.session');
  sessionStorage.removeItem('novavolt.auth.session');
}

configureAccessTokenRefresh(refreshAuthSession);
