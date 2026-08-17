import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CarFrontIcon, MailIcon, UserIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import type { UseCase } from '../../types';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { Input } from '../../components/ui/Input';
import { PhoneInput } from '../../components/ui/PhoneInput';
import { cn } from '../../utils/cn';

const profiles: {id: UseCase;icon: typeof CarFrontIcon;}[] = [
{ id: 'driver', icon: CarFrontIcon },
{ id: 'individual', icon: UserIcon }];


function strength(password: string): 0 | 1 | 2 {
  if (password.length >= 10 && /[A-Z]/.test(password) && /\d/.test(password)) return 2;
  if (password.length >= 8) return 1;
  return 0;
}

export function SignUp() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [phone, setPhone] = useState('');
  const [profile, setProfile] = useState<UseCase>('driver');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const level = strength(form.password);
  const strengthLabels = [t('auth.strengthWeak'), t('auth.strengthMedium'), t('auth.strengthStrong')];

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!form.firstName.trim()) next.firstName = t('auth.errorRequired');
    if (!form.lastName.trim()) next.lastName = t('auth.errorRequired');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = t('auth.errorEmail');
    if (level === 0) next.password = t('auth.errorPassword');
    if (!consent) next.consent = t('auth.errorConsent');
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setLoading(true);
    window.setTimeout(() => navigate('/verification-email'), 700);
  };

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
      }>
      
      <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="signup-first"
            label={t('auth.firstName')}
            value={form.firstName}
            required
            error={errors.firstName}
            autoComplete="given-name"
            onChange={(event) => setForm({ ...form, firstName: event.target.value })} />
          
          <Input
            id="signup-last"
            label={t('auth.lastName')}
            value={form.lastName}
            required
            error={errors.lastName}
            autoComplete="family-name"
            onChange={(event) => setForm({ ...form, lastName: event.target.value })} />
          
        </div>
        <Input
          id="signup-email"
          type="email"
          label={t('auth.email')}
          value={form.email}
          required
          error={errors.email}
          iconLeft={<MailIcon className="h-4 w-4" />}
          autoComplete="email"
          onChange={(event) => setForm({ ...form, email: event.target.value })} />
        
        <PhoneInput id="signup-phone" label={t('auth.phone')} value={phone} onChange={setPhone} required />
        <div>
          <Input
            id="signup-password"
            type="password"
            label={t('auth.password')}
            value={form.password}
            required
            error={errors.password}
            hint={t('auth.passwordRules')}
            autoComplete="new-password"
            onChange={(event) => setForm({ ...form, password: event.target.value })} />
          
          {form.password &&
          <div className="mt-2 flex items-center gap-2">
              <span className="flex flex-1 gap-1" aria-hidden="true">
                {[0, 1, 2].map((index) =>
              <span
                key={index}
                className={cn(
                  'h-1 flex-1 rounded-pill',
                  index <= level ? level === 0 ? 'bg-bad' : level === 1 ? 'bg-warn' : 'bg-ok' : 'bg-line'
                )} />

              )}
              </span>
              <span className="text-[0.75rem] font-semibold text-muted">{strengthLabels[level]}</span>
            </div>
          }
        </div>

        <fieldset className="mt-1">
          <legend className="text-2xs font-semibold text-ink">{t('auth.profile')}</legend>
          <p className="mt-1 text-[0.75rem] text-muted">{t('auth.profileHint')}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {profiles.map(({ id, icon: Icon }) =>
            <label
              key={id}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-[border-color,background-color] duration-200 ease-signature',
                profile === id ? 'border-action bg-sky-50' : 'border-line bg-white hover:border-sky-200'
              )}>
              
                <input
                type="radio"
                name="profile"
                value={id}
                checked={profile === id}
                onChange={() => setProfile(id)}
                className="h-4 w-4 accent-action" />
              
                <Icon className={cn('h-4 w-4', profile === id ? 'text-action' : 'text-muted')} aria-hidden="true" />
                <span className="text-2xs font-semibold text-ink">{t(`useCase.${id}`)}</span>
              </label>
            )}
          </div>
        </fieldset>

        <Checkbox
          id="signup-consent"
          checked={consent}
          error={errors.consent}
          onChange={(event) => setConsent(event.target.checked)}
          label={
          <>
              {t('auth.consent')}{' '}
              <Link to="/legal/conditions" className="font-semibold text-action">
                {t('footer.terms')}
              </Link>
            </>
          } />
        

        <Button type="submit" size="lg" fullWidth loading={loading} className="mt-2">
          {t('auth.signUp')}
        </Button>
      </form>
    </AuthLayout>);

}