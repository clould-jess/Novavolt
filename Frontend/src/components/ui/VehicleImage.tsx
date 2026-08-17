import React, { useState } from 'react';
import { CarFrontIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface VehicleImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  /** Rendered instead of the photo if the external stock asset fails to load. */
  fallbackLabel?: string;
}

export function VehicleImage({ src, alt, className, imgClassName, fallbackLabel }: VehicleImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn('relative overflow-hidden bg-surface', className)}>
      {failed ?
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted">
          <CarFrontIcon className="h-7 w-7" aria-hidden="true" />
          <span className="px-4 text-center text-[0.75rem] font-medium">{fallbackLabel ?? alt}</span>
        </div> :

      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className={cn('h-full w-full object-cover', imgClassName)} />

      }
    </div>);

}