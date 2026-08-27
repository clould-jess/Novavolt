import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LockIcon, MailIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { useToast } from '../../contexts/ToastContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { Input } from '../../components/ui/Input';
import { ApiError } from '../../services/api';
import { login, saveAuthSession } from '../../services/auth';

export function SignIn() {
  const { t } = useI18n();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = t('auth.errorEmail');
    if (!password.trim()) next.password = t('auth.errorRequired');

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      const session = await login({ email, password });
      const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'OWNER';
      if (!isAdmin) {
        setErrors({ password: t('auth.adminOnlyTitle') });
        showToast({
          tone: 'error',
          title: t('auth.adminOnlyTitle'),
          body: t('auth.adminOnlyBody'),
        });
        return;
      }

      saveAuthSession(session, remember);
      navigate('/admin', { replace: true });
    } catch (error) {
      if (error instanceof TypeError) {
        showToast({
          tone: 'error',
          title: t('auth.networkErrorTitle'),
          body: t('auth.networkErrorBody'),
        });
        return;
      }

      if (error instanceof ApiError) {
        if (error.status === 401 && error.message === 'Email not verified') {
          showToast({ tone: 'info', title: t('auth.verifyTitle') });
          navigate(`/verification-email?email=${encodeURIComponent(email)}`);
          return;
        }

        if (error.status === 401) {
          const message = t('auth.errorCredentials');
          setErrors({ password: message });
          showToast({
            tone: 'error',
            title: t('auth.invalidCredentialsTitle'),
            body: message,
          });
          return;
        }

        showToast({
          tone: 'error',
          title: t('auth.serverErrorTitle'),
          body: error.message,
        });
        return;
      }

      const message = error instanceof Error ? error.message : '';
      if (message === 'Email not verified') {
        showToast({ tone: 'info', title: t('auth.verifyTitle') });
        navigate(`/verification-email?email=${encodeURIComponent(email)}`);
        return;
      }
      setErrors({ password: t('auth.errorCredentials') });
      showToast({
        tone: 'error',
        title: t('auth.invalidCredentialsTitle'),
        body: t('auth.errorCredentials'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('auth.signInTitle')}
      subtitle={t('auth.signInSubtitle')}
      footer={
        <p>
          {t('auth.noAccount')}{' '}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled
            className="pointer-events-none ml-1 align-baseline text-2xs text-muted"
          >
            {t('auth.signUpDisabled')}
          </Button>
        </p>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
        <Input
          id="signin-email"
          type="email"
          label={t('auth.email')}
          value={email}
          required
          error={errors.email}
          iconLeft={<MailIcon className="h-4 w-4" />}
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
        />

        <Input
          id="signin-password"
          type="password"
          label={t('auth.password')}
          value={password}
          required
          error={errors.password}
          hint={t('auth.passwordRules')}
          iconLeft={<LockIcon className="h-4 w-4" />}
          autoComplete="current-password"
          onChange={(event) => setPassword(event.target.value)}
        />

        <div className="flex items-center justify-between gap-4">
          <Checkbox
            id="signin-remember"
            label={t('auth.remember')}
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
          />

          <Link to="/mot-de-passe-oublie" className="nv-link-slide text-2xs font-semibold text-action">
            {t('auth.forgot')}
          </Link>
        </div>

        <Button type="submit" size="lg" fullWidth loading={loading} className="mt-2">
          {t('auth.signIn')}
        </Button>
        <p className="text-[0.75rem] leading-relaxed text-muted">{t('auth.secureNote')}</p>
        {/* <Button to="/admin" variant="secondary" size="lg" fullWidth className="mt-2">
          {t('auth.adminWorkspaceCta')}
        </Button> */}
      </form>
    </AuthLayout>
  );
}
