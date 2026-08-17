import React from 'react';
import { cn } from '../../utils/cn';
import { SectionTitle } from '../ui/SectionTitle';
import { VehicleImage } from '../ui/VehicleImage';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  image?: {src: string;alt: string;};
  aside?: React.ReactNode;
  variant?: 0 | 1 | 2 | 3;
  className?: string;
}

/** Inner-page hero: sits below the sticky nav, image optional. */
export function PageHero({ eyebrow, title, subtitle, actions, image, aside, variant = 1, className }: PageHeroProps) {
  return (
    <section className={cn('relative overflow-hidden border-b border-line bg-soft', className)}>
      <div
        className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-sky-200/35 blur-3xl"
        aria-hidden="true" />
      
      <div className="relative mx-auto max-w-content px-4 pb-14 pt-28 sm:px-6 lg:px-8 lg:pb-20 lg:pt-36">
        <div className={cn('grid gap-10', image || aside ? 'lg:grid-cols-[1.05fr_0.95fr] lg:items-center' : '')}>
          <div>
            <SectionTitle as="h1" size="display" eyebrow={eyebrow} title={title} subtitle={subtitle} variant={variant} />
            {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
          </div>
          {image &&
          <VehicleImage
            src={image.src}
            alt={image.alt}
            className="aspect-[4/3] w-full rounded-card border border-line shadow-card lg:aspect-[5/4]" />

          }
          {!image && aside}
        </div>
      </div>
    </section>);

}