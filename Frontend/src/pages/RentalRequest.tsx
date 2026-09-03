import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2Icon, MailIcon, PhoneIcon, SendIcon } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { ApiError } from '../services/api';
import { createRentalRequest } from '../services/rentalRequests';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { PhoneInput } from '../components/ui/PhoneInput';
import { Select } from '../components/ui/Select';

const empty = { firstName: '', lastName: '', phone: '', email: '', city: '' };
type Values = typeof empty;
type Errors = Partial<Record<keyof Values, string>>;

const copy = {
  fr: { eyebrow: 'NOVA VOLT LOCATION', title: 'Obtenez plus d’informations', subtitle: 'Remplissez le formulaire et notre équipe vous contactera dans les 24 heures.', questions: 'Vous avez des questions ?', questionsBody: 'Contactez-nous pour toute question concernant nos véhicules, notre flotte ou votre demande de location.', call: 'APPELEZ-NOUS', emailUs: 'ÉCRIVEZ-NOUS', first: 'Prénom', last: 'Nom', phone: 'Téléphone', email: 'Adresse courriel', city: 'Ville', cityPlaceholder: 'Choisissez votre ville', submit: 'Envoyer ma demande', successTitle: 'Demande envoyée avec succès !', successBody: 'Merci pour votre demande. Notre équipe vous contactera dans les 24 heures.', again: 'Faire une nouvelle demande', required: 'Ce champ est requis.', phoneError: 'Saisissez un numéro canadien valide.', emailError: 'Saisissez une adresse courriel valide.', network: 'Impossible de contacter le serveur. Vérifiez votre connexion internet.', generic: 'Une erreur est survenue. Veuillez réessayer.' },
  en: { eyebrow: 'NOVA VOLT RENTALS', title: 'Get more information', subtitle: "Complete the form and we'll reach out within 24 hours.", questions: 'Have questions?', questionsBody: 'Contact us with any questions about our vehicles, our fleet, or your rental request.', call: 'CALL US', emailUs: 'EMAIL US', first: 'First name', last: 'Last name', phone: 'Phone', email: 'Email address', city: 'City', cityPlaceholder: 'Choose your city', submit: 'Submit my request', successTitle: 'Request sent successfully!', successBody: "Thank you for your request. Our team will contact you within 24 hours.", again: 'Make another request', required: 'This field is required.', phoneError: 'Enter a valid Canadian phone number.', emailError: 'Enter a valid email address.', network: 'Unable to reach the server. Check your internet connection.', generic: 'Something went wrong. Please try again.' },
};

