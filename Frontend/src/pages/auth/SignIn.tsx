import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LockIcon, MailIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { Input } from '../../components/ui/Input';

export function SignIn() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState('karim.benali@example.ca');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = t('auth.errorEmail');
    if (password.length < 8) next.password = t('auth.errorPassword');
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setLoading(true);
    window.setTimeout(() => navigate('/portail'), 700);
  };

  return (
    <AuthLayout
      title={t('auth.signInTitle')}
      subtitle={t('auth.signInSubtitle')}
      footer={
      <p>
          {t('auth.noAccount')}{' '}
          <Link to="/inscription" className="nv-link-slide font-semibold text-action">
            {t('auth.signUp')}
          </Link>
        </p>
      }>
      
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
          onChange={(event) => setEmail(event.target.value)} />
        
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
          onChange={(event) => setPassword(event.target.value)} />
        
        <div className="flex items-center justify-between gap-4">
          <Checkbox
            id="signin-remember"
            label={t('auth.remember')}
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)} />
          
          <Link to="/mot-de-passe-oublie" className="nv-link-slide text-2xs font-semibold text-action">
            {t('auth.forgot')}
          </Link>
        </div>
        <Button type="submit" size="lg" fullWidth loading={loading} className="mt-2">
          {t('auth.signIn')}
        </Button>
        <p className="text-[0.75rem] leading-relaxed text-muted">{t('auth.secureNote')}</p>
      </form>
    </AuthLayout>);

}