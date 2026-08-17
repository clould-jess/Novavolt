import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  tone?: 'white' | 'soft' | 'surface' | 'ink';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'li';
}

const tones = {
  white: 'bg-white',
  soft: 'bg-soft',
  surface: 'bg-surface',
  ink: 'bg-ink text-white'
};

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8'
};

export function Card({ children, tone = 'white', padding = 'md', border = true, className, as = 'div' }: CardProps) {
  const Component = as;
  return (
    <Component
      className={cn(
        'rounded-card',
        tones[tone],
        paddings[padding],
        border && (tone === 'ink' ? 'border border-white/10' : 'border border-line'),
        className
      )}>
      
      {children}
    </Component>);

}

export function CardHeader({
  title,
  description,
  action,
  className





}: {title: React.ReactNode;description?: React.ReactNode;action?: React.ReactNode;className?: string;}) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <h3 className="font-display text-lg font-semibold tracking-[-0.02em] text-ink">{title}</h3>
        {description && <p className="mt-1 text-2xs leading-relaxed text-muted">{description}</p>}
      </div>
      {action}
    </div>);

}