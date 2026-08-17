import React, { useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { useToast } from '../../contexts/ToastContext';
import { currentCustomer } from '../../data/customers';
import type { Locale } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PageHeading } from '../../components/ui/PageHeading';
import { PhoneInput } from '../../components/ui/PhoneInput';
import { Select } from '../../components/ui/Select';
import { Toggle } from '../../components/ui/Toggle';

export function PortalProfile() {
  const { t, locale, setLocale } = useI18n();
  const { showToast } = useToast();
  const [firstName, setFirstName] = useState(currentCustomer.firstName);
  const [lastName, setLastName] = useState(currentCustomer.lastName);
  const [email, setEmail] = useState(currentCustomer.email);
  const [phone, setPhone] = useState('(514) 555-0142');
  const [mfa, setMfa] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="flex flex-col gap-6">
      <PageHeading title={t('portal.profileTitle')} />

      <Card padding="lg">
        <CardHeader title={t('portal.profilePersonal')} />
        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            showToast({ tone: 'success', title: t('common.success') });
          }}>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="profile-first"
              label={t('auth.firstName')}
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)} />
            
            <Input
              id="profile-last"
              label={t('auth.lastName')}
              value={lastName}
              onChange={(event) => setLastName(event.target.value)} />
            
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="profile-email"
              type="email"
              label={t('auth.email')}
              value={email}
              onChange={(event) => setEmail(event.target.value)} />
            
            <PhoneInput id="profile-phone" label={t('auth.phone')} value={phone} onChange={setPhone} />
          </div>
          <Button type="submit" className="mt-2 self-start">
            {t('common.save')}
          </Button>
        </form>
      </Card>

      <Card padding="lg">
        <CardHeader title={t('portal.profileSecurity')} />
        <div className="mt-4 divide-y divide-line">
          <Toggle
            id="profile-mfa"
            label={t('portal.profileMfa')}
            description={t('portal.profileMfaDesc')}
            checked={mfa}
            onChange={(value) => {
              setMfa(value);
              showToast({ tone: value ? 'success' : 'info', title: t('portal.profileMfa') });
            }}
            onLabel={t('common.success')}
            offLabel={t('common.optional')} />
          
        </div>
      </Card>

      <Card padding="lg">
        <CardHeader title={t('portal.profilePrefs')} />
        <div className="mt-4 divide-y divide-line">
          <Toggle
            id="profile-notif"
            label={t('portal.profileNotif')}
            checked={notifications}
            onChange={setNotifications}
            onLabel={t('common.success')}
            offLabel={t('common.optional')} />
          
          <div className="pt-4">
            <Select
              id="profile-lang"
              label={t('portal.profileLang')}
              value={locale}
              onChange={(event) => setLocale(event.target.value as Locale)}
              options={[
              { value: 'fr', label: 'Français (CA)' },
              { value: 'en', label: 'English (CA)' }]
              }
              className="max-w-xs" />
            
          </div>
        </div>
      </Card>
    </div>);

}