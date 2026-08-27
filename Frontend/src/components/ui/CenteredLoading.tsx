import React from 'react';
import { Loader2Icon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { cn } from '../../utils/cn';

interface CenteredLoadingProps {
  className?: string;
  label?: string;
  description?: string;
}

export function CenteredLoading({ className, label, description }: CenteredLoadingProps) {
  const { t } = useI18n();

  return (
    <div className={cn('grid min-h-[18rem] place-items-center px-4 py-10', className)}>
      <div className="flex flex-col items-center gap-4 rounded-card border border-line bg-white px-8 py-10 shadow-card">
        <Loader2Icon className="h-7 w-7 animate-spin-slow text-action" aria-hidden="true" />
        <div className="text-center">
          <p className="text-sm font-semibold text-ink">{label ?? t('common.loading')}</p>
          {description && <p className="mt-1 text-2xs text-muted">{description}</p>}
        </div>
      </div>
    </div>
  );
}
