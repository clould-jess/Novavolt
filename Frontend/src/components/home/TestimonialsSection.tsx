import React, { useEffect, useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { SectionTitle } from '../ui/SectionTitle';
import { TestimonialCard } from '../ui/TestimonialCard';

const testimonials = [
  { name: 'Sophie Martin', role: 'Chauffeuse VTC · Montréal', rating: 5, photo: 'https://placehold.co/160x160/E0F2FE/0F3B5A?text=SM', quote: 'Service super simple et voiture impeccable. Je peux travailler sereinement toute la semaine.' },
  { name: 'Marc Tremblay', role: 'Client particulier · Laval', rating: 5, photo: 'https://placehold.co/160x160/DBEAFE/0F3B5A?text=MT', quote: 'La réservation a été rapide et l’équipe a pris le temps de tout m’expliquer.' },
  { name: 'Aïcha Diallo', role: 'Chauffeuse · Longueuil', rating: 5, photo: 'https://placehold.co/160x160/E0E7FF/0F3B5A?text=AD', quote: 'Une expérience fluide du début à la fin. La voiture était prête exactement comme prévu.' },
  { name: 'Olivia Carter', role: 'Rideshare driver · Toronto', rating: 5, photo: 'https://placehold.co/160x160/ECFDF5/0F3B5A?text=OC', quote: 'The team was responsive, helpful and made the whole process feel effortless.' },
  { name: 'Daniel Wong', role: 'Weekend renter · Ottawa', rating: 5, photo: 'https://placehold.co/160x160/FEF3C7/0F3B5A?text=DW', quote: 'Clean vehicle, clear communication and a great experience for our weekend trip.' },
  { name: 'Emma Johnson', role: 'Delivery driver · Vancouver', rating: 5, photo: 'https://placehold.co/160x160/FCE7F3/0F3B5A?text=EJ', quote: 'I was on the road quickly and support was there whenever I had a question.' },
] as const;

const AUTO_ADVANCE_MS = 5_000;

export function TestimonialsSection() {
  const { t } = useI18n();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="overflow-hidden border-y border-line bg-soft px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-content">
        <SectionTitle as="h2" variant={1} title={t('testimonials.title')} className="max-w-xl" />

        <div className="mt-10 overflow-hidden lg:mt-14" aria-roledescription="carousel">
          <div className="flex transition-transform duration-700 ease-signature motion-reduce:transition-none" style={{ transform: 'translateX(-' + activeIndex * 100 + '%)' }}>
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="w-full shrink-0 px-1">
                <TestimonialCard {...testimonial} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-2" aria-label="Testimonial carousel navigation">
          {testimonials.map((testimonial, index) => (
            <button
              key={testimonial.name}
              type="button"
              aria-label={'Show review ' + (index + 1)}
              aria-current={index === activeIndex}
              onClick={() => setActiveIndex(index)}
              className={'h-2 rounded-full transition-all ' + (index === activeIndex ? 'w-7 bg-action' : 'w-2 bg-sky-200 hover:bg-sky-300')}
            />
          ))}
        </div>
      </div>
    </section>
  );
}