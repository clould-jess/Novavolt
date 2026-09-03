import React, { useEffect, useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { SectionTitle } from '../ui/SectionTitle';
import { TestimonialCard } from '../ui/TestimonialCard';

const testimonials = [
  { name: 'Karim B.', role: 'Chauffeur Uber, Montréal', photo: '/assets/images/testimonials/sophie-martin.jpg', quote: 'Avec NovaVolt, j’ai pu commencer mes courses Uber sans attendre l’achat d’une voiture. Le tarif hebdomadaire est clair, le véhicule était prêt comme prévu et l’équipe a pris le temps de m’expliquer les prochaines étapes.', rating: 5 },
  { name: 'Aïcha D.', role: 'Chauffeuse Uber, Montréal', photo: '/assets/images/testimonials/aicha-diallo.jpg', quote: 'Après avoir activé mon compte Uber, j’avais besoin d’une voiture fiable rapidement. Ma demande a été simple à envoyer et NovaVolt m’a rappelée pour m’accompagner dans le processus. Aujourd’hui, je peux organiser mes semaines de conduite avec plus de sérénité.', rating: 5 },
  { name: 'Marc T.', role: 'Chauffeur Uber, Laval', photo: '/assets/images/testimonials/marc-tremblay.jpg', quote: 'Je voulais passer à l’électrique pour mes longues journées de conduite. La voiture est agréable, l’autonomie répond bien à mon rythme et le suivi de l’équipe fait une vraie différence quand on démarre.', rating: 5 },
  { name: 'Julie L.', role: 'Location personnelle, Montréal', photo: '/assets/images/testimonials/olivia-carter.jpg', quote: 'J’ai loué un véhicule pour un week-end à l’extérieur de la ville. Les informations étaient faciles à comprendre, la prise en charge s’est bien passée et j’ai apprécié d’avoir un contact disponible pour mes questions.', rating: 5 },
  { name: 'Daniel O.', role: 'Uber driver, Longueuil', photo: '/assets/images/testimonials/daniel-wong.jpg', quote: 'The most useful part for me was the guidance. Between the Uber account, the documents, and choosing a vehicle, I knew exactly what to prepare. It helped me move forward with my driving plans faster.', rating: 5 },
  { name: 'Sophie M.', role: 'Uber driver, Montreal', photo: '/assets/images/testimonials/emma-johnson.jpg', quote: 'I wanted a flexible option before making a long-term commitment. NovaVolt helped me find a vehicle that fits my work, and I can now plan my driving hours with confidence.', rating: 5 },
] as const;
const AUTO_ADVANCE_MS = 5_000;

export function TestimonialsSection() {
  const { t } = useI18n();
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => { const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % testimonials.length), AUTO_ADVANCE_MS); return () => window.clearInterval(timer); }, []);
  return <section className="overflow-hidden border-y border-line bg-soft px-4 py-16 sm:px-6 lg:px-8 lg:py-24"><div className="mx-auto max-w-content"><SectionTitle as="h2" variant={1} title={t('testimonials.title')} subtitle={t('testimonials.subtitle')} className="max-w-xl" /><div className="mt-10 overflow-hidden lg:mt-14" aria-roledescription="carousel"><div className="flex transition-transform duration-700 ease-signature motion-reduce:transition-none" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>{testimonials.map((testimonial) => <div key={testimonial.name} className="w-full shrink-0 px-1"><TestimonialCard {...testimonial} /></div>)}</div></div><div className="mt-6 flex justify-center gap-2" aria-label="Testimonial carousel navigation">{testimonials.map((testimonial, index) => <button key={testimonial.name} type="button" aria-label={`${t('testimonials.title')} ${index + 1}`} aria-current={index === activeIndex} onClick={() => setActiveIndex(index)} className={`h-2 rounded-full transition-all ${index === activeIndex ? 'w-7 bg-action' : 'w-2 bg-sky-200 hover:bg-sky-300'}`} />)}</div></div></section>;
}