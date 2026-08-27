import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MailIcon, LockIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { useToast } from '../../contexts/ToastContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';
import { CodeInput } from '../../components/auth/CodeInput';
import { Input } from '../../components/ui/Input';
import { confirmPasswordReset, requestPasswordReset } from '../../services/auth';

function isStrongPassword(password: string): boolean {
  return (
    password.length >= 12 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z\d\s]/.test(password)
  );
}

function codeToDigits(value: string): string[] {
  const digits = value.replace(/\D/g, '').slice(0, 6);
  return Array.from({ length: 6 }, (_, index) => digits[index] ?? '');
}

function digitsToCode(value: string[]): string {
  return value.join('');
}

export function ResetPassword() {
  const { t } = useI18n();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromUrl = useMemo(() => searchParams.get('email') ?? '', [searchParams]);
  const codeFromUrl = useMemo(() => searchParams.get('code') ?? '', [searchParams]);

  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState<string[]>(() => codeToDigits(codeFromUrl));
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};

    if (!email.trim()) next.email = t('auth.errorEmail');
    if (digitsToCode(code).length !== 6) next.code = t('auth.errorRequired');
    if (!isStrongPassword(password)) next.password = t('auth.errorPassword');
    if (confirm !== password) next.confirm = t('auth.errorPassword');

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      await confirmPasswordReset({
        email: email.trim(),
        code: digitsToCode(code),
        newPassword: password,
      });
      showToast({ tone: 'success', title: t('auth.passwordResetDone') });
      navigate('/connexion');
    } catch {
      setErrors({ code: t('common.error') });
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!email.trim()) {
      setErrors((current) => ({ ...current, email: t('auth.errorEmail') }));
      return;
    }

    setResending(true);
    try {
      const result = await requestPasswordReset({ email: email.trim() });
      showToast({ tone: 'success', title: t('auth.resetEmailSent') });
      if (result.resetCode) {
        setCode(codeToDigits(result.resetCode));
      }
    } catch {
      setErrors((current) => ({ ...current, email: t('common.error') }));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout title={t('auth.resetTitle')} subtitle={t('auth.resetSubtitle')}>
      <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
        <Input
          id="reset-email"
          type="email"
          label={t('auth.email')}
          value={email}
          required
          error={errors.email}
          iconLeft={<MailIcon className="h-4 w-4" />}
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
        />

        <CodeInput
          label={t('auth.code')}
          value={code}
          onChange={setCode}
          error={errors.code}
        />

        <div className="flex flex-col gap-4">
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
            onChange={(event) => setPassword(event.target.value)}
          />

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
            onChange={(event) => setConfirm(event.target.value)}
          />
        </div>

        <Button type="submit" size="lg" fullWidth loading={loading} className="mt-2">
          {t('auth.resetCta')}
        </Button>
        <Button variant="ghost" onClick={resend} loading={resending} className="self-center">
          {t('auth.resend')}
        </Button>
      </form>
    </AuthLayout>
  );
}
