import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function ResetPassword() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) next.password = t('auth.errorPassword');
    if (confirm !== password) next.confirm = t('auth.errorPassword');
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setLoading(true);
    window.setTimeout(() => navigate('/succes'), 700);
  };

  return (
    <AuthLayout title={t('auth.resetTitle')} subtitle={t('auth.resetSubtitle')}>
      <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
        <Input
          id="reset-password"
          type="password"
          label={t('auth.password')}
          value={password}
          required
          error={errors.password}
          hint={t('auth.passwordRules')}
          iconLeft={<LockIcon className="h-4 w-4" />}
          autoComplete="new-password"
          onChange={(event) => setPassword(event.target.value)} />
        
        <Input
          id="reset-confirm"
          type="password"
          label={t('auth.passwordConfirm')}
          value={confirm}
          required
          error={errors.confirm}
          success={confirm && confirm === password ? t('common.success') : undefined}
          iconLeft={<LockIcon className="h-4 w-4" />}
          autoComplete="new-password"
          onChange={(event) => setConfirm(event.target.value)} />
        
        <Button type="submit" size="lg" fullWidth loading={loading} className="mt-2">
          {t('auth.resetCta')}
        </Button>
      </form>
    </AuthLayout>);

}