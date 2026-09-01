import { motion } from 'framer-motion';
import React, { useState } from 'react';
import {
  Building2Icon,
  CheckCircle2Icon,
  ShieldCheckIcon,
  TrendingUpIcon,
  UsersIcon,
  WalletIcon,
} from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { useToast } from '../contexts/ToastContext';
import { images } from '../data/images';
import { createPartnershipLead } from '../services/partnershipLeads';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Reveal } from '../components/ui/Reveal';
import { SectionTitle } from '../components/ui/SectionTitle';
import { CtaBanner } from '../components/marketing/CtaBanner';
import { PageHero } from '../components/marketing/PageHero';

export function Fleet() {
  const { t } = useI18n();
  const { showToast } = useToast();
  const phoneHref = `tel:${t('common.phone').replace(/[^\d+]/g, '')}`;
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    vehicleCount: '1-5' as '1-5' | '6-20' | '20+',
    message: '',
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await createPartnershipLead({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        vehicleCount: formData.vehicleCount,
        message: formData.message,
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        vehicleCount: '1-5',
        message: '',
      });
      setSubmitted(true);

      showToast({
        tone: response.emailDelivered ? 'success' : 'warn',
        title: response.emailDelivered
          ? t('fleetPage.successToastTitle')
          : t('fleetPage.pendingToastTitle'),
        body: response.emailDelivered
          ? t('fleetPage.successToastBody')
          : t('fleetPage.pendingToastBody'),
      });
    } catch {
      showToast({
        tone: 'error',
        title: t('fleetPage.errorToastTitle'),
        body: t('fleetPage.errorToastBody'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewRequest = () => {
    setSubmitted(false);
  };

  const advantages = [
    { id: 'b1', icon: TrendingUpIcon, titleKey: 'fleetPage.a1Title', descKey: 'fleetPage.a1Desc' },
    { id: 'b2', icon: ShieldCheckIcon, titleKey: 'fleetPage.a2Title', descKey: 'fleetPage.a2Desc' },
    { id: 'b3', icon: UsersIcon, titleKey: 'fleetPage.a3Title', descKey: 'fleetPage.a3Desc' },
    { id: 'b4', icon: WalletIcon, titleKey: 'fleetPage.a4Title', descKey: 'fleetPage.a4Desc' },
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
            {advantages.map(({ id, icon: Icon, titleKey, descKey }, index) => (
              <Reveal as="li" key={id} index={index}>
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
                {['fleetPage.check1', 'fleetPage.check2', 'fleetPage.check3'].map((itemKey) => (
                  <li key={itemKey} className="flex items-center gap-3 text-xs font-medium text-ink">
                    <CheckCircle2Icon className="h-5 w-5 shrink-0 text-action" />
                    <span>{t(itemKey)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Card tone="soft" className="p-6 sm:p-8">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.24, ease: 'easeOut' }}
                  className="flex min-h-[22rem] flex-col items-center justify-center rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-10 text-center"
                >
                  <motion.div
                    initial={{ scale: 0.7, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 240, damping: 14 }}
                    className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600"
                  >
                    <CheckCircle2Icon className="h-8 w-8" />
                  </motion.div>
                  <h3 className="mt-5 font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
                    {t('fleetPage.successToastTitle')}
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                    {t('fleetPage.successToastBody')}
                  </p>
                  <Button href={phoneHref} className="mt-6 bg-emerald-600 text-white hover:bg-emerald-700">
                    <PhoneIcon className="h-4 w-4" aria-hidden="true" />
                    {t('contactPage.callCta')}
                  </Button>
                  <Button type="button" variant="secondary" className="mt-3" onClick={handleNewRequest}>
                    {t('common.newRequest')}
                  </Button>
                </motion.div>
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
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                    className="mt-1 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-medium text-ink focus:border-action focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-ink">
                    {t('fleetPage.fieldCompany')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(event) => setFormData({ ...formData, company: event.target.value })}
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
                      onChange={(event) => setFormData({ ...formData, email: event.target.value })}
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
                      onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
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
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        vehicleCount: event.target.value as '1-5' | '6-20' | '20+',
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-medium text-ink focus:border-action focus:outline-none"
                  >
                    <option value="1-5">{t('fleetPage.count1')}</option>
                    <option value="6-20">{t('fleetPage.count2')}</option>
                    <option value="20+">{t('fleetPage.count3')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-ink">
                    {t('fleetPage.fieldMessage')}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                    className="mt-1 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-medium text-ink focus:border-action focus:outline-none"
                  />
                </div>

                <Button type="submit" variant="primary" fullWidth size="lg" className="mt-2" loading={submitting}>
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
