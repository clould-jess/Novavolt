import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MailIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { useToast } from '../../contexts/ToastContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { requestPasswordReset } from '../../services/auth';

export function ForgotPassword() {
  const { t } = useI18n();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('auth.errorEmail'));
      return;
    }

    setError(undefined);
    setLoading(true);
    try {
      const result = await requestPasswordReset({ email });
      showToast({ tone: 'success', title: t('auth.resetEmailSent') });
      if (result.resetCode) {
        navigate(
          `/reinitialiser?email=${encodeURIComponent(email)}&code=${encodeURIComponent(result.resetCode)}`
        );
        return;
      }
      navigate(`/reinitialiser?email=${encodeURIComponent(email)}`);
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('auth.forgotTitle')}
      subtitle={t('auth.forgotSubtitle')}
      footer={
        <Link to="/connexion" className="nv-link-slide font-semibold text-action">
          {t('auth.signIn')}
        </Link>
      }
    >
      <form className="flex flex-col gap-5" onSubmit={submit} noValidate>
        <Input
          id="forgot-email"
          type="email"
          label={t('auth.email')}
          value={email}
          required
          error={error}
          iconLeft={<MailIcon className="h-4 w-4" />}
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
        />

        <Button type="submit" size="lg" fullWidth loading={loading}>
          {t('auth.sendLink')}
        </Button>
      </form>
    </AuthLayout>
  );
}