export function RentalRequestPage() {
  const { locale, t } = useI18n();
  const { showToast } = useToast();
  const text = copy[locale === 'fr' ? 'fr' : 'en'];
  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (key: keyof Values, value: string) => { setValues((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: undefined })); };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    (['firstName', 'lastName', 'city'] as const).forEach((key) => { if (!values[key].trim()) next[key] = text.required; });
    if (values.phone.replace(/\D/g, '').length !== 10) next.phone = text.phoneError;
    if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = text.emailError;
    setErrors(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    try { await createRentalRequest({ ...values, phone: `+1 ${values.phone}` }); setSent(true); }
    catch (error) { const message = error instanceof ApiError && error.status === 429 ? (locale === 'fr' ? 'Trop de demandes. Veuillez patienter avant de réessayer.' : 'Too many requests. Please wait before trying again.') : error instanceof ApiError ? text.generic : text.network; showToast({ tone: 'error', title: message }); }
    finally { setSubmitting(false); }
  };
  const phone = t('common.phone');
  const email = t('common.email');
  return <section id="demande-location" className="border-y border-line bg-soft py-16 sm:py-20 lg:py-24"><div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"><div className="grid overflow-hidden rounded-card border border-line bg-white shadow-card lg:grid-cols-[0.88fr_1.12fr]"><aside className="relative overflow-hidden bg-ink px-6 py-10 text-white sm:px-10 sm:py-12"><div className="absolute -right-20 top-12 h-56 w-56 rounded-full border border-sky-300/15" /><div className="absolute -left-16 bottom-[-5rem] h-64 w-64 rounded-full border border-sky-300/10" /><div className="relative flex h-full flex-col"><p className="text-2xs font-bold uppercase tracking-[0.18em] text-sky-300">NovaVolt</p><h2 className="mt-7 max-w-sm font-display text-3xl font-semibold leading-tight tracking-[-0.025em] sm:text-4xl">{text.questions}</h2><motion.svg className="mt-4 h-5 w-28 overflow-visible" viewBox="0 0 112 20" aria-hidden="true"><motion.path d="M2 14 C25 4, 68 4, 110 10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true, amount: 0.7 }} transition={{ duration: 0.75, ease: 'easeOut' }} className="text-action" /></motion.svg><p className="mt-6 max-w-sm text-sm leading-relaxed text-sky-100/75">{text.questionsBody}</p><div className="mt-auto space-y-6 pt-14"><a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="group flex items-center gap-4"><span className="grid h-11 w-11 place-items-center rounded-full border border-sky-100/20 bg-white/5 text-sky-300 transition group-hover:bg-white/10"><PhoneIcon className="h-5 w-5" /></span><span><span className="block text-2xs font-bold tracking-[0.14em] text-sky-200/60">{text.call}</span><span className="mt-1 block text-base font-semibold text-white">{phone}</span></span></a><a href={`mailto:${email}`} className="group flex items-center gap-4"><span className="grid h-11 w-11 place-items-center rounded-full border border-sky-100/20 bg-white/5 text-sky-300 transition group-hover:bg-white/10"><MailIcon className="h-5 w-5" /></span><span><span className="block text-2xs font-bold tracking-[0.14em] text-sky-200/60">{text.emailUs}</span><span className="mt-1 block break-all text-base font-semibold text-white">{email}</span></span></a></div></div></aside><div className="px-6 py-10 sm:px-10 sm:py-12"><p className="text-2xs font-bold uppercase tracking-[0.16em] text-action">{text.eyebrow}</p><h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.025em] text-ink sm:text-4xl">{text.title}</h2><span className="mt-4 block h-px w-full bg-line" /><p className="mt-5 max-w-xl text-sm leading-relaxed text-body">{text.subtitle}</p><AnimatePresence mode="wait">{sent ? <motion.div key="success" initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.98 }} transition={{ duration: 0.38, ease: [0.23, 1, 0.32, 1] }} className="py-12 text-center"><motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.16, type: 'spring', stiffness: 260, damping: 18 }} className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50"><CheckCircle2Icon className="h-10 w-10 text-ok" /></motion.span><h3 className="mt-5 font-display text-2xl font-semibold text-ink">{text.successTitle}</h3><p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-body">{text.successBody}</p><Button className="mt-7" variant="secondary" onClick={() => { setValues(empty); setErrors({}); setSent(false); }}>{text.again}</Button></motion.div> : <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={submit} noValidate className="mt-8 space-y-5"><Input id="rental-first-name" label={text.first} required autoComplete="given-name" placeholder="John" value={values.firstName} error={errors.firstName} onChange={(event) => set('firstName', event.target.value)} /><Input id="rental-last-name" label={text.last} required autoComplete="family-name" placeholder="Doe" value={values.lastName} error={errors.lastName} onChange={(event) => set('lastName', event.target.value)} /><PhoneInput id="rental-phone" label={text.phone} required hint="+1 (514) 555-0142" value={values.phone} error={errors.phone} onChange={(value) => set('phone', value)} /><Input id="rental-email" label={text.email} required type="email" autoComplete="email" placeholder="john@example.com" value={values.email} error={errors.email} onChange={(event) => set('email', event.target.value)} /><Select id="rental-city" label={text.city} required value={values.city} error={errors.city} onChange={(event) => set('city', event.target.value)} options={[{ value: '', label: text.cityPlaceholder }, { value: 'Montreal', label: 'Montréal' }, { value: 'Laval', label: 'Laval' }, { value: 'Longueuil', label: 'Longueuil' }]} /><Button type="submit" fullWidth size="lg" loading={submitting} iconLeft={<SendIcon className="h-4 w-4" />}>{text.submit}</Button></motion.form>}</AnimatePresence></div></div></div></section>;
}