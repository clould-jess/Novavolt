const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1').replace(
  /\/$/,
  ''
);

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type AccessTokenRefresher = () => Promise<string | null>;

let refreshAccessToken: AccessTokenRefresher | null = null;
let refreshInFlight: Promise<string | null> | null = null;
let sessionExpiryNotified = false;

export function configureAccessTokenRefresh(refresher: AccessTokenRefresher): void {
  refreshAccessToken = refresher;
}

export function resetSessionExpiryNotification(): void {
  sessionExpiryNotified = false;
}

function notifySessionExpired(): void {
  if (sessionExpiryNotified) return;

  sessionExpiryNotified = true;
  window.dispatchEvent(new Event('novavolt:session-expired'));
}

async function renewAccessToken(): Promise<string | null> {
  if (!refreshAccessToken) return null;

  if (!refreshInFlight) {
    refreshInFlight = refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

export function buildApiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

function extractMessage(body: unknown): string | undefined {
  if (!body) return undefined;
  if (typeof body === 'string') return body;
  if (typeof body !== 'object') return undefined;

  const record = body as Record<string, unknown>;
  const message = record.message;
  if (Array.isArray(message)) {
    return message
      .map((item) => (typeof item === 'string' ? item : ''))
      .filter(Boolean)
      .join(' ');
  }
  if (typeof message === 'string') {
    return message;
  }
  return undefined;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  token?: string,
  retriedAfterRefresh = false,
): Promise<T> {
  const headers = new Headers(init.headers ?? {});
  if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers,
  });

  const text = await response.text();
  const body = text ? (JSON.parse(text) as unknown) : undefined;

  if (!response.ok) {
    const canRefresh =
      response.status === 401 &&
      Boolean(token) &&
      !retriedAfterRefresh &&
      path !== '/auth/refresh' &&
      path !== '/auth/logout';

    if (canRefresh) {
      try {
        const nextAccessToken = await renewAccessToken();
        if (nextAccessToken) {
          return apiRequest<T>(path, init, nextAccessToken, true);
        }
      } catch {
        // The session-expiration path below handles a failed refresh uniformly.
      }

      notifySessionExpired();
    }

    throw new ApiError(response.status, extractMessage(body) ?? 'Request failed');
  }

  return (body ?? {}) as T;
}
