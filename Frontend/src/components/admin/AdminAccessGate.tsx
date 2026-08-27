import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2Icon } from 'lucide-react';
import { getAuthSession, clearAuthSession } from '../../services/auth';
import { fetchCurrentUser } from '../../services/users';
import { useI18n } from '../../contexts/I18nContext';
import { Logo } from '../ui/Logo';

export function AdminAccessGate() {
  const { t } = useI18n();
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const checkAccess = async () => {
      const session = getAuthSession();
      if (!session?.accessToken) {
        clearAuthSession();
        if (active) {
          setRedirectTo(`/connexion?redirect=${encodeURIComponent(location.pathname)}`);
        }
        return;
      }

      try {
        const user = await fetchCurrentUser();
        const isAdmin = user.role === 'ADMIN' || user.role === 'OWNER';
        if (!isAdmin) {
          clearAuthSession();
          if (active) {
            setRedirectTo('/connexion');
          }
          return;
        }
        if (active) {
          setAllowed(true);
        }
      } catch {
        clearAuthSession();
        if (active) {
          setRedirectTo(`/connexion?redirect=${encodeURIComponent(location.pathname)}`);
        }
      } finally {
        if (active) {
          setReady(true);
        }
      }
    };

    void checkAccess();

    return () => {
      active = false;
    };
  }, [location.pathname]);

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-soft px-4">
        <div className="flex flex-col items-center gap-5 rounded-card border border-line bg-white px-8 py-10 shadow-card">
          <Logo variant="transparent" />
          <Loader2Icon className="h-6 w-6 animate-spin-slow text-action" aria-hidden="true" />
          <p className="text-sm font-medium text-muted">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  return <Outlet />;
}
