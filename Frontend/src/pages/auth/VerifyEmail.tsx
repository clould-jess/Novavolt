import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MailIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { useToast } from '../../contexts/ToastContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';
import { CodeInput } from '../../components/auth/CodeInput';
import { Input } from '../../components/ui/Input';
import { confirmEmailVerification, requestEmailVerification } from '../../services/auth';

function codeToDigits(value: string): string[] {
  const digits = value.replace(/\D/g, '').slice(0, 6);
  return Array.from({ length: 6 }, (_, index) => digits[index] ?? '');
}

function digitsToCode(value: string[]): string {
  return value.join('');
}

export function VerifyEmail() {
  const { t } = useI18n();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromUrl = useMemo(() => searchParams.get('email') ?? '', [searchParams]);
  const codeFromUrl = useMemo(() => searchParams.get('code') ?? '', [searchParams]);

  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState<string[]>(() => codeToDigits(codeFromUrl));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!email.trim()) next.email = t('auth.errorEmail');
    if (digitsToCode(code).length !== 6) next.code = t('auth.errorRequired');

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      await confirmEmailVerification({
        email: email.trim(),
        code: digitsToCode(code),
      });
      showToast({ tone: 'success', title: t('auth.emailVerified') });
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
      const result = await requestEmailVerification({ email: email.trim() });
      showToast({ tone: 'success', title: t('auth.verificationResent') });
      if (result.verificationCode) {
        setCode(codeToDigits(result.verificationCode));
      }
    } catch {
      setErrors((current) => ({ ...current, email: t('common.error') }));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout title={t('auth.verifyTitle')} subtitle={t('auth.verifySubtitle')}>
      <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
        <Input
          id="verify-email"
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

        <Button type="submit" size="lg" fullWidth loading={loading}>
          {t('auth.verify')}
        </Button>
        <Button variant="ghost" onClick={resend} loading={resending} className="self-center">
          {t('auth.resend')}
        </Button>
      </form>
    </AuthLayout>
  );
}
