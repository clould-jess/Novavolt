import React from 'react';
import { Link } from 'react-router-dom';
import { LockIcon, ShieldOffIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';

export function SignUp() {
  const { t } = useI18n();

  return (
    <AuthLayout
      title={t('auth.signUpTitle')}
      subtitle={t('auth.signUpSubtitle')}
      footer={
        <p>
          {t('auth.haveAccount')}{' '}
          <Link to="/connexion" className="nv-link-slide font-semibold text-action">
            {t('auth.signIn')}
          </Link>
        </p>
      }
    >
      <div className="rounded-3xl border border-dashed border-line bg-soft p-6 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-slate-200 text-slate-500">
          <ShieldOffIcon className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="mt-4 font-display text-xl font-semibold tracking-[-0.02em] text-ink">
          {t('auth.adminOnlyTitle')}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {t('auth.adminOnlyBody')}
        </p>
        <Button type="button" variant="secondary" disabled fullWidth className="mt-6 pointer-events-none">
          <LockIcon className="h-4 w-4" />
          {t('auth.signUpDisabled')}
        </Button>
      </div>
    </AuthLayout>
  );
}
