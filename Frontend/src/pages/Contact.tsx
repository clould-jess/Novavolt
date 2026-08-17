import React, { useState } from 'react';
import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { useToast } from '../contexts/ToastContext';
import { mockFaq } from '../data/faq';
import { Accordion } from '../components/ui/Accordion';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { PhoneInput } from '../components/ui/PhoneInput';
import { SectionTitle } from '../components/ui/SectionTitle';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { PageHero } from '../components/marketing/PageHero';

export function Contact() {
  const { t, locale } = useI18n();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('driver');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const phoneHref = `tel:${t('common.phone').replace(/[^\d+]/g, '')}`;
  const quickFaq = mockFaq.filter((item) => ['faq-1', 'faq-19', 'faq-24'].includes(item.id));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = t('auth.errorRequired');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = t('auth.errorEmail');
    if (!message.trim()) nextErrors.message = t('auth.errorRequired');
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      showToast({ tone: 'success', title: t('contactPage.sent') });
    }, 800);
  };

  return (
    <>
      <PageHero
        eyebrow={t('nav.contact')}
        title={t('contactPage.title')}
        subtitle={t('contactPage.subtitle')}
        variant={1}
        aside={
        <Card padding="lg" className="lg:ml-auto lg:max-w-sm">
            <ul className="flex flex-col gap-5">
              <li>
                <p className="text-[0.75rem] font-semibold text-muted">{t('contactPage.phoneTitle')}</p>
                <a href={phoneHref} className="nv-link-slide mt-1 inline-flex items-center gap-2 text-sm font-semibold text-ink">
                  <PhoneIcon className="h-4 w-4 text-action" aria-hidden="true" />
                  {t('common.phone')}
                </a>
              </li>
              <li>
                <p className="text-[0.75rem] font-semibold text-muted">{t('contactPage.emailTitle')}</p>
                <a
                href={`mailto:${t('common.email')}`}
                className="nv-link-slide mt-1 inline-flex items-center gap-2 break-all text-sm font-semibold text-ink">
                
                  <MailIcon className="h-4 w-4 shrink-0 text-action" aria-hidden="true" />
                  {t('common.email')}
                </a>
              </li>
              <li>
                <p className="text-[0.75rem] font-semibold text-muted">{t('contactPage.hoursTitle')}</p>
                <p className="mt-1 flex items-start gap-2 text-2xs text-body">
                  <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-action" aria-hidden="true" />
                  {t('common.hours')}
                </p>
              </li>
            </ul>
            <Button href={phoneHref} fullWidth className="mt-6">
              {t('contactPage.callCta')}
            </Button>
          </Card>
        } />
      

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-content gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <Card padding="lg" tone="white">
            <SectionTitle as="h2" variant={0} title={t('contactPage.formTitle')} />
            <form className="mt-8 flex flex-col gap-4" onSubmit={submit} noValidate>
              <Input
                id="contact-name"
                label={t('contactPage.name')}
                value={name}
                required
                error={errors.name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name" />
              
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="contact-email"
                  type="email"
                  label={t('contactPage.email')}
                  value={email}
                  required
                  error={errors.email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email" />
                
                <PhoneInput id="contact-phone" label={t('contactPage.phone')} value={phone} onChange={setPhone} />
              </div>
              <Select
                id="contact-subject"
                label={t('contactPage.subject')}
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                options={[
                { value: 'driver', label: t('contactPage.subjectDriver') },
                { value: 'individual', label: t('contactPage.subjectIndividual') },
                { value: 'support', label: t('contactPage.subjectSupport') },
                { value: 'partner', label: t('contactPage.subjectPartner') },
                { value: 'other', label: t('contactPage.subjectOther') }]
                } />
              
              <Textarea
                id="contact-message"
                label={t('contactPage.message')}
                placeholder={t('contactPage.messagePlaceholder')}
                value={message}
                required
                error={errors.message}
                onChange={(event) => setMessage(event.target.value)} />
              
              <Button type="submit" size="lg" loading={sending} className="mt-2 self-start">
                {t('contactPage.send')}
              </Button>
            </form>
          </Card>

          <div className="flex flex-col gap-6">
            <Card padding="none" className="overflow-hidden">
              <div
                className="flex h-52 items-end bg-surface p-5"
                role="img"
                aria-label={t('contactPage.mapAlt')}>
                
                <span className="inline-flex items-center gap-2 rounded-pill bg-white px-3.5 py-2 text-2xs font-semibold text-ink shadow-xs">
                  <MapPinIcon className="h-4 w-4 text-action" aria-hidden="true" />
                  {t('cities.montreal')}, QC
                </span>
              </div>
              <div className="p-5">
                <h2 className="font-display text-base font-semibold tracking-[-0.02em] text-ink">
                  {t('contactPage.locationTitle')}
                </h2>
                <p className="mt-2 text-2xs leading-relaxed text-muted">{t('contactPage.locationBody')}</p>
              </div>
            </Card>

            <Card padding="lg">
              <h2 className="font-display text-base font-semibold tracking-[-0.02em] text-ink">
                {t('contactPage.quickFaq')}
              </h2>
              <Accordion
                className="mt-4 border-t-0"
                items={quickFaq.map((item) => ({
                  id: item.id,
                  question: item.question[locale],
                  answer: item.answer[locale]
                }))} />
              
            </Card>
          </div>
        </div>
      </section>
    </>);

}