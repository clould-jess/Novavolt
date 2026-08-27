import React from 'react';
import { CheckIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';

export function AuthSuccess() {
  const { t } = useI18n();

  return (
    <AuthLayout title={t('auth.successTitle')} subtitle={t('auth.successBody')}>
      <div className="flex flex-col items-start gap-6">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-50 text-action" aria-hidden="true">
          <CheckIcon className="h-6 w-6" />
        </span>
        <Button to="/connexion" size="lg" fullWidth>
          {t('auth.signIn')}
        </Button>
        <Button to="/vehicules" variant="secondary" fullWidth>
          {t('common.viewVehicles')}
        </Button>
      </div>
    </AuthLayout>);

}
