import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../contexts/I18nContext';
import { useToast } from '../../contexts/ToastContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { CodeInput } from '../../components/auth/CodeInput';
import { Button } from '../../components/ui/Button';

export function VerifyEmail() {
  const { t } = useI18n();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [code, setCode] = useState<string[]>([]);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (code.filter(Boolean).length < 6) {
      setError(t('auth.errorRequired'));
      return;
    }
    setError(undefined);
    setLoading(true);
    window.setTimeout(() => navigate('/mfa'), 700);
  };

  return (
    <AuthLayout title={t('auth.verifyTitle')} subtitle={t('auth.verifySubtitle')}>
      <form className="flex flex-col gap-6" onSubmit={submit} noValidate>
        <CodeInput label={t('auth.code')} value={code} onChange={setCode} error={error} />
        <Button type="submit" size="lg" fullWidth loading={loading}>
          {t('auth.verify')}
        </Button>
        <Button
          variant="ghost"
          onClick={() => showToast({ tone: 'info', title: t('auth.resend') })}
          className="self-center">
          
          {t('auth.resend')}
        </Button>
      </form>
    </AuthLayout>);

}