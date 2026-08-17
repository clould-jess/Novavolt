import React, { useState } from 'react';
import { Building2Icon, CheckCircle2Icon, ShieldCheckIcon, TrendingUpIcon, UsersIcon, WalletIcon } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { images } from '../data/images';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Reveal } from '../components/ui/Reveal';
import { SectionTitle } from '../components/ui/SectionTitle';
import { CtaBanner } from '../components/marketing/CtaBanner';
import { PageHero } from '../components/marketing/PageHero';

export function Fleet() {
  const { t } = useI18n();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    vehicleCount: '1-5',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const advantages = [
    { id: 'b1', icon: TrendingUpIcon, titleKey: 'fleetPage.a1Title', descKey: 'fleetPage.a1Desc' },
    { id: 'b2', icon: ShieldCheckIcon, titleKey: 'fleetPage.a2Title', descKey: 'fleetPage.a2Desc' },
    { id: 'b3', icon: UsersIcon, titleKey: 'fleetPage.a3Title', descKey: 'fleetPage.a3Desc' },
    { id: 'b4', icon: WalletIcon, titleKey: 'fleetPage.a4Title', descKey: 'fleetPage.a4Desc' }
  ];

  return (
    <>
      <PageHero
        eyebrow={t('fleetPage.eyebrow')}
        title={t('fleetPage.heroTitle')}
        subtitle={t('fleetPage.heroSubtitle')}
        image={{ src: images.driverHero, alt: 'Gestion de flotte Novavolt' }}
        variant={0}
        actions={
          <Button to="#partenaire-form" size="lg">
            {t('fleetPage.heroCta')}
          </Button>
        }
      />

      {/* Advantages Section */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-content">
          <SectionTitle
            as="h2"
            variant={1}
            title={t('fleetPage.advantagesTitle')}
            subtitle={t('fleetPage.advantagesSubtitle')}
            className="max-w-2xl"
          />

          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map(({ id, icon: Icon, titleKey, descKey }, idx) => (
              <Reveal as="li" key={id} index={idx}>
                <div className="flex h-full flex-col justify-between rounded-card border border-line bg-white p-6 shadow-sm transition-all hover:border-action/30 hover:shadow-md">
                  <div>
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-sky-50 text-action">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                      {t(titleKey)}
                    </h3>
                    <p className="mt-2 text-2xs leading-relaxed text-muted">
                      {t(descKey)}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Partner Form Section */}
      <section id="partenaire-form" className="border-t border-line bg-soft px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-content">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-action/20 bg-action/10 px-3.5 py-1 text-2xs font-semibold text-action">
                <Building2Icon className="h-3.5 w-3.5" />
                {t('fleetPage.formBadge')}
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {t('fleetPage.formTitle')}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {t('fleetPage.formSubtitle')}
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  'fleetPage.check1',
                  'fleetPage.check2',
                  'fleetPage.check3'
                ].map((itemKey) => (
                  <li key={itemKey} className="flex items-center gap-3 text-xs font-medium text-ink">
                    <CheckCircle2Icon className="h-5 w-5 shrink-0 text-action" />
                    <span>{t(itemKey)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Card tone="soft" className="p-6 sm:p-8">
              {submitted ? (
                <div className="py-8 text-center">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2Icon className="h-8 w-8" />
                  </span>
                  <h3 className="mt-4 font-display text-xl font-bold text-ink">
                    {t('fleetPage.successTitle')}
                  </h3>
                  <p className="mt-2 text-2xs text-muted">
                    {t('fleetPage.successDesc')}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-2xs font-semibold text-ink">
                      {t('fleetPage.fieldName')}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-medium text-ink focus:border-action focus:outline-none"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-2xs font-semibold text-ink">
                        {t('fleetPage.fieldEmail')}
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-medium text-ink focus:border-action focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-2xs font-semibold text-ink">
                        {t('fleetPage.fieldPhone')}
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-medium text-ink focus:border-action focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-2xs font-semibold text-ink">
                      {t('fleetPage.fieldCount')}
                    </label>
                    <select
                      value={formData.vehicleCount}
                      onChange={(e) => setFormData({ ...formData, vehicleCount: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-medium text-ink focus:border-action focus:outline-none"
                    >
                      <option value="1-5">1 à 5 véhicules</option>
                      <option value="6-20">6 à 20 véhicules</option>
                      <option value="20+">Plus de 20 véhicules</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-2xs font-semibold text-ink">
                      {t('fleetPage.fieldMessage')}
                    </label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-medium text-ink focus:border-action focus:outline-none"
                    />
                  </div>

                  <Button type="submit" variant="primary" fullWidth size="lg" className="mt-2">
                    {t('fleetPage.submitBtn')}
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </section>

      <CtaBanner
        title={t('fleetPage.ctaTitle')}
        primary={{ label: t('fleetPage.heroCta'), to: '#partenaire-form' }}
        secondary={{ label: t('common.contactUs'), to: '/contact' }}
      />
    </>
  );
}
