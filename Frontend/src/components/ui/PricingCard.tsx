import React from 'react';
import { CheckIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import type { Plan } from '../../data/plans';
import { cn } from '../../utils/cn';
import { Badge } from './Badge';
import { Button } from './Button';

interface PricingCardProps {
  plan: Plan;
  ctaTo?: string;
  onSelect?: () => void;
  className?: string;
}

export function PricingCard({ plan, ctaTo, onSelect, className }: PricingCardProps) {
  const { t, money } = useI18n();
  const features = Array.from({ length: plan.featureCount }, (_, index) => t(`${plan.key}.f${index + 1}`));

  return (
    <article
      className={cn(
        'flex h-full flex-col rounded-card border p-6',
        plan.popular ? 'border-action bg-white shadow-card ring-1 ring-action/15' : 'border-line bg-white',
        className
      )}>
      
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-semibold tracking-[-0.02em] text-ink">{t(`${plan.key}.name`)}</h3>
        {plan.popular && <Badge tone="info">{t('plans.popular')}</Badge>}
      </div>
      <p className="mt-2 min-h-[2.5rem] text-2xs leading-relaxed text-muted">{t(`${plan.key}.desc`)}</p>

      <p className="mt-5 flex items-baseline gap-1.5">
        <span className="font-display text-4xl font-bold tracking-[-0.03em] text-ink">{money(plan.price)}</span>
        <span className="text-2xs font-semibold text-muted">{t(plan.unitKey)}</span>
      </p>

      <ul className="mt-6 flex flex-1 flex-col gap-2.5">
        {features.map((feature) =>
        <li key={feature} className="flex items-start gap-2.5 text-2xs leading-relaxed text-body">
            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-action" aria-hidden="true" />
            {feature}
          </li>
        )}
      </ul>

      <div className="mt-auto pt-6">
        <Button
          fullWidth
          variant={plan.popular ? 'primary' : 'secondary'}
          to={ctaTo}
          onClick={onSelect}>
          
          {t('plans.cta')}
        </Button>
      </div>
    </article>);

}