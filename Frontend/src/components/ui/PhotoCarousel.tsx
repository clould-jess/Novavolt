import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { cn } from '../../utils/cn';
import { VehicleImage } from './VehicleImage';

export interface PhotoCarouselItem {
  src: string;
  alt: string;
}

interface PhotoCarouselProps {
  items: PhotoCarouselItem[];
  className?: string;
  imgClassName?: string;
  showThumbnails?: boolean;
  emptyState?: React.ReactNode;
}

export function PhotoCarousel({
  items,
  className,
  imgClassName,
  showThumbnails = true,
  emptyState,
}: PhotoCarouselProps) {
  const { t } = useI18n();
  const [activeIndex, setActiveIndex] = useState(0);

  const activeItem = useMemo(() => {
    if (items.length === 0) return null;
    return items[Math.min(activeIndex, items.length - 1)] ?? items[0];
  }, [activeIndex, items]);

  useEffect(() => {
    setActiveIndex(0);
  }, [items.length, items[0]?.src]);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 4500);
    return () => window.clearInterval(interval);
  }, [items.length]);

  if (!activeItem) {
    return <>{emptyState}</>;
  }

  const goTo = (nextIndex: number) => {
    const total = items.length;
    if (total === 0) return;
    const normalized = ((nextIndex % total) + total) % total;
    setActiveIndex(normalized);
  };

  return (
    <div className={cn('overflow-hidden rounded-card border border-line bg-white', className)}>
      <div className="relative aspect-[16/10] bg-surface">
        <VehicleImage src={activeItem.src} alt={activeItem.alt} className="h-full w-full" imgClassName={imgClassName} />

        {items.length > 1 && (
          <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              aria-label={t('common.previous')}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/70 bg-white/90 text-ink shadow-sm backdrop-blur transition-colors hover:bg-white"
            >
              <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="rounded-pill border border-white/70 bg-white/90 px-3 py-1 text-2xs font-semibold text-ink shadow-sm backdrop-blur">
              {activeIndex + 1}/{items.length}
            </div>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              aria-label={t('common.next')}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/70 bg-white/90 text-ink shadow-sm backdrop-blur transition-colors hover:bg-white"
            >
              <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {items.length > 1 && showThumbnails && (
        <div className="grid grid-cols-4 gap-2 border-t border-line bg-white p-3 sm:grid-cols-5">
          {items.map((item, index) => (
            <button
              key={`${item.src}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-current={index === activeIndex}
              aria-label={item.alt || `Photo ${index + 1}`}
              className={cn(
                'overflow-hidden rounded-xl border transition-colors duration-200',
                index === activeIndex ? 'border-action ring-2 ring-action/20' : 'border-line hover:border-sky-300'
              )}
            >
              <VehicleImage src={item.src} alt="" className="aspect-[4/3]" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
