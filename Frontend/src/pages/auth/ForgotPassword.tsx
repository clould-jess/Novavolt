import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MailIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function ForgotPassword() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('auth.errorEmail'));
      return;
    }
    setError(undefined);
    setLoading(true);
    window.setTimeout(() => navigate('/reinitialiser'), 700);
  };

  return (
    <AuthLayout
      title={t('auth.forgotTitle')}
      subtitle={t('auth.forgotSubtitle')}
      footer={
      <Link to="/connexion" className="nv-link-slide font-semibold text-action">
          {t('auth.signIn')}
        </Link>
      }>
      
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
          onChange={(event) => setEmail(event.target.value)} />
        
        <Button type="submit" size="lg" fullWidth loading={loading}>
          {t('auth.sendLink')}
        </Button>
      </form>
    </AuthLayout>);

}